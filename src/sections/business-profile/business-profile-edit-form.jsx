import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, Divider, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { fData } from 'src/utils/format-number';
import { LANGUAGES } from 'src/_mock/translation-languages';
import { ConfirmDialog } from 'src/components/custom-dialog';
import FormProvider, {
  RHFTextField,
  RHFMultiSelect,
  RHFUploadAvatar,
} from 'src/components/hook-form';

// ----------------------------------------------------------------------------

const OPTIONS = LANGUAGES.map((language) => ({
  value: language.code,
  label: language.languageName,
})).sort((a, b) => a.label.localeCompare(b.label));

const THIS_MONTH = new Date().getMonth();

function BusinessProfileEditForm() {
  const { businessProfile, fsUpdateBusinessProfile } = useAuthContext();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [isOpen, setIsOpen] = useState(false);
  const maxLanguages = businessProfile.planInfo.at(-1).limits.languages;

  const NewUserSchema = Yup.object().shape({
    // imgUrl: Yup.mixed().required('Cover Image is required'),
    languages: Yup.array()
      .min(1, 'Choose at least one option')
      .max(maxLanguages, `max ${maxLanguages} translation languages allowed in your plan`),
  });

  const defaultValues = useMemo(
    () => ({
      businessName: businessProfile?.businessName || '',
      description: businessProfile?.description || '',
      email: businessProfile.ownerInfo.email || '',
      country: !!businessProfile?.country,
      address: businessProfile?.address || '',
      languages: businessProfile?.languages || [],
      defaultLanguage: businessProfile?.defaultLanguage || '',
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
    setValue,
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = methods;

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

  const { isPending, mutate, error, reset } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      queryClient.invalidateQueries(['businessProfile', businessProfile?.docID]);
    },
  });

  const onClose = () => {
    reset();
    setIsOpen(false);
  };

  useEffect(() => {
    if (error?.message) setIsOpen(true);
  }, [error?.message]);

  console.log(error?.message);

  const onSubmit = async (formData) => {
    mutate(async () => {
      // await delay(1000);

      if (dirtyFields.description) return fsUpdateBusinessProfile(formData, true, dirtyFields.logo);
      return fsUpdateBusinessProfile(formData, false, dirtyFields.logo);
    });
  };

  return (
    <>
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
                <RHFTextField name="description" label="Description" rows={5} multiline />
                <RHFTextField name="address" label="Address" disabled />
                <RHFTextField name="country" label="Address" disabled />
                <RHFTextField type="email" name="email" label="Business Email" disabled />
              </Stack>
            </Stack>
          </Card>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Languages</Typography>
              <Stack direction="column" spacing={1} alignItems="flex-start">
                <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 0.5 }}>
                  <Iconify icon="dashicons:warning" sx={{ color: 'error.main' }} />
                  <Typography variant="caption" sx={{ color: 'error.main' }}>
                    Making any changes to the languages will delete existing translations and reset
                    all custom translations edits for all 1- meals, 2- sections, 3- business
                    description and title
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 0.5 }}>
                  <Iconify icon="dashicons:warning" sx={{ color: 'error.main' }} />
                  <Typography variant="caption" sx={{ color: 'error.main' }}>
                    You can only change the languages list 3 times a month to avoid excessive usage{' '}
                    <Box component="span" sx={{ color: 'common.black' }}>
                      | Available limit: {3 - businessProfile.translationEditUsage[THIS_MONTH] || 0}
                    </Box>
                  </Typography>
                </Stack>
              </Stack>
              <RHFMultiSelect
                chip
                checkbox
                name="languages"
                label="Translation Languages"
                options={OPTIONS.filter(
                  (option) => option.value !== businessProfile.defaultLanguage
                )}
              />
            </Stack>
          </Card>
        </Stack>
      </FormProvider>
      <ConfirmDialog
        open={isOpen}
        onClose={onClose}
        content={
          <Stack direction="column" spacing={2} alignItems="center">
            <Iconify
              icon="fluent:error-circle-24-regular"
              sx={{ width: 48, height: 48, color: 'error.main' }}
            />
            <Typography variant="h6">{error?.message}</Typography>
          </Stack>
        }
      />
    </>
  );
}
export default BusinessProfileEditForm;
// BusinessProfileEditForm.propTypes = { tables: PropTypes.array };
