import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import {
  Box,
  Stack,
  Dialog,
  Divider,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import Iconify from 'src/components/iconify';
import { fDate } from 'src/utils/format-time';

ShowOrderDetailsDialog.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
};

function ShowOrderDetailsDialog({ isOpen, onClose }) {
  const { cart, id, lastUpdate } = useSelector((state) => state.orders.order);
  const mealsList = useSelector((state) => state.meal.meals);

  const mealsArr = mealsList.filter((meal) => cart.some((cartItem) => cartItem.mealID === meal.id));
  const orderMeal = mealsArr.map((meal) => ({
    ...meal,
    portions: cart
      .filter((cartMeal) => cartMeal.mealID === meal.id)
      .map((cartMeal) => ({
        comment: cartMeal.comment,
        portionSize: cartMeal.portionSize,
        price: cartMeal.price,
        qty: 1,
        id: cartMeal.id,
      })),
  }));
  const totalBill = cart.reduce((sum, item) => sum + item.price, 0);

  const orderDate = new Date(lastUpdate.seconds * 1000);

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose}>
      <DialogTitle>
        Order Details
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 18,
            top: 18,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Iconify icon="material-symbols:close" />
        </IconButton>
        <Typography variant="caption" component="div">
          {id} - {fDate(orderDate)}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ borderTop: 'dashed 1px #F0F0F0', mt: 1 }}>
        <Box sx={{ p: 1 }}>
          {orderMeal.map((meal) => (
            <React.Fragment key={meal.id}>
              <Typography sx={{ fontWeight: 700 }}>{meal.title}</Typography>
              {meal.portions.map((portion) => (
                <Stack key={portion.id} sx={{ display: 'flex' }}>
                  <Stack direction="row">
                    <Typography sx={{ flexGrow: 1, alignSelf: 'center' }} variant="body2">
                      - {portion.portionSize}
                    </Typography>

                    <Typography variant="caption" sx={{ alignSelf: 'center', mx: 1 }}>
                      {portion.price} AED
                    </Typography>
                  </Stack>
                  {portion.comment !== '' && (
                    <Typography variant="caption" color="secondary" sx={{ ml: 2 }}>
                      *{portion.comment}
                    </Typography>
                  )}
                </Stack>
              ))}

              <Divider flexItem sx={{ borderStyle: 'dashed' }} />
            </React.Fragment>
          ))}
        </Box>
        <Stack sx={{ py: 3, display: 'flex', justifyContent: 'right' }} direction="row" spacing={2}>
          <Typography variant="h6" sx={{ alignSelf: 'center' }}>
            Total Bill : {totalBill} AED
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default ShowOrderDetailsDialog;
