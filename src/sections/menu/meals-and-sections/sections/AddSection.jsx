import * as Yup from 'yup';
import { useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import { Card, InputAdornment } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { rdxAddSection } from 'src/redux/slices/menu';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

function AddSection() {
  const { id: menuID } = useParams();
  const dispatch = useDispatch();
  const { fsAddSection } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const menuSections = useSelector((state) => state.menu.menu.sections);

  const SECTIONS_LENGTH = useMemo(() => menuSections.length, [menuSections]);

  const NewUserSchema = Yup.object().shape({
    sectionName: Yup.string().required('Section Name Cant be Empty !!'),
  });

  const defaultValues = useMemo(() => ({ sectionName: '' }), []);

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const addSectionHandler = async (data) => {
    // CHECK IF SECTION NAME EXISTS (IS DUPLICATE)
    if (menuSections.find((section) => section.title === data.sectionName)) {
      enqueueSnackbar('Section title already exists !!', {
        variant: 'error',
        anchorOrigin: { horizontal: 'center', vertical: 'top' },
      });
      return;
    }

    const sectionID = await fsAddSection(menuID, data.sectionName.trim(), SECTIONS_LENGTH + 1);

    dispatch(
      rdxAddSection({
        menuID,
        sectionID,
        title: data.sectionName.trim(),
        order: SECTIONS_LENGTH + 1,
      })
    );
    reset();
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(addSectionHandler)}>
      <Card sx={{ p: 3 }}>
        <RHFTextField
          name="sectionName"
          label="Section Name"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <LoadingButton type="submit" variant="text" loading={isSubmitting} fullWidth>
                  Add Section
                </LoadingButton>
              </InputAdornment>
            ),
          }}
        />
      </Card>
    </FormProvider>
  );
}

export default AddSection;
