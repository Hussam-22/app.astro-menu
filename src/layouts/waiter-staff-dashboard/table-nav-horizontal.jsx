import { useParams } from 'react-router';
import { useMutation } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Stack, useTheme, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { delay } from 'src/utils/promise-delay';
import { useStaffContext } from 'src/sections/waiter-staff-dashboard/context/staff-context';

function StaffHorizontalNav() {
  const theme = useTheme();
  const { businessProfileID, staffID } = useParams();
  const {
    waiterUnsubscribe,
    branchInfo,
    businessProfile: { businessName },
  } = useStaffContext();
  const { fsUpdateStaffInfo, setStaff, staff } = useAuthContext();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await delay(500);
      setStaff({});
      fsUpdateStaffInfo(businessProfileID, staffID, { isLoggedIn: false });
      waiterUnsubscribe();
    },
  });

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        bgcolor: 'primary.light',
        py: 1,
        px: 2,
        mb: 2,
      }}
    >
      <Typography
        sx={{
          fontWeight: theme.typography.fontWeightBold,
          color: 'common.black',
        }}
      >
        Hello, {staff?.fullname}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Typography sx={{ fontWeight: 'bold' }}>{businessName}</Typography>
        <span>|</span>
        <Typography>{branchInfo.title}</Typography>
      </Stack>
      <LoadingButton
        variant="contained"
        color="primary"
        onClick={() => mutate()}
        loading={isPending}
      >
        Logout
      </LoadingButton>
    </Stack>
  );
}
export default StaffHorizontalNav;
