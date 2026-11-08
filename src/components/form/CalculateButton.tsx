import { Button, Box } from '@mui/material';

interface Props {
  onClick: () => void;
}

export function CalculateButton({ onClick }: Props) {
  return (
    <Box sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
      <Button type="button" variant="contained" size="large" onClick={onClick} sx={{ backgroundColor: '#8B0000' }}>
        Рассчитать
      </Button>
    </Box>
  );
}