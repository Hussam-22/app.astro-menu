import React, { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Box } from '@mui/system';
import {
  Card,
  Stack,
  Divider,
  useTheme,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { useWaiterContext } from 'src/sections/waiter/context/waiter-context';

const TableOrder = () => {
  const theme = useTheme();
  const { user } = useWaiterContext();
  const { fsRemoveMealFromCart, orderSnapShot } = useAuthContext();

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

  const taxValue = Math.floor(orderValue * (user.taxValue / 100));
  const totalBill = orderValue + taxValue;

  const removeMeal = (portion) => {
    const cart = orderSnapShot.cart.filter((cartPortion) => cartPortion.id !== portion.id);
    fsRemoveMealFromCart({
      orderID: orderSnapShot.docID,
      userID: orderSnapShot.userID,
      branchID: orderSnapShot.branchID,
      cart,
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (portion) => removeMeal(portion),
  });

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="column" spacing={1} sx={{ py: 2 }}>
        {cartMeals.map((meal) => (
          <React.Fragment key={meal.docID}>
            <Typography sx={{ fontWeight: theme.typography.fontWeightBold }}>
              {meal.title}
            </Typography>
            <Box sx={{ ml: 3 }}>
              {orderSnapShot.cart
                .filter((cartPortion) => cartPortion.mealID === meal.docID)
                .map((portion) => (
                  <Stack key={portion.id}>
                    <Stack direction="row" justifyContent="space-between">
                      <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }} alignItems="center">
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

                      <IconButton onClick={() => mutate(portion)} sx={{ p: 0.5 }}>
                        {isPending ? (
                          <CircularProgress color="secondary" size={20} />
                        ) : (
                          <Iconify
                            icon="eva:trash-2-outline"
                            width={20}
                            height={20}
                            sx={{ color: 'error.main' }}
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
    </Card>
  );
};

TableOrder.propTypes = {
  //   openState: PropTypes.bool,
  //   toggleDrawer: PropTypes.func,
};

export default TableOrder;
