import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { useRouter } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

MenuNewEditForm.propTypes = {
  menuData: PropTypes.object,
  onClose: PropTypes.func,
};

export default function MenuNewEditForm({ menuData, onClose }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { fsUpdateMenu, fsAddNewMenu, fsDeleteMenu } = useAuthContext();
  const queryClient = useQueryClient();

  const NewUserSchema = Yup.object().shape({
    title: Yup.string().required('Menu title is required'),
  });

  const defaultValues = useMemo(
    () => ({
      docID: menuData?.docID || '',
      title: menuData?.title || '',
      description: menuData?.description || '',
    }),
    [menuData]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const { isPending, isSuccess, mutate } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });

  const deleteMenu = () => {
    mutate(() => fsDeleteMenu(menuData.docID));
    onClose();
  };

  const onSubmit = async (data) => {
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    if (menuData?.docID) {
      mutate(() => fsUpdateMenu(data));
      // dispatch(rdxGetMenu(data));
    }
    if (!menuData?.docID) {
      mutate(() => fsAddNewMenu(data));
    }

    enqueueSnackbar('Update success!');
    onClose();
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" spacing={2}>
        <RHFTextField name="title" label="Menu Title" />
        <RHFTextField name="description" label="Menu Description" multiline rows={3} />
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
          {menuData?.docID && (
            <LoadingButton
              color="error"
              variant="contained"
              loading={isPending}
              sx={{ alignSelf: 'flex-end' }}
              onClick={deleteMenu}
            >
              Delete
            </LoadingButton>
          )}
          <LoadingButton
            type="submit"
            variant="contained"
            color="success"
            loading={isPending}
            sx={{ alignSelf: 'flex-end' }}
          >
            Save
          </LoadingButton>
        </Stack>
      </Stack>
    </FormProvider>
  );
}
