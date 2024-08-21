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
import { Card, Stack, Typography } from '@mui/material';

import Label from 'src/components/label';
import { useAuthContext } from 'src/auth/hooks';
import { delay } from 'src/utils/promise-delay';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useGetProductInfo } from 'src/hooks/use-get-product';
import FormProvider, { RHFMultiSelect } from 'src/components/hook-form';

// ----------------------------------------------------------------------------

const TRANSLATION_LANGUAGES = Object.entries(LANGUAGE_CODES)
  .map(([key, value]) => ({
    value: key,
    label: `${value.name} - ${value.value}`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

TranslationsListEditForm.propTypes = {
  businessProfileInfo: PropTypes.object,
};

function TranslationsListEditForm({ businessProfileInfo }) {
  const queryClient = useQueryClient();
  const { fsUpdateTranslationSettings } = useAuthContext();
  const { maxTranslationsLanguages } = useGetProductInfo();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);

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
    onSuccess: (formData) => {
      queryClient.invalidateQueries(['businessProfile', businessProfileInfo?.docID]);
      reset(formData);
    },
  });

  const onSubmit = async (formData) => {
    const isLanguagesEqual =
      JSON.stringify(formData.languages.sort()) ===
      JSON.stringify(businessProfileInfo?.languages?.sort());

    if (isLanguagesEqual && dirtyFields.languages) {
      enqueueSnackbar('No changes detected', { variant: 'warning' });
      reset();
      return;
    }

    setOpen(true);
  };

  const newLang = values?.languages?.filter(
    (lang) => !businessProfileInfo?.languages?.includes(lang)
  );
  const toRemoveLang = businessProfileInfo?.languages?.filter(
    (lang) => !values?.languages?.includes(lang)
  );

  const updateLanguagesList = async () => {
    mutate(async () => {
      await delay(1000);
      const response = await fsUpdateTranslationSettings(newLang, toRemoveLang, values.languages);
      enqueueSnackbar(response.data.message);
      setOpen(false);
      return values;
    });
  };

  const { count, maxCount } = businessProfileInfo.translationEditUsage;
  const translationEditUsageLimit = count || 0;
  const availableLimit = maxCount - translationEditUsageLimit;

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" spacing={2}>
          <Card sx={{ p: 3 }}>
            <Stack direction="column" spacing={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Translation Languages</Typography>
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
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography>
                  You can only change the translations list few times a month to avoid excessive
                  usage{' '}
                  <Label color={availableLimit === 0 ? 'error' : 'info'}>
                    Available Changes: {availableLimit}
                  </Label>
                </Typography>
              </Stack>

              <RHFMultiSelect
                sx={{ mt: 2 }}
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

      <ConfirmDialog
        maxWidth="md"
        open={open}
        onClose={() => setOpen(false)}
        closeText="No, Cancel"
        action={
          <LoadingButton
            variant="contained"
            color="secondary"
            loading={isPending}
            onClick={updateLanguagesList}
          >
            Yes, Update
          </LoadingButton>
        }
        title="Update Languages List"
        content={
          <Stack direction="column" spacing={1}>
            {toRemoveLang.length !== 0 && (
              <Stack direction="column" spacing={1}>
                <Typography variant="caption" color="error">
                  Removing a Translation language will remove all the translations for that language
                </Typography>

                <Typography sx={{ fontWeight: 600 }}>
                  Languages to Remove :{' '}
                  {toRemoveLang.map((lang) => (
                    <Label
                      key={lang}
                      color="error"
                      sx={{ mx: 0.25 }}
                    >{`${LANGUAGE_CODES[lang].name} - ${LANGUAGE_CODES[lang].value}`}</Label>
                  ))}
                </Typography>
              </Stack>
            )}
            {newLang.length !== 0 && (
              <Typography sx={{ fontWeight: 600 }}>
                New Languages to add :{' '}
                {newLang.map((lang) => (
                  <Label
                    key={lang}
                    color="success"
                    sx={{ mx: 0.25 }}
                  >{`${LANGUAGE_CODES[lang].name} - ${LANGUAGE_CODES[lang].value}`}</Label>
                ))}
              </Typography>
            )}
          </Stack>
        }
      />
    </>
  );
}
export default TranslationsListEditForm;
