import { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Box, Stack, Avatar, Divider, Typography } from '@mui/material';

import Label from 'src/components/label';
import { useAuthContext } from 'src/auth/hooks';
import TextMaxLine from 'src/components/text-max-line';
import { useStaffContext } from 'src/sections/staff/context/staff-context';
import ToggleMealStatus from 'src/sections/staff/food-menu/toogle-meal-status';
import StaffMenuAddMealToCart from 'src/sections/staff/food-menu/staff-menu-add-meal-to-cart';

StaffMenuMealCard.propTypes = {
  mealID: PropTypes.string,
  isMealActive: PropTypes.bool,
  sectionInfo: PropTypes.object,
};

function StaffMenuMealCard({ mealID, isMealActive, sectionInfo }) {
  const { staff, fsGetMeal } = useAuthContext();
  const { businessProfile, branchInfo, selectedTable } = useStaffContext();
  const [selectedPortionIndex, _] = useState(0);
  const [isReadMore, setIsReadMore] = useState(false);

  const { data: mealInfo = {} } = useQuery({
    queryKey: ['meal', mealID, businessProfile.docID],
    queryFn: () => fsGetMeal(mealID, '200x200', businessProfile.docID),
  });

  const isChef = staff?.type === 'chef';

  if (!mealInfo?.docID) return null;

  return (
    <Box sx={{ bgcolor: 'background.paper', px: 1, pt: 1, position: 'relative', width: 1 }}>
      {mealInfo.isNew && (
        <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
          <Label variant="filled" color="error" sx={{ fontSize: 10 }}>
            New
          </Label>
        </Box>
      )}
      <Stack direction="row" spacing={1} sx={{ px: 1 }}>
        <Avatar
          src={mealInfo.cover}
          sx={{
            borderRadius: 1,
            filter: `grayscale(${isMealActive ? '0' : '100'})`,
            width: 60,
            height: 60,
          }}
        />
        <Stack direction="column" spacing={0} sx={{ width: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {mealInfo.title}
            </Typography>
            <Typography variant="overline">{`${mealInfo.portions[selectedPortionIndex].price} ${branchInfo.currency}`}</Typography>
          </Stack>
          {!isReadMore && (
            <TextMaxLine line={2} variant="caption" onClick={() => setIsReadMore(true)}>
              {mealInfo.description}
            </TextMaxLine>
          )}
          {isReadMore && (
            <Typography variant="caption" onClick={() => setIsReadMore(false)}>
              {mealInfo.description}
            </Typography>
          )}
        </Stack>
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="flex-end"
        divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
      >
        {isMealActive && !isChef && (
          <StaffMenuAddMealToCart
            portion={mealInfo.portions[selectedPortionIndex]}
            mealInfo={mealInfo}
            selectedTableID={selectedTable.docID}
          />
        )}
        <ToggleMealStatus
          mealInfo={mealInfo}
          isMealActive={isMealActive}
          sectionInfo={sectionInfo}
        />
      </Stack>
    </Box>
  );
}
export default StaffMenuMealCard;
