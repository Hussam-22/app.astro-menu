import { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';

import { Stack, Switch, useTheme, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { useStaffContext } from 'src/sections/staff/context/staff-context';

function ChefDisableMeal({ mealInfo, isMealActive, sectionInfo }) {
  const theme = useTheme();
  const { fsUpdateSection, activeOrders, fsUpdateCart } = useAuthContext();
  const { selectedTable } = useStaffContext();
  const [isActive, _] = useState(isMealActive);

  const orderSnapShot = activeOrders.find((order) => order.tableID === selectedTable.docID);
  const { docID, businessProfileID, branchID, cart, isReadyToServe } = orderSnapShot;

  const { mutate, error } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
  });

  console.log(error);

  const onMealStatusChange = () => {
    const { meals: sectionMealsInfo, menuID } = sectionInfo;
    const index = sectionMealsInfo.findIndex((meal) => meal.mealID === mealInfo.docID);
    const updatedMeals = sectionMealsInfo;
    updatedMeals[index].isActive = !sectionMealsInfo[index].isActive;

    const updatedCart = cart.map((cartMeal) => {
      if (cartMeal.mealID === mealInfo.docID && !isReadyToServe.includes(cartMeal.update))
        return { ...cartMeal, price: 0 };

      return cartMeal;
    });
    if (!sectionMealsInfo[index].isActive)
      mutate(() =>
        fsUpdateCart({ orderID: docID, businessProfileID, branchID, cart: updatedCart })
      );
    mutate(() =>
      fsUpdateSection(menuID, sectionInfo.docID, { meals: updatedMeals }, businessProfileID)
    );
  };

  return (
    <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
      <Typography
        sx={{
          color: isMealActive ? 'success.main' : 'error.main',
          fontWeight: theme.typography.fontWeightBold,
        }}
      >
        {isMealActive ? 'Available' : 'Out of Stock'}
      </Typography>
      {mealInfo.isActive && <Switch defaultChecked={isActive} onChange={onMealStatusChange} />}
    </Stack>
  );
}
export default ChefDisableMeal;
ChefDisableMeal.propTypes = {
  mealInfo: PropTypes.object,
  isMealActive: PropTypes.bool,
  sectionInfo: PropTypes.object,
};
