import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Box, Stack, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import MealCard from 'src/sections/qr-menu/meal-card';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';
import MealCardSkeleton from 'src/sections/qr-menu/components/meal-card-skeleton';

function MenuSection({ sectionInfo }) {
  const { userID } = useParams();
  const {
    title,
    meals: sectionMeals,
    docID: sectionID,
    translationEdited,
    translation,
  } = sectionInfo;
  const { fsGetSectionMeals } = useAuthContext();
  const { labels, loading, selectedLanguage, user } = useQrMenuContext();

  const getTitle = () => {
    if (selectedLanguage === user.defaultLanguage) return title;
    return translationEdited?.[selectedLanguage]?.title
      ? translationEdited?.[selectedLanguage]?.title
      : translation?.[selectedLanguage]?.title;
  };

  const { data: meals = [] } = useQuery({
    queryKey: ['sectionMeals', userID, sectionID],
    queryFn: () =>
      fsGetSectionMeals(
        userID,
        sectionMeals.flatMap((meal) => meal.mealID)
      ),
  });

  const filteredMeals =
    labels.length === 0
      ? meals
      : meals.filter((meal) => meal.mealLabels.some((mealLabelID) => labels.includes(mealLabelID)));

  // hide sections without meals
  if (filteredMeals.filter((meal) => meal.isActive).length === 0) return null;

  if (loading) return <MealCardSkeleton />;

  return (
    <Box>
      <Typography
        variant="h3"
        id={sectionID}
        sx={{ direction: selectedLanguage === 'ar' ? 'rtl' : 'ltr' }}
      >
        {getTitle()}
      </Typography>
      <Stack spacing={2} sx={{ bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
        <Stack direction="column" spacing={4}>
          {filteredMeals
            .filter((meal) => meal.isActive)
            .map((meal) => (
              <MealCard
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
export default MenuSection;

MenuSection.propTypes = {
  sectionInfo: PropTypes.shape({
    title: PropTypes.string,
    meals: PropTypes.array,
    docID: PropTypes.string,
    translation: PropTypes.object,
    translationEdited: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  }),
};
