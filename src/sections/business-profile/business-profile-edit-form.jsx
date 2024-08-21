import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { useMemo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
// @mui
import { Card, Stack, Divider, Typography } from '@mui/material';

import { fData } from 'src/utils/format-number';
import { useAuthContext } from 'src/auth/hooks';
import { delay } from 'src/utils/promise-delay';
import FormProvider, { RHFUpload, RHFTextField } from 'src/components/hook-form';

function BusinessProfileEditForm() {
  const { businessProfile, fsUpdateBusinessProfile } = useAuthContext();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const defaultValues = useMemo(
    () => ({
      businessName: businessProfile?.businessName || '',
      description: businessProfile?.description || '',
      email: businessProfile.ownerInfo.email || '',
      logo: businessProfile?.logo || '',
    }),
    [businessProfile]
  );

  const methods = useForm({
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

  const handleRemoveFile = useCallback(() => {
    setValue('logo', null, { isTouched: true, isFocused: true, shouldDirty: true });
  }, [setValue]);

  const handelRemove = () => {
    setValue('logo', '');
  };

  const { isPending, mutate, error } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      queryClient.invalidateQueries(['businessProfile', businessProfile?.docID]);
      enqueueSnackbar('Update success!');
    },
  });

  const onSubmit = async (formData) => {
    mutate(async () => {
      const response = await fsUpdateBusinessProfile(
        formData,
        dirtyFields.description,
        dirtyFields.logo
      );
      await delay(1000);
      console.log(response);
    });
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
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
            <RHFUpload
              name="logo"
              maxSize={3000000}
              onDrop={handleDrop}
              onRemove={handelRemove}
              helperText={`Allowed *.jpeg, *.jpg, *.png, *.webp | max size of ${fData(3000000)}`}
              paddingValue="40% 0"
            />
            {/* <RHFUpload
              name="logo"
              maxSize={3000000}
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
                  Allowed *.jpeg, *.jpg, *.png, *.webp
                  <br /> max size of {fData(3000000)}
                </Typography>
              }
            /> */}
          </Stack>
          <Stack direction="column" spacing={2} sx={{ flexGrow: 1 }}>
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
            <RHFTextField name="businessName" label="Business Name" disabled />
            <RHFTextField name="description" label="Description" rows={5} multiline />
            <RHFTextField
              type="email"
              name="email"
              label="Business Email (Does not show to the world)"
              disabled
            />
          </Stack>
        </Stack>
      </Card>
    </FormProvider>
  );
}
export default BusinessProfileEditForm;
// BusinessProfileEditForm.propTypes = { tables: PropTypes.array };
