import PropTypes from 'prop-types';

import { Box, Stack, Divider, useTheme, Typography } from '@mui/material';

import MealCardSkeleton from 'src/sections/qr-menu/components/meal-card-skeleton';
import StaffMenuMealCard from 'src/sections/staff/food-menu/staff-menu-meal-card';

function StaffMenuSections({ sectionInfo }) {
  const { title, meals: sectionMeals, docID: sectionID } = sectionInfo;
  const theme = useTheme();

  if (sectionMeals.flatMap((mealItem) => mealItem.mealID) === undefined)
    return <MealCardSkeleton />;

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
        {sectionMeals
          .flatMap((mealItem) => mealItem.mealID)
          .map((mealID) => (
            <StaffMenuMealCard
              sectionInfo={sectionInfo}
              key={mealID}
              mealID={mealID}
              isMealActive={
                sectionMeals.find((sectionMeal) => sectionMeal.mealID === mealID)?.isActive
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
