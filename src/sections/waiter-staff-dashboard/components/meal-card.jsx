import { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Box, Stack, Avatar, Divider, Typography } from '@mui/material';

import Label from 'src/components/label';
import { useAuthContext } from 'src/auth/hooks';
import TextMaxLine from 'src/components/text-max-line';
import AddMealButton from 'src/sections/waiter-staff-dashboard/components/add-meal-button';
import { useStaffContext } from 'src/sections/waiter-staff-dashboard/context/staff-context';
import ToggleMealStatus from 'src/sections/waiter-staff-dashboard/components/toggle-meal-status-button';

StaffMenuMealCard.propTypes = {
  mealID: PropTypes.string,
  sectionInfo: PropTypes.object,
};

function StaffMenuMealCard({ mealID, sectionInfo }) {
  const { staff, fsGetMeal } = useAuthContext();
  const { businessProfile, branchInfo, selectedTable } = useStaffContext();
  const [selectedPortionIndex, _] = useState(0);
  const [isReadMore, setIsReadMore] = useState(false);

  const { data: mealInfo = {} } = useQuery({
    queryKey: ['meal', mealID, businessProfile.docID],
    queryFn: () => fsGetMeal(mealID, '200x200', businessProfile.docID),
  });

  const isChef = staff?.type === 'chef';
  const isMealActive = !branchInfo.disabledMeals?.includes(mealInfo.docID) && mealInfo.isActive;

  if (!mealInfo?.docID) return null;

  return (
    <Box sx={{ bgcolor: 'background.paper', py: 1, px: 2, width: 1, borderRadius: 1 }}>
      <Stack direction="row" spacing={1} sx={{ position: 'relative' }} alignItems="center">
        <Avatar
          src={mealInfo.cover}
          sx={{
            borderRadius: 1,
            filter: `grayscale(${isMealActive ? '0' : '100'})`,
            width: 100,
            height: 100,
          }}
        />
        {mealInfo.isNew && (
          <Box sx={{ position: 'absolute', top: 2, left: 4, zIndex: 10 }}>
            <Label variant="filled" color="error" sx={{ fontSize: 10 }}>
              New
            </Label>
          </Box>
        )}
        <Stack direction="column" sx={{ width: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              {mealInfo.title}
            </Typography>
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
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="flex-end"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            sx={{ px: 2 }}
          >
            <ToggleMealStatus
              mealInfo={mealInfo}
              isMealActive={isMealActive}
              sectionInfo={sectionInfo}
            />
            {!isChef && (
              <AddMealButton
                portion={mealInfo.portions[selectedPortionIndex]}
                mealInfo={mealInfo}
                selectedTableID={selectedTable.docID}
                isActive={isMealActive}
              />
            )}
            <Typography variant="h6">
              {`${mealInfo.portions[selectedPortionIndex].price} `}
              <span style={{ fontSize: 12 }}>{branchInfo.currency}</span>
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
export default StaffMenuMealCard;
