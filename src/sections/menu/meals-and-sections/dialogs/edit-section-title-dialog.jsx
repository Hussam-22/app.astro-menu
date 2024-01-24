import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import { Box, Stack, Button, Dialog, Divider, Typography, DialogTitle } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { rdxUpdateMenuSectionTitle } from 'src/redux/slices/menu';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
// ----------------------------------------------------------------------

EditSectionTitleDialog.propTypes = {
  sectionID: PropTypes.string,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

function EditSectionTitleDialog({ isOpen, sectionID, onClose }) {
  const { menuID } = useParams();
  const { fbTranslate, fsUpdateSectionTitle } = useAuthContext();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { title: sectionTitle, userID } = useSelector(
    (state) => state.menu.menu.sections.filter((section) => section.id === sectionID)[0]
  );

  const sectionsTitles = useSelector((state) =>
    state.menu.menu.sections
      .filter((section) => section.id !== sectionID)
      .flatMap((section) => section.title)
  );

  const NewUserSchema = Yup.object().shape({
    // title: Yup.string().required('Title cant be empty'),
    title: Yup.string()
      .notOneOf([...sectionsTitles], 'Section Name Already in use')
      .required('Title cant be empty'),
  });
  const defaultValues = useMemo(
    () => ({
      title: sectionTitle || '',
    }),
    [sectionTitle]
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

  const onSubmit = async () => {
    const { title } = values;
    const sectionRef = `users/${userID}/menus/${menuID}/sections/${sectionID}`;
    fbTranslate({ sectionRef, text: title });
    fsUpdateSectionTitle(menuID, sectionID, title);

    // DELETE TRANSLATION_EDIT OBJECT (Firebase)
    // fsDeleteSectionTranslationEdited(menuID, sectionID);

    await new Promise((resolve) =>
      setTimeout(() => {
        dispatch(rdxUpdateMenuSectionTitle({ menuID, sectionID, title }));
        onClose();
        resolve();
      }, 1000)
    );
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose} scroll="paper">
      <DialogTitle>Edit Section Title</DialogTitle>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ pb: 2, px: 2 }}>
          <RHFTextField name="title" label="Section Title" />
        </Box>

        <Divider />
        <Box sx={{ py: 2, px: 2 }}>
          <Stack direction="row" spacing={2} justifyContent="right">
            <Iconify
              icon="ep:warning-filled"
              width={38}
              height={38}
              sx={{ color: theme.palette.error.main }}
            />
            <Typography variant="body2">
              Editing section title will overwrite current translations to match the new title
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

export default EditSectionTitleDialog;
