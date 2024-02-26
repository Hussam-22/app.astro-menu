import { Box, Stack, Button, useTheme, Typography } from '@mui/material';

import { useWaiterContext } from 'src/sections/waiter/context/waiter-context';

function WaiterHorizontalNav() {
  const { waiterInfo } = useWaiterContext();
  const theme = useTheme();
  return (
    <Box
      sx={{
        py: 1.4,
        borderBottom: `dashed 1px ${theme.palette.divider}`,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ bgcolor: 'info.lighter', borderRadius: 2, py: 2, px: 3 }}
      >
        <Typography
          sx={{ fontWeight: theme.typography.fontWeightBold, color: 'info.main' }}
        >{`Hello, ${waiterInfo.fullname}`}</Typography>
        <Button variant="contained" color="info">
          Logout
        </Button>
      </Stack>
    </Box>
  );
}
export default WaiterHorizontalNav;
