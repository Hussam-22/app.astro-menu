import * as Yup from 'yup';
import { useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector, useDispatch } from 'react-redux';

import { Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import { rdxUpdateMenusList } from 'src/redux/slices/menu';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// MenuNewEditForm.propTypes = {
//   isEdit: PropTypes.bool,
// };

export default function MenuNewEditForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const menuInfo = useSelector((state) => state.menu.menu);
  const { enqueueSnackbar } = useSnackbar();
  const { fsUpdateMenu, fsAddNewMenu } = useAuthContext();

  // -------------------------------- Form Validation and Handler --------------------------------------------
  const NewUserSchema = Yup.object().shape({
    title: Yup.string().required('Menu title is required'),
    // scheduler: Yup.object().shape({
    //   alwaysAvailable: Yup.boolean(),
    //   activeTimeRange: Yup.object().when('alwaysAvailable', {
    //     is: false,
    //     then: Yup.object().shape({
    //       to: Yup.string().required(''),
    //       from: Yup.string().required(''),
    //     }),
    //   }),
    //   activeDays: Yup.array().when('alwaysAvailable', {
    //     is: false,
    //     then: Yup.array().min(1, 'At least One Day should be selected'),
    //   }),
    // }),
    // 'cover.file': Yup.mixed().required('Menu Cover is Required'),
    // cover: Yup.mixed().test('required', 'Menu Cover is required', (value) => value.file !== ''),
  });

  const defaultValues = useMemo(
    () => ({
      title: menuInfo?.title || '',
      description: menuInfo?.description || '',
    }),
    [menuInfo]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // -------------------------------- Show Selected Image Handler --------------------------------------------
  const onSubmit = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (menuInfo?.docID) {
      fsUpdateMenu(menuInfo.docID, data);
      // dispatch(rdxGetMenu(data));
    }
    if (!menuInfo?.docID) {
      fsAddNewMenu(data);
      dispatch(rdxUpdateMenusList(data));
      router.push(paths.dashboard.menu.root);
    }

    enqueueSnackbar('Update success!');
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" spacing={2}>
        <RHFTextField name="title" label="Menu Title" />
        <RHFTextField name="description" label="Menu Description" multiline rows={3} />
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          sx={{ alignSelf: 'flex-end' }}
        >
          Save
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
