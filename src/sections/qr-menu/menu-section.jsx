import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Stack, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import MealCard from 'src/sections/qr-menu/meal-card';

function MenuSection({ sectionInfo }) {
  // const {userID} = useParams()
  const userID = 'n2LrTyRkktYlddyljHUPsodtpsf1';
  const { title, meals: sectionMeals } = sectionInfo;

  const { fsGetSectionMeals } = useAuthContext();

  const {
    data: meals = [],
    isFetching: isUserFetching,
    error,
  } = useQuery({
    queryKey: ['sectionMeals', userID, sectionMeals],
    queryFn: () => fsGetSectionMeals(userID, sectionMeals),
  });

  // hide sections without meals
  if (meals.length === 0) return null;

  return (
    <Stack spacing={2} sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 1 }}>
      <Typography variant="h2">{title}</Typography>
      <Stack direction="column" spacing={2}>
        {meals.map((meal) => (
          <MealCard key={meal.docID} mealInfo={meal} />
        ))}
      </Stack>
    </Stack>
  );
}
export default MenuSection;

MenuSection.propTypes = {
  sectionInfo: PropTypes.shape({
    title: PropTypes.string,
    meals: PropTypes.array,
  }),
};
