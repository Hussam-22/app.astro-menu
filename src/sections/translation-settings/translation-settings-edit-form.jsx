import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// @mui
import { LoadingButton } from '@mui/lab';
import { Card, Stack, Divider, MenuItem, Typography } from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { delay } from 'src/utils/promise-delay';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import { ConfirmDialog } from 'src/components/custom-dialog';
import FormProvider, { RHFSelect, RHFMultiSelect } from 'src/components/hook-form';

// ----------------------------------------------------------------------------

const TRANSLATION_LANGUAGES = Object.entries(LANGUAGE_CODES)
  .map(([key, value]) => ({
    value: key,
    label: `${value.name} - ${value.value}`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

TranslationSettingsEditForm.propTypes = {
  translationSettingsInfo: PropTypes.object,
};

function TranslationSettingsEditForm({ translationSettingsInfo }) {
  const { businessProfile, fsBatchUpdateBusinessProfileLanguages } = useAuthContext();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [isOpen, setIsOpen] = useState(false);

  const maxLanguages = 3;

  const availableLanguages =
    (businessProfile?.languages &&
      Object.entries(LANGUAGE_CODES).filter((code) =>
        [...businessProfile.languages, businessProfile.defaultLanguage].includes(code[0])
      )) ||
    [];

  const NewUserSchema = Yup.object().shape({
    languages: Yup.array()
      .min(1, 'Choose at least one option')
      .max(maxLanguages, `max ${maxLanguages} translation languages allowed in your plan`),
  });

  const defaultValues = useMemo(
    () => ({
      languages: businessProfile?.languages || [],
      defaultLanguage: businessProfile?.defaultLanguage || '',
    }),
    [businessProfile]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields },
  } = methods;

  const { isPending, mutate, error } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['businessProfile', businessProfile?.docID]);
      enqueueSnackbar(response.data.message);
      console.log(response);
    },
  });

  console.log(error);

  const onClose = () => {
    reset();
    setIsOpen(false);
  };

  useEffect(() => {
    if (error?.message) setIsOpen(true);
  }, [error?.message]);

  const onSubmit = async (formData) => {
    const isLanguagesEqual =
      JSON.stringify(formData.languages.sort()) ===
      JSON.stringify(businessProfile.languages.sort());

    if (isLanguagesEqual) {
      enqueueSnackbar('No changes detected', { variant: 'warning' });
      return;
    }

    mutate(async () => {
      await delay(1000);
      const newLang = formData.languages.filter(
        (lang) => !businessProfile.languages.includes(lang)
      );
      const toRemoveLang = businessProfile.languages.filter(
        (lang) => !formData.languages.includes(lang)
      );

      const response = await fsBatchUpdateBusinessProfileLanguages(
        newLang,
        toRemoveLang,
        formData.languages
      );
      return response;
    });
  };
  const { count, maxCount } = businessProfile.translationEditUsage;
  const translationEditUsageLimit = count || 0;
  const availableLimit = maxCount - translationEditUsageLimit;

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
            <Stack spacing={2}>
              <Typography variant="h6">Menu Language</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography>
                  Default Language is your main language for the menu and business description, if
                  you are from France for example and you are tending to write your menu in French,
                  then French should be your default language, and you can add other languages for
                  translation, meaning the other languages will use French as a base for
                  translation, keep in mind the Admin dashboard will always be in English ( we are
                  working on adding more languages in the future)
                </Typography>

                <RHFSelect name="defaultLanguage" label="Default Menu Language">
                  {availableLanguages.map((code) => (
                    <MenuItem key={code[1].name} value={code[0]}>
                      {code[1].value}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Stack>

              <Divider sx={{ borderStyle: 'dashed' }} />

              <Stack direction="column" spacing={1} alignItems="flex-start">
                <Typography variant="h6">Translation Languages</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography>
                    You can only change the translations list 2 times a month to avoid excessive
                    usage <Label color="error">Available limit: {availableLimit}</Label>
                  </Typography>
                </Stack>
                <Typography>
                  Removing a Translation language will remove all the translations for that language
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>Affected Items:</Typography>
                <Stack direction="row" spacing={1}>
                  <Label color="warning">Meals</Label>
                  <Label color="warning">Meal Labels</Label>
                  <Label color="warning">Menu Sections Title</Label>
                  <Label color="warning">Business Name and Description</Label>
                </Stack>
              </Stack>
              <RHFMultiSelect
                // disabled={availableLimit === 0}
                chip
                checkbox
                name="languages"
                label="Translation Languages"
                options={TRANSLATION_LANGUAGES.filter(
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
export default TranslationSettingsEditForm;
