import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Card, MenuItem } from '@mui/material';
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
import { LANGUAGES } from 'src/_mock/translation-languages';
import FormProvider, { RHFSelect, RHFTextField, RHFMultiSelect } from 'src/components/hook-form';

const OPTIONS = LANGUAGES.map((language) => ({
  value: language.code,
  label: language.languageName,
})).sort((a, b) => a.label.localeCompare(b.label));

// ----------------------------------------------------------------------

export default function FirebaseRegisterView() {
  const { register, loginWithGoogle, fsCreateBusinessProfile, createDefaults } = useAuthContext();
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const password = useBoolean();

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First name required'),
    lastName: Yup.string().required('Last name required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
    businessName: Yup.string().required('Plan is required'),
    languages: Yup.array()
      .min(1, 'Choose at least one option')
      .max(3, 'max 3 translation languages allowed in the trial plan'),
    defaultLanguage: Yup.string().required('Default language is required'),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    businessName: '',
    address: '',
    languages: [],
    defaultLanguage: '',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    watch,
    reset,
    handleSubmit,
    formState: { isSubmitting, isDirty, errors },
  } = methods;

  console.log(errors);

  const {
    mutate,
    isPending,
    error: mutationError,
  } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
  });
  const values = watch();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      // const selectedPlan = PLANS_INFO.find((plan) => plan.name === data.plan);

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

  const renderTerms = (
    <Typography
      component="div"
      sx={{ color: 'text.secondary', mt: 2.5, typography: 'caption', textAlign: 'center' }}
    >
      {'By signing up, I agree to '}
      <Link underline="always" color="text.primary">
        Terms of Service
      </Link>
      {' and '}
      <Link underline="always" color="text.primary">
        Privacy Policy
      </Link>
      .
    </Typography>
  );

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
      <RHFSelect name="defaultLanguage" label="Default Languages">
        <MenuItem value="">None</MenuItem>
        {OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </RHFSelect>
      <RHFMultiSelect
        chip
        checkbox
        name="languages"
        label="Menu Target Languages"
        options={OPTIONS.filter((option) => option.value !== values.defaultLanguage)}
        disabled={values.defaultLanguage === ''}
      />

      <LoadingButton
        fullWidth
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
  );

  return (
    <Card sx={{ pt: 2 }}>
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
          <Typography variant="caption"> Already have an account? </Typography>
          <Link href={paths.auth.firebase.login} component={RouterLink} variant="caption">
            Sign in
          </Link>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Link underline="always" color="text.primary" variant="caption">
            Terms of Service
          </Link>

          <Link underline="always" color="text.primary" variant="caption">
            Privacy Policy
          </Link>
        </Stack>
      </Stack>
    </Card>
  );
}
