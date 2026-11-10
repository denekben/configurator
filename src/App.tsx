// src/app/App.tsx

import { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Tooltip,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { ThemeProvider } from '@mui/material/styles';

import { InputForm } from './components/form/InputForm';
import type { InputFormHandle } from './components/form/InputForm';
import { MissingFieldsDialog } from './components/MissingFieldsDialog';
import { theme } from './theme';
import { collectMissing } from './core/collectMissing';
import type { CalcResult } from './core/types';

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
      // TODO: здесь будет реальная генерация xlsx
      alert('Генерация документации (заглушка). См. консоль.');
    } catch (err) {
      console.error('Не удалось сгенерировать документацию:', err);
      alert('Ошибка при генерации файла. Подробности в консоли.');
    }
  };

  const handleGenerateDoc = () => {
    const data = formRef.current?.getValues();
    if (!data) {
      generateFile();
      return;
    }

    const missingPaths = collectMissing(data);
    if (missingPaths.length > 0) {
      setMissing(missingPaths);
      setDialogOpen(true);
      return;
    }

    generateFile();
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
        <InputForm
          ref={formRef}
          onCalculated={(_data, calc) => setResult(calc)}
        />
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