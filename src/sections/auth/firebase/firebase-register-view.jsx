import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Box, Card } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import Logo from 'src/components/logo';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import Iconify from 'src/components/iconify';
// auth
import { useAuthContext } from 'src/auth/hooks';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

const DESCRIPTION = `'Established in 1950 by Tuscan chef Antonio Rossi, this restaurant has been a beloved downtown landmark, renowned for its authentic Italian cuisine and warm, inviting atmosphere. Now a multi-generational family business, it blends traditional recipes with modern flair, continuing to delight patrons with exceptional dishes sourced from local ingredients.'`;

// ----------------------------------------------------------------------

export default function FirebaseRegisterView() {
  const { fsCreateBusinessProfile } = useAuthContext();
  const [errorMsg, setErrorMsg] = useState('');
  const [open, setOpen] = useState(false);
  const password = useBoolean();
  const router = useRouter();

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First name required'),
    lastName: Yup.string().required('Last name required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
    businessName: Yup.string().required('Plan is required'),
    // languages: Yup.array()
    //   .min(1, 'Choose at least one option')
    //   .max(3, 'max 3 translation languages allowed in the trial plan'),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    businessName: '',
    // languages: [],
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
    // onSuccess: () => setOpen(true),
  });

  const onSubmit = handleSubmit(async (formData) => {
    try {
      mutate(() =>
        fsCreateBusinessProfile({
          ...formData,
        })
      );
    } catch (error) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const renderForm = (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <RHFTextField name="businessName" label="Business Name" />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <RHFTextField name="firstName" label="First name" />
        <RHFTextField name="lastName" label="Last name" />
      </Stack>

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
      {/* <RHFMultiSelect
        chip
        checkbox
        name="languages"
        label="Menu Target Languages"
        options={TRANSLATION_LANGUAGES.filter((option) => option.value !== values.defaultLanguage)}
      /> */}

      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
        <Typography>No Credit Card Required</Typography>
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

  return (
    <Card sx={{ pt: 2, width: { xs: 'auto', sm: '40dvw' } }}>
      <Logo sx={{ mx: 4 }} />
      <Typography variant="h6" color="secondary" sx={{ textAlign: 'left', px: 3 }}>
        Create your{' '}
        <Box component="span" sx={{ color: 'primary.main' }}>
          Astro-Menu
        </Box>{' '}
        account
      </Typography>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ p: 2, bgcolor: 'grey.100', mt: 1 }}
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

      <ConfirmDialog
        open={open}
        onClose={() => {
          router.push(paths.auth.firebase.login);
        }}
        title="Your account have successfully created"
        content="Please check your email to verify your account"
        closeText="Close"
      />
    </Card>
  );
}
