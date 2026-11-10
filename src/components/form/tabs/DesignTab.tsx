// src/components/form/tabs/DesignTab.tsx

import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Box,
  Typography,
  FormControl,
  FormHelperText,
  FormLabel,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { SectionCard } from '../../controls/SectionCard';
import { TextControl } from '../../controls/TextControl';
import type { InputData } from '../../../core/types';

const REQUIRED_MSG = 'Обязательное поле';

/**
 * Варианты принципиальной схемы.
 * image — путь в public/ (например, '/schemes/scheme-1.png').
 * Файлы кладутся в public/schemes/scheme-1.png, scheme-2.png, scheme-3.png.
 */
const BASE = import.meta.env.BASE_URL; // '/configurator/' или '/'

const SCHEME_OPTIONS: Array<{
  value: 'scheme1' | 'scheme2' | 'scheme3';
  label: string;
  image: string;
}> = [
  { value: 'scheme1', label: 'Схема 1', image: `${BASE}schemes/scheme-1.png` },
  { value: 'scheme2', label: 'Схема 2', image: `${BASE}schemes/scheme-2.png` },
  { value: 'scheme3', label: 'Схема 3', image: `${BASE}schemes/scheme-3.png` },
];

export function DesignTab() {
  const { control } = useFormContext<InputData>();

  // Диалог предпросмотра схемы
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<{
    label: string;
    image: string;
  } | null>(null);

  // Флаги «картинка не загрузилась» — по value схемы
  const [errored, setErrored] = useState<Record<string, boolean>>({});

  const openPreview = (label: string, image: string) => {
    setPreview({ label, image });
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
  };

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

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {SCHEME_OPTIONS.map((opt) => {
                    const selected = field.value === opt.value;
                    const isErrored = !!errored[opt.value];
                    return (
                      <Paper
                        key={opt.value}
                        variant="outlined"
                        role="radio"
                        aria-checked={selected}
                        tabIndex={0}
                        onClick={() => {
                          field.onChange(opt.value);
                          openPreview(opt.label, opt.image);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            field.onChange(opt.value);
                            openPreview(opt.label, opt.image);
                          }
                        }}
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
                          outline: 'none',
                          '&:focus-visible': {
                            boxShadow: (t) =>
                              `0 0 0 2px ${t.palette.primary.main}`,
                          },
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
                            color: 'text.secondary',
                            fontSize: 12,
                            textAlign: 'center',
                            px: 1,
                          }}
                        >
                          {isErrored ? (
                            'Нет изображения'
                          ) : (
                            <Box
                              component="img"
                              src={opt.image}
                              alt={opt.label}
                              sx={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                              }}
                              onError={() =>
                                setErrored((prev) => ({
                                  ...prev,
                                  [opt.value]: true,
                                }))
                              }
                            />
                          )}
                        </Box>
                        <Typography variant="body2" align="center">
                          {opt.label}
                        </Typography>
                      </Paper>
                    );
                  })}
                </Box>

                {error && <FormHelperText>{REQUIRED_MSG}</FormHelperText>}
              </FormControl>
            );
          }}
        />
      </SectionCard>

      {/* Диалог предпросмотра схемы */}
      <Dialog
        open={previewOpen}
        onClose={closePreview}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>{preview?.label ?? ''}</DialogTitle>
        <DialogContent dividers>
          {preview && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 200,
                gap: 2,
              }}
            >
              {errored[
                SCHEME_OPTIONS.find((o) => o.image === preview.image)?.value ??
                  ''
              ] ? (
                <Typography color="text.secondary">
                  Изображение не найдено
                </Typography>
              ) : (
                <Box
                  component="img"
                  src={preview.image}
                  alt={preview.label}
                  sx={{
                    display: 'block',
                    maxWidth: '100%',
                    maxHeight: '75vh',
                    objectFit: 'contain',
                  }}
                  onError={() => {
                    const opt = SCHEME_OPTIONS.find(
                      (o) => o.image === preview.image,
                    );
                    if (opt) {
                      setErrored((prev) => ({ ...prev, [opt.value]: true }));
                    }
                  }}
                />
              )}
              <Typography
                variant="caption"
                color="text.secondary"
                align="center"
              >
                Файл: public{preview.image}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePreview} color="primary">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}