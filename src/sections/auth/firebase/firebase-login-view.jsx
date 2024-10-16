import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

// routes
import { paths } from 'src/routes/paths';
// components
import Iconify from 'src/components/iconify';
// auth
import { useAuthContext } from 'src/auth/hooks';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { PATH_AFTER_LOGIN } from 'src/config-global';
// config
import { useRouter, useSearchParams } from 'src/routes/hook';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function FirebaseLoginView() {
  const { login } = useAuthContext();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login?.(data.email, data.password);

      router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (error) {
      console.log(error.message);
      reset();
      if (error.message === 'Email not verified')
        setErrorMsg('Email not verified. Please verify your email.');

      if (error.code === 'auth/user-not-found')
        setErrorMsg('User not found. Please check your email and password.');

      if (error.code === 'auth/wrong-password')
        setErrorMsg('Wrong password. Please check your email and password.');

      if (error.code === 'auth/too-many-requests')
        setErrorMsg('Too many requests. Please try again later.');

      if (error.code === 'auth/user-disabled')
        setErrorMsg('User is disabled. Please contact support.');

      if (error.code === 'auth/invalid-email')
        setErrorMsg('Invalid email. Please check your email and password.');

      if (error.code === 'auth/network-request-failed')
        setErrorMsg('Network request failed. Please check your internet connection.');
    }
  });

  // const handleGoogleLogin = async () => {
  //   try {
  //     await loginWithGoogle?.();
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4">Sign in to Astro-Menu</Typography>

      <Stack direction="row" spacing={0.5} alignItems="center">
        <Typography variant="body2">New user?</Typography>

        <Link component={RouterLink} href={paths.auth.firebase.register} variant="subtitle2">
          Create an account
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <RHFTextField name="email" label="Email address" />

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

      <Link
        component={RouterLink}
        href={paths.auth.firebase.forgotPassword}
        variant="body2"
        color="inherit"
        underline="always"
        sx={{ alignSelf: 'flex-end' }}
      >
        Forgot password?
      </Link>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Login
      </LoadingButton>
    </Stack>
  );

  // const renderLoginOption = (
  //   <div>
  //     <Divider
  //       sx={{
  //         my: 2.5,
  //         typography: 'overline',
  //         color: 'text.disabled',
  //         '&::before, ::after': {
  //           borderTopStyle: 'dashed',
  //         },
  //       }}
  //     >
  //       OR
  //     </Divider>

  //     <Button
  //       endIcon={<Iconify icon="eva:google-fill" color="#DF3E30" />}
  //       onClick={handleGoogleLogin}
  //       fullWidth
  //       variant="outlined"
  //     >
  //       Login with Google
  //     </Button>
  //   </div>
  // );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}

      {/* {renderLoginOption} */}
    </FormProvider>
  );
}
