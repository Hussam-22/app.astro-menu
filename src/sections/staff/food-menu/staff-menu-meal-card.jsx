import { useState } from 'react';
import PropTypes from 'prop-types';

import { Box, Stack, Avatar, Typography } from '@mui/material';

import Label from 'src/components/label';
import { useAuthContext } from 'src/auth/hooks';
import TextMaxLine from 'src/components/text-max-line';
import { useStaffContext } from 'src/sections/staff/context/staff-context';
import ChefDisableMeal from 'src/sections/staff/food-menu/chef-disable-meal';
import StaffMenuAddMealToCart from 'src/sections/staff/food-menu/staff-menu-add-meal-to-cart';

function StaffMenuMealCard({ mealInfo, isMealActive, sectionInfo }) {
  const { cover, description, isNew, portions, title } = mealInfo;
  const { activeOrders, staff } = useAuthContext();
  const { user, selectedTable } = useStaffContext();
  const [selectedPortionIndex, setSelectedPortionIndex] = useState(0);
  const [isReadMore, setIsReadMore] = useState(false);

  const isChef = staff?.type === 'chef';

  return (
    <Box sx={{ bgcolor: 'background.paper', px: 1, py: 2, position: 'relative', width: 1 }}>
      {isNew && (
        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
          <Label variant="filled" color="error" sx={{ fontSize: 10 }}>
            New
          </Label>
        </Box>
      )}
      <Stack direction="row" spacing={1} sx={{ px: 1 }}>
        <Avatar
          src={cover}
          sx={{
            borderRadius: 1,
            filter: `grayscale(${isMealActive ? '0' : '100'})`,
            width: 60,
            height: 60,
          }}
        />
        <Stack direction="column" spacing={0}>
          <Typography variant="h6">{title}</Typography>
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
      </Stack>
      {isChef && (
        <ChefDisableMeal
          mealInfo={mealInfo}
          isMealActive={isMealActive}
          sectionInfo={sectionInfo}
        />
      )}
      {isMealActive && !isChef && (
        <Stack direction="row" spacing={0} alignItems="center" justifyContent="center">
          <StaffMenuAddMealToCart
            portion={portions[selectedPortionIndex]}
            mealInfo={mealInfo}
            selectedTableID={selectedTable.docID}
          />
          <Typography variant="h6">{`${portions[selectedPortionIndex].price} ${user?.currency}`}</Typography>
        </Stack>
      )}
      {!isMealActive && !isChef && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'text.disabled' }}>
            Out of Stock
          </Typography>
        </Box>
      )}
    </Box>
  );
}
export default StaffMenuMealCard;
StaffMenuMealCard.propTypes = {
  mealInfo: PropTypes.shape({
    isActive: PropTypes.bool,
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
  sectionInfo: PropTypes.object,
};
