import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Card, Stack, Button, Divider, useTheme, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import { rdxRemoveMeal } from 'src/redux/slices/meal';
import MealPortionAdd from 'src/sections/meal/meal-portion-add';
import FormProvider, { RHFSwitch, RHFUpload, RHFTextField } from 'src/components/hook-form';

// import MealPortionAdd from '../../add/MealPortionsAdd';

MealNewEditForm.propTypes = { mealInfo: PropTypes.object };

function MealNewEditForm({ mealInfo }) {
  const { id: mealID } = useParams();
  const theme = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { fsAddNewMeal, fsDeleteMeal, fsGetMealLabels, fsUpdateMeal } = useAuthContext();
  const dispatch = useDispatch();
  const [selectedMealLabels, setSelectedMealLabels] = useState(mealInfo?.mealLabels || []);
  const queryClient = useQueryClient();

  const { data: mealLabelsList = [] } = useQuery({
    queryKey: ['meal-labels'],
    queryFn: fsGetMealLabels,
  });

  const NewMealSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    imageFile: Yup.mixed().nullable().required('Cover is required'),
    cover: Yup.mixed().required('imgURL is required'),
    mealLabels: Yup.array().min(1, 'At least one tag should be entered'),
    portions: Yup.array().min(1, 'At least One portion should be entered'),
  });

  const defaultValues = {
    id: mealInfo?.id || '',
    title: mealInfo?.title || '',
    description: mealInfo?.description || '',
    isNew: mealInfo?.isNew || false,
    mealLabels: mealInfo?.mealLabels || [],
    portions: mealInfo?.portions || [],
    isActive: !!mealInfo?.isActive,
    imageFile: mealInfo?.cover || null,
    cover: mealInfo?.cover,
  };

  const methods = useForm({
    resolver: yupResolver(NewMealSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isDirty },
  } = methods;

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

  const { isPending, mutate } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      const queryKeys = mealInfo?.docID ? ['menus', `menu-${mealInfo.docID}`] : ['menus'];
      queryClient.invalidateQueries(queryKeys);
    },
  });

  const onSubmit = async (data) => {
    if (mealInfo?.docID) mutate(() => fsUpdateMeal(data));
    if (!mealInfo?.docID) {
      mutate(() => fsAddNewMeal(data));
      router.push(paths.dashboard.meal.list);
    }
    enqueueSnackbar('Meal Saved successfully!');
  };

  const handleDeleteMeal = () => {
    fsDeleteMeal(mealInfo?.id, mealInfo?.cover.preview !== '' ? mealInfo?.cover.id : undefined);
    dispatch(rdxRemoveMeal(mealInfo?.id));
    router.push(paths.dashboard.meal.list);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid xs={12} sx={{ position: 'relative' }}>
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
              <Typography variant="h4">Meal Labels</Typography>
              <Typography variant="caption">
                {`"Meal Labels" empower customers to efficiently search for dishes based on specific criteria. Customers have the flexibility to search for meals labeled with specific attributes. For instance, a customer can easily find all meals labeled as "Vegan" or explore a combination of labels, such as searching for meals labeled as both "Vegan" and "Spicy." This functionality enhances the search experience, allowing users to quickly discover meals that align with their preferences and dietary choices.`}
              </Typography>
              <Divider sx={{ mt: 1, border: `dashed 1px ${theme.palette.divider}` }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 1, mt: 3 }}>
                {mealLabelsList.map((tag) => (
                  <Button
                    variant={selectedMealLabels.includes(tag.docID) ? 'contained' : 'outlined'}
                    key={tag.docID}
                    onClick={() => handleAddTag(tag)}
                    color="info"
                  >
                    #{tag.title.toLowerCase()}
                  </Button>
                ))}
              </Box>
            </Card>

            {/* <Card sx={{ p: 3 }}><Scheduler /></Card> */}

            <MealPortionAdd />
          </Stack>
        </Grid>

        <Grid xs={12}>
          <Stack direction="row" spacing={2} sx={{ mt: 2, p: 1, justifyContent: 'flex-end' }}>
            {mealInfo?.docID && (
              <Button color="error" variant="contained" onClick={handleDeleteMeal}>
                Delete Meal
              </Button>
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
      </Grid>
    </FormProvider>
  );
}
export default MealNewEditForm;
