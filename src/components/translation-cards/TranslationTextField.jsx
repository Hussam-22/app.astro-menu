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
  const { user, fsUpdateTable } = useAuthContext();
  const { translated, editedTranslation } = data;
  const queryClient = useQueryClient();

  console.log('//TODO: Fix buttons status on save and reset');

  const tableToUpdate = location.pathname.includes('meal') ? 'meals' : 'branches';
  const docRef = `users/${user.id}/${tableToUpdate}/${id}`;

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
    handleSubmit,
    formState: { isDirty },
  } = methods;

  const { isPending, mutate } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      if (tableToUpdate === 'meals') {
        const queryKeys = data?.docID ? ['meals', `meal-${data.docID}`] : ['meals'];
        queryClient.invalidateQueries(queryKeys);
      }

      if (tableToUpdate === 'branches') {
        const queryKeys = data?.docID ? ['branches', `branch-${data.docID}`] : ['branches'];
        queryClient.invalidateQueries(queryKeys);
      }
    },
  });

  const resetTranslation = () => {
    mutate(() =>
      fsUpdateTable(docRef, {
        [`translationEdited.${languageKey}.${field}`]: translated,
      })
    );
    reset({ [field]: translated });
    setIsRestTranslationDirty(true);
  };

  const onSubmit = async (formData) => {
    mutate(() =>
      fsUpdateTable(docRef, { [`translationEdited.${languageKey}.${field}`]: formData[field] })
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
