import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import { Box, Stack, Button, Dialog, Divider, Typography, DialogTitle } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from '../iconify';
import FormProvider, { RHFTextField } from '../hook-form';

DialogEditTitle.propTypes = {
  data: PropTypes.object,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  showTitle: PropTypes.bool,
};

export default function DialogEditTitle({ isOpen, onClose, data, showTitle = true }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  const { fsUpdateMeal, fsUpdateBranch } = useAuthContext();

  const tableToUpdate = pathname.includes('meal') ? 'meals' : 'branches';
  const docRef = `users/${data.userID}/${tableToUpdate}/${data.docID}`;

  const NewUserSchema = Yup.object().shape({
    title: Yup.string().required('Title cant be empty'),
    description: Yup.string().required('Description cant be empty'),
  });

  const defaultValues = useMemo(
    () => ({
      title: data?.title || '',
      description: data?.description || '',
    }),
    [data]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    watch,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = methods;

  const { mutate } = useMutation({
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

  const onSubmit = async (formData) => {
    mutate(() => {
      if (tableToUpdate === 'meals')
        fsUpdateMeal({
          docID: data.docID,
          title: formData.title,
          description: formData.description,
          translationEdited: '',
          translation: '',
        });

      if (tableToUpdate === 'branches') fsUpdateBranch();
    });
    onClose();
  };
  return (
    <Dialog fullWidth maxWidth="md" open={isOpen} onClose={onClose} scroll="paper">
      <DialogTitle sx={{ mb: 2 }}>Edit Title & Description</DialogTitle>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" spacing={3} sx={{ py: 2, px: 2 }}>
          {showTitle && <RHFTextField name="title" label="Title" />}
          <RHFTextField name="description" label="Description" multiline row={3} />
        </Stack>

        <Divider />

        <Box sx={{ py: 2, px: 2 }}>
          <Stack direction="row" spacing={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify
              icon="ep:warning-filled"
              width={20}
              height={20}
              sx={{ color: theme.palette.error.main }}
            />
            <Typography variant="caption" sx={{ flexGrow: 1 }}>
              Editing meal title or description will overwrite current translations for all
              languages
            </Typography>
            <LoadingButton
              type="submit"
              variant="contained"
              color="success"
              loading={isSubmitting}
              disabled={!isDirty}
            >
              Save
            </LoadingButton>
            <Button color="inherit" variant="outlined" onClick={onClose}>
              close
            </Button>
          </Stack>
        </Box>
      </FormProvider>
    </Dialog>
  );
}
