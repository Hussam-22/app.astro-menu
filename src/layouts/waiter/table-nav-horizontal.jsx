import { useParams } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Box, Stack, Button, useTheme, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { useWaiterContext } from 'src/sections/waiter/context/waiter-context';

function WaiterHorizontalNav() {
  const theme = useTheme();
  const { waiterInfo, waiterUnsubscribe } = useWaiterContext();
  const { userID, waiterID } = useParams();
  const { fsUpdateWaiterInfo, setStaff } = useAuthContext();
  const queryClient = useQueryClient();

  const { mutate, error, isPending } = useMutation({
    mutationFn: () => {
      setStaff({});
      fsUpdateWaiterInfo(userID, waiterID, { isLoggedIn: false });
      waiterUnsubscribe();
    },
  });

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
        <Button variant="contained" color="info" onClick={() => mutate()}>
          Logout
        </Button>
      </Stack>
    </Box>
  );
}
export default WaiterHorizontalNav;
