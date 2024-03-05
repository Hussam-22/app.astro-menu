import { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Stack, Switch, useTheme, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { useStaffContext } from 'src/sections/staff/context/staff-context';

function ChefDisableMeal({ mealInfo, isMealActive, sectionInfo }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { fsUpdateSection, activeOrders, fsUpdateCart } = useAuthContext();
  const { selectedTable } = useStaffContext();
  const [isActive, setIsActive] = useState(isMealActive);

  const orderSnapShot = activeOrders.find((order) => order.tableID === selectedTable.docID);
  const { docID, userID, branchID, cart, updateCount } = orderSnapShot;

  console.log(cart);

  const { mutate } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
  });

  const onMealStatusChange = () => {
    const { meals: sectionMealsInfo, menuID } = sectionInfo;
    const index = sectionMealsInfo.findIndex((meal) => meal.mealID === mealInfo.docID);
    const updatedMeals = sectionMealsInfo;
    updatedMeals[index].isActive = !sectionMealsInfo[index].isActive;

    const updatedCart = cart.map((cartMeal) => {
      if (cartMeal.mealID === mealInfo.docID) return { ...cartMeal, price: 0 };
      return cartMeal;
    });
    if (!sectionMealsInfo[index].isActive)
      mutate(() => fsUpdateCart({ orderID: docID, userID, branchID, cart: updatedCart }));
    mutate(() => fsUpdateSection(menuID, sectionInfo.docID, { meals: updatedMeals }));
  };

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
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
