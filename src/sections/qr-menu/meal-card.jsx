import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Box, Card, Stack, Divider, Typography } from '@mui/material';

import Label from 'src/components/label';
import Image from 'src/components/image';
import { useParams } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import TextMaxLine from 'src/components/text-max-line';
import AddMealToCart from 'src/sections/qr-menu/add-meal-to-cart';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

function MealCard({ mealInfo, isMealActive }) {
  const { userID } = useParams();
  const {
    cover,
    docID,
    description,
    isNew,
    mealLabels,
    portions,
    title,
    translation,
    translationEdited,
  } = mealInfo;
  const { orderSnapShot } = useAuthContext();
  const {
    user,
    selectedLanguage,
    menuInfo: { allowSelfOrder },
  } = useQrMenuContext();
  const [selectedPortionIndex, setSelectedPortionIndex] = useState(0);
  const [isReadMore, setIsReadMore] = useState(false);
  const queryClient = useQueryClient();
  const cachedMealLabels = queryClient.getQueryData(['mealsLabel', userID]) || [];

  const labels = cachedMealLabels.filter((cachedMealLabel) =>
    mealLabels.includes(cachedMealLabel.docID)
  );

  const onPortionChange = (e) => {
    setSelectedPortionIndex(e.target.value);
  };

  const getTitle = () => {
    if (selectedLanguage === user.defaultLanguage) return title;
    return translationEdited?.[selectedLanguage]?.title
      ? translationEdited?.[selectedLanguage]?.title
      : translation?.[selectedLanguage]?.title;
  };

  const getDescription = () => {
    if (selectedLanguage === user.defaultLanguage) return description;
    return translationEdited?.[selectedLanguage]?.desc
      ? translationEdited?.[selectedLanguage]?.desc
      : translation?.[selectedLanguage]?.desc;
  };

  const getPortionOrderCount = useCallback(
    (portionSize) => {
      const { cart } = orderSnapShot;
      if (cart && Array.isArray(cart)) {
        const qty = cart.filter(
          (cartPortion) =>
            cartPortion.mealID === mealInfo.docID && cartPortion.portionSize === portionSize
        ).length;
        return qty;
      }
      return 0;
    },
    [mealInfo.docID, orderSnapShot]
  );

  return (
    <Card sx={{ bgcolor: 'background.default', p: 0, boxShadow: 10 }}>
      <Stack direction="column" spacing={1}>
        <Box sx={{ position: 'relative' }}>
          <Image
            src={cover}
            ratio="16/9"
            sx={{ borderRadius: 0, filter: `grayscale(${isMealActive ? '0' : '100'})` }}
          />
          {isNew && (
            <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
              <Label
                variant="filled"
                color="error"
                sx={{ fontSize: 20, p: 2, boxShadow: '5px 5px 0 0 #000' }}
              >
                New
              </Label>
            </Box>
          )}
        </Box>
        <Title selectedLanguage={selectedLanguage} getTitle={getTitle} />
        <Labels labels={labels} />
        <Description
          isReadMore={isReadMore}
          setIsReadMore={setIsReadMore}
          getDescription={getDescription}
          selectedLanguage={selectedLanguage}
        />
        <Divider />

        <Portions
          portions={portions}
          selectedPortionIndex={selectedPortionIndex}
          onPortionChange={onPortionChange}
          getPortionOrderCount={getPortionOrderCount}
          isMealActive={isMealActive}
          mealInfo={mealInfo}
        />
      </Stack>
    </Card>
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
  }),
  isMealActive: PropTypes.bool,
};
// ----------------------------------------------------------------------------
Title.propTypes = {
  getTitle: PropTypes.func,
  selectedLanguage: PropTypes.string,
};
function Title({ selectedLanguage, getTitle }) {
  return (
    <Typography variant="h4" sx={{ px: 2, direction: selectedLanguage === 'ar' ? 'rtl' : 'ltr' }}>
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
          variant="body2"
          onClick={() => setIsReadMore(true)}
          sx={{ px: 2, direction: selectedLanguage === 'ar' ? 'rtl' : 'ltr' }}
        >
          {getDescription()}
        </TextMaxLine>
      )}
      {isReadMore && (
        <Typography
          variant="body2"
          onClick={() => setIsReadMore(false)}
          sx={{ px: 2, direction: selectedLanguage === 'ar' ? 'rtl' : 'ltr' }}
        >
          {getDescription()}
        </Typography>
      )}
    </>
  );
}

// ----------------------------------------------------------------------------
Labels.propTypes = {
  labels: PropTypes.array,
};

function Labels({ labels }) {
  return (
    <Stack direction="row" spacing={1} sx={{ px: 2 }}>
      {labels.map((label) => (
        <Label variant="soft" color="default" key={label.docID} sx={{ fontSize: 10 }}>
          #{label.title}
        </Label>
      ))}
    </Stack>
  );
}

// ----------------------------------------------------------------------------

Portions.propTypes = {
  selectedPortionIndex: PropTypes.number,
  onPortionChange: PropTypes.func,
  portions: PropTypes.array,
  getPortionOrderCount: PropTypes.func,
  isMealActive: PropTypes.bool,
  mealInfo: PropTypes.object,
};

function Portions({
  selectedPortionIndex,
  onPortionChange,
  portions,
  getPortionOrderCount,
  isMealActive,
  mealInfo,
}) {
  const {
    user,
    menuInfo: { allowSelfOrder },
  } = useQrMenuContext();
  const {
    orderSnapShot: { updateCount },
  } = useAuthContext();
  return (
    <>
      {!isMealActive && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'text.disabled' }}>
            Out of Stock
          </Typography>
        </Box>
      )}

      {isMealActive && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
        >
          <Portions
            portions={portions}
            selectedPortionIndex={selectedPortionIndex}
            onPortionChange={onPortionChange}
            getPortionOrderCount={getPortionOrderCount}
          />

          <Stack direction="row" spacing={1} alignItems="center">
            {allowSelfOrder && updateCount === 0 && (
              <AddMealToCart portion={portions[selectedPortionIndex]} mealInfo={mealInfo} />
            )}
            <Typography
              variant="h6"
              sx={{ pr: 2 }}
            >{`${portions[selectedPortionIndex].price} ${user?.currency}`}</Typography>
          </Stack>
        </Stack>
      )}
    </>
  );
}
