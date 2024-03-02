import * as Yup from 'yup';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useWaiterContext } from 'src/sections/waiter/context/waiter-context';

function RestaurantLoginFormView() {
  const { userID, waiterID } = useParams();
  const { fsGetWaiterLogin, fsUpdateWaiterInfo, staff } = useAuthContext();
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

  const {
    mutate,
    error: mutationError,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: (mutationFn) => mutationFn(),
    onSuccess: (unsubscribeFn) => {
      fsUpdateWaiterInfo(userID, waiterID, { isLoggedIn: true, lastLogIn: new Date() });
      setWaiterUnsubscribe(() => unsubscribeFn);
    },
  });

  console.log({ isSuccess, mutationError });

  // useEffect(() => {
  //   if (staff?.docID !== undefined) {
  //     mutate(() =>
  //       fsUpdateWaiterInfo(userID, waiterID, { isLoggedIn: true, lastLogIn: new Date() })
  //     );
  //   }
  // }, [fsUpdateWaiterInfo, mutate, staff?.docID, userID, waiterID]);

  const onSubmit = async ({ passCode }) => {
    mutate(() => fsGetWaiterLogin(userID, waiterID, passCode));
  };

  return (
    <Stack
      direction="column"
      justifyContent="space-between"
      alignItems="center"
      // sx={{ height: '100%', py: 2 }}
    >
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" spacing={2} sx={{ width: 400 }} justifyContent="space-between">
          <Typography>Welcome, [username]</Typography>
          <RHFTextField name="passCode" label="Pass Code" type="password" />
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
