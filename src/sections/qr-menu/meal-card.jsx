import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

import { Box, Stack, useTheme, Typography, IconButton } from '@mui/material';

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
  const { orderSnapShot, businessProfile } = useAuthContext();
  const { branchInfo, selectedLanguage, tableInfo } = useQrMenuContext();
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
      <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
        <Box
          sx={{
            bgcolor: 'info.main',
            width: count === 0 ? 0 : 8,
            height: 100,
            borderRadius: 3,
            transition: 'width 0.3s ease-in-out',
          }}
        />
        <Stack direction="column" spacing={0} sx={{ width: '70%', flexGrow: 1 }}>
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <Title selectedLanguage={selectedLanguage} getTitle={getTitle} />
            <Stack direction="row" spacing={1} alignItems="center">
              <Stack direction="row" spacing={0.5}>
                <Typography variant="h4">{portions[0].price}</Typography>
                <Typography variant="caption" sx={{ fontWeight: theme.typography.fontWeightLight }}>
                  {branchInfo?.currency}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Description
            isReadMore={isReadMore}
            setIsReadMore={setIsReadMore}
            getDescription={getDescription}
            selectedLanguage={selectedLanguage}
          />
        </Stack>
        <Box
          sx={{
            position: 'relative',
            width: '40%',
            height: 1,
            textAlign: 'center',
          }}
        >
          <Image
            src={cover}
            ratio="1/1"
            sx={{
              borderRadius: 1,
              border: `dashed 1px ${theme.palette.divider}`,
              filter: `grayscale(${isMealActive ? '0' : '100'})`,
              maxWidth: '85%',
              p: 0,
            }}
            onClick={() => allowAddToCart && setIsOpen(true)}
          />
          {allowAddToCart && (
            <>
              <IconButton
                variant="contained"
                color="success"
                sx={{
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'common.white',
                  p: 0.1,
                  // transition: 'left 0.3s ease-in-out', // Add smooth transition
                }}
                onClick={() => setIsOpen(true)}
              >
                <Iconify icon="carbon:add-filled" sx={{ width: 24, height: 24 }} />
              </IconButton>
              <Box
                sx={{
                  position: 'absolute',
                  top: -15,
                  left: '10%',
                  transform: 'translateX(-50%)',
                  borderRadius: '50%',
                  py: 0.3,
                  px: 1.2,
                  bgcolor: 'info.main',
                  color: '#FFFFFF',
                  border: 'solid 4px #FFF',
                  fontWeight: 700,
                  fontSize: '1rem',
                  visibility: count === 0 ? 'hidden' : 'visible',
                  transition: 'visibility 0.3s ease-in-out',
                }}
              >
                {count}
              </Box>
            </>
          )}
          {isNew && (
            <Box sx={{ position: 'absolute', top: 4, right: 1 }}>
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
                bottom: 0,
                left: '50%',
                transform: 'translate(-50%, 30%)',
              }}
            >
              Out of Stock
            </Label>
          )}
        </Box>
      </Stack>
      {isOpen && (
        <AddMealDrawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          mealInfo={mealInfo}
          tableID={tableID}
          orderSnapShot={orderSnapShot}
          branchInfo={branchInfo}
          mealTitle={getTitle()}
        />
      )}
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
