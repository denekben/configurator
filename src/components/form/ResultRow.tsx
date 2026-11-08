// src/components/form/ResultRow.tsx

import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import InfoIcon from '@mui/icons-material/Info';

interface Props {
  label: string;
  value: string;
  unit?: string;
  latexFormulaWithNumbers?: string;
  /** Подсветить строку как ошибку (красным). */
  highlightError?: boolean;
}

export function ResultRow({
  label,
  value,
  unit,
  latexFormulaWithNumbers,
  highlightError = false,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          color: highlightError ? 'error.main' : 'text.secondary',
        }}
      >
        {label}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'normal',
            color: highlightError ? 'error.main' : undefined,
          }}
        >
          {value} <small>{unit ?? ''}</small>
        </Typography>

        {latexFormulaWithNumbers && (
          <>
            <IconButton
              size="small"
              onClick={() => setOpen(true)}
              title="Показать расчет"
            >
              <InfoIcon
                fontSize="small"
                color={highlightError ? 'error' : 'action'}
              />
            </IconButton>

            <Dialog
              open={open}
              onClose={() => setOpen(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Расчет: {label}</DialogTitle>
              <DialogContent dividers>
                <BlockMath math={latexFormulaWithNumbers} />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)} color="primary">
                  Закрыть
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Box>
    </Box>
  );
}