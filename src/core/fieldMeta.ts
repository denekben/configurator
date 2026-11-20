// src/core/fieldMeta.ts

import type { InputData } from './types';

// ==========================================
// 1. МЕТАДАННЫЕ ПОЛЕЙ
// ==========================================

export interface FieldMeta {
  /** Человекочитаемая подпись. */
  label: string;
  /**
   * Ключ раздела для группировки в диалоге.
   * Для `scheme.*` — `scheme.primary` / `scheme.secondary` / `scheme.makeup`,
   * для `results.*` — раздел конкретного поля (`trap`, `controlValve`, ...),
   * для остальных — первый сегмент (`system`, `steamFlow`, ...).
   */
  section: string;
  /**
   * Если задано — поле считается «обязательным ручным» из `results.*`
   * и проверяется в `collectMissing` только при выполнении условия.
   */
  requiredWhen?: (input: InputData) => boolean;
}

const isManual = (mode: string | null | undefined) => mode === 'manual';
const filled = (v: unknown): boolean =>
  v !== undefined && v !== null && v !== '';

/**
 * Единая таблица «путь → метаданные».
 * Здесь же — все бизнес-правила «это поле обязательно, если...».
 */
export const FIELD_META: Record<string, FieldMeta> = {
  // === Пар в первичном контуре ===
  'steamFlow.steamTempC': { label: 'Температура пара, °C', section: 'steamFlow' },
  'steamFlow.steamPressureBar': { label: 'Давление пара, Бар (и)', section: 'steamFlow' },
  'steamFlow.condensateTempC': { label: 'Температура конденсата, °C', section: 'steamFlow' },
  'steamFlow.condensateLinePressureBar': {
    label: 'Давление в конденсатной линии, Бар (и)',
    section: 'steamFlow',
  },

  // === Параметры пара ===
  'steamThermo.enthalpySteam': { label: 'Энтальпия пара, кДж/кг', section: 'steamThermo' },
  'steamThermo.enthalpyCondensate': {
    label: 'Энтальпия конденсата, кДж/кг',
    section: 'steamThermo',
  },
  'steamThermo.specificVolumeSteam': {
    label: 'Удельный объём пара, м³/кг',
    section: 'steamThermo',
  },
  'steamThermo.specificVolumeAfterValve': {
    label: 'Удельный объём пара после РК, м³/кг',
    section: 'steamThermo',
  },

  // === Системы ===
  'system.loadKw': { label: 'Мощность, кВт', section: 'system' },
  'system.supplyTempC': { label: 'Температура подачи, °C', section: 'system' },
  'system.returnTempC': { label: 'Температура обратки, °C', section: 'system' },
  'system.hydraulicLossM': { label: 'Гидравлические потери, м.вод.ст.', section: 'system' },
  'system.staticPressureM': { label: 'Статическое давление, м.вод.ст.', section: 'system' },
  'system.systemVolumeL': { label: 'Объём системы, л', section: 'system' },
  'system.designPressureBar': { label: 'Расчётное давление, Бар', section: 'system' },

  // === Параметры схемы ===
  'scheme.primary.hasSeparator': {
    label: 'Наличие сепаратора',
    section: 'scheme.primary',
  },
  'scheme.primary.hasAccountingPrimary': {
    label: 'Наличие учёта',
    section: 'scheme.primary',
  },
  'scheme.primary.trapReserve': {
    label: 'Резерв конденсатоотводчиков',
    section: 'scheme.primary',
  },
  'scheme.secondary.hxReserve': { label: 'Резерв ПТО', section: 'scheme.secondary' },
  'scheme.secondary.pumpReserve': { label: 'Резерв насосов', section: 'scheme.secondary' },
  'scheme.secondary.hasAccountingSecondary': {
    label: 'Наличие учёта',
    section: 'scheme.secondary',
  },
  'scheme.makeup.makeupConfig': {
    label: 'Конфигурация подпитки',
    section: 'scheme.makeup',
  },
  'scheme.makeup.hasExpansionTank': {
    label: 'Наличие расширительного бака',
    section: 'scheme.makeup',
  },
  'scheme.makeup.aupdConfig': {
    label: 'Наличие АУПД / АУПДз',
    section: 'scheme.makeup',
  },

  // === Паропровод ===
  'steamPipe.mode': { label: 'Режим подбора (паропровод)', section: 'steamPipe' },
  'steamPipe.steamSpeedMs': {
    label: 'Предварительная скорость пара, м/с',
    section: 'steamPipe',
  },

  // === Конденсатоотводчик ===
  'condensateTrap.mode': {
    label: 'Режим подбора (конденсатоотводчик)',
    section: 'condensateTrap',
  },
  'condensateTrap.trapReserveFactor': { label: 'Запас на расход', section: 'condensateTrap' },

  // === Регулирующий клапан ===
  'controlValve.mode': { label: 'Режим подбора (РК)', section: 'controlValve' },
  'controlValve.valveDeltaPAssumed': {
    label: 'Перепад на клапане, Бар',
    section: 'controlValve',
  },
  'controlValve.valveType': { label: 'Тип РК', section: 'controlValve' },
  'controlValve.valveDu': { label: 'Ду РК', section: 'controlValve' },
  'controlValve.actuatorControl': {
    label: 'Тип управления привода',
    section: 'controlValve',
  },
  'controlValve.actuatorVoltage': { label: 'Напряжение привода', section: 'controlValve' },
  'controlValve.actuatorSuSd': { label: 'SU|SD привода', section: 'controlValve' },

  // === Предохранительный клапан ===
  'safetyValve.mode': { label: 'Режим подбора (ПК)', section: 'safetyValve' },
  'safetyValve.safetyValveDu': { label: 'Диаметр отвода ПК, мм', section: 'safetyValve' },

  // === Вторичный контур ===
  'secondaryCircuit.mode': {
    label: 'Режим подбора (вторичный контур)',
    section: 'secondaryCircuit',
  },
  'secondaryCircuit.secondaryPreliminarySpeed': {
    label: 'Скорость в первом приближении, м/с',
    section: 'secondaryCircuit',
  },
  'secondaryCircuit.secondaryStandardDu': {
    label: 'Стандартный Ду вторичного контура, мм',
    section: 'secondaryCircuit',
  },
  'secondaryCircuit.editStandardDu': {
    label: 'Разрешение редактировать Ду',
    section: 'secondaryCircuit',
  },

  // === Циркуляционные насосы ===
  'pumps.mode': { label: 'Режим подбора (насосы)', section: 'pumps' },
  'pumps.pumpCount': { label: 'Количество работающих насосов', section: 'pumps' },
  'pumps.hxLossM': { label: 'Потери в ПТО, м.вод.ст.', section: 'pumps' },
  'pumps.reserveM': { label: 'Запас по напору, м.вод.ст.', section: 'pumps' },
  'pumps.extraLossM': { label: 'Доп. потери, м.вод.ст.', section: 'pumps' },

  // === Подпитка ===
  'makeUp.mode': { label: 'Режим подбора (подпитка)', section: 'makeUp' },
  'makeUp.makeupVolumeCoef': { label: 'Коэффициент объёма, л/кВт', section: 'makeUp' },
  'makeUp.makeupPreliminarySpeed': {
    label: 'Скорость в первом приближении, м/с',
    section: 'makeUp',
  },
  'makeUp.makeupStandardDu': {
    label: 'Стандартный Ду подпитки, мм',
    section: 'makeUp',
  },
  'makeUp.editStandardDu': {
    label: 'Разрешение редактировать Ду (подпитка)',
    section: 'makeUp',
  },

  // === Арматура · Вторичка ===
  'secondaryArmature.mode': {
    label: 'Режим подбора (арматура вторички)',
    section: 'secondaryArmature',
  },
  'secondaryArmature.connectionType': {
    label: 'Тип присоединения',
    section: 'secondaryArmature',
  },
  'secondaryArmature.valveName': { label: 'Запорный клапан', section: 'secondaryArmature' },
  'secondaryArmature.checkValveName': {
    label: 'Обратный клапан',
    section: 'secondaryArmature',
  },
  'secondaryArmature.filterName': { label: 'Фильтр', section: 'secondaryArmature' },

  // === Арматура · Подпитка ===
  'makeupArmature.mode': {
    label: 'Режим подбора (арматура подпитки)',
    section: 'makeupArmature',
  },
  'makeupArmature.connectionType': {
    label: 'Тип присоединения',
    section: 'makeupArmature',
  },
  'makeupArmature.valveName': { label: 'Запорный клапан', section: 'makeupArmature' },
  'makeupArmature.checkValveName': { label: 'Обратный клапан', section: 'makeupArmature' },

  // === Насос ===
  'choicePump.pumpName': { label: 'Название насоса', section: 'choicePump' },
  'choicePump.pumpCode': { label: 'Код насоса', section: 'choicePump' },
  'choicePump.headM': { label: 'Напор насоса, м.вод.ст.', section: 'choicePump' },
  'choicePump.flowM3h': { label: 'Расход насоса, м³/ч', section: 'choicePump' },

  // === ПТО ===
  'pto.name': { label: 'Название ПТО', section: 'pto' },
  'pto.code': { label: 'Кодовый номер ПТО', section: 'pto' },
  'pto.reserve': { label: 'Процент резервирования', section: 'pto' },
  'pto.primaryFlow': { label: 'Расход по первичке', section: 'pto' },
  'pto.secondaryFlow': { label: 'Расход по вторичке', section: 'pto' },
  'pto.primaryLoss': { label: 'Потери давления по первичке', section: 'pto' },
  'pto.secondaryLoss': { label: 'Потери давления по вторичке', section: 'pto' },
  'pto.priceHi': { label: 'Цена из HI', section: 'pto' },
  'pto.margin': { label: 'Запас', section: 'pto' },

  // === Оформление ===
  'design.systemName': { label: 'Наименование системы', section: 'design' },
  'design.objectName': { label: 'Название объекта', section: 'design' },
  'design.author': { label: 'Автор', section: 'design' },
  'design.taskAuthor': { label: 'Автор задачи в ЦРМ', section: 'design' },
  'design.taskAuthorPhone': { label: 'Номер автора задачи', section: 'design' },
  'design.calcNumber': { label: 'Номер расчёта', section: 'design' },
  'design.schemeKind': { label: 'Принципиальная схема', section: 'design' },

  // === Результаты: паропровод ===
  'results.steamPipe.steamFlowKgH': {
    label: 'Расход пара, кг/ч',
    section: 'steamPipe',
  },
  'results.steamPipe.preliminarySpeedMs': {
    label: 'Предварительная скорость, м/с',
    section: 'steamPipe',
  },
  'results.steamPipe.estimatedPipeAreaM2': {
    label: 'Расчётная площадь сечения, м²',
    section: 'steamPipe',
  },
  'results.steamPipe.estimatedDiameterMm': {
    label: 'Расчётный диаметр, мм',
    section: 'steamPipe',
  },
  'results.steamPipe.standardDiameterMm': {
    label: 'Стандартный Ду паропровода, мм',
    section: 'steamPipe',
    requiredWhen: (i) => isManual(i.steamPipe.mode),
  },
  'results.steamPipe.pipeCrossSectionAreaM2': {
    label: 'Площадь сечения трубы, м²',
    section: 'steamPipe',
  },
  'results.steamPipe.actualSpeedMs': {
    label: 'Фактическая скорость, м/с',
    section: 'steamPipe',
  },

  // === Результаты: конденсатоотводчик ===
  'results.trap.trapSteamFlowKgH': { label: 'Расход пара, кг/ч', section: 'condensateTrap' },
  'results.trap.trapReserveFactor': { label: 'Запас на расход', section: 'condensateTrap' },
  'results.trap.trapDeltaP': { label: 'Перепад давления, Бар', section: 'condensateTrap' },
  'results.trap.trapRequiredFlowKgH': {
    label: 'Требуемый расход, кг/ч',
    section: 'condensateTrap',
  },
  'results.trap.trapDu': {
    label: 'Ду конденсатоотводчика, мм',
    section: 'condensateTrap',
    requiredWhen: (i) => isManual(i.condensateTrap.mode),
  },
  'results.trap.trapDesignDeltaP': {
    label: 'Расчётный перепад, Бар',
    section: 'condensateTrap',
    requiredWhen: (i) => isManual(i.condensateTrap.mode),
  },
  'results.trap.trapTypeDeltaP': {
    label: 'Перепад конденсатоотводчика, Бар',
    section: 'condensateTrap',
    requiredWhen: (i) => isManual(i.condensateTrap.mode),
  },
  'results.trap.trapActualCapacityKgH': {
    label: 'Пропускная способность конденсатоотводчика, кг/ч',
    section: 'condensateTrap',
    requiredWhen: (i) => isManual(i.condensateTrap.mode),
  },
  'results.trap.trapSelectedDeltaP': {
    label: 'Выбранный перепад, Бар',
    section: 'condensateTrap',
  },
  'results.trap.trapIsSufficient': {
    label: 'Достаточность пропускной способности',
    section: 'condensateTrap',
  },

  // === Результаты: регулирующий клапан ===
  'results.controlValve.valveSteamFlowKgH': {
    label: 'Расход пара, кг/ч',
    section: 'controlValve',
  },
  'results.controlValve.valveP1Bar': { label: 'Давление до клапана, Бар', section: 'controlValve' },
  'results.controlValve.valveDeltaPBar': {
    label: 'Перепад на клапане, Бар',
    section: 'controlValve',
  },
  'results.controlValve.valveP2Bar': {
    label: 'Давление после клапана, Бар',
    section: 'controlValve',
  },
  'results.controlValve.valveX': { label: 'Степень открытия X', section: 'controlValve' },
  'results.controlValve.valveKvRequired': {
    label: 'Требуемый Kv, м³/ч',
    section: 'controlValve',
  },
  'results.controlValve.valveType': { label: 'Тип РК', section: 'controlValve' },
  'results.controlValve.valveDu': { label: 'Ду РК', section: 'controlValve' },
  'results.controlValve.valveKvActual': {
    label: 'Фактический Kv, м³/ч',
    section: 'controlValve',
  },
  'results.controlValve.valveActualDeltaP': {
    label: 'Фактический перепад, Бар',
    section: 'controlValve',
  },
  'results.controlValve.valveOverloaded': {
    label: 'Перегрузка клапана',
    section: 'controlValve',
  },
  'results.controlValve.actuatorName': {
    label: 'Наименование электропривода',
    section: 'controlValve',
    // Код/имя попадают в results.* только после успешного подбора.
    // Если пользователь выбрал режим + тип + Ду, но в каталоге нет подходящей
    // строки — это надо показать в missing-окне (в спецификации не будет
    // кода клапана). Если же valveDu/valveType ещё пустые — это обычное
    // «поле не заполнено», его ловит walk() по controlValve.valveDu/valveType,
    // поэтому here=false, чтобы не дублировать сообщение.
    requiredWhen: (i) =>
      isManual(i.controlValve.mode) &&
      filled(i.controlValve.valveType) &&
      filled(i.controlValve.valveDu),
  },
  'results.controlValve.actuatorCode': {
    label: 'Код электропривода (не найден в каталоге)',
    section: 'controlValve',
    requiredWhen: (i) =>
      isManual(i.controlValve.mode) &&
      filled(i.controlValve.valveType) &&
      filled(i.controlValve.valveDu),
  },
  'results.controlValve.actuatorControlType': {
    label: 'Тип управления привода',
    section: 'controlValve',
  },
  'results.controlValve.actuatorVoltage': {
    label: 'Напряжение привода',
    section: 'controlValve',
  },
  'results.controlValve.actuatorSuSd': {
    label: 'SU|SD привода',
    section: 'controlValve',
  },

  // === Результаты: предохранительный клапан ===
  'results.safetyValve.safetyValveDuMm': {
    label: 'Ду отвода ПК, мм',
    section: 'safetyValve',
  },

  // === Результаты: вторичный контур ===
  'results.secondaryCircuit.secondaryFlowM3h': {
    label: 'Расход, м³/ч',
    section: 'secondaryCircuit',
  },
  'results.secondaryCircuit.secondaryPreliminarySpeed': {
    label: 'Предварительная скорость, м/с',
    section: 'secondaryCircuit',
  },
  'results.secondaryCircuit.secondaryEstimatedDuMm': {
    label: 'Расчётный Ду, мм',
    section: 'secondaryCircuit',
  },
  'results.secondaryCircuit.secondaryStandardDuMm': {
    label: 'Стандартный Ду, мм',
    section: 'secondaryCircuit',
  },
  'results.secondaryCircuit.secondaryActualSpeedMs': {
    label: 'Фактическая скорость, м/с',
    section: 'secondaryCircuit',
  },

  // === Результаты: циркуляционные насосы ===
  'results.pumps.pumpFlowM3h': { label: 'Расход насоса, м³/ч', section: 'pumps' },
  'results.pumps.pumpHeadM': { label: 'Напор насоса, м.вод.ст.', section: 'pumps' },

  // === Результаты: подпитка ===
  'results.makeUp.makeupVolumeCoef': {
    label: 'Коэффициент объёма, л/кВт',
    section: 'makeUp',
  },
  'results.makeUp.makeupFlowM3h': { label: 'Расход подпитки, м³/ч', section: 'makeUp' },
  'results.makeUp.makeupPreliminarySpeed': {
    label: 'Предварительная скорость, м/с',
    section: 'makeUp',
  },
  'results.makeUp.makeupEstimatedDuMm': {
    label: 'Расчётный Ду, мм',
    section: 'makeUp',
  },
  'results.makeUp.makeupStandardDuMm': {
    label: 'Стандартный Ду, мм',
    section: 'makeUp',
  },
  'results.makeUp.makeupActualSpeedMs': {
    label: 'Фактическая скорость, м/с',
    section: 'makeUp',
  },
};

// ==========================================
// 2. НАЗВАНИЯ РАЗДЕЛОВ
// ==========================================

export const SECTION_LABELS: Record<string, string> = {
  'scheme.primary': 'Параметры схемы: Первичный контур',
  'scheme.secondary': 'Параметры схемы: Вторичный контур',
  'scheme.makeup': 'Параметры схемы: Линия подпитки',

  steamFlow: 'Данные по пару в первичном контуре',
  steamThermo: 'Данные по параметрам пара',
  system: 'Данные по системам',
  steamPipe: 'Паропровод',
  condensateTrap: 'Конденсатоотводчик',
  controlValve: 'Регулирующий клапан',
  safetyValve: 'Предохранительный клапан',
  secondaryCircuit: 'Вторичный контур',
  pumps: 'Циркуляционные насосы',
  makeUp: 'Подпитка',
  secondaryArmature: 'Арматура · Вторичка',
  makeupArmature: 'Арматура · Подпитка',
  choicePump: 'Насос',
  pto: 'ПТО',
  design: 'Оформление',
  results: 'Результаты расчёта',
};

// ==========================================
// 3. ХЕЛПЕРЫ ДЛЯ ДИАЛОГА
// ==========================================

/** Человекочитаемое название или последний сегмент пути, если неизвестно. */
export function humanizePath(path: string): string {
  return FIELD_META[path]?.label ?? path.split('.').pop() ?? path;
}

/** Человекочитаемое название раздела или сам ключ, если неизвестно. */
export function humanizeSection(section: string): string {
  return SECTION_LABELS[section] ?? section;
}

/**
 * Ключ раздела для группировки.
 * - есть в FIELD_META → берём оттуда;
 * - `scheme.primary.*` / `scheme.secondary.*` / `scheme.makeup.*` → первые два сегмента;
 * - остальное → первый сегмент.
 */
export function getSectionOf(path: string): string {
  const fromMeta = FIELD_META[path]?.section;
  if (fromMeta) return fromMeta;

  const parts = path.split('.');
  if (parts[0] === 'scheme' && parts.length >= 2) {
    return `${parts[0]}.${parts[1]}`;
  }
  return parts[0] ?? '';
}

// ==========================================
// 4. СБОР НЕЗАПОЛНЕННЫХ ПОЛЕЙ
// ==========================================

const isEmptyValue = (v: unknown): boolean =>
  v === undefined ||
  v === null ||
  v === '' ||
  (typeof v === 'number' && Number.isNaN(v));

function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

/**
 * Собирает пути незаполненных полей InputData.
 *
 * Логика:
 * 1. Обходим всё дерево InputData, кроме `results`, `mode`, `editStandardDu`.
 *    Всё, что пустое — в список (это «обычные» поля формы).
 * 2. Дополнительно проверяем поля из `FIELD_META`, у которых есть `requiredWhen`
 *    (это «ручные» поля из `results.*`). Они попадают в список, только если
 *    условие выполнилось, а значение пустое.
 */
export function collectMissing(input: InputData): string[] {
  const SKIP_KEYS = new Set(['results', 'mode', 'editStandardDu']);
  const missing: string[] = [];

  const walk = (obj: unknown, prefix: string) => {
    if (isEmptyValue(obj)) {
      missing.push(prefix);
      return;
    }
    if (typeof obj !== 'object') return;

    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (SKIP_KEYS.has(k)) continue;
      const path = prefix ? `${prefix}.${k}` : k;
      walk(v, path);
    }
  };

  for (const [k, v] of Object.entries(input)) {
    if (k === 'results') continue;
    walk(v, k);
  }

  for (const [path, meta] of Object.entries(FIELD_META)) {
    if (!meta.requiredWhen) continue;
    if (!meta.requiredWhen(input)) continue;
    if (isEmptyValue(getByPath(input, path))) {
      missing.push(path);
    }
  }

  return missing;
}

// ==========================================
// 5. КАКИЕ ПОЛЯ РЕДАКТИРУЕТ ВКЛАДКА (для «Сбросить данные»)
// ==========================================

/**
 * Список путей к полям InputData, которые редактирует каждая вкладка.
 * Ключи должны совпадать с key из NAV_GROUPS в InputForm.
 *
 * ВАЖНО: включать ВСЕ поля, которые видны на вкладке, включая «глобальные»
 * (system.*, steamFlow.*, steamThermo.*) и селекты, которые пишут в results.*.
 */
export const TAB_FIELDS: Record<string, string[]> = {
  global: [
    'steamFlow.steamTempC',
    'steamFlow.steamPressureBar',
    'steamFlow.condensateTempC',
    'steamFlow.condensateLinePressureBar',
    'steamThermo.enthalpySteam',
    'steamThermo.enthalpyCondensate',
    'steamThermo.specificVolumeSteam',
    'steamThermo.specificVolumeAfterValve',
    'system.loadKw',
    'system.supplyTempC',
    'system.returnTempC',
    'system.hydraulicLossM',
    'system.staticPressureM',
    'system.systemVolumeL',
    'system.designPressureBar',
  ],
  scheme: [
    'scheme.primary.hasSeparator',
    'scheme.primary.hasAccountingPrimary',
    'scheme.primary.trapReserve',
    'scheme.secondary.hxReserve',
    'scheme.secondary.pumpReserve',
    'scheme.secondary.hasAccountingSecondary',
    'scheme.makeup.makeupConfig',
    'scheme.makeup.hasExpansionTank',
    'scheme.makeup.aupdConfig',
  ],

  'steam-pipe': [
    'steamPipe.mode',
    'steamPipe.steamSpeedMs',
    'system.loadKw',
    'steamThermo.enthalpySteam',
    'steamThermo.enthalpyCondensate',
    'steamThermo.specificVolumeSteam',
    'results.steamPipe.standardDiameterMm',
  ],

  trap: [
    'condensateTrap.mode',
    'condensateTrap.trapReserveFactor',
    'results.trap.trapDu',
    'results.trap.trapDesignDeltaP',
    'results.trap.trapTypeDeltaP',
    'system.loadKw',
    'steamFlow.steamPressureBar',
    'steamFlow.condensateLinePressureBar',
    'steamThermo.enthalpySteam',
    'steamThermo.enthalpyCondensate',
  ],

  'control-valve': [
    'controlValve.mode',
    'controlValve.valveDeltaPAssumed',
    'controlValve.valveType',
    'controlValve.valveDu',
    'controlValve.actuatorControl',
    'controlValve.actuatorVoltage',
    'controlValve.actuatorSuSd',
    'system.loadKw',
    'steamFlow.steamPressureBar',
    'steamThermo.enthalpySteam',
    'steamThermo.enthalpyCondensate',
  ],

  'safety-valve': [
    'safetyValve.mode',
    'safetyValve.safetyValveDu',
    // если на вкладке видны глобальные поля — добавь их сюда:
    // 'system.loadKw',
    // 'steamFlow.steamPressureBar',
    // 'steamThermo.enthalpySteam',
    // 'steamThermo.enthalpyCondensate',
    // 'steamThermo.specificVolumeSteam',
  ],

  secondary: [
    'secondaryCircuit.mode',
    'secondaryCircuit.secondaryPreliminarySpeed',
    'secondaryCircuit.secondaryStandardDu',
    'secondaryCircuit.editStandardDu',
    'system.loadKw',
    'system.supplyTempC',
    'system.returnTempC',
  ],

  pumps: [
    'pumps.mode',
    'pumps.pumpCount',
    'pumps.hxLossM',
    'pumps.reserveM',
    'pumps.extraLossM',
    'system.loadKw',
    'system.supplyTempC',
    'system.returnTempC',
    'system.hydraulicLossM',
  ],

  makeup: [
    'makeUp.mode',
    'makeUp.makeupVolumeCoef',
    'makeUp.makeupPreliminarySpeed',
    'makeUp.makeupStandardDu',
    'makeUp.editStandardDu',
    'system.loadKw',
    'system.systemVolumeL',
  ],

  'arm-secondary': [
    'secondaryArmature.mode',
    'secondaryArmature.connectionType',
    'secondaryArmature.valveName',
    'secondaryArmature.checkValveName',
    'secondaryArmature.filterName',
    'secondaryCircuit.secondaryStandardDu',
    'secondaryCircuit.editStandardDu',
    'system.loadKw',
    'system.supplyTempC',
    'system.returnTempC',
  ],

  'arm-makeup': [
    'makeupArmature.mode',
    'makeupArmature.connectionType',
    'makeupArmature.valveName',
    'makeupArmature.checkValveName',
    'makeUp.makeupVolumeCoef',
    'makeUp.makeupPreliminarySpeed',
    'makeUp.makeupStandardDu',
    'makeUp.editStandardDu',
    'system.loadKw',
    'system.supplyTempC',
    'system.returnTempC',
    'system.hydraulicLossM',
  ],

  'pump-choice': [
    'choicePump.pumpName',
    'choicePump.pumpCode',
    'choicePump.headM',
    'choicePump.flowM3h',
  ],

  pto: [
    'pto.name',
    'pto.code',
    'pto.reserve',
    'pto.primaryFlow',
    'pto.secondaryFlow',
    'pto.primaryLoss',
    'pto.secondaryLoss',
    'pto.priceHi',
    'pto.margin',
  ],

  design: [
    'design.systemName',
    'design.objectName',
    'design.author',
    'design.taskAuthor',
    'design.taskAuthorPhone',
    'design.calcNumber',
    'design.schemeKind',
  ],
};

/** Возвращает пустое значение для конкретного пути на основе EMPTY_INPUT. */
export function getEmptyValueForPath(emptyInput: InputData, path: string): unknown {
  const parts = path.split('.');
  let cur: unknown = emptyInput;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}