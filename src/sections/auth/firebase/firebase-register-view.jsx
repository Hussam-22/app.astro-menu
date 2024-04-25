import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import { Box, Card, Button, MenuItem, useTheme } from '@mui/material';

import Image from 'src/components/image';
// routes
import { paths } from 'src/routes/paths';
import Label from 'src/components/label';
import { useRouter } from 'src/routes/hook';
// components
import Iconify from 'src/components/iconify';
import { PLANS_INFO } from 'src/_mock/_planes';
// auth
import { useAuthContext } from 'src/auth/hooks';
import { COUNTRIES } from 'src/_mock/_countries';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { LANGUAGES } from 'src/_mock/translation-languages';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { addOneMonth } from 'src/utils/get-next-payment-date';
import FormProvider, { RHFSelect, RHFTextField, RHFMultiSelect } from 'src/components/hook-form';

const OPTIONS = LANGUAGES.map((language) => ({
  value: language.code,
  label: language.languageName,
})).sort((a, b) => a.label.localeCompare(b.label));

// ----------------------------------------------------------------------

export default function FirebaseRegisterView() {
  const {
    register,
    loginWithGoogle,
    loginWithGithub,
    loginWithTwitter,
    fsCreateBusinessProfile,
    createDefaults,
  } = useAuthContext();
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const password = useBoolean();
  const isDialogOpen = useBoolean(false);
  const theme = useTheme();

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First name required'),
    lastName: Yup.string().required('Last name required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
    country: Yup.string().required('Country is required'),
    plan: Yup.string().required('Plan is required'),
    businessName: Yup.string().required('Plan is required'),
    languages: Yup.array()
      .min(1, 'Choose at least one option')
      .max(3, 'max 3 translation languages allowed in the trial plan'),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    businessName: '',
    address: '',
    country: '',
    plan: '',
    languages: [],
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const {
    mutate,
    isPending,
    error: mutationError,
  } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
  });

  console.log({ isPending, mutationError });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const selectedPlan = PLANS_INFO.find((plan) => plan.name === data.plan);
      const { plan, ...formData } = data;
      const businessProfile = {
        ...formData,
        planInfo: [
          {
            ...selectedPlan,
            isTrial: true,
            activationDate: new Date(),
            trialExpiration: addOneMonth(),
            isActive: true,
          },
        ],
        paymentInfo: [
          {
            isPaid: true,
            amount: 0,
            term: 'monthly',
            paymentDate: new Date(),
            nextPaymentDate: addOneMonth(),
          },
        ],
      };

      mutate(() => fsCreateBusinessProfile(businessProfile));

      // const searchParams = new URLSearchParams({ email: data.email }).toString();
      // const href = `${paths.auth.firebase.verify}?${searchParams}`;
      // router.push(href);
    } catch (error) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle?.();
    } catch (error) {
      console.error(error);
    }
  };

  const handleGithubLogin = async () => {
    try {
      await loginWithGithub?.();
    } catch (error) {
      console.error(error);
    }
  };

  const handleTwitterLogin = async () => {
    try {
      await loginWithTwitter?.();
    } catch (error) {
      console.error(error);
    }
  };

  const renderHead = (
    <Stack spacing={1} sx={{ mb: 4, position: 'relative' }}>
      {/* <Typography variant="overline">All plans come with 1 month free trial</Typography> */}
      <Typography variant="h4" sx={{ mt: -1 }}>
        Get started absolutely free
      </Typography>

      <Stack direction="row" spacing={0.5} alignItems="center">
        <Typography variant="body2"> Already have an account? </Typography>

        <Link href={paths.auth.firebase.login} component={RouterLink} variant="body2">
          Sign in
        </Link>
      </Stack>
    </Stack>
  );

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
    <Stack spacing={2}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="overline" sx={{ color: 'secondary.main' }}>
          Not sure which plan suits you
        </Typography>
        <Button
          variant="soft"
          color="secondary"
          size="small"
          onClick={() => isDialogOpen.onTrue()}
          endIcon={<Iconify icon="iconamoon:compare-duotone" />}
        >
          Compare Plans
        </Button>
      </Stack>
      <RHFSelect name="plan" label="Plan">
        <MenuItem value="">None</MenuItem>
        <Divider sx={{ borderStyle: 'dashed' }} />
        {PLANS_INFO.map((plan) => (
          <MenuItem value={plan.name} key={plan.name}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Image
                src={`/assets/icons/plans/${plan.media.icon}.svg`}
                sx={{ width: 24, height: 24 }}
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="overline">{`${plan.name} - ${plan.cost.monthly} AED`}</Typography>
                {plan.isFav && <Label color="primary">Popular</Label>}
              </Stack>
            </Stack>
          </MenuItem>
        ))}
      </RHFSelect>
      <Typography variant="body2" sx={{ mt: -1, color: 'text.disabled' }}>
        No Credit Card is Required, All Plans start with 1 month free trial !!
      </Typography>

      <RHFMultiSelect chip checkbox name="languages" label="Menu Languages" options={OPTIONS} />

      <RHFTextField name="businessName" label="Business Name" />
      <Stack direction="row" spacing={2}>
        <RHFTextField name="address" label="Address" />
        <RHFSelect name="country" label="Country">
          <MenuItem value="">None</MenuItem>
          <Divider sx={{ borderStyle: 'dashed' }} />
          {COUNTRIES.map((country) => (
            <MenuItem key={country} value={country}>
              {country}
            </MenuItem>
          ))}
        </RHFSelect>
      </Stack>

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

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isPending}
      >
        Create account
      </LoadingButton>
    </Stack>
  );

  const plansCards = (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { sm: 'repeat(4,1fr)', xs: 'repeat(1,1fr)' },
        gap: 1,
      }}
    >
      {PLANS_INFO.map((plan) => (
        <Card
          sx={{
            p: 3,
            border: plan.isFav ? `solid 3px ${theme.palette.secondary.light}` : 'solid 2px #000000',
            boxShadow: `3px 3px 0 0 ${plan.isFav ? theme.palette.secondary.light : '#000000'}`,
            borderRadius: 1,
          }}
          key={plan.name}
        >
          <Stack direction="column" spacing={1}>
            <Stack direction="column" spacing={1} sx={{ height: 140 }}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Image
                    src={`/assets/icons/plans/${plan.media.icon}.svg`}
                    sx={{ width: 34, height: 34, borderRadius: 1 }}
                  />
                  <Typography variant="h5" sx={{ whiteSpace: 'nowrap' }}>
                    {plan.name}
                  </Typography>
                </Stack>
                <Typography variant="h5">
                  {plan.cost.monthly} <sup style={{ fontSize: '9px' }}>AED</sup>
                </Typography>
              </Stack>
              <Typography variant="body2">{plan.description}</Typography>
              <Box>{plan.isFav && <Label color="secondary">Popular</Label>}</Box>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed' }} flexItem />

            <Typography variant="h6">Features</Typography>

            <Stack direction="column" spacing={0.5} sx={{ ml: 2 }}>
              <Stack direction="row" spacing={0.5}>
                <Typography variant="body2">
                  <strong>Digital Menu</strong>
                </Typography>
                <Iconify icon="ph:check-circle-bold" sx={{ color: 'success.main' }} />
              </Stack>
              <Stack direction="row" spacing={0.5}>
                <Typography variant="body2">
                  <strong>Analytics</strong>
                </Typography>
                <Iconify
                  icon="ph:check-circle-bold"
                  sx={{ color: plan.limits.analytics ? 'success.main' : 'grey.400' }}
                />
              </Stack>
              <Stack direction="row" spacing={0.5}>
                <Typography variant="body2">
                  <strong>Waiter/ess Dashboard</strong>
                </Typography>
                <Iconify
                  icon="ph:check-circle-bold"
                  sx={{ color: plan.isMenuOnly ? 'grey.400' : 'success.main' }}
                />
              </Stack>
              <Stack direction="row" spacing={0.5}>
                <Typography variant="body2">
                  <strong>Kitchen Dashboard</strong>
                </Typography>
                <Iconify
                  icon="ph:check-circle-bold"
                  sx={{ color: plan.isMenuOnly ? 'grey.400' : 'success.main' }}
                />
              </Stack>

              <Stack direction="row" spacing={0.5}>
                <Typography variant="body2">
                  <strong>Customer Self Order</strong>
                </Typography>
                <Iconify
                  icon="ph:check-circle-bold"
                  sx={{ color: plan.isMenuOnly ? 'grey.400' : 'success.main' }}
                />
              </Stack>

              <Typography variant="body2">
                <strong>QR/Tables: </strong> {plan.limits.tables} /per branch
              </Typography>
              <Typography variant="body2">
                <strong>Branches: </strong>
                {plan.limits.branch}
              </Typography>
              <Typography variant="body2">
                <strong>Translation Languages: </strong>
                {plan.limits.languages}
              </Typography>
              <Typography variant="body2">
                <strong>System Users: </strong>
                {plan.limits.subUser}
              </Typography>
              <Typography variant="body2">
                <strong>Meals: </strong> unlimited
              </Typography>
              <Typography variant="body2">
                <strong>Menus: </strong> unlimited
              </Typography>
              <Typography variant="body2">
                <strong>Scans: </strong> {plan.isMenuOnly ? plan.limits.scans : 'unlimited*'}
              </Typography>
            </Stack>
          </Stack>
        </Card>
      ))}
    </Box>
  );

  const renderPlansDialog = (
    <ConfirmDialog
      title="Compare Plans"
      content={plansCards}
      open={isDialogOpen.value}
      onClose={() => isDialogOpen.onFalse()}
      maxWidth="xl"
    />
  );

  const renderLoginOption = (
    <div>
      <Divider
        sx={{
          my: 2.5,
          typography: 'overline',
          color: 'text.disabled',
          '&::before, ::after': {
            borderTopStyle: 'dashed',
          },
        }}
      >
        OR
      </Divider>

      <Stack direction="row" justifyContent="center" spacing={2}>
        <IconButton onClick={handleGoogleLogin}>
          <Iconify icon="eva:google-fill" color="#DF3E30" />
        </IconButton>

        <IconButton color="inherit" onClick={handleGithubLogin}>
          <Iconify icon="eva:github-fill" />
        </IconButton>

        <IconButton onClick={handleTwitterLogin}>
          <Iconify icon="eva:twitter-fill" color="#1C9CEA" />
        </IconButton>
      </Stack>
    </div>
  );

  const runWorkflow = async () => {
    const businessProfileID = 'FLqmCtMhS4uQNQSgOjf4';
    mutate(() => createDefaults(businessProfileID));
  };

  return (
    <>
      <LoadingButton onClick={runWorkflow} variant="contained" color="error" loading={isPending}>
        Run Workflow
      </LoadingButton>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderHead}

        {renderForm}

        {renderTerms}
        {renderPlansDialog}
      </FormProvider>
    </>
  );
}
