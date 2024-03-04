import { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Stack, Switch, useTheme, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';

function ChefDisableMeal({ mealInfo, isMealActive, sectionInfo }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { fsUpdateSection } = useAuthContext();
  const [isActive, setIsActive] = useState(isMealActive);

  const { mutate, isPending, error, isError, status } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      queryClient.invalidateQueries([`sectionMeals`, mealInfo.userID]);
    },
  });

  const onMealStatusChange = () => {
    const { meals: sectionMealsInfo, menuID } = sectionInfo;
    const index = sectionMealsInfo.findIndex((meal) => meal.mealID === mealInfo.docID);
    const updatedMeals = sectionMealsInfo;
    updatedMeals[index].isActive = !sectionMealsInfo[index].isActive;

    mutate(() => fsUpdateSection(menuID, sectionInfo.docID, { meals: updatedMeals }));
  };

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography
        sx={{
          color: isMealActive ? 'success.main' : 'error.main',
          fontWeight: theme.typography.fontWeightBold,
        }}
      >
        {isMealActive ? 'Available' : 'Out of Stock'}
      </Typography>
      {mealInfo.isActive && <Switch defaultChecked={isActive} onChange={onMealStatusChange} />}
    </Stack>
  );
}
export default ChefDisableMeal;
ChefDisableMeal.propTypes = {
  mealInfo: PropTypes.object,
  isMealActive: PropTypes.bool,
  sectionInfo: PropTypes.object,
};
