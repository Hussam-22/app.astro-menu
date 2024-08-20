import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// @mui
import { LoadingButton } from '@mui/lab';
import { Card, Stack, Divider, MenuItem, Typography } from '@mui/material';

import Label from 'src/components/label';
import { delay } from 'src/utils/promise-delay';
import { useAuthContext } from 'src/auth/hooks';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import { useGetProductInfo } from 'src/hooks/use-get-product';
import FormProvider, { RHFSelect, RHFMultiSelect } from 'src/components/hook-form';

// ----------------------------------------------------------------------------

const TRANSLATION_LANGUAGES = Object.entries(LANGUAGE_CODES)
  .map(([key, value]) => ({
    value: key,
    label: `${value.name} - ${value.value}`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

TranslationSettingsEditForm.propTypes = {
  businessProfileInfo: PropTypes.object,
};

function TranslationSettingsEditForm({ businessProfileInfo }) {
  const { fsUpdateTranslationSettings, fsUpdateBusinessProfile } = useAuthContext();
  const { maxTranslationsLanguages } = useGetProductInfo();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [isOpen, setIsOpen] = useState(false);

  const NewUserSchema = Yup.object().shape({
    languages: Yup.array()
      .min(1, 'Choose at least one option')
      .max(
        maxTranslationsLanguages,
        `max ${maxTranslationsLanguages} translation languages allowed in your plan`
      ),
  });

  const defaultValues = useMemo(
    () => ({
      languages: businessProfileInfo?.languages || [],
      defaultLanguage: businessProfileInfo?.defaultLanguage || '',
    }),
    [businessProfileInfo]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    watch,
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields },
  } = methods;

  const values = watch();

  const { isPending, mutate, error } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['businessProfile', businessProfileInfo?.docID]);
    },
  });

  console.log(error);

  const updateMenuLanguage = async (formData) => {
    if (formData.languages.includes(formData.defaultLanguage)) {
      const updatedLanguages = formData.languages.filter(
        (lang) => lang !== formData.defaultLanguage
      );

      await fsUpdateBusinessProfile(formData);
      const response = await fsUpdateTranslationSettings(
        [],
        [formData.defaultLanguage],
        updatedLanguages
      );
      reset();
      enqueueSnackbar(response.data.message);
    }

    reset();
    await fsUpdateBusinessProfile({
      defaultLanguage: formData.defaultLanguage,
    });

    return { status: 'success', message: 'Default language updated successfully' };
  };
  const updateTranslationsList = async (formData) => {
    const newLang = formData.languages.filter(
      (lang) => !businessProfileInfo.languages.includes(lang)
    );
    const toRemoveLang = businessProfileInfo.languages.filter(
      (lang) => !formData.languages.includes(lang)
    );

    const response = await fsUpdateTranslationSettings(newLang, toRemoveLang, formData.languages);
    return response;
  };

  const onSubmit = async (formData) => {
    const isLanguagesEqual =
      JSON.stringify(formData.languages.sort()) ===
      JSON.stringify(businessProfileInfo?.languages?.sort());

    if (isLanguagesEqual && dirtyFields.languages) {
      enqueueSnackbar('No changes detected', { variant: 'warning' });
      reset();
      return;
    }

    mutate(async () => {
      await delay(1000);
      if (dirtyFields.languages) await updateTranslationsList(formData);
      if (dirtyFields.defaultLanguage) await updateMenuLanguage(formData);
    });
  };
  const { count, maxCount } = businessProfileInfo.translationEditUsage;
  const translationEditUsageLimit = count || 0;
  const availableLimit = maxCount - translationEditUsageLimit;

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
          <Stack spacing={2}>
            <Typography variant="h6">Menu Language</Typography>
            <Stack direction="row" spacing={4} alignItems="center">
              <Stack direction="column" spacing={1}>
                <Typography>
                  {`"Default Menu Language" is the language you will use to write your meal titles, meal description, menu sections...etc`}
                </Typography>
                <Typography>
                  for example: if you are from France and you are tending to write your menu in
                  French, then French should be your default language, and you can add other
                  languages for translation, meaning the other languages will use French as a base
                  for translation, keep in mind the Admin dashboard will always be in English ( we
                  are working on adding more languages in the future)
                </Typography>
              </Stack>

              <Stack direction="column" spacing={2}>
                <RHFSelect name="defaultLanguage" label="Default Menu Language">
                  {TRANSLATION_LANGUAGES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
                {values.languages.includes(values.defaultLanguage) && (
                  <Typography variant="caption" color="error">
                    Selecting{' '}
                    <Label color="info" sx={{ mx: 0.5 }}>{`${
                      LANGUAGE_CODES[values.defaultLanguage].name
                    } - ${LANGUAGE_CODES[values.defaultLanguage].value}`}</Label>{' '}
                    as the default language will remove all translation for this language as it will
                    be your base language
                  </Typography>
                )}
              </Stack>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack direction="column" spacing={1} alignItems="flex-start">
              <Typography variant="h6">Translation Languages</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography>
                  You can only change the translations list few times a month to avoid excessive
                  usage{' '}
                  <Label color={availableLimit === 0 ? 'error' : 'info'}>
                    Available Changes: {availableLimit}
                  </Label>
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
              disabled={availableLimit <= 0}
              chip
              checkbox
              name="languages"
              label="Translation Languages"
              options={TRANSLATION_LANGUAGES.filter(
                (option) => option.value !== businessProfileInfo.defaultLanguage
              )}
            />
          </Stack>
        </Card>
      </Stack>
    </FormProvider>
  );
}
export default TranslationSettingsEditForm;
