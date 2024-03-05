import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

import { Stack, Typography, IconButton } from '@mui/material';

import Iconify from 'src/components/iconify';
import generateID from 'src/utils/generate-id';
import { useAuthContext } from 'src/auth/hooks';
import DialogAddComment from 'src/sections/qr-menu/components/DialogAddComment';

function StaffMenuAddMealToCart({ portion, mealInfo, selectedTableID }) {
  const { fsUpdateCart, activeOrders } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const orderSnapShot = activeOrders.find((order) => order.tableID === selectedTableID);
  const { docID, userID, branchID, cart, updateCount } = orderSnapShot;

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

  const onQtyChange = (qtyValue, comment = '') => {
    const updatedCart = cart;

    if (qtyValue === +1) {
      updatedCart.push({
        ...portion,
        mealID: mealInfo.docID,
        qty: 1,
        comment,
        id: generateID(8),
        update: updateCount,
      });
      fsUpdateCart({ orderID: docID, userID, branchID, cart: updatedCart });
      setIsOpen(false);
    }
  };

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-evenly">
        <Typography sx={{ color: count > 0 ? 'info.main' : 'grey.600', fontWeight: '700' }}>
          {count}x
        </Typography>
        <IconButton onClick={() => setIsOpen(true)}>
          <Iconify icon="flat-color-icons:plus" sx={{ width: 32, height: 32 }} />
        </IconButton>
      </Stack>

      {isOpen && (
        <DialogAddComment isOpen={isOpen} onClose={() => setIsOpen(false)} addMeal={onQtyChange} />
      )}
    </>
  );
}
export default StaffMenuAddMealToCart;

StaffMenuAddMealToCart.propTypes = {
  portion: PropTypes.object,
  mealInfo: PropTypes.object,
  selectedTableID: PropTypes.string,
};
