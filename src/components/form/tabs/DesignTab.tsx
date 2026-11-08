// src/components/form/tabs/DesignTab.tsx

import { Controller, useFormContext } from 'react-hook-form';
import {
  Box,
  Typography,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
} from '@mui/material';
import { SectionCard } from '../../controls/SectionCard';
import { TextControl } from '../../controls/TextControl';
import type { InputData } from '../../../core/types';

const REQUIRED_MSG = 'Обязательное поле';

/**
 * Варианты принципиальной схемы.
 * Замени value/label/image на свои. image — путь в public/ (например, '/schemes/scheme-1.png')
 * или импортированный из src/assets путь.
 */
const SCHEME_OPTIONS: Array<{
  value: 'scheme1' | 'scheme2' | 'scheme3';
  label: string;
  image: string;
}> = [
  { value: 'scheme1', label: 'Схема 1', image: '/schemes/scheme-1.png' },
  { value: 'scheme2', label: 'Схема 2', image: '/schemes/scheme-2.png' },
  { value: 'scheme3', label: 'Схема 3', image: '/schemes/scheme-3.png' },
];

export function DesignTab() {
  const { control } = useFormContext<InputData>();

  return (
    <Box>
      {/* === Данные для оформления === */}
      <SectionCard title="Данные для оформления">
        <TextControl name="design.systemName" label="Наименование системы" control={control} />
        <TextControl name="design.objectName" label="Название объекта" control={control} />
        <TextControl name="design.author" label="Автор" control={control} />
        <TextControl name="design.taskAuthor" label="Автор задачи в ЦРМ" control={control} />
        <TextControl name="design.taskAuthorPhone" label="Номер автора задачи" control={control} />
        <TextControl name="design.calcNumber" label="Номер расчёта" control={control} />
      </SectionCard>

      <Divider sx={{ my: 3 }} />

      {/* === Принципиальная схема === */}
      <SectionCard title="Принципиальная схема">
        <Controller
          name="design.schemeKind"
          control={control}
          render={({ field, fieldState }) => {
            const error = !!fieldState.error;
            return (
              <FormControl component="fieldset" error={error} fullWidth>
                <FormLabel component="legend" sx={{ mb: 1 }}>
                  Выберите схему
                </FormLabel>

                <RadioGroup
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  row
                  sx={{ gap: 2, flexWrap: 'wrap' }}
                >
                  {SCHEME_OPTIONS.map((opt) => {
                    const selected = field.value === opt.value;
                    return (
                      <FormControlLabel
                        key={opt.value}
                        value={opt.value}
                        control={
                          <Radio
                            sx={{
                              // Радио-кнопку визуально прячем — карточка сама индикатор
                              position: 'absolute',
                              opacity: 0,
                              pointerEvents: 'none',
                            }}
                          />
                        }
                        label={
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              width: 220,
                              cursor: 'pointer',
                              borderWidth: selected ? 2 : 1,
                              borderColor: selected
                                ? 'primary.main'
                                : error
                                  ? 'error.main'
                                  : 'divider',
                              boxShadow: selected ? 3 : 0,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Box
                              sx={{
                                width: '100%',
                                aspectRatio: '4 / 3',
                                bgcolor: '#f5f5f5',
                                borderRadius: 1,
                                mb: 1,
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Box
                                component="img"
                                src={opt.image}
                                alt={opt.label}
                                sx={{
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                  objectFit: 'contain',
                                }}
                                onError={(e) => {
                                  // Если картинки пока нет — просто скрываем её
                                  (e.currentTarget as HTMLImageElement).style.visibility =
                                    'hidden';
                                }}
                              />
                            </Box>
                            <Typography variant="body2" align="center">
                              {opt.label}
                            </Typography>
                          </Paper>
                        }
                        sx={{
                          m: 0,
                          '& .MuiFormControlLabel-label': { display: 'block' },
                        }}
                      />
                    );
                  })}
                </RadioGroup>

                {error && (
                  <FormHelperText>{REQUIRED_MSG}</FormHelperText>
                )}
              </FormControl>
            );
          }}
        />
      </SectionCard>
    </Box>
  );
}