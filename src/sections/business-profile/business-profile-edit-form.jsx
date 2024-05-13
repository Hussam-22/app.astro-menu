import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { useMemo, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';

// @mui
import { LoadingButton } from '@mui/lab';
import { Card, Stack, Divider, Typography } from '@mui/material';

import { delay } from 'src/utils/promise-delay';
import { fData } from 'src/utils/format-number';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';

function BusinessProfileEditForm() {
  const { businessProfile, fsUpdateBusinessProfile } = useAuthContext();

  const NewUserSchema = Yup.object().shape({
    // title: Yup.string().required('Menu title is required'),
    // imgUrl: Yup.mixed().required('Cover Image is required'),
    // defaultLanguage: Yup.string().required('Menu Default Language is required'),
    // currency: Yup.string().required('Menu Default Language is required'),
  });

  const defaultValues = useMemo(
    () => ({
      businessName: businessProfile?.businessName || '',
      description: businessProfile?.description || '',
      email: businessProfile.ownerInfo.email || '',
      country: !!businessProfile?.country,
      address: businessProfile?.address || '',
      languages: businessProfile?.languages || [],
      logo: businessProfile?.logo || '',
      isActive: !!businessProfile?.isActive,
    }),
    [businessProfile]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = methods;

  const values = watch();

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      setValue('logo', file.name, { isTouched: true, isFocused: true, shouldDirty: true });

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('logo', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handelRemove = () => {
    setValue('cover', '');
  };

  const { isPending, mutate } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {},
  });

  const onSubmit = async (formData) => {
    mutate(async () => {
      await delay(1000);
      if (dirtyFields.description) return fsUpdateBusinessProfile(formData, true);
      return fsUpdateBusinessProfile(formData);
    });
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" spacing={2}>
        <LoadingButton
          type="submit"
          variant="contained"
          color="success"
          loading={isPending}
          disabled={!isDirty}
          sx={{ alignSelf: 'flex-end' }}
        >
          Save
        </LoadingButton>
        <Card sx={{ p: 3 }}>
          <Stack
            spacing={3}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            divider={<Divider flexItem orientation="vertical" />}
          >
            <Stack direction="column" spacing={2} alignItems="center">
              <Typography variant="overline">Business Logo</Typography>
              <RHFUploadAvatar
                name="logo"
                maxSize={3145728}
                onDrop={handleDrop}
                onRemove={handelRemove}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />
            </Stack>
            <Stack direction="column" spacing={2} sx={{ flexGrow: 1 }}>
              <RHFTextField name="businessName" label="Business Name" disabled />
              <RHFTextField name="description" label="Description" rows={3} multiline />
              <RHFTextField name="address" label="Address" disabled />
              <RHFTextField name="country" label="Address" disabled />
              <RHFTextField type="email" name="email" label="Business Email" disabled />
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </FormProvider>
  );
}
export default BusinessProfileEditForm;
// BusinessProfileEditForm.propTypes = { tables: PropTypes.array };
