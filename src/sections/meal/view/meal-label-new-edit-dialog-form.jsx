import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  Box,
  Card,
  Stack,
  Button,
  Dialog,
  Divider,
  useTheme,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import MealPortionAdd from 'src/sections/meal/meal-portion-add';
import FormProvider, { RHFSwitch, RHFUpload, RHFTextField } from 'src/components/hook-form';

MealLabelNewEditForm.propTypes = { labelInfo: PropTypes.object, onClose: PropTypes.func };

export default function MealLabelNewEditForm({ labelInfo, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const { fsGetMealLabels, fsAddNewMealLabel } = useAuthContext();
  const queryClient = useQueryClient();

  const { data: mealLabelsList = [] } = useQuery({
    queryKey: ['meal-labels'],
    queryFn: fsGetMealLabels,
  });

  const NewMealSchema = Yup.object().shape({
    title: Yup.string()
      .required('Title is required')
      .notOneOf([...mealLabelsList.map((label) => label.title.toLowerCase())]),
  });

  const defaultValues = {
    title: '',
  };

  const methods = useForm({
    resolver: yupResolver(NewMealSchema),
    defaultValues,
  });

  const { handleSubmit } = methods;

  const { isPending, mutate } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      queryClient.invalidateQueries('meal-labels');
      enqueueSnackbar('Meal Saved successfully!');
      onClose();
    },
  });

  const onSubmit = async (data) => {
    mutate(() => fsAddNewMealLabel(data.title));
  };
  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" spacing={2} sx={{ py: 2 }}>
        <RHFTextField name="title" label="Meal Label Title" />
        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Close
          </Button>
          <LoadingButton variant="contained" color="success" type="submit" loading={isPending}>
            Add
          </LoadingButton>
        </Stack>
      </Stack>
    </FormProvider>
  );
}
