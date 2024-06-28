import PropTypes from 'prop-types';
import { useQueries } from '@tanstack/react-query';

import { Box, Stack, Divider, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import MealCardSkeleton from 'src/sections/qr-menu/components/meal-card-skeleton';
import StaffMenuMealCard from 'src/sections/waiter-staff-dashboard/components/meal-card';
import { useStaffContext } from 'src/sections/waiter-staff-dashboard/context/staff-context';

function StaffMenuSections({ sectionInfo }) {
  const { title, meals: sectionMeals, docID: sectionID } = sectionInfo;
  const { labels, businessProfile } = useStaffContext();
  const { fsGetMeal } = useAuthContext();

  const mealsData = useQueries({
    queries: sectionMeals.map((mealID) => ({
      queryKey: ['meal', mealID, businessProfile.docID],
      queryFn: () => fsGetMeal(mealID, '800x800', businessProfile.docID),
      staleTime: Infinity,
    })),
  });

  const filteredMeals =
    labels.length === 0
      ? mealsData
      : mealsData.filter((meal) =>
          meal.data.mealLabels.some((mealLabelID) => labels.includes(mealLabelID))
        );

  // hide sections without meals
  if (filteredMeals.length === 0) return null;

  if (sectionMeals.map((mealItem) => mealItem) === undefined) return <MealCardSkeleton />;

  return (
    <Box sx={{ px: 2 }} id={sectionInfo.docID}>
      <Typography id={sectionID} variant="h5">
        {title}
      </Typography>
      <Stack direction="column" divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
        {filteredMeals
          .filter((meal) => meal.data?.isActive)
          .map((meal) => (
            <StaffMenuMealCard
              sectionInfo={sectionInfo}
              key={meal.data.docID}
              mealID={meal.data.docID}
            />
          ))}
      </Stack>
    </Box>
  );
}
export default StaffMenuSections;

StaffMenuSections.propTypes = {
  sectionInfo: PropTypes.shape({
    title: PropTypes.string,
    meals: PropTypes.array,
    docID: PropTypes.string,
    translation: PropTypes.object,
    translationEdited: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  }),
};
