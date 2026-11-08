import { Card, CardContent, Typography, Divider, Box } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

export function SectionCard({ title, children }: Props) {
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2, 
        border: '1px solid #e0e0e0', // Легкая серая рамка
        boxShadow: 'none',
        backgroundColor: 'transparent'
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#000', mb: 1 }}>
          {title}
        </Typography>
        <Divider sx={{ mb: 2, borderColor: '#e0e0e0' }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}