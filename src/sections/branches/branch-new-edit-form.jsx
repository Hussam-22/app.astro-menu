import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useMemo, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

// @mui
import { LoadingButton } from '@mui/lab';
import { Card, Stack, Divider, MenuItem, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { fData } from 'src/utils/format-number';
import { useAuthContext } from 'src/auth/hooks';
import BranchSocialLinks from 'src/sections/branches/components/BranchSocialLinks';
import FormProvider, {
  RHFUpload,
  RHFSwitch,
  RHFSelect,
  RHFTextField,
} from 'src/components/hook-form';
// ----------------------------------------------------------------------

BranchNewEditForm.propTypes = {
  branchData: PropTypes.object,
};

export default function BranchNewEditForm({ branchData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { fsAddNewBranch, fsDeleteBranch, fsUpdateBranch } = useAuthContext();
  const menusList = useSelector((state) => state.menu.menus);

  const NewUserSchema = Yup.object().shape({
    title: Yup.string().required('Menu title is required'),
    // scheduler: Yup.object().shape({
    //   alwaysAvailable: Yup.boolean(),
    //   activeTimeRange: Yup.object().when('alwaysAvailable', {
    //     is: false,
    //     then: Yup.object().shape({
    //       to: Yup.string().required(''),
    //       from: Yup.string().required(''),
    //     }),
    //   }),
    //   activeDays: Yup.array().when('alwaysAvailable', {
    //     is: false,
    //     then: Yup.array().min(1, 'At least One Day should be selected'),
    //   }),
    // }),
    // 'cover.file': Yup.mixed().required('Menu Cover is Required'),
    // cover: Yup.mixed().test('required', 'Menu Cover is required', (value) => value.file !== ''),
  });

  const defaultValues = useMemo(
    () => ({
      title: branchData?.title || '',
      description: branchData?.description || '',
      wifiPassword: branchData?.wifiPassword || '',
      activeMenuID: branchData?.activeMenuID || '',
      isActive: !!branchData?.isActive,
      isDeleted: branchData?.isDeleted || false,
      createdAt: branchData?.createdAt || '',
      scanLimits: branchData?.scanLimits || '',
      cover: branchData?.cover || '',
      imgUrl: branchData?.cover || '',

      mealVisual: branchData?.mealVisual || '',
      menuVisual: branchData?.menuVisual || '',

      socialLinks: {
        facebook: branchData?.socialLinks?.facebook || '',
        instagram: branchData?.socialLinks?.instagram || '',
        twitter: branchData?.socialLinks?.twitter || '',
        youtube: branchData?.socialLinks?.youtube || '',
        snapchat: branchData?.socialLinks?.snapchat || '',
        tiktok: branchData?.socialLinks?.tiktok || '',
        linkedin: branchData?.socialLinks?.linkedin || '',
        website: branchData?.socialLinks?.website || '',
        other: branchData?.socialLinks?.other || '',
        // useMasterLinks: branchData?.socialLinks?.useMasterLinks || false,
      },
    }),
    [branchData]
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
    formState: { isDirty, isSubmitting },
  } = methods;

  const values = watch();

  // -------------------------------- Show Selected Image Handler --------------------------------------------
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

  const onSubmit = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const shouldUpdateDescription = getFieldState('description').isDirty;
    const shouldUpdateCover = getFieldState('cover').isDirty;
    if (branchData?.docID)
      fsUpdateBranch(
        { docID: branchData.docID, ...data },
        shouldUpdateDescription,
        shouldUpdateCover
      );
    if (!branchData?.docID) {
      fsAddNewBranch(data);
      router.push(paths.dashboard.branches.list);
    }
    reset(data);
    enqueueSnackbar('Update success!');
  };

  const handleDeleteBranch = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    fsDeleteBranch(branchData?.docID);
    router.push(paths.dashboard.branches.list);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
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

        {menusList?.length !== 0 && (
          <Card sx={{ p: 3 }}>
            <SelectMenu />
          </Card>
        )}

        <Card sx={{ p: 3 }}>
          <BranchSocialLinks />
        </Card>

        <Divider />

        <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end' }}>
          {branchData?.docID && (
            <LoadingButton
              variant="contained"
              loading={isSubmitting}
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
            loading={isSubmitting}
            disabled={!isDirty}
          >
            Save
          </LoadingButton>
        </Stack>
      </Stack>
    </FormProvider>
  );
}

// ----------------------------------------------------------------------------

function SelectMenu({ menusList }) {
  return (
    <RHFSelect name="activeMenuID" label="Default Menu" placeholder="Default Menu">
      <MenuItem value="" />
      {menusList.map((menu) => (
        <MenuItem key={menu.id} value={menu.id}>
          {menu.title}
        </MenuItem>
      ))}
    </RHFSelect>
  );
}

SelectMenu.propTypes = {
  menusList: PropTypes.array,
};
