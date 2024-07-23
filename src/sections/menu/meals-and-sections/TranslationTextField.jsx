import * as Yup from 'yup';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import { Tooltip, Divider, InputAdornment } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

TranslationTextField.propTypes = {
  languageKey: PropTypes.string,
  sectionInfo: PropTypes.object,
  isLoading: PropTypes.func,
};

function TranslationTextField({ languageKey, sectionInfo, isLoading }) {
  const { enqueueSnackbar } = useSnackbar();
  const { fsUpdateSectionTranslation } = useAuthContext();

  const schema = Yup.object().shape({
    translation: Yup.string().required('Translation cant be empty !!'),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: { translation: sectionInfo?.translationEdited[languageKey] || '' },
  });

  const {
    reset,
    watch,
    handleSubmit,
    setValue,
    formState: { isSubmitting, isDirty },
  } = methods;

  useEffect(() => {
    setValue('translation', sectionInfo?.translationEdited[languageKey]);
  }, [languageKey, sectionInfo, setValue]);

  const values = watch();

  const onSubmit = async () => {
    isLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // UPDATE FIREBASE
    fsUpdateSectionTranslation(sectionInfo.menuID, sectionInfo.id, {
      translationEdited: { ...sectionInfo.translationEdited, [languageKey]: values.translation },
    });

    enqueueSnackbar('Translation Updated Successfully !!');
    reset(values);
    isLoading(false);
  };

  const resetTranslationHandler = async () => {
    isLoading(true);

    // UPDATE FIREBASE
    await fsUpdateSectionTranslation(sectionInfo.menuID, sectionInfo.id, {
      translationEdited: {
        ...sectionInfo.translationEdited,
        [languageKey]: sectionInfo.translation[languageKey],
      },
    });

    await new Promise((resolve) =>
      setTimeout(() => {
        enqueueSnackbar('Translation Updated Successfully !!');
        setValue('translation', sectionInfo.translation[languageKey]);
        resolve();
        isLoading(false);
      }, 1000)
    );
  };

  const isRestTranslationDirty = sectionInfo.translation[languageKey] === values.translation;

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <RHFTextField
        name="translation"
        label={LANGUAGE_CODES[languageKey].value}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Reset to default value">
                <LoadingButton
                  type="reset"
                  variant="text"
                  loading={isSubmitting}
                  onClick={() => reset()}
                  color="inherit"
                >
                  <Iconify icon="grommet-icons:power-reset" width={20} height={20} />
                </LoadingButton>
              </Tooltip>

              <Divider orientation="vertical" sx={{ width: 2, height: 40 }} />

              <Tooltip title="Reset to Original Translation">
                <div>
                  <LoadingButton
                    type="button"
                    variant="text"
                    loading={isSubmitting}
                    color="info"
                    onClick={handleSubmit(resetTranslationHandler)}
                    disabled={isRestTranslationDirty}
                  >
                    <Iconify icon="fa:language" width={20} height={20} />
                  </LoadingButton>
                </div>
              </Tooltip>

              <Divider orientation="vertical" sx={{ width: 2, height: 40 }} />

              <LoadingButton
                type="submit"
                variant="text"
                loading={isSubmitting}
                disabled={!isDirty}
              >
                <Iconify icon="fluent:save-28-regular" width={20} height={20} />
              </LoadingButton>
            </InputAdornment>
          ),
        }}
      />
    </FormProvider>
  );
}

export default TranslationTextField;
