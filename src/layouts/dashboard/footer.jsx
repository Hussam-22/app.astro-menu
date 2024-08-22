import { Box, Link, Stack, Typography } from '@mui/material';

import Logo from 'src/components/logo';

export default function Footer() {
  return (
    <Box sx={{ alignSelf: 'flex-end' }}>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
        <Typography variant="body2" align="center">
          Powered by{' '}
          <Link href="https://www.updivision.com" target="_blank" rel="noopener noreferrer">
            Astro-Menu
          </Link>
        </Typography>
        <Logo />
      </Stack>
    </Box>
  );
}
