import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Box, Stack, Button, useTheme, Typography } from '@mui/material';

import Label from 'src/components/label';
import Image from 'src/components/image';
import { useParams } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import TextMaxLine from 'src/components/text-max-line';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';
import DialogAddComment from 'src/sections/qr-menu/components/DialogAddComment';

function MealCard({ mealInfo, isMealActive }) {
  const theme = useTheme();
  const { userID } = useParams();
  const { cover, description, isNew, mealLabels, portions, title, translation, translationEdited } =
    mealInfo;
  const { orderSnapShot } = useAuthContext();
  const { user, selectedLanguage, menuInfo } = useQrMenuContext();
  const [selectedPortionIndex, setSelectedPortionIndex] = useState(0);
  const [isReadMore, setIsReadMore] = useState(false);
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
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
    <Box sx={{ py: 1 }}>
      <Stack direction="row" spacing={1} sx={{ position: 'relative' }}>
        <Stack direction="column" spacing={1} sx={{ pt: 2, maxWidth: '65%', flexGrow: 1 }}>
          <Title selectedLanguage={selectedLanguage} getTitle={getTitle} />

          <Description
            isReadMore={isReadMore}
            setIsReadMore={setIsReadMore}
            getDescription={getDescription}
            selectedLanguage={selectedLanguage}
          />
          {/* <Labels labels={labels} /> */}

          {isMealActive ? (
            <Stack
              direction="row"
              spacing={0}
              alignItems="center"
              justifyContent="space-between"
              sx={{ pr: 1 }}
            >
              <Typography
                variant="body1"
                sx={{ fontWeight: theme.typography.fontWeightBold, textWrap: 'nowrap' }}
              >{`${portions[0].price} ${user?.currency}`}</Typography>
              {menuInfo?.allowSelfOrder && orderSnapShot?.updateCount === 0 && (
                <Button variant="soft" color="success" onClick={() => setIsOpen(true)}>
                  Add
                </Button>
              )}
            </Stack>
          ) : (
            <Typography variant="h6" color="error">
              Out of Stock
            </Typography>
          )}
        </Stack>

        <Image
          src={cover}
          ratio="1/1"
          sx={{
            borderRadius: 2,
            filter: `grayscale(${isMealActive ? '0' : '100'})`,
            maxWidth: '35%',
            p: 0,
          }}
        />
        {isNew && (
          <Box sx={{ position: 'absolute', top: 4, right: 7 }}>
            <Label
              variant="filled"
              color="error"
              sx={{ fontSize: 12, p: 1, boxShadow: '2px 2px 0 0 #000', zIndex: 999 }}
            >
              New
            </Label>
          </Box>
        )}
      </Stack>
      {isOpen && (
        <DialogAddComment isOpen={isOpen} onClose={() => setIsOpen(false)} portions={portions} />
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
    <Typography
      variant="h6"
      sx={{ color: 'info.dark', direction: selectedLanguage === 'ar' ? 'rtl' : 'ltr' }}
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
          sx={{ direction: selectedLanguage === 'ar' ? 'rtl' : 'ltr' }}
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

/* <Select
        value={selectedPortionIndex}
        onChange={onPortionChange}
        input={<InputBase />}
        inputProps={{
          sx: { textTransform: 'capitalize' },
        }}
      >
        {portions.map((portion, index) => (
          <MenuItem key={index} value={index}>
            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
              <Typography
                variant="caption"
                sx={{ textWrap: 'pretty' }}
              >{`${portion.portionSize} - ${portion.gram}gram`}</Typography>
              <Label
                variant="soft"
                color={getPortionOrderCount(portion.portionSize) > 0 ? 'success' : 'default'}
              >{`x${getPortionOrderCount(portion.portionSize)}`}</Label>
            </Stack>
          </MenuItem>
        ))}
      </Select> */
