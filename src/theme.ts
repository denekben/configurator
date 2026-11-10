// src/app/theme.ts

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#8B0000' },
    text: {
      primary: '#000000',
      secondary: '#555555',
    },
    divider: '#e0e0e0',
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#8B0000',
            fontWeight: 'bold',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          '&.MuiButton-containedPrimary': {
            backgroundColor: '#8B0000',
            '&:hover': { backgroundColor: '#a00000' },
          },
        },
      },
    },
  },
});