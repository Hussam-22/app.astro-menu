import { Box, Stack, Typography } from '@mui/material';

import Image from 'src/components/image';

function Footer() {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{
        bgcolor: 'background.paper',
        height: 40,
        width: '100%',
      }}
    >
      <Typography variant="caption">
        Powered By{' '}
        <Box component="span" sx={{ color: 'primary.main' }}>
          Astro-Menu
        </Box>
      </Typography>
      <Image src="/assets/astro-logo.svg" alt="Astro-Menu Logo" width={30} height={30} />
    </Stack>
  );
}
export default Footer;
