import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import {
  Grid,
  Card,
  Stack,
  Dialog,
  Button,
  Skeleton,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  InputAdornment,
} from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import LanguageCard from 'src/components/translation-cards/LanguageCard';
// ----------------------------------------------------------------------

EditSectionTitleDialog.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  sectionID: PropTypes.string,
};

function EditSectionTitleDialog({ isOpen, onClose, sectionID }) {
  const { id: menuID } = useParams();
  const { fsUpdateSectionTitle, fsGetSections, fsGetSection } = useAuthContext();
  const queryClient = useQueryClient();

  const { data: sections = [] } = useQuery({
    queryKey: [`sections-${menuID}`],
    queryFn: () => fsGetSections(menuID),
  });

  const { data: sectionInfo = [], isFetching } = useQuery({
    queryKey: [`menu/${menuID}/section/${sectionID}`],
    queryFn: () => fsGetSection(menuID, sectionID),
  });

  const languageKeys = Object.keys(sectionInfo?.translationEdited || {});

  const { isPending, mutate } = useMutation({
    mutationFn: (payload) =>
      fsUpdateSectionTitle(menuID, sectionInfo.docID, {
        title: payload.title,
        translation: '',
        translationEdit: '',
      }),
    onSuccess: () => {
      const queryKeys = [`sections-${menuID}`];
      queryClient.invalidateQueries(queryKeys);
    },
  });

  const NewUserSchema = Yup.object().shape({
    // title: Yup.string().required('Title cant be empty'),
    title: Yup.string()
      .required('Title cant be empty')
      .notOneOf(sections.map((section) => section.title)),
  });
  const defaultValues = useMemo(
    () => ({
      title: sectionInfo?.title || '',
    }),
    [sectionInfo?.title]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods;

  useEffect(() => {
    if (sectionInfo) reset(defaultValues);
  }, [defaultValues, reset, sectionInfo]);

  const onSubmit = async (formData) => {
    mutate(formData);
  };

  const skeletonLanguageCards = (
    <Grid container spacing={5}>
      {[...Array(languageKeys.length + 1)].map((_, index) => (
        <Grid item xs={12} md={12} key={index}>
          <Card sx={{ p: 3 }}>
            <Stack direction="column" spacing={3}>
              <Skeleton variant="rounded" />
              <Skeleton variant="rounded" />
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Dialog fullWidth maxWidth="md" open={isOpen} onClose={onClose} scroll="paper">
      <DialogTitle>Edit Section Title</DialogTitle>

      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Card sx={{ p: 3 }}>
            <RHFTextField
              name="title"
              label="Section Title"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <LoadingButton
                      type="submit"
                      variant="text"
                      color="success"
                      loading={isPending}
                      disabled={!isDirty}
                    >
                      Update
                    </LoadingButton>
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="caption">
              Editing section title will overwrite current translations to match the new updated
              title
            </Typography>
          </Card>
        </FormProvider>

        {isFetching && skeletonLanguageCards}

        {!isFetching && (
          <Stack direction="column" spacing={1} sx={{ mt: 1 }}>
            {languageKeys
              .sort((a, b) => LANGUAGE_CODES[a].localeCompare(LANGUAGE_CODES[b]))
              .map((key) => (
                <LanguageCard
                  languageKey={key}
                  key={key}
                  data={sectionInfo}
                  showDescriptionField={false}
                />
              ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={onClose}>
          close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditSectionTitleDialog;
