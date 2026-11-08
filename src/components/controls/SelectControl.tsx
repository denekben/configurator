import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
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
  error?: boolean;
  helperText?: string;
}

export function SelectControl<T extends FieldValues>({
  name,
  label,
  control,
  options,
  error: errorProp,
  helperText,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const hasError = !!error || !!errorProp;
        const message = error?.message ?? helperText;

        return (
          <FormControl fullWidth size="small" error={hasError}>
            <InputLabel>{label}</InputLabel>
            <Select
              {...field}
              value={field.value ?? ''}
              label={label}
              onChange={(e) => field.onChange(e.target.value)}
            >
              {options.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            {hasError && message && <FormHelperText>{message}</FormHelperText>}
          </FormControl>
        );
      }}
    />
  );
}