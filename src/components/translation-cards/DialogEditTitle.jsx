import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import { Stack, Button, Dialog, Divider, Typography } from '@mui/material';

import { delay } from 'src/utils/promise-delay';
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
  const { fsUpdateMeal, fsUpdateBusinessProfile, businessProfile } = useAuthContext();

  const tableToUpdate = pathname.includes('meal') ? 'meals' : 'businessProfile';

  const NewUserSchema = Yup.object().shape({
    title: showTitle && Yup.string().required('Title cant be empty'),
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
    handleSubmit,
    formState: { isDirty },
  } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      if (tableToUpdate === 'meals') {
        const queryKeys = data?.docID ? ['meals', `meal-${data.docID}`] : ['meals'];
        queryClient.invalidateQueries(queryKeys);
      }

      if (tableToUpdate === 'businessProfile') {
        const queryKeys = ['businessProfile', businessProfile.docID];
        queryClient.invalidateQueries(queryKeys);
      }
    },
  });

  const onSubmit = async (formData) => {
    mutate(async () => {
      if (tableToUpdate === 'meals')
        await fsUpdateMeal({
          docID: data.docID,
          title: formData.title,
          description: formData.description,
          translationEdited: '',
          translation: '',
        });

      if (tableToUpdate === 'businessProfile')
        await fsUpdateBusinessProfile(
          {
            businessName: businessProfile.businessName,
            description: formData.description,
            translationEdited: '',
            translation: '',
          },
          true,
          businessProfile.docID
        );
      await delay(5000);
      onClose();
    });
  };
  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={isOpen}
      onClose={onClose}
      scroll="paper"
      PaperProps={{ sx: { p: 3 } }}
    >
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" spacing={3}>
          {showTitle && <RHFTextField name="title" label="Title" />}
          <RHFTextField name="description" label="Description" multiline row={3} />
        </Stack>

        <Divider />

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
          <Iconify
            icon="ep:warning-filled"
            width={20}
            height={20}
            sx={{ color: theme.palette.error.main }}
          />
          <Typography variant="caption" sx={{ flexGrow: 1 }}>
            Editing title or description will overwrite current translations for all languages
          </Typography>
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
      </FormProvider>
    </Dialog>
  );
}
