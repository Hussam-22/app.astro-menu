import { Card, Stack, useTheme, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';

function NoStatisticsAvailable() {
  const theme = useTheme();
  return (
    <Card sx={{ p: 3 }}>
      <Stack alignItems="center" justifyContent="center" direction="row" spacing={1}>
        <Iconify
          icon="ph:warning-circle-light"
          sx={{ width: 28, height: 28, color: theme.palette.text.disabled }}
        />
        <Typography variant="h6" sx={{ color: theme.palette.text.disabled }}>
          No Statistics Available
        </Typography>
      </Stack>
    </Card>
  );
}
export default NoStatisticsAvailable;
