import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, Drawer, Button, Container, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';
import Image from 'src/components/image/image';
import generateID from 'src/utils/generate-id';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import TextMaxLine from 'src/components/text-max-line';
import { useResponsive } from 'src/hooks/use-responsive';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField, RHFRadioGroup } from 'src/components/hook-form';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

const AddMealDrawer = ({ isOpen, onClose, mealInfo, orderSnapShot, branchInfo, mealTitle }) => {
  const { fsUpdateCart } = useAuthContext();
  const { selectedLanguage, getTranslation } = useQrMenuContext();
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

  const getTitle = () => {
    if (selectedLanguage === 'en') return mealInfo.title;
    return mealInfo.translationEdited?.[selectedLanguage]?.title
      ? mealInfo.translationEdited?.[selectedLanguage]?.title
      : mealInfo.translation?.[selectedLanguage]?.title;
  };

  const getDescription = () => {
    if (selectedLanguage === 'en') return mealInfo.description;
    return mealInfo.translationEdited?.[selectedLanguage]?.desc
      ? mealInfo.translationEdited?.[selectedLanguage]?.desc
      : mealInfo.translation?.[selectedLanguage]?.desc;
  };

  return (
    <Drawer anchor="bottom" open={isOpen} onClose={() => onClose()}>
      <Container maxWidth="sm" sx={{ px: 0 }}>
        <Scrollbar sx={{ bgcolor: 'background.default', pb: 3 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={1} direction="column">
              <Image src={mealInfo.cover} ratio={isMobile ? '4/3' : '21/9'} />
              <Stack spacing={2} sx={{ px: 2 }}>
                <Box>
                  <Typography variant="h4">{getTitle()}</Typography>
                  <TextMaxLine line={5} variant="body2">
                    {getDescription()}
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

                <RHFTextField
                  rows={2}
                  multiline
                  name="comment"
                  label={getTranslation('Any Special Requests ?')}
                />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button variant="contained" onClick={onClose}>
                    {getTranslation('close')}
                  </Button>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    color="success"
                    startIcon={<Iconify icon="mdi:hamburger-plus" />}
                    loading={isSubmitting}
                  >
                    {getTranslation('add meal')}
                  </LoadingButton>
                </Stack>
              </Stack>
            </Stack>
          </FormProvider>
        </Scrollbar>
      </Container>
    </Drawer>
  );
};

AddMealDrawer.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  mealInfo: PropTypes.object,
  orderSnapShot: PropTypes.object,
  branchInfo: PropTypes.object,
  mealTitle: PropTypes.string,
};

export default AddMealDrawer;
