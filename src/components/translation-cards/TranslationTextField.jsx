import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useParams, useLocation } from 'react-router';

import { LoadingButton } from '@mui/lab';
import { Stack, Divider, Tooltip, InputAdornment } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { rdxResetTranslation_Meal, rdxUpdateTranslation_Meal } from 'src/redux/slices/meal';
import { rdxResetTranslation_Branch, rdxUpdateTranslation_Branch } from 'src/redux/slices/branch';

TranslationTextField.propTypes = {
  field: PropTypes.string,
  label: PropTypes.string,
  languageKey: PropTypes.string,
  direction: PropTypes.string,
  data: PropTypes.object,
};

export default function TranslationTextField({
  field,
  label,
  languageKey,
  direction = 'row',
  data,
}) {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, fsUpdateTable } = useAuthContext();
  const { translated, editedTranslation } = data;

  const tableToUpdate = location.pathname.includes('meal') ? 'meals' : 'branches';

  const [isRestTranslationDirty, setIsRestTranslationDirty] = useState(
    translated === editedTranslation
  );

  const NewUserSchema = Yup.object().shape({
    [field]: Yup.string().required(`${label} cant be empty`),
  });

  const defaultValues = useMemo(
    () => ({ [field]: editedTranslation || translated }),
    [field, editedTranslation, translated]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = methods;

  const values = watch();

  const resetTranslation = async () => {
    const docRef = `users/${user.id}/${tableToUpdate}/${id}`;

    if (tableToUpdate === 'branches')
      dispatch(rdxResetTranslation_Branch({ key: field, languageKey }));

    if (tableToUpdate === 'meals') dispatch(rdxResetTranslation_Meal({ key: field, languageKey }));

    fsUpdateTable(docRef, {
      [`translationEdited.${languageKey}.${field}`]: translated,
    });
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve();
        reset({ [field]: translated });
        setIsRestTranslationDirty(true);
      }, 1000)
    );
  };

  const onSubmit = async () => {
    const docRef = `users/${user.id}/${tableToUpdate}/${id}`;

    fsUpdateTable(docRef, { [`translationEdited.${languageKey}.${field}`]: values[field] });

    if (tableToUpdate === 'branches')
      dispatch(rdxUpdateTranslation_Branch({ key: field, keyValue: values[field], languageKey }));

    if (tableToUpdate === 'meals')
      dispatch(rdxUpdateTranslation_Meal({ key: field, keyValue: values[field], languageKey }));

    await new Promise((resolve) =>
      setTimeout(() => {
        reset(values);
        resolve();
      }, 1000)
    );
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <RHFTextField
        name={field}
        label={label}
        multiline
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Stack
                direction={direction}
                divider={
                  <Divider orientation="vertical" sx={{ width: 2, height: 20 }} variant="middle" />
                }
              >
                <Tooltip title="Reset to default value">
                  <div>
                    <LoadingButton
                      type="reset"
                      variant="text"
                      loading={isSubmitting}
                      onClick={() => reset()}
                      color="warning"
                      disabled={!isDirty}
                    >
                      <Iconify icon="grommet-icons:power-reset" width={20} height={20} />
                    </LoadingButton>
                  </div>
                </Tooltip>

                <Tooltip title="Reset to Original Translation">
                  <div>
                    <LoadingButton
                      type="button"
                      variant="text"
                      loading={isSubmitting}
                      color="info"
                      onClick={handleSubmit(resetTranslation)}
                      disabled={isRestTranslationDirty}
                    >
                      <Iconify icon="fa:language" width={20} height={20} />
                    </LoadingButton>
                  </div>
                </Tooltip>

                <LoadingButton
                  type="submit"
                  variant="text"
                  loading={isSubmitting}
                  disabled={!isDirty}
                  color="success"
                >
                  <Iconify icon="fluent:save-28-regular" width={20} height={20} />
                </LoadingButton>
              </Stack>
            </InputAdornment>
          ),
        }}
      />
    </FormProvider>
  );
}
