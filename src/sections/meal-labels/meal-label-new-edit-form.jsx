import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Stack, Button } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

MealLabelNewEditForm.propTypes = {
  // labelInfo: PropTypes.object,
  onClose: PropTypes.func,
  mealID: PropTypes.string,
};

export default function MealLabelNewEditForm({ onClose, mealID }) {
  const { enqueueSnackbar } = useSnackbar();
  const { fsGetMealLabels, fsAddNewMealLabel } = useAuthContext();
  const queryClient = useQueryClient();

  const { data: mealLabelsList = [], error } = useQuery({
    queryKey: ['meal-labels'],
    queryFn: () => fsGetMealLabels(),
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
      const keysArray = mealID ? ['meal-labels', 'meals', `meal-${mealID}`] : ['meal-labels'];
      queryClient.invalidateQueries(keysArray);
      enqueueSnackbar('Meal Label Saved successfully!');
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
