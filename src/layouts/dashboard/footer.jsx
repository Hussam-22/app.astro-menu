import { Box, Stack, Typography } from '@mui/material';

import Logo from 'src/components/logo';

export default function Footer() {
  return (
    <Box sx={{ alignSelf: 'flex-end' }}>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
        <Typography variant="body2" align="center">
          Powered by{' '}
        </Typography>
        <Logo />
      </Stack>
    </Box>
  );
}
