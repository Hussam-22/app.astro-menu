import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Grid,
  Card,
  Stack,
  Drawer,
  Skeleton,
  Typography,
  InputAdornment,
} from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import TranslationCard from 'src/components/translation-cards/translation-card';
// ----------------------------------------------------------------------

EditSectionTitleDrawer.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  sectionID: PropTypes.string,
};

function EditSectionTitleDrawer({ isOpen, onClose, sectionID }) {
  const { id: menuID } = useParams();
  const { fsUpdateSectionTitle, fsGetSection, menuSections } = useAuthContext();
  const queryClient = useQueryClient();

  const { data: sectionInfo = [], isFetching } = useQuery({
    queryKey: ['section', sectionID, menuID],
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
    onSuccess: () => queryClient.invalidateQueries(['section', menuID]),
  });

  const schema = Yup.object().shape({
    title: Yup.string()
      .required('Title cant be empty')
      .notOneOf(
        menuSections.map((section) => section.title),
        'Title already exists'
      )
      .test('unique-title', 'Title already exists', (value) => {
        const existingTitles = menuSections.map((section) => section.title.toLowerCase());
        return !existingTitles.includes(value.toLowerCase());
      }),
  });

  const defaultValues = useMemo(
    () => ({
      title: sectionInfo?.title || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods;

  useEffect(() => {
    if (sectionInfo.length !== 0) reset({ title: sectionInfo.title });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionInfo]);

  const onSubmit = async (formData) => {
    mutate(formData);
  };

  const skeletonLanguageCards = (
    <Grid container spacing={1} sx={{ mt: 2 }}>
      {[...Array(languageKeys.length + 1)].map((_, index) => (
        <Grid item xs={12} key={index}>
          <Card sx={{ p: 2, mx: 2 }}>
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
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={() => onClose()}
      PaperProps={{
        sx: { borderRadius: '25px 0 0 25px', width: '35%' },
      }}
    >
      <Box sx={{ bgcolor: 'secondary.main', p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary">
          Edit Section Title
        </Typography>
      </Box>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ p: 2, mx: 2 }}>
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
            Editing section title will overwrite all translations to match the new section title
          </Typography>
        </Card>
      </FormProvider>

      {isFetching && skeletonLanguageCards}

      {!isFetching && (
        <Stack direction="column" spacing={1} sx={{ mt: 1, mx: 2 }}>
          {languageKeys
            .sort((a, b) => LANGUAGE_CODES[a]?.name.localeCompare(LANGUAGE_CODES[b]?.name))
            .map((key) => (
              <TranslationCard
                languageKey={key}
                key={key}
                data={sectionInfo}
                showDescriptionField={false}
              />
            ))}
        </Stack>
      )}
    </Drawer>
  );
}

export default EditSectionTitleDrawer;
