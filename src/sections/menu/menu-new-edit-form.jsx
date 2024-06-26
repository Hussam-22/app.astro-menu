import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

MenuNewEditForm.propTypes = {
  menuData: PropTypes.object,
  onClose: PropTypes.func,
};

export default function MenuNewEditForm({ menuData, onClose }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { fsUpdateMenu, fsAddNewMenu, fsDeleteMenu } = useAuthContext();
  const queryClient = useQueryClient();

  const NewUserSchema = Yup.object().shape({
    title: Yup.string().required('Menu title is required'),
    mostOrderedMeals: Yup.number().max(
      10,
      'Number of most ordered meals must be less than or equal to 10'
    ),
  });

  const defaultValues = useMemo(
    () => ({
      docID: menuData?.docID || '',
      title: menuData?.title || '',
      description: menuData?.description || '',
      mostOrderedMeals: menuData?.mostOrderedMeals || 0,
    }),
    [menuData]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const { handleSubmit } = methods;

  const { isPending, mutate } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      const queryKeys = menuData?.docID ? ['menus', `menu-${menuData.docID}`] : ['menus'];
      queryClient.invalidateQueries(queryKeys);
    },
  });

  const deleteMenu = () => {
    mutate(() => fsDeleteMenu(menuData.docID));
    router.push(paths.dashboard.menu.list);
  };

  const onSubmit = async (data) => {
    if (menuData?.docID) {
      mutate(() => fsUpdateMenu(data));
    }
    if (!menuData?.docID) {
      mutate(() => fsAddNewMenu(data));
    }

    enqueueSnackbar('Update success!');
    if (!menuData?.docID) onClose();
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" spacing={2}>
        <RHFTextField name="title" label="Menu Title" />
        <RHFTextField name="description" label="Menu Description" multiline rows={3} />
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="column" sx={{ width: 1 }}>
            <Typography variant="" color="text.secondary">
              Number of Most Ordered Meals to Show
            </Typography>
            <Typography variant="caption" sx={{ color: 'info.main' }}>
              Set to 0 (Zero) to hide the most ordered meals section, max is 10
            </Typography>
          </Stack>
          <RHFTextField
            name="mostOrderedMeals"
            label="Number of Most Ordered Meals to Show"
            type="number"
          />
        </Stack>
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
