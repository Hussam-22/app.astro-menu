import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import { Box, Stack, Drawer, Button, Divider, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { delay } from 'src/utils/promise-delay';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
// ----------------------------------------------------------------------

EditMealTitleDescDrawer.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  mealInfo: PropTypes.object,
};

function EditMealTitleDescDrawer({ isOpen, onClose, mealInfo }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { fsUpdateMeal } = useAuthContext();

  const NewUserSchema = Yup.object().shape({
    title: Yup.string().required('Title cant be empty'),
    description: Yup.string().required('Description cant be empty'),
  });

  const defaultValues = useMemo(
    () => ({
      title: mealInfo?.title || '',
      description: mealInfo?.description || '',
    }),
    [mealInfo]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isDirty },
  } = methods;

  const { mutate, isPending, error } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`meal-${mealInfo.docID}`] });
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
  });

  const onSubmit = async (formData) => {
    mutate(async () => {
      await fsUpdateMeal({
        docID: mealInfo.docID,
        title: formData.title,
        description: formData.description,
        translationEdited: '',
        translation: '',
      });
      await delay(5000);
      onClose();
    });
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={() => onClose()}
      PaperProps={{
        sx: { borderRadius: '25px 0 0 25px', width: { xs: '75%', sm: '45%' } },
      }}
    >
      <Box sx={{ p: 2, mb: 1, bgcolor: 'secondary.main' }}>
        <Typography variant="h6" color="primary">
          Edit Title & Description
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="column" spacing={3}>
            <RHFTextField name="title" label="Title" />
            <RHFTextField name="description" label="Description" multiline row={3} />
          </Stack>

          <Divider />

          <Stack direction="column" sx={{ mt: 2 }} spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button color="inherit" variant="outlined" onClick={onClose}>
                close
              </Button>
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
            {isPending && (
              <Typography variant="body2">Updating translation might take a while...</Typography>
            )}
            <Typography variant="body2" color="error">
              Editing title or description will overwrite current custom translations for all
              languages
            </Typography>
          </Stack>
        </FormProvider>
      </Box>
    </Drawer>
  );
}
export default EditMealTitleDescDrawer;
