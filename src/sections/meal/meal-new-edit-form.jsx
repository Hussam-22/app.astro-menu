import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  Box,
  Card,
  Stack,
  Dialog,
  Button,
  Divider,
  useTheme,
  Typography,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import MealPortionAdd from 'src/sections/meal/meal-portion-add';
import MealLabelNewEditForm from 'src/sections/meal/meal-label-new-edit-form';
import FormProvider, { RHFSwitch, RHFUpload, RHFTextField } from 'src/components/hook-form';

MealNewEditForm.propTypes = { mealInfo: PropTypes.object };

function MealNewEditForm({ mealInfo }) {
  const theme = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { fsAddNewMeal, fsDeleteMeal, fsGetMealLabels, fsUpdateMeal } = useAuthContext();
  const [selectedMealLabels, setSelectedMealLabels] = useState([]);
  const queryClient = useQueryClient();

  const onClose = () => setIsOpen(false);

  const { data: mealLabelsList = [] } = useQuery({
    queryKey: ['meal-labels'],
    queryFn: fsGetMealLabels,
  });

  const NewMealSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    imageFile: Yup.mixed().nullable().required('Cover is required'),
    cover: Yup.mixed().required('imgURL is required'),
    mealLabels: Yup.array().min(1, 'At least one meal label should be selected'),
    portions: Yup.array().min(1, 'At least One portion should be entered'),
  });

  const defaultValues = useMemo(
    () => ({
      docID: mealInfo?.docID || '',
      title: mealInfo?.title || '',
      description: mealInfo?.description || '',
      isNew: mealInfo?.isNew || false,
      mealLabels: mealInfo?.mealLabels || [],
      portions: mealInfo?.portions || [],
      isActive: !!mealInfo?.isActive,
      imageFile: mealInfo?.cover || null,
      cover: mealInfo?.cover,
    }),
    [mealInfo]
  );

  const methods = useForm({
    resolver: yupResolver(NewMealSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields, errors },
  } = methods;

  useEffect(() => {
    if (mealInfo) {
      reset(defaultValues);
      setSelectedMealLabels(mealInfo.mealLabels);
    }
  }, [mealInfo, defaultValues, reset]);

  const handleAddTag = (tag) => {
    if (selectedMealLabels.includes(tag.docID))
      setSelectedMealLabels((tagsIDs) => {
        const updatedList = tagsIDs.filter((tagID) => tagID !== tag.docID);
        setValue('mealLabels', updatedList, { shouldDirty: true, shouldTouch: true });
        return updatedList;
      });
    if (!selectedMealLabels.includes(tag.docID))
      setSelectedMealLabels((tagsIDs) => {
        const updatedList = [...tagsIDs, tag.docID];
        setValue('mealLabels', updatedList, { shouldDirty: true, shouldTouch: true });
        return updatedList;
      });
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('cover', URL.createObjectURL(file));
        setValue('imageFile', newFile, {
          shouldValidate: true,
          isTouched: true,
          isFocused: true,
          shouldDirty: true,
        });
      }
    },
    [setValue]
  );

  const handleRemoveFile = useCallback(() => {
    setValue('imageFile', null, { isTouched: true, isFocused: true, shouldDirty: true });
  }, [setValue]);

  const { isPending, mutate, error } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      const queryKeys = mealInfo?.docID ? ['meals', `meal-${mealInfo.docID}`] : ['meals'];
      queryClient.removeQueries({ queryKey: [`meal-${mealInfo.docID}`], exact: true });
      queryClient.invalidateQueries(queryKeys);
    },
  });

  const onSubmit = async (data) => {
    if (mealInfo?.docID)
      mutate(() =>
        fsUpdateMeal({
          ...data,
          translation: dirtyFields.title || dirtyFields.description ? '' : mealInfo.translation,
          translationEdited:
            dirtyFields.title || dirtyFields.description ? '' : mealInfo.translationEdited,
        })
      );
    if (!mealInfo?.docID) {
      mutate(() => fsAddNewMeal(data));
      router.push(paths.dashboard.meal.list);
    }
    reset(data);
    enqueueSnackbar('Meal Saved successfully!');
  };

  const handleDeleteMeal = () => {
    mutate(() => fsDeleteMeal(mealInfo.docID));
    setTimeout(() => {
      router.push(paths.dashboard.meal.list);
    }, 1000);
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid xs={12}>
          <Stack direction="row" spacing={2} sx={{ mb: 2, p: 1, justifyContent: 'flex-end' }}>
            {mealInfo?.docID && (
              <LoadingButton
                loading={isPending}
                color="error"
                variant="contained"
                onClick={handleDeleteMeal}
              >
                Delete Meal
              </LoadingButton>
            )}
            <LoadingButton
              type="submit"
              color="primary"
              variant="contained"
              loading={isPending}
              disabled={!isDirty}
            >
              {mealInfo?.docID ? 'Update Meal' : 'Add Meal'}
            </LoadingButton>
          </Stack>
        </Grid>
        <Grid container spacing={2}>
          <Grid xs={12}>
            <RHFUpload
              name="imageFile"
              maxSize={3145728}
              onDrop={handleDrop}
              onDelete={handleRemoveFile}
            />
          </Grid>

          <Grid xs={12}>
            <Stack spacing={3}>
              <Card sx={{ p: 3 }}>
                <Stack direction="column" spacing={3}>
                  <RHFTextField name="title" label="Meal Title" />
                  <RHFTextField name="description" label="Description" multiline rows={5} />
                  <Stack direction="row" alignItems="center" justifyContent="flex-end">
                    <RHFSwitch name="isNew" label="New" labelPlacement="start" />
                    <RHFSwitch name="isActive" label="Status" labelPlacement="start" />
                  </Stack>
                </Stack>
              </Card>

              <Card sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h4">Meal Labels</Typography>
                  <Button
                    onClick={() => setIsOpen(true)}
                    variant="soft"
                    color="info"
                    startIcon={<Iconify icon="fluent:table-cell-edit-24-regular" />}
                  >
                    Add New Meal Label
                  </Button>
                </Stack>
                <Typography variant="caption">
                  {`"Meal Labels" empower customers to efficiently search for dishes based on specific criteria. Customers have the flexibility to search for meals labeled with specific attributes. For instance, a customer can easily find all meals labeled as "Vegan" or explore a combination of labels, such as searching for meals labeled as both "Vegan" and "Spicy." This functionality enhances the search experience, allowing users to quickly discover meals that align with their preferences and dietary choices.`}
                </Typography>
                <Divider sx={{ mt: 1, border: `dashed 1px ${theme.palette.divider}` }} />
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6,1fr)',
                    gap: 1,
                    mt: 3,
                    mb: 1.5,
                  }}
                >
                  {mealLabelsList
                    .filter((label) => label.isActive)
                    .map((label) => (
                      <Button
                        variant={
                          selectedMealLabels.includes(label.docID) ? 'contained' : 'outlined'
                        }
                        key={label.docID}
                        onClick={() => handleAddTag(label)}
                        color="info"
                      >
                        #{label.title.toLowerCase()}
                      </Button>
                    ))}
                </Box>
                {errors.mealLabels !== '' && (
                  <Typography variant="caption" color="error">
                    {errors?.mealLabels?.message}
                  </Typography>
                )}
              </Card>

              <MealPortionAdd />
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>
      {isOpen && (
        <Dialog fullWidth maxWidth="md" open={isOpen} onClose={onClose}>
          <DialogTitle sx={{ pb: 2 }}>Add New Meal Label</DialogTitle>

          <DialogContent>
            <MealLabelNewEditForm onClose={onClose} mealID={mealInfo.docID} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
export default MealNewEditForm;
