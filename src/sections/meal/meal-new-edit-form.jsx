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
  Alert,
  Stack,
  Button,
  Dialog,
  Divider,
  useTheme,
  AlertTitle,
  Typography,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import Label from 'src/components/label';
import { useRouter } from 'src/routes/hook';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { fData } from 'src/utils/format-number';
import { delay } from 'src/utils/promise-delay';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useGetProductInfo } from 'src/hooks/use-get-product';
import MealPortionAdd from 'src/sections/meal/meal-portion-add';
import MealLabelNewEditForm from 'src/sections/meal-labels/meal-label-new-edit-form';
import FormProvider, { RHFSwitch, RHFUpload, RHFTextField } from 'src/components/hook-form';

MealNewEditForm.propTypes = { mealInfo: PropTypes.object };

function MealNewEditForm({ mealInfo }) {
  const theme = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const {
    fsAddNewMeal,
    fsDeleteMeal,
    fsGetMealLabels,
    fsUpdateMeal,
    fsRemoveMealFromAllSections,
    fsGetAllMeals,
  } = useAuthContext();
  const [selectedMealLabels, setSelectedMealLabels] = useState([]);
  const queryClient = useQueryClient();
  const { maxAllowedMeals } = useGetProductInfo();

  const onClose = () => setIsOpen(false);

  const { data: mealLabelsList = [] } = useQuery({
    queryKey: ['meal-labels'],
    queryFn: () => fsGetMealLabels(),
  });

  const { data: allMeals = [], isLoading } = useQuery({
    queryKey: [`meals`],
    queryFn: () => fsGetAllMeals(),
  });

  const activeMealsLength = !isLoading && allMeals?.filter((meal) => meal.isActive)?.length;

  console.log(activeMealsLength >= maxAllowedMeals);

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
      isActive: mealInfo?.isActive !== false,
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
    watch,
    formState: { isDirty, dirtyFields, errors },
  } = methods;

  const values = watch();

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
    setValue('cover', null, { isTouched: true, isFocused: true, shouldDirty: true });
  }, [setValue]);

  const { isPending, mutate, error } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: (mutationReturnValue) => {
      queryClient.invalidateQueries(['sections']);
      queryClient.invalidateQueries(['section']);
      queryClient.invalidateQueries(['meals']);

      if (values.isActive === false) queryClient.invalidateQueries(['menu']);

      if (!mealInfo?.docID) {
        enqueueSnackbar('Meal Saved successfully!');
      } else if (mutationReturnValue !== 'DELETE') {
        enqueueSnackbar('Meal Deleted successfully!');
        queryClient.invalidateQueries(['meals']);
        queryClient.invalidateQueries(['meal', mealInfo.docID]);
      }
    },
  });

  const onSubmit = async (data) => {
    if (mealInfo?.docID) {
      mutate(async () => {
        await delay(1000);
        await fsUpdateMeal(
          {
            ...data,
            translation: dirtyFields.title || dirtyFields.description ? '' : mealInfo.translation,
            translationEdited:
              dirtyFields.title || dirtyFields.description ? '' : mealInfo.translationEdited,
            lastUpdatedAt: new Date(),
          },
          dirtyFields.imageFile
        );
      });
      reset(data);
      // remove meal from all menus when disabled
      if (data.isActive === false) mutate(() => fsRemoveMealFromAllSections(mealInfo.docID));
    }

    if (!mealInfo?.docID)
      mutate(async () => {
        await delay(100);
        await fsAddNewMeal(data);
        router.push(paths.dashboard.meal.list);
      });
  };

  const handleDeleteMeal = () => {
    mutate(async () => {
      await delay(1000);
      await fsDeleteMeal(mealInfo.docID);
      return 'DELETE';
    });
    setTimeout(() => {
      router.push(paths.dashboard.meal.list);
    }, 500);
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid xs={12}>
            {maxAllowedMeals !== 'unlimited' &&
              activeMealsLength >= maxAllowedMeals &&
              !mealInfo?.isActive && (
                <Alert severity="warning" variant="outlined" sx={{ width: 1 }}>
                  <AlertTitle>Attention</AlertTitle>
                  <Typography>
                    You have reached your plan max allowed <Label color="success">Active</Label>{' '}
                    meals of <Label color="info"> {`${maxAllowedMeals}`}</Label> , Please contact
                    our sales team on{' '}
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      hello@astro-menu.com{' '}
                    </Box>
                    to include more meals to your plan.
                  </Typography>
                  <Typography color="secondary">
                    If you wish to enable this meal, please disable other meal first.
                  </Typography>
                </Alert>
              )}
            <Stack sx={{ mt: 2 }}>
              <LoadingButton
                type="submit"
                color="success"
                variant="contained"
                loading={isPending}
                disabled={!isDirty || (activeMealsLength >= maxAllowedMeals && !mealInfo?.isActive)}
                sx={{ alignSelf: 'self-end' }}
              >
                {mealInfo?.docID ? 'Update Meal' : 'Add Meal'}
              </LoadingButton>
            </Stack>
          </Grid>
          <Grid xs={12} sm={7}>
            <Card sx={{ p: 3, height: 1 }}>
              <Stack direction="column" spacing={3}>
                <Typography variant="h4">Meal Labels</Typography>
                <RHFTextField name="title" label="Meal Title" />
                <RHFTextField name="description" label="Description" multiline rows={5} />
              </Stack>
            </Card>
          </Grid>

          <Grid xs={12} sm={5}>
            <RHFUpload
              name="cover"
              maxSize={3000000}
              onDrop={handleDrop}
              onRemove={handleRemoveFile}
              helperText={`Allowed *.jpeg, *.jpg, *.png, *.webp | max size of ${fData(3000000)}`}
              paddingValue="40% 0"
            />
          </Grid>

          <Grid xs={12}>
            <Stack spacing={3}>
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
                    variant="contained"
                    color="inherit"
                    startIcon={<Iconify icon="eva:plus-fill" />}
                  >
                    Add New Meal Label
                  </Button>
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 1,
                    mt: 3,
                    mb: 1.5,
                  }}
                >
                  {mealLabelsList.map((label) => (
                    <Box sx={{ position: 'relative', width: 1 }} key={label.docID}>
                      {!label.isActive && (
                        <Iconify
                          icon="fe:disabled"
                          sx={{
                            position: 'absolute',
                            color: 'error.main',
                          }}
                        />
                      )}
                      <Button
                        variant={selectedMealLabels.includes(label.docID) ? 'soft' : 'soft'}
                        color={selectedMealLabels.includes(label.docID) ? 'primary' : 'inherit'}
                        onClick={() => handleAddTag(label)}
                        disabled={!label.isActive}
                        fullWidth
                      >
                        {label.title.toLowerCase()}
                      </Button>
                    </Box>
                  ))}
                </Box>
                {errors.mealLabels !== '' && (
                  <Typography variant="caption" color="error">
                    {errors?.mealLabels?.message}
                  </Typography>
                )}
                <Divider sx={{ mb: 1, border: `dashed 1px ${theme.palette.divider}` }} />
                <Typography variant="body2">
                  {`Empower customers to efficiently search for dishes based on specific criteria. Customers have the flexibility to search for meals labeled with specific attributes. For instance, a customer can easily find all meals labeled as "Vegan" or explore a combination of labels, such as searching for meals labeled as both "Vegan" and "Spicy." This functionality enhances the search experience, allowing users to quickly discover meals that align with their preferences and dietary choices.`}
                </Typography>
              </Card>

              <MealPortionAdd />

              <Card sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  Meal Settings
                </Typography>
                <Stack
                  direction="column"
                  spacing={1}
                  divider={<Divider sx={{ borderStyle: 'dashed' }} />}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ px: 1 }}
                  >
                    <Typography sx={{ fontWeight: 500 }}>{`Show "New" Label on Meal`}</Typography>
                    <RHFSwitch name="isNew" label="New" labelPlacement="start" />
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ px: 1 }}
                    spacing={3}
                  >
                    <Stack direction="column">
                      <Typography sx={{ fontWeight: 500 }}>Meal Status</Typography>
                      <Typography variant="caption">
                        Disabling a meal will remove it from all menus where it appears, providing a
                        quick and efficient way to hide the meal across all menus without the need
                        to manually remove it from each one. You can easily re-enable the meal at
                        any time to make it visible again.
                      </Typography>
                    </Stack>
                    <RHFSwitch
                      name="isActive"
                      label={values.isActive ? 'Active' : 'Disabled'}
                      labelPlacement="start"
                    />
                  </Stack>

                  {mealInfo?.docID && (
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        px: 1,
                      }}
                    >
                      <Stack direction="column">
                        <Typography
                          color="error"
                          sx={{ fontWeight: theme.typography.fontWeightBold }}
                        >
                          Delete Meal
                        </Typography>
                        <Typography variant="caption">
                          Deleting the meal will completely remove it from the system, all menus and
                          all its statistics will be gone. This action cannot be undone.
                        </Typography>
                      </Stack>
                      <Button
                        variant="contained"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        color="error"
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        Delete Meal
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>

      <Dialog fullWidth maxWidth="md" open={isOpen} onClose={onClose}>
        <DialogTitle sx={{ pb: 2 }}>Add New Meal Label</DialogTitle>
        <DialogContent>
          <MealLabelNewEditForm onClose={onClose} mealID={mealInfo?.docID} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        title="Delete Meal"
        content={
          <Typography sx={{ display: 'inline-block' }}>
            Are you sure you want to delete{' '}
            <Label variant="soft" color="error">
              {mealInfo?.title}
            </Label>{' '}
            meal ?
          </Typography>
        }
        action={
          <LoadingButton
            variant="contained"
            onClick={handleDeleteMeal}
            loading={isPending}
            color="error"
          >
            Delete
          </LoadingButton>
        }
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth="sm"
        closeText="Close"
      />
    </>
  );
}
export default MealNewEditForm;
