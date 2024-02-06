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
import { Card, Stack, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { fData } from 'src/utils/format-number';
import { useAuthContext } from 'src/auth/hooks';
import BranchSocialLinks from 'src/sections/branches/components/BranchSocialLinks';
import FormProvider, { RHFUpload, RHFSwitch, RHFTextField } from 'src/components/hook-form';
// ----------------------------------------------------------------------

BranchNewEditForm.propTypes = {
  branchInfo: PropTypes.object,
};

export default function BranchNewEditForm({ branchInfo }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { fsAddNewBranch, fsDeleteBranch, fsUpdateBranch } = useAuthContext();
  const queryClient = useQueryClient();

  const NewUserSchema = Yup.object().shape({
    title: Yup.string().required('Menu title is required'),
    cover: Yup.mixed().required('imgURL is required'),
  });

  const defaultValues = useMemo(
    () => ({
      title: branchInfo?.title || '',
      description: branchInfo?.description || '',
      wifiPassword: branchInfo?.wifiPassword || '',
      activeMenuID: branchInfo?.activeMenuID || '',
      isActive: !!branchInfo?.isActive,
      isDeleted: branchInfo?.isDeleted || false,
      createdAt: branchInfo?.createdAt || '',
      scanLimits: branchInfo?.scanLimits || '',
      cover: branchInfo?.cover || '',
      imgUrl: branchInfo?.cover || '',

      mealVisual: branchInfo?.mealVisual || '',
      menuVisual: branchInfo?.menuVisual || '',

      socialLinks: {
        facebook: branchInfo?.socialLinks?.facebook || '',
        instagram: branchInfo?.socialLinks?.instagram || '',
        twitter: branchInfo?.socialLinks?.twitter || '',
        youtube: branchInfo?.socialLinks?.youtube || '',
        snapchat: branchInfo?.socialLinks?.snapchat || '',
        tiktok: branchInfo?.socialLinks?.tiktok || '',
        linkedin: branchInfo?.socialLinks?.linkedin || '',
        website: branchInfo?.socialLinks?.website || '',
        other: branchInfo?.socialLinks?.other || '',
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

  // useEffect(() => {
  //   if (branchInfo?.docID) reset(defaultValues);
  // }, [branchInfo?.docID, defaultValues, reset, branchInfo?.cover]);

  const handelRemove = () => {
    setValue('cover', '');
  };

  const { isPending, mutate } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      queryClient.invalidateQueries(['branches']);
      setTimeout(() => {
        queryClient.invalidateQueries([`branch-${branchInfo?.docID}`]);
      }, 1000);
      enqueueSnackbar('Update success!');
      if (!branchInfo?.docID) router.push(paths.dashboard.branches.list);
    },
  });

  const onSubmit = async (formData) => {
    const shouldUpdateCover = getFieldState('cover').isDirty;
    if (branchInfo?.docID)
      mutate(() =>
        fsUpdateBranch(
          {
            ...formData,
            docID: branchInfo?.docID,
            translation: dirtyFields.description ? '' : branchInfo.translation,
            translationEdited: dirtyFields.description ? '' : branchInfo.translationEdited,
          },
          shouldUpdateCover
        )
      );
    if (!branchInfo?.docID) {
      mutate(() => fsAddNewBranch(formData));
    }
  };

  const handleDeleteBranch = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    fsDeleteBranch(branchInfo?.docID);
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
              <Stack direction="column" alignItems="flex-end">
                <RHFSwitch
                  name="isActive"
                  labelPlacement="start"
                  label={values.isActive ? `Branch is Active` : `Branch is Inactive`}
                  sx={{ alignItems: 'center' }}
                />
                <Typography variant="caption" sx={{ color: 'error.main' }}>
                  When branch is inactive, customers cant view menu and waiters cant take orders
                </Typography>
              </Stack>
            </Stack>
            <RHFTextField name="title" label="Name" />
            <RHFTextField name="description" label="About" multiline rows={3} />
            <RHFTextField name="wifiPassword" label="Wifi Password" />
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <BranchSocialLinks />
        </Card>
      </Stack>
    </FormProvider>
  );
}
