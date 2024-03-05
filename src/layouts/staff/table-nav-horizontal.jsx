import { useParams } from 'react-router';
import { useMutation } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, useTheme, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { delay } from 'src/utils/promise-delay';
import { useStaffContext } from 'src/sections/staff/context/staff-context';

function StaffHorizontalNav() {
  const theme = useTheme();
  const { userID, staffID } = useParams();
  const { waiterUnsubscribe } = useStaffContext();
  const { fsUpdateStaffInfo, setStaff, staff } = useAuthContext();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await delay(500);
      setStaff({});
      fsUpdateStaffInfo(userID, staffID, { isLoggedIn: false });
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
        sx={{
          bgcolor: staff.type === 'chef' ? 'warning.lighter' : 'info.lighter',
          borderRadius: 2,
          py: 2,
          px: 3,
        }}
      >
        <Typography
          sx={{
            fontWeight: theme.typography.fontWeightBold,
            color: 'common.black',
          }}
        >
          {`Hello, ${staff?.fullname}`}
        </Typography>
        <LoadingButton
          variant="contained"
          color={staff.type === 'chef' ? 'warning' : 'info'}
          onClick={() => mutate()}
          loading={isPending}
        >
          Logout
        </LoadingButton>
      </Stack>
    </Box>
  );
}
export default StaffHorizontalNav;
