// src/components/controls/RadioControl.tsx

import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';

interface Option {
  value: string;
  label: string;
}

interface Props<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  options: Option[];
  /** Внешняя ошибка (например, «Выберите режим подбора»). */
  error?: boolean;
  /** Внешний helperText под группой. */
  helperText?: string;
}

export function RadioControl<T extends FieldValues>({
  name,
  label,
  control,
  options,
  error,
  helperText,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error: fieldError } }) => {
        const hasError = !!error || !!fieldError;
        const helper = helperText ?? fieldError?.message;

        return (
          <FormControl component="fieldset" error={hasError}>
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup
              row
              {...field}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value)}
            >
              {options.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={<Radio />}
                  label={opt.label}
                />
              ))}
            </RadioGroup>
            {hasError && helper && <FormHelperText>{helper}</FormHelperText>}
          </FormControl>
        );
      }}
    />
  );
}