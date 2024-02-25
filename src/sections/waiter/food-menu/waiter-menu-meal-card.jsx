import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useState, useCallback } from 'react';

import {
  Box,
  Card,
  Stack,
  Avatar,
  Select,
  Divider,
  MenuItem,
  InputBase,
  Typography,
} from '@mui/material';

import Label from 'src/components/label';
import { useAuthContext } from 'src/auth/hooks';
import TextMaxLine from 'src/components/text-max-line';
import AddMealToCart from 'src/sections/qr-menu/add-meal-to-cart';
import { useWaiterContext } from 'src/sections/waiter/context/waiter-context';

function WaiterMenuMealCard({ mealInfo, isMealActive }) {
  const { userID } = useParams();
  const { cover, docID, description, isNew, mealLabels, portions, title } = mealInfo;
  const { orderSnapShot } = useAuthContext();
  const { user } = useWaiterContext();
  const [selectedPortionIndex, setSelectedPortionIndex] = useState(0);
  const [isReadMore, setIsReadMore] = useState(false);

  const onPortionChange = (e) => {
    setSelectedPortionIndex(e.target.value);
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
    <Card sx={{ bgcolor: 'background.paper', p: 1, position: 'relative' }}>
      {isNew && (
        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
          <Label variant="filled" color="error" sx={{ fontSize: 10 }}>
            New
          </Label>
        </Box>
      )}
      <Stack direction="column" spacing={1} sx={{ px: 1 }}>
        <Typography variant="h6">{title}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            src={cover}
            sx={{ borderRadius: 1, filter: `grayscale(${isMealActive ? '0' : '100'})` }}
          />
          {!isReadMore && (
            <TextMaxLine line={2} variant="caption" onClick={() => setIsReadMore(true)}>
              {description}
            </TextMaxLine>
          )}
          {isReadMore && (
            <Typography variant="caption" onClick={() => setIsReadMore(false)}>
              {description}
            </Typography>
          )}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />
        {!isMealActive && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: 'text.disabled' }}>
              Out of Stock
            </Typography>
          </Box>
        )}
        {isMealActive && (
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Select
              value={selectedPortionIndex}
              onChange={onPortionChange}
              input={<InputBase sx={{ pl: 2, borderRadius: 0.5 }} />}
              inputProps={{
                sx: { textTransform: 'capitalize' },
              }}
            >
              {portions.map((portion, index) => (
                <MenuItem key={index} value={index}>
                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="caption">{`${portion.portionSize} - ${portion.gram}gram`}</Typography>
                    <Label
                      variant="soft"
                      color={getPortionOrderCount(portion.portionSize) > 0 ? 'success' : 'default'}
                    >{`x${getPortionOrderCount(portion.portionSize)}`}</Label>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
            <Stack direction="row" spacing={1} alignItems="center">
              <AddMealToCart portion={portions[selectedPortionIndex]} mealInfo={mealInfo} />
              <Typography
                variant="h6"
                sx={{ pr: 2 }}
              >{`${portions[selectedPortionIndex].price} ${user?.currency}`}</Typography>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
export default WaiterMenuMealCard;
WaiterMenuMealCard.propTypes = {
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
