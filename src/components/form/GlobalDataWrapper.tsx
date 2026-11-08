import { ReactNode } from 'react';
import { Box, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { useGlobalEdit } from './GlobalEditContext';

interface Props {
  children: ReactNode;
  /** Если задано — блок всегда в этом состоянии (для вкладки «Глобальные данные»). */
  defaultEditable?: boolean;
}

export function GlobalDataWrapper({ children, defaultEditable }: Props) {
  const ctx = useGlobalEdit();
  const controlled = defaultEditable !== undefined;

  // Контролируемый режим — берём из пропса.
  // Неконтролируемый — из контекста вкладки (единственный источник истины).
  const isEditable = controlled ? (defaultEditable as boolean) : ctx.editable;

  const handleChange = (v: boolean) => {
    if (controlled) return; // чекбокс в этом режиме не показывается
    ctx.setEditable(v);
  };

  return (
    <Box sx={{ position: 'relative', mb: 3 }}>
      <Box
        sx={{
          position: 'absolute',
          top: -8,
          left: -8,
          right: -8,
          bottom: -8,
          border: '1px solid #cccccc',
          borderRadius: 1,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {!controlled && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isEditable}
                  onChange={(e) => handleChange(e.target.checked)}
                  size="small"
                  sx={{
                    color: '#888',
                    '&.Mui-checked': { color: '#8B0000' },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: '#555', fontWeight: 500 }}>
                  Редактировать в этом расчете (может повлиять на расчеты других компонентов)
                </Typography>
              }
            />
          </Box>
        )}

        <fieldset
          disabled={!isEditable}
          style={{ border: 'none', padding: 0, margin: 0, opacity: isEditable ? 1 : 0.6 }}
        >
          {children}
        </fieldset>
      </Box>
    </Box>
  );
}