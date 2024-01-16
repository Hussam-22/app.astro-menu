import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import { Box, Stack, Button, Dialog, Divider, Typography, DialogTitle } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { useResponsive } from 'src/hooks/use-responsive';
import { rdxUpdateBranchDescription } from 'src/redux/slices/branch';

import Iconify from '../iconify';
import FormProvider, { RHFTextField } from '../hook-form';
import { rdxStartLoading as mealStartingLoading } from '../../redux/slices/meal';

DialogEditTitle.propTypes = {
  data: PropTypes.object,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  showTitle: PropTypes.bool,
};

export default function DialogEditTitle({ isOpen, onClose, data, showTitle = true }) {
  const { fsUpdateTable, fbTranslateMeal, fbTranslateBranchDesc } = useAuthContext();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isDesktop = useResponsive('up', 'sm');
  const { pathname } = useLocation();

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

  const values = watch();

  const mealSubmit = () => {
    const mealRef = `users/${data.userID}/meals/${data.id}`;
    const { title, description } = values;

    fsUpdateTable(mealRef, { title, description });
    fbTranslateMeal({ mealRef, text: { title, desc: description }, userID: data.userID });
    dispatch(mealStartingLoading());
  };
  const branchSubmit = () => {
    const branchRef = `users/${data.userID}/branches/${data.id}`;
    const { description } = values;

    fsUpdateTable(branchRef, { description });
    fbTranslateBranchDesc({ branchRef, text: { description }, userID: data.userID });
    dispatch(rdxUpdateBranchDescription(description));
  };

  const onSubmit = async () => {
    if (pathname.includes('meal')) mealSubmit();
    if (pathname.includes('branch')) branchSubmit();
    await new Promise((resolve) =>
      setTimeout(() => {
        onClose();
        resolve();
      }, 500)
    );
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
          <Stack
            direction={isDesktop ? 'row' : 'column'}
            spacing={2}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
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
