import useSWR from 'swr';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { useMemo, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// @mui
import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Card, Stack, Divider, MenuItem, useTheme, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { fetcher } from 'src/utils/axios';
import { useRouter } from 'src/routes/hook';
import { fData } from 'src/utils/format-number';
import { useAuthContext } from 'src/auth/hooks';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import { useGetAccountLimits } from 'src/hooks/use-get-account-limits';
import BranchSocialLinks from 'src/sections/branches/components/BranchSocialLinks';
import FormProvider, {
  RHFSelect,
  RHFSwitch,
  RHFUpload,
  RHFTextField,
} from 'src/components/hook-form';
// ----------------------------------------------------------------------

BranchNewEditForm.propTypes = {
  branchInfo: PropTypes.object,
};

export default function BranchNewEditForm({ branchInfo }) {
  const theme = useTheme();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { fsAddNewBranch, fsUpdateBranch, businessProfile } = useAuthContext();
  const queryClient = useQueryClient();
  const { allowPoS } = useGetAccountLimits();

  const { data, isLoading } = useSWR(`https://restcountries.com/v3.1/all`, fetcher);

  const currencies = useMemo(
    () =>
      !isLoading &&
      data
        .filter((item) => item?.currencies && Object.values(item?.currencies))
        .sort((a, b) => a.name.official.localeCompare(b.name.official))
        .map((item) => (
          <MenuItem
            key={`${item.name.official} - ${
              Object.values(item?.currencies || {})[0]?.symbol || ''
            }`}
            value={Object.values(item?.currencies || {})[0]?.symbol || ''}
          >
            <Stack
              direction="row"
              spacing={1}
              divider={<Divider orientation="vertical" flexItem />}
            >
              <Typography variant="body2">{item.name.official}</Typography>
              <Typography variant="caption" sx={{ fontWeight: theme.typography.fontWeightBold }}>
                {Object.values(item?.currencies)[0]?.symbol}
              </Typography>
            </Stack>
          </MenuItem>
        )),
    [data, isLoading, theme]
  );

  const NewUserSchema = Yup.object().shape({
    title: Yup.string().required('Menu title is required'),
    imgUrl: Yup.mixed().required('Cover Image is required'),
    defaultLanguage: Yup.string().required('Menu Default Language is required'),
    currency: Yup.string().required('Menu Default Language is required'),
  });

  const defaultValues = useMemo(
    () => ({
      title: branchInfo?.title || '',
      // description: branchInfo?.description || '',
      wifiPassword: branchInfo?.wifiPassword || '',
      isActive: !!branchInfo?.isActive,
      allowSelfOrder: !!branchInfo?.allowSelfOrder,
      cover: branchInfo?.cover || '',
      imgUrl: branchInfo?.cover || null,
      defaultLanguage: branchInfo?.defaultLanguage || businessProfile.defaultLanguage,
      currency: branchInfo?.currency || '',
      taxValue: branchInfo?.taxValue || 0,
      email: branchInfo.email || '',
      number: branchInfo.number || '',
      skipKitchen: !!branchInfo?.skipKitchen,

      socialLinks: {
        facebook: branchInfo?.socialLinks?.facebook || '',
        instagram: branchInfo?.socialLinks?.instagram || '',
        twitter: branchInfo?.socialLinks?.twitter || '',
        youtube: branchInfo?.socialLinks?.youtube || '',
        snapchat: branchInfo?.socialLinks?.snapchat || '',
        tiktok: branchInfo?.socialLinks?.tiktok || '',
        linkedin: branchInfo?.socialLinks?.linkedin || '',
        website: branchInfo?.socialLinks?.website || '',
        // useMasterLinks: branchInfo?.socialLinks?.useMasterLinks || false,
      },
    }),
    [branchInfo, businessProfile]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    getFieldState,
    formState: { isDirty, dirtyFields },
  } = methods;

  const values = watch();

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      setValue('cover', file.name, { isTouched: true, isFocused: true, shouldDirty: true });

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('imgUrl', URL.createObjectURL(file));
        setValue('cover', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handelRemove = () => {
    setValue('cover', '');
  };

  const { isPending, mutate, error } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      queryClient.invalidateQueries(['branches']);
      queryClient.invalidateQueries(['branch', branchInfo?.docID]);
      enqueueSnackbar('Update success!');
      if (!branchInfo?.docID) router.push(paths.dashboard.branches.list);
    },
  });

  const onSubmit = async (formData) => {
    const shouldUpdateCover = getFieldState('cover').isDirty;
    if (branchInfo?.docID)
      mutate(() => {
        fsUpdateBranch(
          {
            ...formData,
            docID: branchInfo?.docID,
          },
          shouldUpdateCover
        );
        reset(formData);
      });
    if (!branchInfo?.docID) {
      mutate(() => fsAddNewBranch(formData));
    }
  };

  const availableLanguages =
    (businessProfile?.languages &&
      Object.entries(LANGUAGE_CODES).filter((code) =>
        [...businessProfile.languages, businessProfile.defaultLanguage].includes(code[0])
      )) ||
    [];

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid xs={12} md={7}>
          <Stack direction="column" spacing={2}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h3">Branch Info</Typography>
                </Stack>
                <RHFTextField name="title" label="Name" />
                {/* <RHFTextField name="description" label="About" multiline rows={3} /> */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 2 }}>
                  <RHFTextField name="wifiPassword" label="Wifi Password" />
                  <RHFTextField name="taxValue" label="Tax Value" type="number" />

                  {!isLoading && (
                    <RHFSelect name="currency" label="Currency">
                      {currencies}
                    </RHFSelect>
                  )}
                  <RHFSelect name="defaultLanguage" label="Default Menu Language">
                    {availableLanguages.map((code) => (
                      <MenuItem key={code[1].name} value={code[0]}>
                        {code[1].value}
                      </MenuItem>
                    ))}
                  </RHFSelect>

                  <RHFTextField type="email" name="email" label="Contact Email" />
                  <RHFTextField type="number" name="number" label="Contact Number" />
                </Box>
              </Stack>
            </Card>

            <Card sx={{ p: 3 }}>
              <BranchSocialLinks />
            </Card>

            {allowPoS && (
              <Card sx={{ p: 3 }}>
                <Typography variant="h3" sx={{ mb: 1 }}>
                  Branch Settings
                </Typography>
                <Stack
                  direction="column"
                  spacing={1}
                  divider={
                    <Divider sx={{ borderColor: theme.palette.divider, borderStyle: 'dashed' }} />
                  }
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="column" spacing={0} sx={{ px: 1, width: '75%' }}>
                      <Typography sx={{ fontWeight: theme.typography.fontWeightBold }}>
                        Skip Kitchen
                      </Typography>
                      <Typography variant="caption">
                        {`Activate "Skip Kitchen" when you want your waiter/ess to be in control of the order process. without waiting for the kitchen to confirm when the order is ready.`}
                      </Typography>
                    </Stack>
                    <RHFSwitch
                      name="skipKitchen"
                      labelPlacement="start"
                      label={values.skipKitchen ? `Skip` : `Don't Skip`}
                      sx={{ alignItems: 'center' }}
                      color="secondary"
                    />
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="column" spacing={0} sx={{ px: 1, width: '75%' }}>
                      <Typography sx={{ fontWeight: theme.typography.fontWeightBold }}>
                        Self-Order
                      </Typography>
                      <Typography variant="caption">
                        Disable self-order to prevent customers from ordering directly from the
                        menu, customers can still view the cart when the waiter adds items from
                        their dashboard
                      </Typography>
                    </Stack>
                    <RHFSwitch
                      name="allowSelfOrder"
                      labelPlacement="start"
                      label={values.skipKitchen ? `Enabled` : `Disabled`}
                      sx={{ alignItems: 'center' }}
                      color="secondary"
                    />
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="column" spacing={0} sx={{ px: 1, width: '75%' }}>
                      <Typography
                        color="error"
                        sx={{ fontWeight: theme.typography.fontWeightBold }}
                      >
                        Branch Status
                      </Typography>
                      <Typography variant="caption">
                        When branch is inactive, customers cant view menu and waiters cant take
                        orders
                      </Typography>
                    </Stack>
                    <RHFSwitch
                      name="isActive"
                      labelPlacement="start"
                      label={values.isActive ? `Active` : `Disabled`}
                      color="success"
                    />
                  </Stack>
                </Stack>
              </Card>
            )}
          </Stack>
        </Grid>

        <Grid xs={12} md={5}>
          <Stack spacing={2}>
            <RHFUpload
              name="cover"
              maxSize={3145728}
              onDrop={handleDrop}
              onRemove={handelRemove}
              helperText={`Allowed *.jpeg, *.jpg, *.png, *.webp | max size of ${fData(3145728)}`}
              paddingValue="30% 0"
            />
            <LoadingButton
              type="submit"
              variant="contained"
              color="success"
              loading={isPending}
              disabled={!isDirty}
              sx={{ alignSelf: 'center' }}
            >
              {branchInfo?.docID ? 'Update Branch' : 'Add Branch'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
