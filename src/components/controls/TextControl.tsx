import { TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';

interface Props<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  type?: 'text' | 'number';
  helperText?: string;
  error?: boolean;
}

export function TextControl<T extends FieldValues>({
  name,
  label,
  control,
  type = 'text',
  helperText,
  error: externalError,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const hasError = !!error || !!externalError;
        const helper = error?.message ?? helperText;
        return (
          <TextField
            name={field.name}
            inputRef={field.ref}
            onBlur={field.onBlur}
            label={label}
            type={type}
            variant="outlined"
            fullWidth
            size="small"
            error={hasError}
            helperText={helper}
            slotProps={{
              formHelperText: {
                sx: hasError ? { color: 'error.main' } : undefined,
              },
            }}
            value={
              field.value === undefined || field.value === null
                ? ''
                : String(field.value)
            }
            onChange={(e) => {
              field.onChange(e.target.value);
            }}
          />
        );
      }}
    />
  );
}