import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useParams, useLocation } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Stack, Divider, Tooltip, InputAdornment } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

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
  const { fsUpdateTable, businessProfile } = useAuthContext();
  const queryClient = useQueryClient();

  console.log(data);

  const translationData = {
    translated: data?.translation[languageKey]?.[field] || '',
    editedTranslation: data?.translationEdited[languageKey]?.[field] || '',
  };

  const tableToUpdate = () => {
    if (location.pathname.includes('meal'))
      return { table: 'meals', docRef: `businessProfiles/${businessProfile.docID}/meals/${id}` };

    if (location.pathname.includes('menu'))
      return {
        table: 'menu-sections',
        docRef: `businessProfiles/${businessProfile.docID}/menus/${id}/sections/${data.docID}`,
      };

    if (location.pathname.includes('business-profile'))
      return { table: 'businessProfiles', docRef: `businessProfiles/${businessProfile.docID}/` };

    return undefined;
  };

  const [isRestTranslationDirty, setIsRestTranslationDirty] = useState(
    translationData.translated === translationData.editedTranslation
  );

  const NewUserSchema = Yup.object().shape({
    [field]: Yup.string().required(`${label} cant be empty`),
  });
  const defaultValues = useMemo(
    () => ({ [field]: translationData.editedTranslation || translationData.translated }),
    [field, translationData.editedTranslation, translationData.translated]
  );
  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });
  const {
    setValue,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = methods;

  // useEffect(() => {
  //   setValue(field, translationData.editedTranslation || translationData.translated);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [translationData]);

  const { isPending, mutate, error } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      if (tableToUpdate().table === 'meals') {
        // const queryKeys = ['meals', `meal-${id}`];
        queryClient.invalidateQueries({ queryKey: [`meal-${id}`] });
      }

      if (tableToUpdate().table === 'businessProfiles') {
        queryClient.invalidateQueries({ queryKey: ['businessProfiles'] });
      }

      if (tableToUpdate().table === 'menu-sections') {
        queryClient.invalidateQueries({
          queryKey: ['section', id, businessProfile.docID],
        });
      }
    },
  });

  const resetTranslation = () => {
    mutate(() =>
      fsUpdateTable(tableToUpdate().docRef, {
        [`translationEdited.${languageKey}.${field}`]: translationData.translated,
      })
    );
    reset({ [field]: translationData.translated });
    setIsRestTranslationDirty(true);
  };

  const onSubmit = async (formData) => {
    mutate(async () =>
      fsUpdateTable(tableToUpdate().docRef, {
        [`translationEdited.${languageKey}.${field}`]: formData[field],
      })
    );
    reset({ [field]: translationData.translated });
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
                      loading={isPending}
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
                      loading={isPending}
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
                  loading={isPending}
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
