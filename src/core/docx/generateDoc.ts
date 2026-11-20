// src/core/docx/generateDoc.ts
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

import type { InputData } from '../types';
import { flattenForTemplate } from './flattenForTemplate';

const OUTPUT_NAME = 'Спецификация.docx';
const DELIMITERS = { start: '[[', end: ']]' } as const;

/** Шаблон по design.schemeKind. */
function templateFileName(schemeKind: InputData['design']['schemeKind']): string {
  switch (schemeKind) {
    case 'scheme1':
      return 'documentation_template_1.docx';
    case 'scheme2':
      return 'documentation_template_2.docx';
    case 'scheme3':
      return 'documentation_template_3.docx';
    default:
      return 'documentation_template.docx';
  }
}

async function fetchTemplate(
  schemeKind: InputData['design']['schemeKind'],
): Promise<ArrayBuffer> {
  const fileName = templateFileName(schemeKind);
  const url = `${import.meta.env.BASE_URL}${fileName}`;

  console.log('[docx] fetch template:', url, '| schemeKind:', schemeKind);

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `Не удалось загрузить шаблон "${url}" (${res.status} ${res.statusText}). ` +
        `Проверьте public/${fileName} и перезапуск dev-сервера.`,
    );
  }
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('text/html')) {
    throw new Error(
      `По пути "${url}" отдался HTML вместо .docx — файл не найден или перехвачен прокси.`,
    );
  }
  return res.arrayBuffer();
}

/**
 * Убирает пустые квадратные скобки из текста (после склейки runs):
 *   [[ ]]  -> ''
 *   [[]]   -> ''
 *   [[]    -> ''
 *   []]    -> ''
 *   []     -> ''
 */
function stripEmptyBrackets(text: string): string {
  return text
    .replace(/\[\[\s*\]\]/g, '')
    .replace(/\[\[\]/g, '')
    .replace(/\[\]\]/g, '')
    .replace(/\[\]/g, '');
}

/**
 * Склеивает все <w:t> внутри одного <w:p> в один текст,
 * чистит пустые скобки, пишет результат в первый <w:t>;
 * остальные <w:t> в параграфе опустошает.
 */
function sanitizeDocumentXml(xml: string): string {
  const before = xml.length;

  const paragraphRe = /(<w:p\b[^>]*>)([\s\S]*?)(<\/w:p>)/g;

  const result = xml.replace(
    paragraphRe,
    (_full: string, open: string, body: string, close: string): string => {
      const tRe = /(<w:t\b[^>]*>)([\s\S]*?)(<\/w:t>)/g;
      const matches: Array<{ open: string; text: string; close: string }> = [];
      let m: RegExpExecArray | null;
      while ((m = tRe.exec(body)) !== null) {
        matches.push({ open: m[1], text: m[2], close: m[3] });
      }
      if (matches.length === 0) return _full;

      const joined = matches.map((x) => x.text).join('');
      const cleaned = stripEmptyBrackets(joined);

      let idx = 0;
      const newBody = body.replace(
        tRe,
        (_t: string, tOpen: string, _tText: string, tClose: string): string => {
          if (idx === 0) {
            idx++;
            return `${tOpen}${cleaned}${tClose}`;
          }
          idx++;
          return `${tOpen}${tClose}`;
        },
      );

      return `${open}${newBody}${close}`;
    },
  );

  console.log('[docx] sanitize: было', before, 'стало', result.length);
  return result;
}

/** Все имена тегов [[...]] в XML шаблона. */
function extractTagNames(xml: string): string[] {
  const re = /\[\[\s*([^\[\]\s][^\[\]]*?)\s*\]\]/g;
  const names = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    names.add(m[1].trim());
  }
  return [...names];
}

/**
 * Генерирует .docx.
 * `results` всегда передаём как объект (даже если пустой {}).
 * Если какого-то поля нет в results — в документе будет пусто.
 */
export async function generateDoc(input: InputData): Promise<void> {
  // --- 0. Подстраховка: results не undefined ---
  const safeInput: InputData = {
    ...input,
    results: input.results ?? {},
  };

  // --- 1. Шаблон (по design.schemeKind) ---
  const arrayBuffer = await fetchTemplate(safeInput.design.schemeKind);
  const zip = new PizZip(arrayBuffer);

  // --- 2. Санитайзер (до конструктора) ---
  const docXmlPath = 'word/document.xml';
  const docXml = zip.file(docXmlPath)?.asText();
  if (!docXml) {
    throw new Error(`В шаблоне не найден ${docXmlPath}`);
  }
  const cleaned = sanitizeDocumentXml(docXml);
  zip.file(docXmlPath, cleaned);

  // --- 3. Данные ---
  const data = flattenForTemplate(safeInput);
  const dataKeys = Object.keys(data);
  const dataResultsKeys = dataKeys.filter((k) => k.startsWith('results.'));

  // --- 4. Теги в шаблоне ---
  const tagNames = extractTagNames(cleaned);
  const templateResultsTags = tagNames.filter((t) => t.startsWith('results.'));

  // --- 5. Сравнение (только для лога) ---
  const willSubstitute = templateResultsTags.filter((t) =>
    dataResultsKeys.includes(t),
  );
  const willBeEmpty = templateResultsTags.filter(
    (t) => !dataResultsKeys.includes(t),
  );

  const otherMissing = tagNames.filter(
    (t) => !t.startsWith('results.') && !dataKeys.includes(t),
  );
  if (otherMissing.length > 0) {
    console.warn(
      '[docx] Не results, но тоже без данных (подставятся пустыми):',
      otherMissing,
    );
  }
  console.log('[docx] results.* подставится:', willSubstitute);
  console.log('[docx] results.* останется пустым:', willBeEmpty);

  // --- 6. Docxtemplater ---
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '',
    delimiters: DELIMITERS,
  });

  try {
    doc.render(data);
  } catch (err: any) {
    if (err?.properties?.errors) {
      console.error(
        '[docx] Ошибки шаблона:',
        err.properties.errors.map((e: any) => ({
          id: e.properties?.id,
          explanation: e.properties?.explanation,
          context: e.properties?.context,
          xtag: e.properties?.xtag,
        })),
      );
    }
    throw err;
  }

  // --- 7. Сохранение ---
  const blob = doc.getZip().generate({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  saveAs(blob, OUTPUT_NAME);
}