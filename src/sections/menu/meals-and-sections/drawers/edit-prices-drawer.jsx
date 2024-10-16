import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, Drawer, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

EditPricesDrawer.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
  mealInfo: PropTypes.object,
  sectionInfo: PropTypes.object,
};

function EditPricesDrawer({ onClose, isOpen, mealInfo, sectionInfo }) {
  const { fsUpdateSection } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const menuVersionMealPortions = useMemo(
    () => sectionInfo?.meals.find((meal) => meal?.docID === mealInfo?.docID)?.portions || [],
    [sectionInfo, mealInfo]
  );

  const portionsObject = useMemo(
    () =>
      menuVersionMealPortions.reduce((acc, portion) => {
        acc[portion.portionSize] = portion.price;
        return acc;
      }, {}),
    [menuVersionMealPortions]
  );

  // Define the schema using Yup
  const schema = Yup.object().shape(
    Object.keys(portionsObject).reduce((acc, key) => {
      acc[key] = Yup.number().required(`${key} is required`).min(1, `${key} must be at least 1`);
      return acc;
    }, {})
  );

  const defaultValues = useMemo(() => ({ ...portionsObject }), [portionsObject]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = methods;

  useEffect(() => {
    if (portionsObject) reset(portionsObject);
  }, [portionsObject, reset]);

  const { isPending, error, mutate } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      enqueueSnackbar('Prices updated successfully', { variant: 'success' });
      queryClient.invalidateQueries(['section', sectionInfo.docID, sectionInfo.menuID]);
      onClose();
    },
  });

  const onSubmit = async (formData) => {
    const newPortionsArray = Object.entries(formData).map(([portionSize, price]) => ({
      portionSize,
      price,
    }));

    const updatedMeals = sectionInfo.meals.map((meal) => {
      if (meal.docID === mealInfo.docID) return { ...meal, portions: newPortionsArray };
      return meal;
    });

    mutate(() =>
      fsUpdateSection(sectionInfo.menuID, sectionInfo.docID, {
        ...sectionInfo,
        meals: updatedMeals,
      })
    );
  };

  if (!mealInfo) return null;

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={() => onClose()}
      PaperProps={{
        sx: { borderRadius: '25px 0 0 25px', width: { xs: '75%', sm: '45%', md: '25%' } },
      }}
    >
      <Box sx={{ bgcolor: 'secondary.main', p: 2 }}>
        <Typography variant="h6" color="primary">
          {mealInfo?.title}
        </Typography>
      </Box>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" spacing={3} sx={{ p: 3 }}>
          {menuVersionMealPortions.map((portion, i) => (
            <RHFTextField
              key={portion.portionSize}
              label={portion.portionSize}
              name={portion.portionSize}
            />
          ))}

          <LoadingButton
            type="submit"
            fullWidth
            size="large"
            variant="contained"
            loading={isPending}
            disabled={!isDirty}
          >
            Update Prices
          </LoadingButton>
        </Stack>
      </FormProvider>

      <Typography variant="caption" sx={{ px: 3, py: 1 }}>
        {`Updating the prices here does not alter the original prices of the meal, nor does it affect the prices of the same meal listed in another menu. This feature is particularly useful when you want to offer the same meal at different price points across separate menus. For example, if you are running a promotional discount, you can create a special menu that reflects the discounted prices while keeping the original menu with the regular prices unchanged. Additionally, if you have different branches offering the same menus but with different prices, you can manage each branch's pricing independently without affecting the others. This allows for greater flexibility in pricing strategies across different locations.`}
      </Typography>
    </Drawer>
  );
}

export default EditPricesDrawer;

// ----------------------------------------------------------------------------
