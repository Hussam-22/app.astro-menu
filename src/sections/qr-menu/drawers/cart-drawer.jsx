import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Box } from '@mui/system';
import {
  Stack,
  Drawer,
  Divider,
  useTheme,
  Container,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

const CartDrawer = ({ openState, toggleDrawer }) => {
  const theme = useTheme();
  const { fsRemoveMealFromCart, orderSnapShot } = useAuthContext();
  const { user, orderStatus } = useQrMenuContext();
  const { updateCount } = orderSnapShot;

  const queryClient = useQueryClient();
  const cachedMealLabels = queryClient.getQueriesData({ queryKey: ['sectionMeals'] }) || [];

  const availableMeals = cachedMealLabels.flatMap((item) => item[1]);

  const cartMeals = useMemo(
    () =>
      availableMeals.length !== 0 &&
      availableMeals.filter((meal) =>
        orderSnapShot.cart.some((portion) => portion.mealID === meal?.docID)
      ),
    [availableMeals, orderSnapShot.cart]
  );

  const orderValue = useMemo(
    () =>
      orderSnapShot?.docID &&
      orderSnapShot.cart.reduce((accumulator, portion) => accumulator + portion.price, 0),
    [orderSnapShot.cart, orderSnapShot?.docID]
  );

  const taxValue = +(orderValue * (user.taxValue / 100)).toFixed(2);
  const totalBill = +orderValue + taxValue;

  const removeMeal = (portion) => {
    const updatedCart = orderSnapShot.cart.filter((cartPortion) => cartPortion.id !== portion.id);
    fsRemoveMealFromCart({
      orderID: orderSnapShot.docID,
      userID: orderSnapShot.userID,
      branchID: orderSnapShot.branchID,
      updatedCart,
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (portion) => removeMeal(portion),
  });

  return (
    <Drawer anchor="bottom" open={openState} onClose={() => toggleDrawer('cart')}>
      <Scrollbar sx={{ maxHeight: 400 }}>
        <Container maxWidth="sm">
          <Stack direction="column" spacing={1} sx={{ py: 2 }}>
            <Label
              color={orderStatus.color}
              variant="filled"
              startIcon={<Iconify icon={orderStatus.icon} />}
            >
              {orderStatus.text}
            </Label>
            {cartMeals.map((meal) => (
              <React.Fragment key={meal.docID}>
                <Typography sx={{ fontWeight: theme.typography.fontWeightBold }}>
                  {meal.title}
                </Typography>
                <Box>
                  {orderSnapShot.cart
                    .filter((cartPortion) => cartPortion.mealID === meal.docID)
                    .map((portion) => (
                      <Stack key={portion.id}>
                        <Stack direction="row" justifyContent="space-between">
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                              flexGrow: 1,
                              textDecorationLine: portion?.price === 0 ? 'line-through' : 'none',
                              textDecorationColor: theme.palette.error.main,
                              textDecorationThickness: 2,
                            }}
                            alignItems="center"
                          >
                            <Typography variant="body2">- {portion.portionSize}</Typography>
                          </Stack>

                          <Typography variant="caption" sx={{ alignSelf: 'center', mx: 1 }}>
                            {portion.price} AED
                          </Typography>
                          <Divider
                            orientation="vertical"
                            flexItem
                            sx={{ borderStyle: 'dashed', mx: 1 }}
                          />

                          <IconButton
                            onClick={() => mutate(portion)}
                            sx={{ p: 0.5 }}
                            disabled={updateCount > 0}
                          >
                            {isPending ? (
                              <CircularProgress color="secondary" size={20} />
                            ) : (
                              <Iconify
                                icon="eva:trash-2-outline"
                                width={20}
                                height={20}
                                sx={{ color: updateCount === 0 ? 'error.main' : 'default' }}
                              />
                            )}
                          </IconButton>
                        </Stack>
                        {portion?.comment && (
                          <Typography variant="caption" sx={{ ml: 2, color: 'error.main' }}>
                            *{portion.comment}
                          </Typography>
                        )}
                      </Stack>
                    ))}
                </Box>

                <Divider flexItem sx={{ borderStyle: 'dashed' }} />
              </React.Fragment>
            ))}
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="column" spacing={0.5} alignItems="flex-end" sx={{ mb: 2 }}>
              <Typography variant="caption">
                Order : {orderValue}{' '}
                <Box component="span" sx={{ typography: 'caption' }}>
                  AED
                </Box>
              </Typography>
              <Typography variant="caption">
                Tax : {taxValue}{' '}
                <Box component="span" sx={{ typography: 'caption' }}>
                  AED
                </Box>
              </Typography>
              <Typography variant="h6" sx={{ color: 'success.main' }}>
                Total Bill : {totalBill}{' '}
                <Box component="span" sx={{ typography: 'caption', color: 'common.black' }}>
                  AED
                </Box>
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Scrollbar>
    </Drawer>
  );
};

CartDrawer.propTypes = {
  openState: PropTypes.bool,
  toggleDrawer: PropTypes.func,
};

export default CartDrawer;
