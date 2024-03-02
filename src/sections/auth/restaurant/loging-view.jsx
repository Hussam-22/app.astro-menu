import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

const userID = 'n2LrTyRkktYlddyljHUPsodtpsf1';
const waiterID = '0dKABg8il9nDMsz8JgB1';

function RestaurantLoginView() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { fsGetWaiterLogin, staff } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (staff?.docID) router.replace('/waiter/n2LrTyRkktYlddyljHUPsodtpsf1/0dKABg8il9nDMsz8JgB1');
  }, [router, staff]);

  const onSubmit = async ({ passCode }) => {
    setIsLoading(true);
    fsGetWaiterLogin(userID, waiterID, passCode);
    setIsLoading(!staff?.docID);
    enqueueSnackbar('Login successful!');

    // mutate(() => fsAddNewMealLabel(data.title));
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
            <LoadingButton variant="contained" type="submit" sx={{ px: 2 }}>
              Login
            </LoadingButton>
          </Stack>
        </Stack>
      </FormProvider>
    </Stack>
  );
}
export default RestaurantLoginView;
