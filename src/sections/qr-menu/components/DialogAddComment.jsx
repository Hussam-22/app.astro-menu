import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import { Stack, Button, Dialog, Typography, DialogContent } from '@mui/material';

import Iconify from 'src/components/iconify';
import Image from 'src/components/image/image';
import generateID from 'src/utils/generate-id';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField, RHFRadioGroup } from 'src/components/hook-form';

// ----------------------------------------------------------------------

DialogAddComment.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  mealInfo: PropTypes.object,
  orderSnapShot: PropTypes.object,
  branchInfo: PropTypes.object,
  mealTitle: PropTypes.string,
};

export default function DialogAddComment({
  isOpen,
  onClose,
  mealInfo,
  orderSnapShot,
  branchInfo,
  mealTitle,
}) {
  const { fsUpdateCart } = useAuthContext();
  const { docID, businessProfileID, branchID, cart, updateCount } = orderSnapShot;

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

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async ({ comment, portion }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const updatedCart = cart;
    updatedCart.push({
      ...mealInfo.portions[portion],
      mealID: mealInfo.docID,
      qty: 1,
      comment,
      id: generateID(8),
      update: updateCount,
    });
    fsUpdateCart({ orderID: docID, businessProfileID, branchID, cart: updatedCart });
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose} scroll="paper">
      <DialogContent sx={{ p: 2 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={1} direction="column" sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{mealTitle}</Typography>
            <Image src={mealInfo.cover} sx={{ borderRadius: 1, height: 200 }} ratio="21/9" />
            <RHFRadioGroup
              spacing={-1}
              name="portion"
              options={mealInfo.portions.map((portion, index) => ({
                value: index,
                label: `${portion.portionSize} - ${portion.gram}gram - ${portion.price} ${branchInfo.currency}`,
              }))}
            />

            <RHFTextField rows={3} multiline name="comment" label="Any Special Requests?" />

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="soft" onClick={onClose}>
                Close
              </Button>
              <LoadingButton
                type="submit"
                variant="contained"
                color="success"
                startIcon={<Iconify icon="mdi:hamburger-plus" />}
                loading={isSubmitting}
              >
                Add Meal
              </LoadingButton>
            </Stack>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
