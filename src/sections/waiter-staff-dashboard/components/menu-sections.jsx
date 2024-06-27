import PropTypes from 'prop-types';

import { Box, Stack, Divider, useTheme, Typography } from '@mui/material';

import MealCardSkeleton from 'src/sections/qr-menu/components/meal-card-skeleton';
import StaffMenuMealCard from 'src/sections/waiter-staff-dashboard/components/meal-card';

function StaffMenuSections({ sectionInfo }) {
  const { title, meals: sectionMeals, docID: sectionID } = sectionInfo;
  const theme = useTheme();

  if (sectionMeals.map((mealItem) => mealItem) === undefined) return <MealCardSkeleton />;

  return (
    <Box>
      <Typography
        id={sectionID}
        sx={{
          fontWeight: theme.typography.fontWeightBold,
        }}
      >
        {title}
      </Typography>
      <Stack direction="column" divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
        {sectionMeals.map((mealID) => (
          <StaffMenuMealCard sectionInfo={sectionInfo} key={mealID} mealID={mealID} />
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
