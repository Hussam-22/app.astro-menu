import React, { useMemo } from 'react';
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';

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
import { delay } from 'src/utils/promise-delay';
import { useAuthContext } from 'src/auth/hooks';
import { blinkingBorder, blinkingElement } from 'src/theme/css';
import { getOrderStatusStyle } from 'src/utils/get-order-status-styles';
import { useStaffContext } from 'src/sections/staff/context/staff-context';

const TableOrder = () => {
  const theme = useTheme();
  const { selectedTable, setSelectedTable, branchInfo } = useStaffContext();
  const { fsRemoveMealFromCart, activeOrders, fsUpdateOrderStatus, staff, fsGetMenu, fsGetMeal } =
    useAuthContext();
  const orderSnapShot = activeOrders.find((order) => order.tableID === selectedTable.docID);

  console.log(orderSnapShot);

  const isChef = staff?.type === 'chef';

  const {
    isInKitchen,
    isReadyToServe,
    docID: orderID,
    businessProfileID,
    branchID,
    cart,
    updateCount,
  } = orderSnapShot;

  const isSendToKitchenDisabled = (updateValue) =>
    cart.filter((cartItem) => cartItem.update === updateValue).length === 0 ||
    isInKitchen.includes(updateValue);

  const getStatus = (updateValue) =>
    getOrderStatusStyle(
      isInKitchen.includes(updateValue),
      isReadyToServe.includes(updateValue),
      theme
    );

  useQueries({
    queries: orderSnapShot.cart
      .flatMap((cartItem) => cartItem.mealID)
      .map((mealID) => ({
        queryKey: ['meal', mealID, businessProfileID],
        queryFn: () => fsGetMeal(mealID, '200x200', businessProfileID),
      })),
  });

  const queryClient = useQueryClient();
  const cachedSectionMeals = queryClient.getQueriesData({ queryKey: ['meal'] }) || [];
  const availableMeals = cachedSectionMeals.map((meal) => meal[1]);

  const cartMeals = useMemo(
    () => (updateNo) =>
      availableMeals.length !== 0 &&
      availableMeals.filter((meal) =>
        orderSnapShot.cart
          .filter((portion) => portion.update === updateNo) // Filter cart by updateNo
          .some((portion) => portion.mealID === meal?.docID)
      ),
    [availableMeals, orderSnapShot]
  );

  console.log(cartMeals(0));

  const removeMeal = (portion) =>
    mutate(() => {
      const removedMealCart = orderSnapShot.cart.filter(
        (cartPortion) => cartPortion.id !== portion.id
      );
      fsRemoveMealFromCart({
        orderID,
        businessProfileID,
        branchID,
        cart: removedMealCart,
      });
    });

  const onOrderStatusUpdate = () =>
    mutate(async () => {
      await delay(500);
      fsUpdateOrderStatus({
        orderID,
        businessProfileID,
        branchID,
        toUpdateFields: {
          isInKitchen: [...isInKitchen, updateCount],
          updateCount: updateCount + 1,
          staffID: staff.docID,
        },
      });
    });

  const onReadyToServe = (value) =>
    mutate(() => {
      setSelectedTable({});
      fsUpdateOrderStatus({
        orderID,
        businessProfileID,
        branchID,
        toUpdateFields: {
          isInKitchen: isInKitchen.filter((orderIndex) => orderIndex !== value),
          isReadyToServe: [...isReadyToServe, value],
        },
      });
    });

  const { mutate, isPending } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
  });
  const orderUpdateToShow = isChef
    ? [...Array(updateCount + 1)].map((_, index) => index).filter((i) => isInKitchen.includes(i))
    : [...Array(updateCount + 1)].map((_, index) => index);

  if (cachedSectionMeals.length === 0) return null;

  return (
    <Stack direction="column-reverse" spacing={2}>
      {orderUpdateToShow.map((orderIndex) => (
        <Card
          key={`${orderID}${orderIndex}`}
          sx={{
            p: 3,
            position: 'relative',
            overflow: 'visible',
            ...(getStatus(+orderIndex) !== 'none' && {
              ...blinkingBorder(getStatus(+orderIndex).color, `${orderID}${orderIndex}`),
            }),
          }}
        >
          <Label
            color="default"
            variant="filled"
            sx={{
              position: 'absolute',
              top: -10,
              left: -10,
              fontSize: 15,
              borderRadius: 4,
              p: 0,
            }}
          >
            {orderIndex + 1}
          </Label>

          {getStatus(orderIndex) !== 'none' && (
            <Label
              color={getStatus(orderIndex).labelColor}
              startIcon={<Iconify icon={getStatus(orderIndex).icon} />}
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
              {getStatus(orderIndex).status}
            </Label>
          )}
          <Stack direction="column" spacing={0.25}>
            {cartMeals(orderIndex).map((meal) => (
              <React.Fragment key={meal.docID}>
                <Stack direction="row" spacing={1}>
                  <Typography sx={{ fontWeight: theme.typography.fontWeightBold }}>
                    {meal.title}
                  </Typography>
                  <Box sx={{ color: 'text.disabled' }}>
                    x(
                    {
                      orderSnapShot.cart.filter(
                        (cartPortion) =>
                          cartPortion.mealID === meal.docID && cartPortion.update === orderIndex
                      ).length
                    }
                    )
                  </Box>
                </Stack>
                <Box sx={{ ml: 3 }}>
                  {orderSnapShot.cart
                    .filter(
                      (cartPortion) =>
                        cartPortion.mealID === meal.docID && cartPortion.update === orderIndex
                    )
                    .map((portion) => (
                      <Stack key={portion.id}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          sx={{
                            textDecorationLine: portion?.price === 0 ? 'line-through' : 'none',
                            textDecorationColor: theme.palette.error.main,
                            textDecorationThickness: 2,
                          }}
                        >
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            - {portion.portionSize}
                          </Typography>

                          {!isChef && (
                            <Typography variant="caption" sx={{ alignSelf: 'center', mx: 1 }}>
                              {`${portion.price} 
                            ${branchInfo?.currency}`}
                            </Typography>
                          )}
                          {!isChef && (
                            <Divider
                              orientation="vertical"
                              flexItem
                              sx={{ borderStyle: 'dashed', mx: 1 }}
                            />
                          )}

                          {!isChef && (
                            <IconButton
                              onClick={() => removeMeal(portion)}
                              sx={{ p: 0.5 }}
                              disabled={
                                isInKitchen.includes(orderIndex) ||
                                isReadyToServe.includes(orderIndex)
                              }
                            >
                              {isPending ? (
                                <CircularProgress color="primary" size={20} />
                              ) : (
                                <Iconify
                                  icon="eva:trash-2-outline"
                                  width={20}
                                  height={20}
                                  sx={{
                                    color:
                                      isInKitchen.includes(orderIndex) ||
                                      isReadyToServe.includes(orderIndex)
                                        ? 'default'
                                        : 'error.main',
                                  }}
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
              </React.Fragment>
            ))}
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            {!isChef &&
              !isInKitchen.includes(orderIndex) &&
              !isReadyToServe.includes(orderIndex) && (
                <LoadingButton
                  variant="soft"
                  color="warning"
                  onClick={() => onOrderStatusUpdate()}
                  startIcon={<Iconify icon="ph:cooking-pot-light" />}
                  loading={isPending}
                  disabled={isSendToKitchenDisabled(orderIndex)}
                >
                  Send to Kitchen
                </LoadingButton>
              )}

            {isChef && isInKitchen.includes(orderIndex) && (
              <LoadingButton
                variant="soft"
                color="info"
                onClick={() => onReadyToServe(orderIndex)}
                startIcon={<Iconify icon="dashicons:food" />}
                loading={isPending}
                // disabled={isSendToKitchenDisabled(orderIndex)}
              >
                Ready to Serve
              </LoadingButton>
            )}
          </Box>
        </Card>
      ))}
    </Stack>
  );
};

export default TableOrder;
