import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

import { Stack, Typography, IconButton } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import AddMealDrawer from 'src/sections/waiter-staff-dashboard/components/add-meal-drawer';
import { useStaffContext } from 'src/sections/waiter-staff-dashboard/context/staff-context';

function StaffMenuAddMealToCart({ mealInfo, selectedTableID, isActive }) {
  const { branchInfo } = useStaffContext();
  const { activeOrders } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const orderSnapShot = activeOrders.find((order) => order.tableID === selectedTableID);

  const count = useMemo(
    () =>
      orderSnapShot?.cart?.reduce((accumulator, cartPortion) => {
        if (cartPortion.mealID === mealInfo.docID) {
          return cartPortion.qty + accumulator;
        }
        return accumulator;
      }, 0) || 0,
    [mealInfo.docID, orderSnapShot.cart]
  );

  return (
    <>
      <Stack direction="row" alignItems="center">
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{ px: 0.25 }}
          disabled={!isActive}
          color="primary"
        >
          <Iconify icon="mdi:hamburger-plus" sx={{ width: 24, height: 24 }} />
        </IconButton>
        <Typography sx={{ color: count > 0 ? 'default' : 'grey.300', fontWeight: '700' }}>
          {count}x
        </Typography>
      </Stack>

      <AddMealDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mealInfo={mealInfo}
        tableID={selectedTableID}
        orderSnapShot={orderSnapShot}
        branchInfo={branchInfo}
      />
    </>
  );
}
export default StaffMenuAddMealToCart;

StaffMenuAddMealToCart.propTypes = {
  mealInfo: PropTypes.object,
  selectedTableID: PropTypes.string,
  isActive: PropTypes.bool,
};
