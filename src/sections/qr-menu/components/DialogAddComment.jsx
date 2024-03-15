import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, Dialog, MenuItem, Typography, DialogContent } from '@mui/material';

import Iconify from 'src/components/iconify';
import generateID from 'src/utils/generate-id';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

DialogAddComment.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  mealInfo: PropTypes.object,
  orderSnapShot: PropTypes.object,
};

export default function DialogAddComment({ isOpen, onClose, mealInfo, orderSnapShot }) {
  const { fsUpdateCart, user } = useAuthContext();
  const { docID, userID, branchID, cart, updateCount } = orderSnapShot;

  console.log(orderSnapShot);

  const count = useMemo(
    () =>
      orderSnapShot?.cart?.reduce((accumulator, cartPortion) => {
        if (cartPortion?.mealID === mealInfo?.docID) {
          return cartPortion.qty + accumulator;
        }
        return accumulator;
      }, 0) || 0,
    [mealInfo?.docID, orderSnapShot?.cart]
  );

  const defaultValues = useMemo(
    () => ({
      comment: '',
      portion: 0,
    }),
    []
  );

  const methods = useForm({
    defaultValues,
  });

  const { handleSubmit } = methods;

  const onSubmit = async ({ comment, portion }) => {
    const updatedCart = cart;
    updatedCart.push({
      ...mealInfo.portions[portion],
      mealID: mealInfo.docID,
      qty: 1,
      comment,
      id: generateID(8),
      update: updateCount,
    });
    fsUpdateCart({ orderID: docID, userID, branchID, cart: updatedCart });
    onClose();
  };

  const onQtyChange = (qtyValue, comment = '') => {
    const updatedCart = cart;

    // if (qtyValue === -1) {
    //   const index = cart.findLastIndex(
    //     (cartPortion) =>
    //       cartPortion.mealID === mealInfo.docID &&
    //       cartPortion.portionSize === portions[selectedPortion].portionSize
    //   );
    //   if (index !== -1) {
    //     updatedCart.splice(index, 1);
    //     fsUpdateCart({ orderID: docID, userID, branchID, cart: updatedCart });
    //   }
    // }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose} scroll="paper">
      <DialogContent sx={{ p: 3 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2} direction="column" sx={{ textAlign: 'center' }}>
            <RHFSelect name="portion" label="Select Meal Size/Portion">
              {mealInfo.portions.map((portion, index) => (
                <MenuItem key={index} value={index}>
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      variant="caption"
                      sx={{ textWrap: 'pretty' }}
                    >{`${portion.portionSize} - ${portion.gram}gram - ${portion.price} ${user.currency}`}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFTextField rows={3} multiline name="comment" label="Any Special Requests?" />

            <Box>
              <LoadingButton
                type="submit"
                variant="contained"
                color="success"
                startIcon={<Iconify icon="mdi:hamburger-plus" />}
              >
                Add Meal
              </LoadingButton>
            </Box>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
