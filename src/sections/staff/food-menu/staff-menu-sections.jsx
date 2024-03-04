import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Box, Stack, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import MealCardSkeleton from 'src/sections/qr-menu/components/meal-card-skeleton';
import StaffMenuMealCard from 'src/sections/staff/food-menu/staff-menu-meal-card';

function StaffMenuSections({ sectionInfo }) {
  const { userID } = useParams();
  const { title, meals: sectionMeals, docID: sectionID } = sectionInfo;
  const { fsGetSectionMeals, staff } = useAuthContext();

  const isChef = staff?.type === 'chef';

  const { data: meals = [], isLoading } = useQuery({
    queryKey: ['sectionMeals', userID, sectionID],
    queryFn: () =>
      fsGetSectionMeals(
        userID,
        sectionMeals.flatMap((meal) => meal.mealID)
      ),
  });

  if (isLoading) return <MealCardSkeleton />;

  return (
    <Box>
      <Typography
        // variant="caption"
        id={sectionID}
        sx={{
          bgcolor: 'common.black',
          color: 'common.white',
          borderRadius: 1,
          px: 2,
          py: 0.5,
          mb: 2,
        }}
      >
        {title}
      </Typography>
      <Stack spacing={2}>
        <Stack direction="column" spacing={2}>
          {meals.map((meal) => (
            <StaffMenuMealCard
              sectionInfo={sectionInfo}
              key={meal.docID}
              mealInfo={meal}
              isMealActive={
                sectionMeals.find((sectionMeal) => sectionMeal.mealID === meal.docID).isActive &&
                meal.isActive
              }
            />
          ))}
        </Stack>
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
