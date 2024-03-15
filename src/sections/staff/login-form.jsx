import * as Yup from 'yup';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useMutation } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { delay } from 'src/utils/promise-delay';
import { useAuthContext } from 'src/auth/hooks';
import { shakingAnimation } from 'src/theme/css';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useStaffContext } from 'src/sections/staff/context/staff-context';

function StaffLoginForm() {
  const { userID, staffID } = useParams();
  const { fsGetStaffLogin, fsUpdateStaffInfo, fsGetStaffInfo } = useAuthContext();
  const { setWaiterUnsubscribe } = useStaffContext();

  const NewMealSchema = Yup.object().shape({
    passCode: Yup.string().required('Pass Code is Required'),
  });

  const defaultValues = {
    passCode: '',
  };

  const methods = useForm({
    resolver: yupResolver(NewMealSchema),
    defaultValues,
  });

  const { handleSubmit } = methods;

  const { data: staffInfo = {} } = useQuery({
    queryFn: () => fsGetStaffInfo(userID, staffID),
    queryKey: ['waiter', userID, staffID],
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (mutationFn) => mutationFn(),
    onSuccess: (unsubscribeFn) => {
      fsUpdateStaffInfo(userID, staffID, { isLoggedIn: true, lastLogIn: new Date() });
      setWaiterUnsubscribe(() => unsubscribeFn);
    },
  });

  const onSubmit = async ({ passCode }) => {
    mutate(async () => {
      await delay(500);
      await fsGetStaffLogin(userID, staffID, passCode);
    });
  };

  return (
    <Stack
      direction="column"
      justifyContent="space-between"
      alignItems="center"
      sx={{ ...(isError && shakingAnimation()) }}
      // sx={{ height: '100%', py: 2 }}
    >
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" spacing={2} sx={{ width: 500 }} justifyContent="space-between">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography>
              Welcome back, <b>{staffInfo?.fullname}</b> <Iconify icon="twemoji:waving-hand" />
            </Typography>
            <Image
              src={
                staffInfo.type === 'waiter'
                  ? '/assets/icons/staff/waiter-icon.svg'
                  : '/assets/icons/staff/chef-icon.svg'
              }
              sx={{ width: 28, height: 28 }}
            />
          </Stack>
          <RHFTextField
            name="passCode"
            label="Pass Code"
            type="password"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption">Powered by ProzEffect Menu</Typography>
            <LoadingButton variant="contained" type="submit" sx={{ px: 2 }} loading={isPending}>
              Login
            </LoadingButton>
          </Stack>
        </Stack>
      </FormProvider>
    </Stack>
  );
}
export default StaffLoginForm;
