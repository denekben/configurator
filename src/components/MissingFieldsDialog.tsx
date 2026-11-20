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
} from '../core/fieldMeta';

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
      const isResultOnly = path.startsWith('results.');
      const groupKey = `${section}::${isResultOnly ? 'result' : 'input'}`;

      if (!map.has(groupKey)) {
        map.set(groupKey, {
          section,
          title: humanizeSection(section),
          isResultOnly,
          fields: [],
        });
      }
      map.get(groupKey)!.fields.push(path);
    }

    return Array.from(map.values()).sort((a, b) => {
      if (a.section !== b.section) return a.section.localeCompare(b.section);
      return Number(a.isResultOnly) - Number(b.isResultOnly);
    });
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
            <Box key={`${group.section}-${group.isResultOnly ? 'r' : 'i'}`}>
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