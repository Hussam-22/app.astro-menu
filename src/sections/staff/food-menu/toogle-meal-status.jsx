import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';

import { Stack, Switch, useTheme, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { useStaffContext } from 'src/sections/staff/context/staff-context';

function ToggleMealStatus({ mealInfo, isMealActive, sectionInfo }) {
  const theme = useTheme();
  const { activeOrders, fsUpdateCart, fsUpdateDisabledMealsInBranch } = useAuthContext();
  const { selectedTable, branchInfo } = useStaffContext();

  const orderSnapShot = activeOrders.find((order) => order.tableID === selectedTable.docID);
  const { docID, businessProfileID, branchID, cart, isReadyToServe } = orderSnapShot;

  const { mutate, error } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
  });

  const onMealStatusChange = () => {
    // change price to 0 if meal is not available
    const updatedCart = cart.map((cartMeal) => {
      if (cartMeal.mealID === mealInfo.docID && !isReadyToServe.includes(cartMeal.update))
        return { ...cartMeal, price: 0 };

      return cartMeal;
    });

    const updatedDisabledMealsInBranch = branchInfo?.disabledMeals || [];
    const index = updatedDisabledMealsInBranch?.findIndex((mealID) => mealID === mealInfo.mealID);

    console.log(updatedDisabledMealsInBranch);

    console.log(updatedDisabledMealsInBranch?.findIndex((mealID) => mealID === mealInfo.mealID));

    if (index === -1) updatedDisabledMealsInBranch.push(mealInfo.docID);
    if (index !== -1) {
      updatedDisabledMealsInBranch.filter((mealID) => mealID !== mealInfo.mealID);
      mutate(() =>
        fsUpdateCart({ orderID: docID, businessProfileID, branchID, cart: updatedCart })
      );
    }

    mutate(() =>
      fsUpdateDisabledMealsInBranch(updatedDisabledMealsInBranch, branchID, businessProfileID)
    );
  };

  return (
    <Stack direction="row" spacing={0} justifyContent="flex-end" alignItems="center">
      <Typography
        sx={{
          color: isMealActive ? 'info.main' : 'error.main',
          fontWeight: theme.typography.fontWeightBold,
        }}
        variant="body2"
      >
        {isMealActive ? 'Available' : 'Out of Stock'}
      </Typography>
      {mealInfo.isActive && (
        <Switch
          // defaultChecked={isActive}
          checked={sectionInfo.meals.find((meal) => meal.mealID === mealInfo.docID).isActive}
          onChange={onMealStatusChange}
          color="info"
          size="small"
        />
      )}
    </Stack>
  );
}
export default ToggleMealStatus;
ToggleMealStatus.propTypes = {
  mealInfo: PropTypes.object,
  isMealActive: PropTypes.bool,
  sectionInfo: PropTypes.object,
};
