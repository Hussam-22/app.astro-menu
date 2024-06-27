import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, Drawer, Button, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';
import Image from 'src/components/image/image';
import generateID from 'src/utils/generate-id';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import TextMaxLine from 'src/components/text-max-line';
import { useResponsive } from 'src/hooks/use-responsive';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField, RHFRadioGroup } from 'src/components/hook-form';

const AddMealDrawer = ({ isOpen, onClose, mealInfo, orderSnapShot, branchInfo }) => {
  const { fsUpdateCart } = useAuthContext();
  const { docID, businessProfileID, branchID, cart, updateCount } = orderSnapShot;
  const isMobile = useResponsive('down', 'sm');

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
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={() => onClose()}
      PaperProps={{ sx: { borderRadius: '25px 0 0 25px', minWidth: '30%' } }}
    >
      <Scrollbar sx={{ bgcolor: 'background.default', pb: 3, height: 1 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={1} direction="column">
            <Image src={mealInfo.cover} ratio="6/4" />
            <Stack spacing={2} sx={{ px: 2 }}>
              <Box>
                <Typography variant="h4">{mealInfo.title}</Typography>
                <TextMaxLine line={5} variant="body2">
                  {mealInfo?.description}
                </TextMaxLine>
              </Box>
              <RHFRadioGroup
                spacing={-1}
                name="portion"
                options={mealInfo.portions.map((portion, index) => ({
                  value: index,
                  label: `${portion.portionSize} - ${portion.gram}gram - ${portion.price} ${branchInfo.currency}`,
                }))}
              />

              <RHFTextField rows={2} multiline name="comment" label="Any Special Requests ?" />

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="contained" onClick={onClose}>
                  close
                </Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  color="success"
                  startIcon={<Iconify icon="mdi:hamburger-plus" />}
                  loading={isSubmitting}
                >
                  add meal
                </LoadingButton>
              </Stack>
            </Stack>
          </Stack>
        </FormProvider>
      </Scrollbar>
    </Drawer>
  );
};

AddMealDrawer.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  mealInfo: PropTypes.object,
  orderSnapShot: PropTypes.object,
  branchInfo: PropTypes.object,
};

export default AddMealDrawer;
