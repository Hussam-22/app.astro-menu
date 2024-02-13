import { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Stack, Typography, IconButton } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';

function AddMealToCart({ portion, mealInfo }) {
  const { fsAddMealToCart, orderSnapShot } = useAuthContext();
  const { docID, userID, branchID, cart } = orderSnapShot;
  const queryClient = useQueryClient();

  const mealInCartCount = orderSnapShot;

  const [count, setCount] = useState(0);

  const { mutate, isPending } = useMutation({ mutationFn: (mutateFn) => mutateFn() });

  const onQtyChange = (qtyValue) => {
    const updatedCart = cart;
    const portionIndex = cart.findIndex(
      (cartPortion) => cartPortion.title === portion.title && cartPortion.mealID === mealInfo.docID
    );
    const qty = updatedCart[portionIndex]?.qty || 0;
    console.log(portionIndex);

    if (portionIndex > -1) updatedCart[portionIndex].qty = qty + 1;
    if (portionIndex === -1) updatedCart.push({ ...portion, mealID: mealInfo.docID, qty: 1 });

    console.log({ qty, cartQty: updatedCart });

    // mutate(() => fsAddMealToCart({ docID, userID, branchID, cart }));
    setCount((state) => state + qtyValue);
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
