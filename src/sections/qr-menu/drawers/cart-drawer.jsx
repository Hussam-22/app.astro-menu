import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Box } from '@mui/system';
import {
  Stack,
  Button,
  Drawer,
  Divider,
  useTheme,
  Container,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

const CartDrawer = ({ openState, onClose }) => {
  const theme = useTheme();
  const { fsRemoveMealFromCart, orderSnapShot } = useAuthContext();
  const { branchInfo, selectedLanguage, getTranslation } = useQrMenuContext();
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
        orderSnapShot?.cart?.some((portion) => portion.mealID === meal?.docID)
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

  const allowToRemoveMeal =
    branchInfo?.allowSelfOrder &&
    orderSnapShot?.updateCount === 0 &&
    orderSnapShot?.closingTime === '';

  if (!cartMeals) return null;

  return (
    <Drawer
      anchor="bottom"
      open={openState}
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: '25px 25px 0 0', height: '99%' } }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ bgcolor: 'rose.400', py: 1, px: 2 }}
        alignItems="center"
        justifyContent="space-between"
      >
        <Button variant="contained" color="inherit" size="small" onClick={onClose}>
          {getTranslation('close')}
        </Button>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h5" sx={{ color: '#FFFFFF' }}>
            {getTranslation('bill')}
          </Typography>
          <Image src="/assets/icons/qr-menu/bill.svg" width={32} height={32} />
        </Stack>
      </Stack>
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '90dvh' }}>
          <Scrollbar sx={{ flexGrow: 1, maxHeight: '80%', mt: 2 }}>
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
                            {branchInfo.allowSelfOrder && allowToRemoveMeal && (
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
          <Stack direction="column" spacing={0.5} alignItems="flex-end" sx={{ my: 2, flexGrow: 0 }}>
            <Typography variant="caption">
              {getTranslation('order')} : {orderValue}{' '}
              <Box component="span" sx={{ typography: 'caption' }}>
                {branchInfo.currency}
              </Box>
            </Typography>
            {taxValue !== 0 && (
              <Typography variant="caption">
                {getTranslation('tax')} ({branchInfo.taxValue}%) : {taxValue}{' '}
                <Box component="span" sx={{ typography: 'caption' }}>
                  {branchInfo.currency}
                </Box>
              </Typography>
            )}
            <Typography variant="h6">
              {getTranslation('total bill')} : {totalBill}{' '}
              <Box component="span" sx={{ typography: 'caption', color: 'common.black' }}>
                {branchInfo.currency}
              </Box>
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Drawer>
  );
};

CartDrawer.propTypes = {
  openState: PropTypes.bool,
  onClose: PropTypes.func,
};

export default CartDrawer;
