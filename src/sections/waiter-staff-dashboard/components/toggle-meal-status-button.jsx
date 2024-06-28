import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';

import { Switch, FormControlLabel } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { useStaffContext } from 'src/sections/waiter-staff-dashboard/context/staff-context';

function ToggleMealStatus({ mealInfo }) {
  const { activeOrders, fsUpdateCart, fsUpdateDisabledMealsInBranch } = useAuthContext();
  const { selectedTable, branchInfo } = useStaffContext();

  const orderSnapShot = activeOrders.find((order) => order.tableID === selectedTable.docID);
  const { docID, businessProfileID, branchID, cart } = orderSnapShot;

  const { mutate } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
  });

  const onMealStatusChange = () => {
    // change price to 0 if meal is not available
    const updatedCart = cart.map((cartMeal) => {
      if (cartMeal.mealID === mealInfo.docID) return { ...cartMeal, price: 0 };
      return cartMeal;
    });
    mutate(() => fsUpdateCart({ orderID: docID, businessProfileID, branchID, cart: updatedCart }));

    const disabledMealsArray = branchInfo?.disabledMeals || [];
    const index = disabledMealsArray?.findIndex((mealID) => mealID === mealInfo.docID);

    if (index === -1 || index === undefined) {
      mutate(() =>
        fsUpdateDisabledMealsInBranch(
          [...disabledMealsArray, mealInfo.docID],
          branchID,
          businessProfileID
        )
      );
    }
    if (index !== -1) {
      mutate(() =>
        fsUpdateDisabledMealsInBranch(
          [...branchInfo.disabledMeals.filter((mealID) => mealID !== mealInfo.docID)],
          branchID,
          businessProfileID
        )
      );
    }
  };

  const isMealActive = !branchInfo.disabledMeals?.includes(mealInfo.docID) && mealInfo.isActive;

  return (
    <FormControlLabel
      value={isMealActive}
      label={isMealActive ? 'Available' : 'Out of Stock'}
      labelPlacement="end"
      control={
        <Switch
          checked={branchInfo.disabledMeals?.includes(mealInfo.docID) ? false : isMealActive}
          onChange={onMealStatusChange}
          size="small"
          sx={{ color: 'common.black' }}
        />
      }
    />
  );
}
export default ToggleMealStatus;
ToggleMealStatus.propTypes = {
  mealInfo: PropTypes.object,
};
