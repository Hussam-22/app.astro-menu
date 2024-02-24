import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Box, Stack, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import MealCardSkeleton from 'src/sections/qr-menu/components/meal-card-skeleton';
import WaiterMenuMealCard from 'src/sections/waiter/food-menu/waiter-menu-meal-card';

function WaiterMenuSections({ sectionInfo }) {
  const { userID } = useParams();
  const { title, meals: sectionMeals, docID: sectionID } = sectionInfo;
  const { fsGetSectionMeals } = useAuthContext();

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
          {meals
            .filter((meal) => meal.isActive)
            .map((meal) => (
              <WaiterMenuMealCard
                key={meal.docID}
                mealInfo={meal}
                isMealActive={
                  sectionMeals.find((sectionMeal) => sectionMeal.mealID === meal.docID).isActive
                }
              />
            ))}
        </Stack>
      </Stack>
    </Box>
  );
}
export default WaiterMenuSections;

WaiterMenuSections.propTypes = {
  sectionInfo: PropTypes.shape({
    title: PropTypes.string,
    meals: PropTypes.array,
    docID: PropTypes.string,
    translation: PropTypes.object,
    translationEdited: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  }),
};
