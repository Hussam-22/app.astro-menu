import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

import { Box, Stack, useTheme, IconButton, Typography } from '@mui/material';

import Image from 'src/components/image';
import Label from 'src/components/label';
import { useParams } from 'src/routes/hook';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import TextMaxLine from 'src/components/text-max-line';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';
import DialogAddComment from 'src/sections/qr-menu/components/DialogAddComment';

function MealCard({ mealInfo, isMealActive }) {
  const theme = useTheme();
  const { tableID } = useParams();
  const { cover, description, isNew, portions, title, translation, translationEdited } = mealInfo;
  const { orderSnapShot } = useAuthContext();
  const { branchInfo, selectedLanguage, tableInfo } = useQrMenuContext();
  const [isReadMore, setIsReadMore] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
      <Stack direction="row" spacing={1} alignItems="center">
        {count !== 0 && (
          <Box sx={{ bgcolor: 'success.main', width: 5, height: 100, borderRadius: 5 }} />
        )}
        <Stack direction="column" spacing={0} sx={{ width: '70%', flexGrow: 1 }}>
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <Title selectedLanguage={selectedLanguage} getTitle={getTitle} />
            <Stack direction="row" spacing={1} alignItems="center">
              {count !== 0 && (
                <Box
                  sx={{
                    borderRadius: 1,
                    bgcolor: 'success.lighter',
                    color: 'common.black',
                    px: 0.75,
                  }}
                  onClick={() => setIsOpen(true)}
                >
                  <Typography variant="overline">x{count}</Typography>
                </Box>
              )}
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
              border: `dashed 1px ${theme.palette.divider}`,
              filter: `grayscale(${isMealActive ? '0' : '100'})`,
              maxWidth: '85%',
              p: 0,
            }}
          />
          {isMealActive &&
            branchInfo?.allowSelfOrder &&
            tableInfo.index !== 0 &&
            orderSnapShot?.updateCount === 0 && (
              <IconButton
                variant="contained"
                color="success"
                sx={{
                  position: 'absolute',
                  bottom: -15,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'common.white',
                  p: 0.25,
                }}
                onClick={() => setIsOpen(true)}
              >
                <Iconify icon="carbon:add-filled" sx={{ width: 32, height: 32 }} />
              </IconButton>
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
        <DialogAddComment
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
          sx={{ direction: selectedLanguage === 'ar' ? 'rtl' : 'ltr', color: 'grey.600' }}
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
