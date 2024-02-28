import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

import { Stack, Typography, IconButton } from '@mui/material';

import Iconify from 'src/components/iconify';
import generateID from 'src/utils/generate-id';
import { useAuthContext } from 'src/auth/hooks';
import DialogAddComment from 'src/sections/qr-menu/components/DialogAddComment';

function WaiterMenuAddMealToCart({ portion, mealInfo, selectedTableID }) {
  const { fsUpdateCart, activeOrders } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const orderSnapShot = activeOrders.find((order) => order.tableID === selectedTableID);
  const { docID, userID, branchID, cart, updateCount } = orderSnapShot;

  console.log(updateCount);

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

    if (qtyValue === -1) {
      const index = cart.findLastIndex(
        (cartPortion) =>
          cartPortion.mealID === mealInfo.docID && cartPortion.portionSize === portion.portionSize
      );
      if (index !== -1) {
        updatedCart.splice(index, 1);
        fsUpdateCart({ orderID: docID, userID, branchID, cart: updatedCart });
      }
    }
  };

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-evenly">
        <IconButton onClick={() => onQtyChange(-1)} disabled={count === 0}>
          <Iconify icon="zondicons:minus-solid" sx={{ color: count === 0 ? '' : 'error.main' }} />
        </IconButton>
        <Typography>{count}</Typography>
        <IconButton onClick={() => setIsOpen(true)}>
          <Iconify icon="flat-color-icons:plus" />
        </IconButton>
      </Stack>

      {isOpen && (
        <DialogAddComment isOpen={isOpen} onClose={() => setIsOpen(false)} addMeal={onQtyChange} />
      )}
    </>
  );
}
export default WaiterMenuAddMealToCart;

WaiterMenuAddMealToCart.propTypes = {
  portion: PropTypes.object,
  mealInfo: PropTypes.object,
  selectedTableID: PropTypes.string,
};
