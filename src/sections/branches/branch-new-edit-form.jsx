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
import { Box, Card, Stack, Divider, MenuItem, useTheme, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { fetcher } from 'src/utils/axios';
import { useRouter } from 'src/routes/hook';
import { fData } from 'src/utils/format-number';
import { useAuthContext } from 'src/auth/hooks';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
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
  const { fsAddNewBranch, fsDeleteBranch, fsUpdateBranch } = useAuthContext();
  const queryClient = useQueryClient();

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
              <Typography>{item.name.official}</Typography>
              <Typography sx={{ fontWeight: theme.typography.fontWeightBold }}>
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
      description: branchInfo?.description || '',
      wifiPassword: branchInfo?.wifiPassword || '',
      isActive: !!branchInfo?.isActive,
      allowSelfOrder: !!branchInfo?.allowSelfOrder,
      cover: branchInfo?.cover || '',
      imgUrl: branchInfo?.cover || null,
      defaultLanguage: branchInfo?.defaultLanguage || 'en',
      currency: branchInfo?.currency || '',
      taxValue: branchInfo?.taxValue || 0,
      email: branchInfo.email || '',
      number: branchInfo.number || '',

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
    [branchInfo]
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

  const { isPending, mutate } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      queryClient.invalidateQueries(['branches']);
      setTimeout(() => {
        queryClient.invalidateQueries(['branch', branchInfo?.docID]);
      }, 1000);
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
            translation: dirtyFields.description ? '' : branchInfo.translation,
            translationEdited: dirtyFields.description ? '' : branchInfo.translationEdited,
          },
          shouldUpdateCover
        );
        reset(formData);
      });
    if (!branchInfo?.docID) {
      mutate(() => fsAddNewBranch(formData));
    }
  };

  const handleDeleteBranch = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    fsDeleteBranch(branchInfo?.docID);
    queryClient.invalidateQueries({ queryKey: ['branches'] });
    router.push(paths.dashboard.branches.list);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', mb: 2 }}>
        {branchInfo?.docID && (
          <LoadingButton
            variant="contained"
            loading={isPending}
            color="error"
            onClick={handleDeleteBranch}
          >
            Delete Branch
          </LoadingButton>
        )}

        <LoadingButton
          type="submit"
          variant="contained"
          color="success"
          loading={isPending}
          disabled={!isDirty}
        >
          Save
        </LoadingButton>
      </Stack>
      <Stack direction="column" spacing={2}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h3" sx={{ mb: 1 }}>
            Cover Image
          </Typography>
          <RHFUpload
            name="imgUrl"
            maxSize={3145728}
            onDrop={handleDrop}
            onRemove={handelRemove}
            helperText={`Allowed *.jpeg, *.jpg, *.png, *.webp | max size of ${fData(3145728)}`}
          />
        </Card>
        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h3">Branch Info</Typography>
            </Stack>
            <RHFTextField name="title" label="Name" />
            <RHFTextField name="description" label="About" multiline rows={3} />
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 2 }}>
              <RHFTextField name="wifiPassword" label="Wifi Password" />
              <RHFTextField name="taxValue" label="Tax Value" type="number" />

              {!isLoading && (
                <RHFSelect name="currency" label="Currency">
                  {currencies}
                </RHFSelect>
              )}
              <RHFSelect name="defaultLanguage" label="Default Menu Language">
                {Object.entries(LANGUAGE_CODES).map((code) => (
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
          <Typography variant="h3" sx={{ mb: 1 }}>
            Branch Settings
          </Typography>
          <Stack
            direction="column"
            spacing={1}
            divider={<Divider sx={{ borderColor: theme.palette.divider, borderStyle: 'dashed' }} />}
          >
            {/* <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="column" spacing={0}>
                <Typography sx={{ fontWeight: theme.typography.fontWeightBold }} color="error">
                  Allow Self Order
                </Typography>
                <Typography variant="caption">
                  Allow restaurant customers to place orders directly from their devices without
                  waiter/ess attendance
                </Typography>
              </Stack>
              <RHFSwitch
                name="allowSelfOrder"
                labelPlacement="start"
                label={values.allowSelfOrder ? `Allow Self Order` : `View Menu Only`}
                sx={{ alignItems: 'center' }}
              />
            </Stack> */}

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="column" spacing={0}>
                <Typography sx={{ fontWeight: theme.typography.fontWeightBold }} color="error">
                  Branch Status
                </Typography>
                <Typography variant="caption">
                  When branch is inactive, customers cant view menu and waiters cant take orders
                </Typography>
              </Stack>
              <RHFSwitch
                name="isActive"
                labelPlacement="start"
                label={values.isActive ? `Branch is Active` : `Branch is Inactive`}
                sx={{ alignItems: 'center' }}
              />
            </Stack>
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <BranchSocialLinks />
        </Card>
      </Stack>
    </FormProvider>
  );
}
