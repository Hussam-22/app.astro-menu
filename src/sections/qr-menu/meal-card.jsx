import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

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
  const { branchInfo, selectedLanguage, tableInfo, businessProfile } = useQrMenuContext();
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
    !isMenuOnly;

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 0.5 }}>
        <Box
          sx={{
            bgcolor: 'warning.main',
            width: count === 0 ? 0 : 8,
            height: 100,
            borderRadius: 3,
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
          <Stack direction="row" spacing={0.5} alignSelf="end">
            <Typography variant="h4">{portions[0].price}</Typography>
            <Typography variant="caption" sx={{ fontWeight: theme.typography.fontWeightLight }}>
              {branchInfo?.currency}
            </Typography>
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
              filter: `grayscale(${isMealActive ? '0' : '100'})`,
            }}
            onClick={() => allowAddToCart && setIsOpen(true)}
          />
          {allowAddToCart && (
            <Button
              size="small"
              sx={{
                color: 'rgba(0, 0, 0, 1)',
                position: 'absolute',
                bottom: 5,
                left: '50%',
                transform: 'translateX(-50%)',
                px: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
              }}
              onClick={() => setIsOpen(true)}
              startIcon={<Iconify icon="carbon:add-filled" sx={{ width: 24, height: 24 }} />}
            >
              {count === 0 ? 'Add' : count}
            </Button>
          )}
          {isNew && (
            <Box sx={{ position: 'absolute', top: 10, left: -15 }}>
              <Label
                variant="filled"
                color="error"
                sx={{ fontSize: 12, p: 1, boxShadow: '2px 2px 0 0 #000', zIndex: 999 }}
              >
                New
              </Label>
            </Box>
          )}

          {!isMealActive && (
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
              Out of Stock
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
        // color: 'info.dark',
        direction: selectedLanguage === 'ar' ? 'rtl' : 'ltr',
        lineHeight: 1,
        fontWeight: 700,
      }}
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
