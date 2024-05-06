import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

import { Stack, Typography, IconButton } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { useStaffContext } from 'src/sections/staff/context/staff-context';
import DialogAddComment from 'src/sections/qr-menu/components/DialogAddComment';

function StaffMenuAddMealToCart({ mealInfo, selectedTableID }) {
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
        <Typography sx={{ color: count > 0 ? 'default' : 'grey.300', fontWeight: '700' }}>
          {count}x
        </Typography>
        <IconButton onClick={() => setIsOpen(true)} sx={{ px: 0.25 }}>
          <Iconify icon="flat-color-icons:plus" sx={{ width: 24, height: 24 }} />
        </IconButton>
      </Stack>

      {isOpen && (
        <DialogAddComment
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          mealInfo={mealInfo}
          orderSnapShot={orderSnapShot}
          branchInfo={branchInfo}
        />
      )}
    </>
  );
}
export default StaffMenuAddMealToCart;

StaffMenuAddMealToCart.propTypes = {
  mealInfo: PropTypes.object,
  selectedTableID: PropTypes.string,
};
