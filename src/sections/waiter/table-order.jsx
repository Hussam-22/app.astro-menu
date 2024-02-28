import React, { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Box } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import {
  Card,
  Stack,
  Divider,
  useTheme,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { blinkingBorder, blinkingElement } from 'src/theme/css';
import { getOrderStatusStyle } from 'src/utils/get-order-status-styles';
import { useWaiterContext } from 'src/sections/waiter/context/waiter-context';

const TableOrder = () => {
  const theme = useTheme();
  const { selectedTable } = useWaiterContext();
  const { fsRemoveMealFromCart, activeOrders, fsUpdateOrderStatus } = useAuthContext();
  const orderSnapShot = activeOrders.find((order) => order.tableID === selectedTable.docID);

  const { isInKitchen, isReadyToServe, docID: orderID, userID, branchID } = orderSnapShot;

  const getStatus = getOrderStatusStyle(isInKitchen, isReadyToServe, theme);

  const queryClient = useQueryClient();
  const cachedSectionMeals = queryClient.getQueriesData({ queryKey: ['sectionMeals'] }) || [];

  const availableMeals = cachedSectionMeals.flatMap((item) => item[1]);

  const cartMeals = useMemo(
    () =>
      availableMeals.length !== 0 &&
      availableMeals.filter((meal) =>
        orderSnapShot.cart.some((portion) => portion.mealID === meal?.docID)
      ),
    [availableMeals, orderSnapShot.cart]
  );

  const removeMeal = (portion) =>
    mutate(() => {
      const cart = orderSnapShot.cart.filter((cartPortion) => cartPortion.id !== portion.id);
      fsRemoveMealFromCart({
        orderID,
        userID,
        branchID,
        cart,
      });
    });

  const onOrderStatusUpdate = () =>
    mutate(() =>
      fsUpdateOrderStatus({ orderID, userID, branchID, toUpdateFields: { isInKitchen: true } })
    );

  const { mutate, isPending } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
  });

  return (
    <Card
      sx={{
        p: 3,
        position: 'relative',
        ...(getStatus !== 'none' && { ...blinkingBorder(getStatus.color, orderSnapShot.docID) }),
      }}
    >
      {getStatus !== 'none' && (
        <Label
          color={getStatus.labelColor}
          startIcon={<Iconify icon={getStatus.icon} />}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            fontSize: 15,
            borderRadius: '0 0 0 20px',
            p: 2,
            ...blinkingElement,
          }}
        >
          {getStatus.status}
        </Label>
      )}
      <Stack direction="column" spacing={0.25}>
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

                      <IconButton
                        onClick={() => removeMeal(portion)}
                        sx={{ p: 0.5 }}
                        disabled={isInKitchen}
                      >
                        {isPending ? (
                          <CircularProgress color="secondary" size={20} />
                        ) : (
                          <Iconify
                            icon="eva:trash-2-outline"
                            width={20}
                            height={20}
                            sx={{ color: !isInKitchen ? 'error.main' : 'default' }}
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        {!isInKitchen && (
          <LoadingButton
            variant="soft"
            color="warning"
            onClick={() => onOrderStatusUpdate()}
            startIcon={<Iconify icon="ph:cooking-pot-light" />}
            loading={isPending}
          >
            Send to Kitchen
          </LoadingButton>
        )}
      </Box>
    </Card>
  );
};

TableOrder.propTypes = {
  //   openState: PropTypes.bool,
  //   toggleDrawer: PropTypes.func,
};

export default TableOrder;
