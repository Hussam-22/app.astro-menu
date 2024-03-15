import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Box, Stack, Divider, useTheme, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import MealCardSkeleton from 'src/sections/qr-menu/components/meal-card-skeleton';
import StaffMenuMealCard from 'src/sections/staff/food-menu/staff-menu-meal-card';

function StaffMenuSections({ sectionInfo }) {
  const { userID } = useParams();
  const { title, meals: sectionMeals, docID: sectionID } = sectionInfo;
  const { fsGetSectionMeals } = useAuthContext();
  const theme = useTheme();

  const { data: meals = [], isLoading } = useQuery({
    queryKey: ['sectionMeals', userID, sectionID],
    queryFn: () =>
      fsGetSectionMeals(
        userID,
        sectionMeals.flatMap((meal) => meal.mealID),
        '200x200'
      ),
  });

  if (isLoading) return <MealCardSkeleton />;

  return (
    <Box>
      <Typography
        // variant="caption"
        id={sectionID}
        sx={{
          fontWeight: theme.typography.fontWeightBold,
        }}
      >
        {title}
      </Typography>
      <Stack
        direction="column"
        // sx={{ borderRadius: 1, border: `dashed 1px ${theme.palette.divider}` }}
        divider={<Divider sx={{ borderStyle: 'dashed', mx: 2 }} />}
      >
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
