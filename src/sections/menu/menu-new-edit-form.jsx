import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Card, Stack, Divider, MenuItem, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import Label from 'src/components/label';
import { useRouter } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

MenuNewEditForm.propTypes = {
  menuInfo: PropTypes.object,
  onClose: PropTypes.func,
};

export default function MenuNewEditForm({ menuInfo, onClose }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { fsUpdateMenu, fsDeleteMenu, fsGetAllMenus } = useAuthContext();
  const queryClient = useQueryClient();

  const NewUserSchema = Yup.object().shape({
    title: Yup.string().required('Menu title is required'),
    mostOrderedMeals: Yup.number().max(
      10,
      'Number of most ordered meals must be less than or equal to 10'
    ),
  });

  const {
    data: menusList = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['menus'],
    queryFn: fsGetAllMenus,
  });

  const defaultValues = useMemo(
    () => ({
      docID: menuInfo?.docID || '',
      title: menuInfo?.title || '',
      description: menuInfo?.description || '',
      mostOrderedMeals: menuInfo?.mostOrderedMeals || 0,
      newMenuID: '',
    }),
    [menuInfo]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { dirtyFields },
    watch,
  } = methods;

  const values = watch();

  const {
    isPending,
    mutate,
    error: mutationError,
  } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      queryClient.invalidateQueries(['menus', `menu-${menuInfo.docID}`]);
    },
  });

  const deleteMenu = () => {
    mutate(() => fsDeleteMenu(menuInfo.docID, values.newMenuID));
    router.push(paths.dashboard.menu.list);
  };

  const onSubmit = async (data) => {
    mutate(() => fsUpdateMenu(data));
    enqueueSnackbar('Update success!');
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" spacing={2}>
        <LoadingButton
          type="submit"
          variant="contained"
          color="success"
          loading={isPending}
          sx={{ alignSelf: 'flex-end' }}
          disabled={!dirtyFields.title && !dirtyFields.description && !dirtyFields.mostOrderedMeals}
        >
          Update Menu
        </LoadingButton>

        <Card sx={{ p: 3 }}>
          <Stack direction="column" spacing={2}>
            <RHFTextField name="title" label="Menu Title" />
            <RHFTextField name="description" label="Menu Description" multiline rows={3} />
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Menu Settings
          </Typography>
          <Stack
            direction="column"
            spacing={1}
            divider={<Divider sx={{ borderStyle: 'dashed' }} />}
          >
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="column" sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontWeight: 500 }}>Most Ordered Meals</Typography>
                <Typography variant="caption">
                  {` - Show the number of "most ordered meals" in the menu, max is 10`}
                </Typography>
                <Typography variant="caption">
                  - Set to 0 (Zero) to hide the most ordered meals section
                </Typography>
              </Stack>
              <RHFTextField
                name="mostOrderedMeals"
                label="# of Meals"
                type="number"
                sx={{ flexShrink: 1, width: '10%' }}
              />
            </Stack>

            <Stack direction="row" spacing={3}>
              <Stack direction="column">
                <Typography color="error" sx={{ fontWeight: 700 }}>
                  Delete Menu
                </Typography>
                {menusList.length === 1 && (
                  <Typography variant="caption">
                    The system must have at least 1 menu, &nbsp;
                    <Label variant="soft" color="primary">
                      {menuInfo.title}
                    </Label>
                    &nbsp;is your only menu, you must create a new menu before deleting it.
                  </Typography>
                )}
                {menusList.length !== 1 && (
                  <Typography variant="caption">
                    {`You must specify the 'Revert to Menu' to delete this menu, QRs across all
                  branches using `}
                    <Label variant="soft" color="primary">
                      {menuInfo.title}
                    </Label>
                    &nbsp;menu will revert to the selected menu
                  </Typography>
                )}
              </Stack>
              <Stack direction="column" spacing={2} alignSelf="flex-end" sx={{ flexGrow: 1 }}>
                {menusList.length !== 0 && menusList.length > 1 && (
                  <RHFSelect
                    name="newMenuID"
                    label="Revert to Menu"
                    sx={{ bgcolor: 'common.white', borderRadius: 1 }}
                    size="small"
                  >
                    <MenuItem value="" />
                    {menusList
                      .filter((menu) => menu.docID !== menuInfo.docID)
                      .map((menu) => (
                        <MenuItem key={menu.docID} value={menu.docID}>
                          {menu.title}
                        </MenuItem>
                      ))}
                  </RHFSelect>
                )}

                <LoadingButton
                  loading={isPending}
                  variant="contained"
                  onClick={deleteMenu}
                  color="error"
                  sx={{ whiteSpace: 'nowrap' }}
                  disabled={isLoading || menusList.length <= 1 || values.newMenuID === ''}
                  fullWidth
                >
                  Delete Menu
                </LoadingButton>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </FormProvider>
  );
}
