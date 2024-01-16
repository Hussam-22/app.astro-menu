import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import { Stack, Divider, Tooltip, InputAdornment } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { rdxResetTranslation_Meal, rdxUpdateTranslation_Meal } from 'src/redux/slices/meal';
import { rdxResetTranslation_Branch, rdxUpdateTranslation_Branch } from 'src/redux/slices/branch';

TranslationTextField.propTypes = {
  field: PropTypes.string,
  reduxSlice: PropTypes.string,
  label: PropTypes.string,
  languageKey: PropTypes.string,
  direction: PropTypes.string,
};

export default function TranslationTextField({
  field,
  label,
  languageKey,
  reduxSlice,
  direction = 'row',
}) {
  const param = useParams();
  const docID = Object.values(param)[0];
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, fsUpdateTable, docSnapshot } = useAuthContext();

  const tableToUpdate = location.pathname.includes('meal') ? 'meals' : 'branches';

  // const translationOriginal = useSelector((state) => state[reduxSlice][reduxSlice].translation[languageKey]);
  // const translationInfo = useSelector((state) => state[reduxSlice][reduxSlice].translationEdited[languageKey]);
  const translationOriginal = docSnapshot.translation[languageKey];
  const translationInfo = docSnapshot.translationEdited[languageKey];

  const [isRestTranslationDirty, setIsRestTranslationDirty] = useState(
    translationOriginal[field] === translationInfo[field]
  );

  const NewUserSchema = Yup.object().shape({
    [field]: Yup.string().required(`${label} cant be empty`),
  });

  const defaultValues = useMemo(
    () => ({ [field]: docSnapshot.translationEdited[languageKey][field] || '' }),
    [field, languageKey, docSnapshot.translationEdited]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    setValue,
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = methods;

  useEffect(() => {
    setValue(field, docSnapshot.translationEdited[languageKey][field]);
  }, [defaultValues, field, languageKey, docSnapshot, setValue]);

  const values = watch();
  // const keyValue = values[field].trim();
  const keyValue = [];
  const docRef = `users/${user.id}/${tableToUpdate}/${docID}`;

  const resetTranslation = async () => {
    if (tableToUpdate === 'branches')
      dispatch(rdxResetTranslation_Branch({ key: field, languageKey }));

    if (tableToUpdate === 'meals') dispatch(rdxResetTranslation_Meal({ key: field, languageKey }));

    fsUpdateTable(docRef, {
      [`translationEdited.${languageKey}.${field}`]: translationOriginal[field],
    });
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve();
        reset({ [field]: translationOriginal[field] });
        setIsRestTranslationDirty(true);
      }, 1000)
    );
  };

  const onSubmit = async () => {
    fsUpdateTable(docRef, { [`translationEdited.${languageKey}.${field}`]: keyValue });

    if (tableToUpdate === 'branches')
      dispatch(rdxUpdateTranslation_Branch({ key: field, keyValue, languageKey }));

    if (tableToUpdate === 'meals')
      dispatch(rdxUpdateTranslation_Meal({ key: field, keyValue, languageKey }));

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
        // rows={3}
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
                      color="inherit"
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
