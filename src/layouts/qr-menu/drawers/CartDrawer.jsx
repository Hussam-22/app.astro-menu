import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Box } from '@mui/system';
import { Stack, Drawer, Divider, useTheme, Typography, CircularProgress } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';

CartDrawer.propTypes = {
  openState: PropTypes.bool,
  toggleDrawer: PropTypes.func,
};

function CartDrawer({ openState, toggleDrawer }) {
  const theme = useTheme();
  const { menuMeals } = useSelector((state) => state.qrMenu);
  const { fsRemoveMealFromCart, dataSnapshotListener } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [cartMeal, setCartMeals] = useState([]);
  const [totalBill, setTotalBill] = useState(0);

  useEffect(() => {
    // re-construct data and load them to cart state
    if (
      dataSnapshotListener?.cart &&
      dataSnapshotListener.isPaid === false &&
      dataSnapshotListener.isCanceled === false
    ) {
      setTotalBill(
        dataSnapshotListener.id &&
          dataSnapshotListener.cart.reduce((sum, item) => sum + item.price, 0)
      );

      const mealsArr = menuMeals.filter((meal) =>
        dataSnapshotListener.cart.some((cartItem) => cartItem.mealID === meal.id)
      );
      setCartMeals(
        mealsArr.map((meal) => ({
          ...meal,
          portions: dataSnapshotListener.cart
            .filter((cartItem) => cartItem.mealID === meal.id)
            .map((cartItem) => ({
              comment: cartItem.comment,
              portionSize: cartItem.portionSize,
              price: cartItem.price,
              qty: 1,
              id: cartItem.id,
            })),
        }))
      );
    } else {
      setCartMeals([]);
      setTotalBill(0);
    }
  }, [dataSnapshotListener, menuMeals]);

  const removeMeal = (portion) => {
    setIsLoading(true);

    const cart = dataSnapshotListener.cart.filter((cartPortion) => cartPortion.id !== portion.id);

    fsRemoveMealFromCart(
      {
        orderID: dataSnapshotListener.id,
        userID: dataSnapshotListener.userID,
        branchID: dataSnapshotListener.branchID,
        cart,
      },
      true
    );

    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <Drawer anchor="bottom" open={openState} onClose={() => toggleDrawer('cart')}>
      <Scrollbar sx={{ maxHeight: 50 * 8 }}>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
          {cartMeal.map((meal) => (
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
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ borderStyle: 'dashed', mx: 1 }}
                    />
                    {isLoading ? (
                      <CircularProgress color="secondary" size={20} />
                    ) : (
                      <Iconify
                        icon="eva:trash-2-outline"
                        width={20}
                        height={20}
                        onClick={() => removeMeal(portion)}
                        sx={{ color: theme.palette.error.main }}
                      />
                    )}
                    {/* <AddRemovePortionBtns qty={portion.qty} selectedPortionSize={portion} meal={meal} small /> */}
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, mb: 2 }}>
          <Typography variant="h6" sx={{ alignSelf: 'center' }}>
            Total Bill : {totalBill} AED
          </Typography>
        </Box>
      </Scrollbar>
    </Drawer>
  );
}

export default CartDrawer;
