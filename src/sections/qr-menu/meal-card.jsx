import PropTypes from 'prop-types';
import { useMemo, useState, useEffect } from 'react';

import { Box, Stack, Button, useTheme, Typography } from '@mui/material';

import Label from 'src/components/label';
import Image from 'src/components/image';
import { useParams } from 'src/routes/hook';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import TextMaxLine from 'src/components/text-max-line';
import AddMealDrawer from 'src/sections/qr-menu/drawers/add-meal-drawer';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

function MealCard({ mealInfo }) {
  const theme = useTheme();
  const { tableID } = useParams();
  const { cover, description, isNew, portions, title, translation, translationEdited } = mealInfo;
  const { orderSnapShot } = useAuthContext();
  const { branchInfo, selectedLanguage, tableInfo, businessProfile, getTranslation } =
    useQrMenuContext();
  const [isReadMore, setIsReadMore] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const getTitle = () => {
    if (selectedLanguage === 'en') return title;
    return translationEdited?.[selectedLanguage]?.title
      ? translationEdited?.[selectedLanguage]?.title
      : translation?.[selectedLanguage]?.title;
  };

  const getDescription = () => {
    if (selectedLanguage === 'en') return description;
    return translationEdited?.[selectedLanguage]?.desc
      ? translationEdited?.[selectedLanguage]?.desc
      : translation?.[selectedLanguage]?.desc;
  };

  const count = useMemo(
    () =>
      orderSnapShot?.cart?.reduce((accumulator, cartPortion) => {
        if (cartPortion.mealID === mealInfo.docID) {
          return cartPortion.qty + accumulator;
        }
        return accumulator;
      }, 0) || 0,
    [mealInfo.docID, orderSnapShot.cart]
  );

  const isMenuOnly = useMemo(
    () => businessProfile?.planInfo?.at(-1)?.isMenuOnly,
    [businessProfile.planInfo]
  );

  const isMealActive = !branchInfo.disabledMeals?.includes(mealInfo.docID) && mealInfo.isActive;

  const allowAddToCart =
    isMealActive &&
    branchInfo?.allowSelfOrder &&
    tableInfo.index !== 0 &&
    orderSnapShot?.updateCount === 0 &&
    orderSnapShot?.closingTime === '' &&
    !isMenuOnly;

  useEffect(() => {
    // Handler for the popstate event (Closing the Modal when clicking the back button on Mobile devices)
    const handlePopState = (event) => {
      if (event.type === 'popstate') setIsOpen(false);
      // Ensure we push a new state to handle further back button presses
      window.history.pushState({}, '');
    };

    // Add the popstate event listener
    window.addEventListener('popstate', handlePopState);

    // Push initial state
    window.history.pushState({}, '');

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [setIsOpen]);

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 0.5 }}>
        <Box
          sx={{
            bgcolor: 'success.main',
            width: count === 0 ? 0 : 8,
            height: 100,
            borderRadius: '0 25px 25px 0',
            transition: 'width 0.3s ease-in-out',
          }}
        />
        <Stack direction="column" spacing={1} sx={{ width: '55%', flexGrow: 1 }}>
          <Title selectedLanguage={selectedLanguage} getTitle={getTitle} />

          <Description
            isReadMore={isReadMore}
            setIsReadMore={setIsReadMore}
            getDescription={getDescription}
            selectedLanguage={selectedLanguage}
          />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={0.5} alignSelf="end">
              <Typography variant="h4">{portions[0].price}</Typography>
              <Typography variant="caption" sx={{ fontWeight: theme.typography.fontWeightLight }}>
                {branchInfo?.currency}
              </Typography>
            </Stack>
            {allowAddToCart && (
              <Button
                type="submit"
                variant="contained"
                color="success"
                onClick={() => setIsOpen(true)}
                startIcon={<Iconify icon="mdi:hamburger-plus" />}
                sx={{
                  whiteSpace: 'nowrap',
                  borderRadius: 1,
                  typography: 'caption',
                  py: 0.5,
                  fontWeight: 'bold',
                }}
              >
                {count === 0 ? getTranslation('add') : count}
              </Button>
            )}
          </Stack>
        </Stack>
        <Box
          sx={{
            position: 'relative',
            width: '45%',
            height: 1,
            textAlign: 'center',
            px: 0.25,
          }}
        >
          <Image
            src={cover}
            ratio="1/1"
            sx={{
              borderRadius: 1,
              border: `dashed 1px ${theme.palette.divider}`,
              filter: `grayscale(${isMealActive || tableInfo?.mealAlwaysAvailable ? '0' : '100'})`,
            }}
            onClick={() => allowAddToCart && setIsOpen(true)}
          />

          {isNew && (
            <Box sx={{ position: 'absolute', top: 10, left: -5 }}>
              <Label
                variant="filled"
                color="error"
                sx={{ fontSize: 12, p: 1, boxShadow: '2px 2px 0 0 #000', zIndex: 999 }}
              >
                {getTranslation('new')}
              </Label>
            </Box>
          )}

          {!isMealActive && !tableInfo?.mealAlwaysAvailable && (
            <Label
              variant="filled"
              color="warning"
              sx={{
                position: 'absolute',
                bottom: 15,
                left: '50%',
                transform: 'translate(-50%, 30%)',
              }}
            >
              {getTranslation('out of stock')}
            </Label>
          )}
        </Box>
      </Stack>
      <AddMealDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mealInfo={mealInfo}
        tableID={tableID}
        orderSnapShot={orderSnapShot}
        branchInfo={branchInfo}
        mealTitle={getTitle()}
      />
    </Box>
  );
}
export default MealCard;
MealCard.propTypes = {
  mealInfo: PropTypes.shape({
    cover: PropTypes.string,
    docID: PropTypes.string,
    description: PropTypes.string,
    isNew: PropTypes.bool,
    mealLabels: PropTypes.array,
    portions: PropTypes.array,
    title: PropTypes.string,
    translation: PropTypes.object,
    translationEdited: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    isActive: PropTypes.bool,
  }),
};
// ----------------------------------------------------------------------------
Title.propTypes = {
  getTitle: PropTypes.func,
  selectedLanguage: PropTypes.string,
};
function Title({ selectedLanguage, getTitle }) {
  return (
    <Typography
      sx={{
        direction: selectedLanguage === 'ar' ? 'rtl' : 'ltr',
        lineHeight: 1,
      }}
      variant="h5"
    >
      {getTitle()}
    </Typography>
  );
}
// ----------------------------------------------------------------------------
Description.propTypes = {
  setIsReadMore: PropTypes.func,
  selectedLanguage: PropTypes.string,
  getDescription: PropTypes.func,
  isReadMore: PropTypes.bool,
};
function Description({ setIsReadMore, selectedLanguage, getDescription, isReadMore }) {
  return (
    <>
      {!isReadMore && (
        <TextMaxLine
          line={2}
          variant="caption"
          onClick={() => setIsReadMore(true)}
          sx={{ direction: selectedLanguage === 'ar' ? 'rtl' : 'ltr', color: 'grey.500' }}
        >
          {getDescription()}
        </TextMaxLine>
      )}
      {isReadMore && (
        <Typography
          variant="caption"
          onClick={() => setIsReadMore(false)}
          sx={{ direction: selectedLanguage === 'ar' ? 'rtl' : 'ltr' }}
        >
          {getDescription()}
        </Typography>
      )}
    </>
  );
}
