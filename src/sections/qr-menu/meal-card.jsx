import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

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
  const { tableID } = useParams();
  const { cover, description, isNew, portions, title, translation, translationEdited } = mealInfo;
  const { orderSnapShot } = useAuthContext();
  const { branchInfo, selectedLanguage, menuInfo } = useQrMenuContext();
  const [isReadMore, setIsReadMore] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  console.log(branchInfo);

  const getTitle = () => {
    if (selectedLanguage === branchInfo.defaultLanguage) return title;
    return translationEdited?.[selectedLanguage]?.title
      ? translationEdited?.[selectedLanguage]?.title
      : translation?.[selectedLanguage]?.title;
  };

  const getDescription = () => {
    if (selectedLanguage === branchInfo.defaultLanguage) return description;
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

  return (
    <Box sx={{ py: 1 }}>
      <Stack direction="row" spacing={1}>
        <Stack direction="column" spacing={1} sx={{ pt: 2, width: '70%', flexGrow: 1 }}>
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <Title selectedLanguage={selectedLanguage} getTitle={getTitle} />
            <Stack direction="row" spacing={1}>
              <Typography variant="h4">{portions[0].price}</Typography>
              <Typography variant="caption" sx={{ fontWeight: theme.typography.fontWeightLight }}>
                {branchInfo?.currency}
              </Typography>
            </Stack>
          </Stack>

          <Description
            isReadMore={isReadMore}
            setIsReadMore={setIsReadMore}
            getDescription={getDescription}
            selectedLanguage={selectedLanguage}
          />

          {isMealActive && branchInfo?.allowSelfOrder && orderSnapShot?.updateCount === 0 && (
            <Button
              variant="soft"
              color="success"
              sx={{ alignSelf: 'flex-start' }}
              onClick={() => setIsOpen(true)}
            >
              Add
              {count !== 0 && (
                <Box component="span" sx={{ color: 'common.black', pl: 1 }}>{`| x${count}`}</Box>
              )}
            </Button>
          )}
        </Stack>
        <Box
          sx={{
            position: 'relative',
            width: '30%',
            height: 1,
            textAlign: 'center',
          }}
        >
          <Image
            src={cover}
            ratio="1/1"
            sx={{
              borderRadius: 1,
              filter: `grayscale(${isMealActive ? '0' : '100'})`,
              maxWidth: '85%',
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
        <DialogAddComment
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          mealInfo={mealInfo}
          tableID={tableID}
          orderSnapShot={orderSnapShot}
          branchInfo={branchInfo}
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
