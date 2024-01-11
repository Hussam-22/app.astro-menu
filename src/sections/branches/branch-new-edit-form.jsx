import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useMemo, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { ref, uploadBytesResumable } from 'firebase/storage';

// @mui
import { LoadingButton } from '@mui/lab';
import { Card, Stack, useTheme, MenuItem, Typography } from '@mui/material';

import uuidv4 from 'src/utils/uuidv4';
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
  coverImage: PropTypes.object,
};

export default function BranchNewEditForm({ branchData, coverImage }) {
  const theme = useTheme();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { fsUpdateTable, fsAddNewBranch, user, STORAGE, fsDeleteBranch, fbTranslateMeal } =
    useAuthContext();
  const menusList = useSelector((state) => state.menu.menus);

  // -------------------------------- Form Validation and Handler --------------------------------------------

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
      isActive: !!branchData?.isActive || true,
      isDeleted: branchData?.isDeleted || false,
      createdAt: branchData?.createdAt || '',
      scanLimits: branchData?.scanLimits || '',
      cover: coverImage || ' ',

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
      // ...branchData,
    }),
    [branchData, coverImage]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
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
      if (file) {
        setValue('cover', URL.createObjectURL(file), {
          shouldTouch: true,
          shouldDirty: true,
        });
      }
    },
    [setValue]
  );

  const handelRemove = () => {
    setValue('cover', '');
  };
  // ------------------------------- Save new/Updates Form ---------------------------------------------
  const newBranchOnSubmit = async (docID) => {
    if (values.cover.preview !== '') {
      const imgID = uuidv4();
      setValue('cover.id', imgID);

      const storageRef = ref(STORAGE, `${user.id}/branches/${docID}`);
      const uploadTask = uploadBytesResumable(storageRef, values.cover);

      // Start uploading the image to firebase
      uploadTask.on('state_changed', null, null, async () => {
        // On image upload complete, add new branch doc and get docID
        const newBranchID = await fsAddNewBranch({
          ...values,
          cover: { id: values.cover.id, ...values.cover },
        });

        // translate the new branch 'Description' field
        fbTranslateMeal({
          mealRef: `/users/${user.id}/branches/${newBranchID}`,
          text: { title: '', desc: values.description },
          userID: user.id,
        });

        enqueueSnackbar('Create success!');
        router.push(paths.dashboard.branches.list);
      });
    } else {
      enqueueSnackbar('Please make sure to add branch cover image', {
        variant: 'error',
      });
    }
  };

  const updateBranchOnSubmit = async () => {
    // upload new image if it was changed
    if (getFieldState('cover').isTouched && values.cover.preview !== '') {
      const storageRef = ref(STORAGE, `${user.id}/branches/${values.cover.id}`);
      const uploadTask = uploadBytesResumable(storageRef, values.cover);
      uploadTask.on('state_changed', null, null, null);
    }

    fsUpdateTable(`users/${user.id}/branches/${branchData.id}`, values);

    // update translation if description was changed
    if (getFieldState('description').isDirty) {
      fbTranslateMeal({
        mealRef: `/users/${user.id}/branches/${branchData.id}`,
        text: { title: '', desc: values.description },
        userID: user.id,
      });
    }

    // update Redux
    // dispatch(rdxSetBranch(values));

    enqueueSnackbar('Update success!');
  };

  const onSubmit = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (branchData?.docID) updateBranchOnSubmit(data);
    if (!branchData?.docID) newBranchOnSubmit(data);
  };

  const handleDeleteBranch = async () => {
    // TODO: Trigger loading
    await new Promise((resolve) => setTimeout(resolve, 1000));
    fsDeleteBranch(
      branchData?.id,
      branchData?.cover.preview !== '' ? branchData?.cover.id : undefined
    );
    router.push(paths.dashboard.branches.list);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', mb: 2 }}>
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

      <Stack direction="column" spacing={2}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h3" sx={{ mb: 1 }}>
            Cover Image
          </Typography>
          <RHFUpload
            name="cover"
            maxSize={3145728}
            onDrop={handleDrop}
            onRemove={handelRemove}
            helperText={`Allowed *.jpeg, *.jpg, *.png, *.webp | max size of ${fData(3145728)}`}
          />
        </Card>
        <Card sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h3">Branch Info</Typography>
              <RHFSwitch
                name="isActive"
                labelPlacement="start"
                label="Branch Status"
                sx={{ alignItems: 'center' }}
              />
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
