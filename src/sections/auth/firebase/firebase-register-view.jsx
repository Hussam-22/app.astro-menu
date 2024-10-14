import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useMutation } from '@tanstack/react-query';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Divider, MenuItem } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';

import Image from 'src/components/image';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import Iconify from 'src/components/iconify';
import { delay } from 'src/utils/promise-delay';
// auth
import { useAuthContext } from 'src/auth/hooks';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { RouterLink } from 'src/routes/components';
import { LoadingScreen } from 'src/components/loading-screen';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import BuildingProfileDialog from 'src/sections/auth/firebase/components/building-profile-dialog';

// ----------------------------------------------------------------------

export default function FirebaseRegisterView() {
  const { fsCreateBusinessProfile, fsGetProducts } = useAuthContext();
  const [errorMsg, setErrorMsg] = useState('');
  const [open, setOpen] = useState(false);
  const password = useBoolean();
  const router = useRouter();

  console.log(errorMsg);

  const onClose = () => {
    setOpen(false);
    router.push(paths.auth.firebase.login);
  };

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fsGetProducts,
  });

  const RegisterSchema = Yup.object().shape({
    // firstName: Yup.string().required('First name required'),
    // lastName: Yup.string().required('Last name required'),
    email: Yup.string()
      .required('Business Email is required')
      .email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
    businessName: Yup.string().required('Plan is required'),
    plan: Yup.string().required('Plan is required'),
  });

  const defaultValues = {
    // firstName: '',
    // lastName: '',
    email: '',
    password: '',
    businessName: '',
    plan: '',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    watch,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
  });

  const onSubmit = handleSubmit(async (formData) => {
    try {
      mutate(async () => {
        await delay(1000);
        const product = productsData.find((item) => item.id === formData.plan);
        fsCreateBusinessProfile({
          ...formData,
          plan: product.default_price,
          productID: product.id,
        });
      });
      setOpen(true);
    } catch (error) {
      reset();
      setErrorMsg(error);
    }
  });

  const renderForm = (
    <Stack spacing={1.5} sx={{ py: 2 }}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      {!isLoading && (
        <RHFSelect name="plan" label="Select your Plan">
          <MenuItem value="">-- Select your plan --</MenuItem>
          {productsData
            .filter((product) => product.active)
            .map((product) => (
              <MenuItem key={product.id} value={product.id}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Image src={product.images[0]} sx={{ width: 22, height: 22 }} />
                  {product.name}
                </Stack>
              </MenuItem>
            ))}
        </RHFSelect>
      )}

      <RHFTextField name="businessName" label="Business Name" />

      {/* <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <RHFTextField name="firstName" label="First name" />
        <RHFTextField name="lastName" label="Last name" />
      </Stack> */}

      <RHFTextField name="email" label="Business Email address" />

      <RHFTextField
        name="password"
        label="Password"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Stack
        direction={{ sm: 'row', xs: 'column' }}
        justifyContent="flex-end"
        alignItems="center"
        spacing={2}
      >
        <Stack
          direction={{ xs: 'row', sm: 'column' }}
          sx={{ textAlign: { xs: 'center', sm: 'right' } }}
          spacing={0}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
            14 Days free trial
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
            No Credit Card Required
          </Typography>
        </Stack>
        <LoadingButton
          color="primary"
          size="large"
          type="submit"
          variant="contained"
          loading={isPending}
          disabled={!isDirty}
        >
          Create account
        </LoadingButton>
      </Stack>
    </Stack>
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Stack direction="row" justifyContent="left" spacing={1}>
        <Typography variant="h4" color="secondary">
          Create your{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>
            Astro-Menu
          </Box>{' '}
          account
        </Typography>
      </Stack>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
      <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent={{ xs: 'center', sm: 'space-between' }}
        alignItems="center"
        sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography variant="body2"> Already have an account? </Typography>
          <Link href={paths.auth.firebase.login} component={RouterLink} variant="caption">
            Sign in
          </Link>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Link underline="always" color="text.primary" variant="body2">
            Terms of Service
          </Link>

          <Link underline="always" color="text.primary" variant="body2">
            Privacy Policy
          </Link>
        </Stack>
      </Stack>

      <BuildingProfileDialog open={open} onClose={onClose} />
    </>
  );
}
