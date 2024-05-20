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

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

const CartDrawer = ({ openState, toggleDrawer }) => {
  const theme = useTheme();
  const { fsRemoveMealFromCart, orderSnapShot } = useAuthContext();
  const { branchInfo, selectedLanguage } = useQrMenuContext();
  const { updateCount } = orderSnapShot;

  const queryClient = useQueryClient();
  const cachedMeals = queryClient.getQueriesData({ queryKey: ['meal'] }) || [];

  const availableMeals = cachedMeals.flatMap((item) => item[1]);

  const getTitle = (meal) => {
    const { title, translation, translationEdited } = meal;
    if (selectedLanguage === 'en') return title;
    return translationEdited?.[selectedLanguage]?.title
      ? translationEdited?.[selectedLanguage]?.title
      : translation?.[selectedLanguage]?.title;
  };

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

  const taxValue = +(orderValue * (branchInfo.taxValue / 100)).toFixed(2) || 0;
  const totalBill = +orderValue + taxValue;

  const removeMeal = (portion) => {
    const updatedCart = orderSnapShot.cart.filter((cartPortion) => cartPortion.id !== portion.id);
    fsRemoveMealFromCart({
      orderID: orderSnapShot.docID,
      businessProfileID: orderSnapShot.businessProfileID,
      branchID: orderSnapShot.branchID,
      cart: updatedCart,
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (portion) => removeMeal(portion),
  });

  return (
    <Drawer anchor="bottom" open={openState} onClose={() => toggleDrawer('cart')}>
      <Container maxWidth="sm">
        <Stack direction="column" spacing={1} sx={{ py: 2 }}>
          <Scrollbar sx={{ maxHeight: 300 }}>
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                p: 1,
                border: `dashed 1px ${theme.palette.divider}`,
              }}
            >
              {cartMeals.map((meal) => (
                <Box key={meal.docID}>
                  <Typography sx={{ fontWeight: theme.typography.fontWeightBold }}>
                    {getTitle(meal)}
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

                            <Typography variant="overline" sx={{ alignSelf: 'center', mx: 1 }}>
                              {portion.price} {branchInfo.currency}
                            </Typography>
                            {branchInfo.allowSelfOrder && (
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
                            )}
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
                </Box>
              ))}
            </Box>
          </Scrollbar>
        </Stack>
        <Stack direction="row" justifyContent="flex-end" alignItems="center">
          <Stack direction="column" spacing={0.5} alignItems="flex-end" sx={{ mb: 2 }}>
            <Typography variant="caption">
              Order : {orderValue}{' '}
              <Box component="span" sx={{ typography: 'caption' }}>
                {branchInfo.currency}
              </Box>
            </Typography>
            {taxValue !== 0 && (
              <Typography variant="caption">
                Tax ({branchInfo.taxValue}%) : {taxValue}{' '}
                <Box component="span" sx={{ typography: 'caption' }}>
                  {branchInfo.currency}
                </Box>
              </Typography>
            )}
            <Typography variant="h6" sx={{ color: 'success.main' }}>
              Total Bill : {totalBill}{' '}
              <Box component="span" sx={{ typography: 'caption', color: 'common.black' }}>
                {branchInfo.currency}
              </Box>
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Drawer>
  );
};

CartDrawer.propTypes = {
  openState: PropTypes.bool,
  toggleDrawer: PropTypes.func,
};

export default CartDrawer;
