// src/components/MissingFieldsDialog.tsx

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

interface Props {
  open: boolean;
  items: string[];
  onClose: () => void;
  onGenerateAnyway: () => void;
}

export function MissingFieldsDialog({
  open,
  items,
  onClose,
  onGenerateAnyway,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Не все поля заполнены</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Документация может быть сгенерирована, но часть данных пуста:
        </Typography>

        <Box
          component="ul"
          sx={{
            m: 0,
            pl: 2.5,
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: 13,
          }}
        >
          {items.map((path) => (
            <li key={path}>{path}</li>
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