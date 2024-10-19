/* eslint-disable no-unsafe-optional-chaining */
import PropTypes from 'prop-types';
import { useTheme } from '@emotion/react';
import { useQuery } from '@tanstack/react-query';

import { Box, Stack, Button, Drawer, Divider, Typography } from '@mui/material';

import Label from 'src/components/label';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import { fDistance } from 'src/utils/format-time';

// ----------------------------------------------------------------------

OrderDetailsDrawer.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
  orderInfo: PropTypes.object,
};

function OrderDetailsDrawer({ onClose, isOpen, orderInfo }) {
  const theme = useTheme();
  const { fsGetAllMeals, fsGetBranch, fsGetStaffInfo, fsGetTableInfo } = useAuthContext();
  const {
    cart,
    closingTime,
    docID,
    initiationTime,
    customerEmail,
    totalBill,
    staffID,
    branchID,
    businessProfileID,
    tableID,
  } = orderInfo;

  console.log(orderInfo);

  const { data: branchInfo = {} } = useQuery({
    queryKey: ['branch', orderInfo.branchID],
    queryFn: () => fsGetBranch(orderInfo.branchID),
    enabled: orderInfo.docID !== undefined,
  });

  // const { data: mealsList = [] } = useQuery({
  //   queryKey: [`meals`],
  //   queryFn: () => fsGetAllMeals(),
  //   enabled: orderInfo.docID !== undefined,
  // });

  const { data: staffInfo = {} } = useQuery({
    queryKey: ['staff', staffID],
    queryFn: () => fsGetStaffInfo(staffID),
    enabled: (orderInfo.docID !== undefined && staffID !== '') || staffID !== undefined,
  });

  const { data: tableInfo = [] } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [`table`, branchID, tableID],
    queryFn: () => fsGetTableInfo(businessProfileID, branchID, tableID),
    enabled: orderInfo.docID !== undefined,
  });

  // const allMeals = mealsList.filter((meal) =>
  //   cart?.some((cartItem) => cartItem.mealID === meal.docID)
  // );

  // const cartMeals = useMemo(
  //   () =>
  //     allMeals.filter((meal) => orderInfo.cart.some((portion) => portion.mealID === meal?.docID)) ||
  //     [],
  //   [allMeals, orderInfo.cart]
  // );

  const orderDate =
    typeof closingTime === 'string'
      ? // eslint-disable-next-line no-unsafe-optional-chaining
        new Date(initiationTime?.seconds * 1000)
      : // eslint-disable-next-line no-unsafe-optional-chaining
        new Date(closingTime?.seconds * 1000);

  const orderStatus = () => {
    if (orderInfo?.isPaid) return ['Paid', 'success'];
    if (orderInfo?.isCanceled) return ['Canceled', 'error'];
    return ['In Progress', 'default'];
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: '25px 0 0 25px', width: { xs: '35%', sm: '25%' }, p: 3 },
      }}
    >
      <Typography variant="h5">Order Details</Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2">{orderInfo.docID}</Typography>
        <Label
          variant="soft"
          color={orderStatus()[1]}
          sx={{ textTransform: 'capitalize', fontSize: 18, p: 2 }}
        >
          {orderStatus()[0]}
        </Label>
      </Stack>

      <Box>
        <Scrollbar sx={{ maxHeight: 300, my: 1 }}>
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 1,
              p: 2,
              border: `dashed 1px ${theme.palette.grey[300]}`,
            }}
          >
            {cart?.length !== 0 &&
              cart?.map((cartMeal) => (
                <Box key={cartMeal.docID}>
                  <Typography sx={{ fontWeight: theme.typography.fontWeightBold }}>
                    {cartMeal.title}
                  </Typography>
                  <Stack key={cartMeal.id}>
                    <Stack direction="row" justifyContent="space-between">
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          flexGrow: 1,
                          textDecorationLine: cartMeal?.price === 0 ? 'line-through' : 'none',
                          textDecorationColor: theme.palette.error.main,
                          textDecorationThickness: 2,
                        }}
                        alignItems="center"
                      >
                        <Typography variant="body2">- {cartMeal.portionSize}</Typography>
                      </Stack>

                      <Typography variant="overline" sx={{ alignSelf: 'center', mx: 1 }}>
                        {cartMeal.price} {branchInfo?.currency}
                      </Typography>
                    </Stack>
                    {cartMeal?.comment && (
                      <Typography variant="caption" sx={{ ml: 2, color: 'error.main' }}>
                        *{cartMeal.comment}
                      </Typography>
                    )}
                  </Stack>

                  <Divider flexItem sx={{ borderStyle: 'dashed' }} />
                </Box>
              ))}
          </Box>
        </Scrollbar>
      </Box>
      <Typography variant="h6" sx={{ textAlign: 'right', mt: 1.5 }}>
        Total Bill : {totalBill} {branchInfo?.currency}
      </Typography>
      <Divider flexItem sx={{ borderStyle: 'dashed', my: 1 }} />

      <Stack>
        <Typography variant="caption">Customer Email</Typography>
        <Typography variant="body2">{customerEmail || 'Not Provided'}</Typography>
      </Stack>
      <Stack>
        <Typography variant="caption">Order Date Time</Typography>
        <Typography variant="body2">{orderDate.toLocaleString()}</Typography>
      </Stack>
      {(initiationTime !== '' || closingTime !== '') && (
        <Stack>
          <Typography variant="caption">Turnover</Typography>
          <Typography variant="body2">
            {fDistance(
              initiationTime?.seconds ? new Date(initiationTime.seconds * 1000) : new Date(),
              closingTime?.seconds ? new Date(closingTime.seconds * 1000) : new Date()
            )}
          </Typography>
        </Stack>
      )}
      <Stack>
        <Typography variant="caption">Waitstaff</Typography>
        <Typography variant="body2">{staffInfo?.fullname || 'Self Order'}</Typography>
      </Stack>
      <Stack>
        <Typography variant="caption">Table #</Typography>
        <Typography variant="body2">{tableInfo?.index}</Typography>
      </Stack>
      {orderInfo.isCanceled && (
        <Stack>
          <Typography variant="caption">Cancelation Reason</Typography>
          <Typography variant="body2">{orderInfo.cancelReason}</Typography>

          <Typography variant="caption">Waitstaff Comment</Typography>
          <Typography variant="body2">{orderInfo.cancelComment || 'No Comment'}</Typography>
        </Stack>
      )}
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        <Button variant="soft" color="secondary" onClick={onClose}>
          Close
        </Button>
      </Box>
    </Drawer>
  );
}

export default OrderDetailsDrawer;
