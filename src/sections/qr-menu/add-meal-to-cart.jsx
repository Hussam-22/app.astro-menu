import { useMemo } from 'react';
import PropTypes from 'prop-types';

import { Stack, Typography, IconButton } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';

function AddMealToCart({ portion, mealInfo }) {
  const { fsAddMealToCart, orderSnapShot } = useAuthContext();
  const { docID, userID, branchID, cart } = orderSnapShot;

  const count = useMemo(
    () =>
      orderSnapShot.cart.reduce((accumulator, cartPortion) => {
        if (cartPortion.mealID === mealInfo.docID) {
          return cartPortion.qty + accumulator;
        }
        return accumulator;
      }, 0) || 0,
    [mealInfo.docID, orderSnapShot.cart]
  );

  const onQtyChange = (qtyValue) => {
    let updatedCart = cart;
    const portionIndex = cart.findIndex((cartPortion) => cartPortion.id === portion.id);
    const qty = updatedCart[portionIndex]?.qty || 0;

    if (qtyValue === +1) {
      if (portionIndex > -1) updatedCart[portionIndex].qty = qty + 1;
      if (portionIndex === -1) updatedCart.push({ ...portion, mealID: mealInfo.docID, qty: 1 });
      fsAddMealToCart({ orderID: docID, userID, branchID, cart: updatedCart });
    }

    if (portionIndex !== -1 && qtyValue === -1) {
      if (qty > 1) {
        updatedCart[portionIndex].qty = qty - 1;
      }
      if (qty === 1) {
        updatedCart = updatedCart.filter((cartPortion) => cartPortion.id !== portion.id);
      }
      fsAddMealToCart({ orderID: docID, userID, branchID, cart: updatedCart });
    }
  };

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-evenly">
      <IconButton onClick={() => onQtyChange(-1)} disabled={count === 0}>
        <Iconify icon="zondicons:minus-solid" sx={{ color: count === 0 ? '' : 'error.main' }} />
      </IconButton>
      <Typography>{count}</Typography>
      <IconButton onClick={() => onQtyChange(+1)}>
        <Iconify icon="flat-color-icons:plus" />
      </IconButton>
    </Stack>
  );
}
export default AddMealToCart;

AddMealToCart.propTypes = { portion: PropTypes.object, mealInfo: PropTypes.object };
