import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, MenuItem, Typography } from '@mui/material';

import Label from 'src/components/label';
import { delay } from 'src/utils/promise-delay';
import { useAuthContext } from 'src/auth/hooks';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import { ConfirmDialog } from 'src/components/custom-dialog';
import FormProvider, { RHFSelect } from 'src/components/hook-form';

// ----------------------------------------------------------------------------

const TRANSLATION_LANGUAGES = Object.entries(LANGUAGE_CODES)
  .map(([key, value]) => ({
    value: key,
    label: `${value.name} - ${value.value}`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

DefaultLanguageEditForm.propTypes = {
  businessProfileInfo: PropTypes.object,
};

function DefaultLanguageEditForm({ businessProfileInfo }) {
  const { fsUpdateTranslationSettings, fsUpdateBusinessProfile, fsUpdateBranchesDefaultLanguage } =
    useAuthContext();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [isOpen, setIsOpen] = useState(false);

  const defaultValues = useMemo(
    () => ({
      defaultLanguage: businessProfileInfo?.defaultLanguage || '',
    }),
    [businessProfileInfo]
  );

  const methods = useForm({
    defaultValues,
  });

  const {
    watch,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods;

  const values = watch();

  const { isPending, mutate, error } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      queryClient.invalidateQueries(['businessProfile', businessProfileInfo?.docID]);
      queryClient.invalidateQueries(['branches']);
      queryClient.invalidateQueries(['branch']);
    },
  });

  const onSubmit = async (formData) => {
    mutate(async () => {
      // prevent user from updating the default language its the only language left for translation
      if (
        businessProfileInfo.languages.length === 1 &&
        businessProfileInfo.languages.includes(formData.defaultLanguage)
      ) {
        setIsOpen(true);
        return;
      }

      // remove translation language from languages list when its selected as the default language
      if (businessProfileInfo.languages.includes(formData.defaultLanguage)) {
        const updatedLanguages = businessProfileInfo.languages.filter(
          (lang) => lang !== formData.defaultLanguage
        );

        await fsUpdateBusinessProfile(formData);
        const response = await fsUpdateTranslationSettings(
          [],
          [formData.defaultLanguage],
          updatedLanguages
        );
        await delay(1000);
        reset(formData);
        enqueueSnackbar(response.data.message);
      } else {
        await fsUpdateBusinessProfile({
          defaultLanguage: formData.defaultLanguage,
        });
        await fsUpdateBranchesDefaultLanguage(formData.defaultLanguage);
        await delay(1000);
        enqueueSnackbar('Default language updated successfully');
        reset(formData);
      }
    });
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" spacing={2}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Menus Default Language</Typography>
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
              </Stack>
              <Stack direction="row" spacing={4} alignItems="center">
                <Stack direction="column" spacing={1} sx={{ maxWidth: '70%' }}>
                  <Typography>
                    {`The default menu language you select will act as the foundation for all your
                  content, including menus, descriptions, and titles. This means that any text you
                  input in this default language will be used as the primary source for creating
                  your entire menu structure. Additionally, if you choose to offer translations in
                  other languages, these translations will be generated based on the content in your
                  default language. Therefore, it's important to ensure that the default language is
                  accurately and clearly defined, as it will directly influence how your content is
                  translated and presented in other languages.`}
                  </Typography>
                </Stack>

                <Stack direction="column" spacing={2} flexGrow={1}>
                  <RHFSelect name="defaultLanguage" label="Menus Default Language">
                    {TRANSLATION_LANGUAGES.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                  {businessProfileInfo?.languages?.includes(values.defaultLanguage) && (
                    <Typography variant="caption" color="error">
                      Selecting{' '}
                      <Label color="info" sx={{ mx: 0.5 }}>{`${
                        LANGUAGE_CODES[values.defaultLanguage].name
                      } - ${LANGUAGE_CODES[values.defaultLanguage].value}`}</Label>{' '}
                      as the default language will remove all translation for this language as it
                      will be your base language
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </FormProvider>
      <ConfirmDialog
        maxWidth="md"
        title="Error"
        content={
          <Box>
            <Typography>
              You cannot remove{' '}
              <Label color="warning">
                {`${LANGUAGE_CODES[values.defaultLanguage]?.name} -
            ${LANGUAGE_CODES[values.defaultLanguage]?.value}`}
              </Label>{' '}
              as it is the only language left for translation, please add another language to{' '}
              <Box component="span" sx={{ fontWeight: 600, display: 'inline-block' }}>
                Translation Languages
              </Box>{' '}
              before setting this language as the default language
            </Typography>
          </Box>
        }
        open={isOpen}
        onClose={() => setIsOpen(false)}
        closeText="Close"
      />
    </>
  );
}
export default DefaultLanguageEditForm;
