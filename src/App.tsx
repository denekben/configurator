// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  Tooltip,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { InputForm } from './components/form/InputForm';
import type { InputFormHandle } from './components/form/InputForm';
import { MissingFieldsDialog } from './components/MissingFieldsDialog';
import type { CalcResult, InputData } from './core/types';

const theme = createTheme({
  palette: {
    primary: { main: '#8B0000' },
    text: {
      primary: '#000000',
      secondary: '#555555',
    },
    divider: '#e0e0e0',
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#8B0000',
            fontWeight: 'bold',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          '&.MuiButton-containedPrimary': {
            backgroundColor: '#8B0000',
            '&:hover': { backgroundColor: '#a00000' },
          },
        },
      },
    },
  },
});

/**
 * «Ручные» поля, которые физически лежат в results.*, но по смыслу — ввод пользователя.
 * Проверяем их только при выполнении условия `when`.
 */
const CONDITIONAL_RESULT_FIELDS: Array<{
  path: keyof CalcResult;
  when: (input: InputData) => boolean;
}> = [
  {
    path: 'standardDiameterMm',
    when: (input) => input.steamPipe.mode === 'manual',
  },
  {
    path: 'trapDu',
    when: (input) => input.condensateTrap.mode === 'manual',
  },
  {
    path: 'trapDesignDeltaP',
    when: (input) => input.condensateTrap.mode === 'manual',
  },
  {
    path: 'trapTypeDeltaP',
    when: (input) => input.condensateTrap.mode === 'manual',
  },
  {
    path: 'trapActualCapacityKgH',
    when: (input) => input.condensateTrap.mode === 'manual',
  },
];

/**
 * Собирает «служебные» пути незаполненных полей InputData.
 */
function collectMissing(input: InputData): string[] {
  const SKIP_KEYS = new Set(['results', 'mode', 'editStandardDu']);
  const missing: string[] = [];

  const isEmptyValue = (v: unknown): boolean =>
    v === undefined ||
    v === null ||
    v === '' ||
    (typeof v === 'number' && Number.isNaN(v));

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

  for (const { path, when } of CONDITIONAL_RESULT_FIELDS) {
    if (!when(input)) continue;
    const value = input.results?.[path];
    if (isEmptyValue(value)) {
      missing.push(`results.${String(path)}`);
    }
  }

  return missing;
}

function App() {
  const [result, setResult] = useState<CalcResult | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const formRef = useRef<InputFormHandle>(null);

  useEffect(() => {
    if (result) {
      console.log('=== CalcResult ===');
      console.table(result);
      console.log(JSON.stringify(result, null, 2));
    }
  }, [result]);

  const generateFile = () => {
    try {
      downloadSpecSkeleton('Спецификация_скелет.xlsx');
    } catch (err) {
      console.error('Не удалось сгенерировать документацию:', err);
      alert('Ошибка при генерации файла. Подробности в консоли.');
    }
  };

  const handleGenerateDoc = () => {
    
  };

  const handleGenerateAnyway = () => {
    setDialogOpen(false);
    generateFile();
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.appBar }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Конфигуратор паровых блоков
          </Typography>

          <Tooltip title="Скачать Спецификация_скелет.xlsx">
            <span>
              <Button
                color="inherit"
                variant="outlined"
                startIcon={<DescriptionOutlinedIcon />}
                onClick={handleGenerateDoc}
                sx={{
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.85)',
                  '&:hover': {
                    borderColor: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                  },
                }}
              >
                Сгенерировать документацию
              </Button>
            </span>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ pt: 10, pb: 4 }}>
        {result === null ? (
          <InputForm
            ref={formRef}
            onCalculated={(_data, calc) => setResult(calc)}
          />
        ) : (
          <Box>
            <Typography variant="h4" gutterBottom>
              Результаты расчёта
            </Typography>
            <pre>{JSON.stringify(result, null, 2)}</pre>
            <Button
              variant="contained"
              onClick={() => setResult(null)}
              sx={{ mt: 2 }}
            >
              Вернуться назад
            </Button>
          </Box>
        )}
      </Container>

      <MissingFieldsDialog
        open={dialogOpen}
        items={missing}
        onClose={() => setDialogOpen(false)}
        onGenerateAnyway={handleGenerateAnyway}
      />
    </ThemeProvider>
  );
}

export default App;