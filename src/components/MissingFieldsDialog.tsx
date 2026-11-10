// src/components/MissingFieldsDialog.tsx

import { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
} from '@mui/material';
import {
  humanizePath,
  getSectionOf,
  humanizeSection,
} from '../core/fieldLabels';

interface Props {
  open: boolean;
  items: string[];
  onClose: () => void;
  onGenerateAnyway: () => void;
}

interface Group {
  section: string;
  title: string;
  isResultOnly: boolean;
  fields: string[];
}

export function MissingFieldsDialog({
  open,
  items,
  onClose,
  onGenerateAnyway,
}: Props) {
  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Group>();

    for (const path of items) {
      const section = getSectionOf(path);
      if (!map.has(section)) {
        map.set(section, {
          section,
          title: humanizeSection(section),
          isResultOnly: true,
          fields: [],
        });
      }
      const group = map.get(section)!;
      group.fields.push(path);
      if (!path.startsWith('results.')) {
        group.isResultOnly = false;
      }
    }

    return Array.from(map.values());
  }, [items]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Не все поля заполнены</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Документация может быть сгенерирована, но часть данных пуста:
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {groups.map((group) => (
            <Box key={group.section}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {group.title}
                {group.isResultOnly ? '. Результаты расчёта' : ''}:
              </Typography>
              <Box
                component="ul"
                sx={{
                  m: 0,
                  pl: 2.5,
                  fontSize: 14,
                }}
              >
                {group.fields.map((path) => (
                  <li key={path}>{humanizePath(path)}</li>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} color="inherit">
            Закрыть
          </Button>
          <Button onClick={onGenerateAnyway} color="primary" variant="contained">
            Всё равно сгенерировать
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}