import { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Box, Stack } from '@mui/material';

import Image from 'src/components/image';
import Label from 'src/components/label';
import generateID from 'src/utils/generate-id';
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
  const { staff, fsGetMeal, fsUpdateCart } = useAuthContext();
  const { businessProfile, branchInfo, selectedTable } = useStaffContext();
  const { activeOrders } = useAuthContext();
  const [selectedPortionIndex, _] = useState(0);
  const [loading, setLoading] = useState(false);
  const { cart, updateCount, docID, businessProfileID, branchID } = activeOrders.find(
    (order) => order.tableID === selectedTable.docID
  );

  const { data: mealInfo = {} } = useQuery({
    queryKey: ['meal', mealID, businessProfile.docID],
    queryFn: () => fsGetMeal(mealID, '200x200', businessProfile.docID),
  });

  const isChef = staff?.type === 'chef';
  const isMealActive = !branchInfo.disabledMeals?.includes(mealInfo.docID) && mealInfo.isActive;

  const onQuickAddByPortion = async (portion) => {
    setLoading(true);
    const updatedCart = cart;
    updatedCart.push({
      ...portion,
      mealID: mealInfo.docID,
      qty: 1,
      comment: '',
      id: generateID(8),
      update: updateCount,
    });
    fsUpdateCart({ orderID: docID, businessProfileID, branchID, cart: updatedCart });
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  if (!mealInfo?.docID) return null;

  return (
    <Box sx={{ bgcolor: 'background.paper', py: 0.5, borderRadius: 1 }}>
      <Stack direction="row" spacing={1} sx={{ position: 'relative' }} alignItems="center">
        <Image
          src={mealInfo.cover}
          sx={{
            borderRadius: 1,
            filter: `grayscale(${isMealActive ? '0' : '100'})`,
            width: '25%',
            height: '25%',
          }}
        />
        {mealInfo.isNew && (
          <Box sx={{ position: 'absolute', top: 2, left: 4, zIndex: 10 }}>
            <Label variant="filled" color="error" sx={{ fontSize: 10 }}>
              New
            </Label>
          </Box>
        )}
        <Stack direction="column" spacing={0.5} sx={{ width: 1, px: 1 }}>
          <TextMaxLine line={1} variant="overline">
            {mealInfo.title}
          </TextMaxLine>
          {isMealActive && (
            <Stack direction="row" spacing={1}>
              {mealInfo.portions.map((portion, i) => (
                <LoadingButton
                  loading={loading}
                  variant="soft"
                  color="warning"
                  key={`${portion.portionSize}-${i}`}
                  onClick={() => onQuickAddByPortion(portion)}
                  size="small"
                  sx={{ fontSize: { xs: 6, sm: 8, md: 10, lg: 12, xl: 14 }, px: 0.5 }}
                >
                  {portion.portionSize} - ${portion.price}
                </LoadingButton>
              ))}
            </Stack>
          )}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 1 }}
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
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
export default StaffMenuMealCard;
