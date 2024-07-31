import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, Drawer, Typography } from '@mui/material';

import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

EditPricesDrawer.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
  mealInfo: PropTypes.object,
  sectionInfo: PropTypes.object,
};

function EditPricesDrawer({ onClose, isOpen, mealInfo, sectionInfo }) {
  const menuVersionMealPortions = useMemo(
    () => sectionInfo?.meals.find((meal) => meal?.docID === mealInfo?.docID)?.portions || [],
    [sectionInfo, mealInfo]
  );

  const portionsObjectYup = useMemo(() => {
    const menuVersionMealPortionsObject = menuVersionMealPortions.map((portion) => ({
      [portion.portionSize]: portion.price,
    }));

    const portionsObjectValue = menuVersionMealPortionsObject.reduce((acc, portion) => {
      const [key, _] = Object.entries(portion)[0];
      acc[key] = Yup.number().typeError('Price must be a number').required('Price cannot be empty');

      console.log(acc);
      return acc;
    }, []);

    return portionsObjectValue;
  }, [menuVersionMealPortions]);

  console.log(portionsObjectYup);

  const portionsObject = useMemo(() => {
    const menuVersionMealPortionsObject = menuVersionMealPortions.map((portion) => ({
      [portion.portionSize]: portion.price,
    }));

    const portionsObjectValue = menuVersionMealPortionsObject.reduce((acc, portion) => {
      const [key, value] = Object.entries(portion)[0];
      acc[key] = value;
      return acc;
    }, []);

    return portionsObjectValue;
  }, [menuVersionMealPortions]);

  const schema = Yup.object().shape(portionsObjectYup);

  const defaultValues = (() => {}, []);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,

    formState: { isDirty, errors },
  } = methods;

  console.log(errors);

  useEffect(() => {
    if (portionsObject) reset(portionsObject);
  }, [portionsObject, reset]);

  const onSubmit = async (formData) => {
    console.log(formData);
    // mutate(formData);
  };

  if (!mealInfo) return null;

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={() => onClose()}
      PaperProps={{
        sx: { borderRadius: '25px 0 0 25px', width: '25%' },
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
            loading={false}
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
