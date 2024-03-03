import * as Yup from 'yup';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useMutation } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { shakingAnimation } from 'src/theme/css';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useWaiterContext } from 'src/sections/waiter/context/waiter-context';

function RestaurantLoginFormView() {
  const { userID, waiterID } = useParams();
  const { fsGetWaiterLogin, fsUpdateWaiterInfo, fsGetWaiterInfo } = useAuthContext();
  const { setWaiterUnsubscribe } = useWaiterContext();

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

  const { data: waiterInfo = {} } = useQuery({
    queryFn: () => fsGetWaiterInfo(userID, waiterID),
    queryKey: ['waiter', userID, waiterID],
  });

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (mutationFn) => mutationFn(),
    onSuccess: (unsubscribeFn) => {
      fsUpdateWaiterInfo(userID, waiterID, { isLoggedIn: true, lastLogIn: new Date() });
      setWaiterUnsubscribe(() => unsubscribeFn);
    },
  });

  const onSubmit = async ({ passCode }) => {
    mutate(() => fsGetWaiterLogin(userID, waiterID, passCode));
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
          <Typography>
            Welcome back, <b>{waiterInfo?.fullname}</b>
          </Typography>
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
export default RestaurantLoginFormView;
