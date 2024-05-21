import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  Box,
  Stack,
  Dialog,
  Divider,
  useTheme,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import { fDateTime } from 'src/utils/format-time';
import getCartTotal from 'src/utils/getCartTotal';

ShowOrderDetailsDialog.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
  orderInfo: PropTypes.object,
};

function ShowOrderDetailsDialog({ isOpen, onClose, orderInfo }) {
  const { cart, lastUpdate, docID, totalBill } = orderInfo;
  const theme = useTheme();
  const { fsGetAllMeals, fsGetBranch } = useAuthContext();

  const { data: branchInfo = {} } = useQuery({
    queryKey: ['branch', orderInfo.branchID],
    queryFn: () => fsGetBranch(orderInfo.branchID),
  });

  const { data: mealsList = [] } = useQuery({
    queryKey: [`meals`],
    queryFn: () => fsGetAllMeals(),
  });

  const allMeals = mealsList.filter((meal) =>
    cart.some((cartItem) => cartItem.mealID === meal.docID)
  );

  const cartMeals = useMemo(
    () =>
      allMeals.filter((meal) => orderInfo.cart.some((portion) => portion.mealID === meal?.docID)) ||
      [],
    [allMeals, orderInfo.cart]
  );

  const calculatedTotalBill = getCartTotal(cart, branchInfo.taxValue);

  const orderDate = new Date(lastUpdate.seconds * 1000);

  const orderStatus = () => {
    if (orderInfo.isPaid) return ['Paid', 'success'];
    if (orderInfo.isCanceled) return ['Canceled', 'error'];
    if (orderInfo.isReadyToServe.length !== 0) return ['Ready to Serve', 'info'];
    if (orderInfo.isInKitchen.length !== 0) return ['Sent to Kitchen', 'warning'];
    if (orderInfo.isCanceled) return ['Canceled', 'error'];
    return ['In Progress', 'default'];
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: { bgcolor: 'background.neutral' },
      }}
    >
      <DialogTitle>
        Order Details
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 18,
            top: 18,
            color: theme.palette.grey[500],
          }}
        >
          <Iconify icon="material-symbols:close" />
        </IconButton>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="column">
            <Typography
              variant="caption"
              component="div"
              sx={{ color: theme.palette.text.disabled }}
            >
              {docID}
            </Typography>
            <Typography variant="caption" component="div">
              {fDateTime(orderDate)}
            </Typography>
          </Stack>
          <Stack direction="column" alignItems="flex-end">
            <Label variant="filled" color={orderStatus()[1]} sx={{ textTransform: 'capitalize' }}>
              {orderStatus()[0]}
            </Label>
            {orderInfo.isCanceled && (
              <Stack direction="column" alignItems="flex-end">
                <Typography variant="caption" component="div" sx={{ color: 'error.main' }}>
                  {orderInfo.cancelReason}
                </Typography>
                <Typography variant="caption" component="div" sx={{ color: 'error.main' }}>
                  {orderInfo.cancelComment}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Scrollbar sx={{ maxHeight: 300 }}>
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 1,
              p: 2,
              border: `dashed 1px ${theme.palette.grey[300]}`,
            }}
          >
            {mealsList.length !== 0 &&
              cartMeals.length !== 0 &&
              cartMeals.map((meal) => (
                <Box key={meal.docID}>
                  <Typography sx={{ fontWeight: theme.typography.fontWeightBold }}>
                    {meal.title}
                  </Typography>
                  <Box>
                    {orderInfo.cart
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
                              {portion.price} {branchInfo?.currency}
                            </Typography>
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
        <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ py: 2, px: 1 }}>
          <Typography variant="h6">
            Total Bill : {calculatedTotalBill} {branchInfo?.currency}
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default ShowOrderDetailsDialog;
