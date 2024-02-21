import { Box, Typography } from '@mui/material';

import { useWaiterContext } from 'src/sections/waiter/context/waiter-context';

function WaiterHorizontalNav() {
  const { waiterInfo } = useWaiterContext();
  return (
    <Box
      sx={{
        mt: 3,
        mb: 1,
        pb: 2,
        borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
      }}
    >
      <Typography>{`Hello,${waiterInfo.fullname}`}</Typography>
    </Box>
  );
}
export default WaiterHorizontalNav;
