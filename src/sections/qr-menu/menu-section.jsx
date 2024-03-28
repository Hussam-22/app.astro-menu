import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useQueries } from '@tanstack/react-query';

import { Box, Stack, Divider, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import MealCard from 'src/sections/qr-menu/meal-card';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

function MenuSection({ sectionInfo }) {
  const { userID } = useParams();
  const {
    title,
    meals: sectionMeals,
    docID: sectionID,
    translationEdited,
    translation,
  } = sectionInfo;
  const { fsGetSectionMeals, fsGetMeal } = useAuthContext();
  const { labels, loading, selectedLanguage, branchInfo } = useQrMenuContext();

  const getTitle = () => {
    if (selectedLanguage === branchInfo.defaultLanguage) return title;
    return translationEdited?.[selectedLanguage]?.title
      ? translationEdited?.[selectedLanguage]?.title
      : translation?.[selectedLanguage]?.title;
  };

  // const { data: meals = [] } = useQuery({
  //   queryKey: ['sectionMeals', userID, sectionID],
  //   queryFn: () =>
  //     fsGetSectionMeals(
  //       userID,
  //       sectionMeals.flatMap((meal) => meal.mealID)
  //     ),
  // });

  const mealsData = useQueries({
    queries: sectionMeals
      .flatMap((meal) => meal.mealID)
      .map((mealID) => ({
        queryKey: ['meal', mealID, userID],
        queryFn: () => fsGetMeal(mealID, '800x800', userID),
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
  if (filteredMeals.filter((meal) => meal?.data?.isActive).length === 0) return null;

  return (
    <Box>
      <Typography
        variant="h5"
        id={sectionID}
        sx={{
          // color: 'common.white',
          direction: selectedLanguage === 'ar' ? 'rtl' : 'ltr',
          borderRadius: 1,
          py: 1,
          fontWeight: '900',
        }}
      >
        {getTitle()}
      </Typography>
      <Stack
        spacing={2}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 1,
          border: 'dashed 1px #D9D9D9',
        }}
      >
        <Stack direction="column" spacing={1} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
          {filteredMeals
            .filter((meal) => meal.data?.isActive)
            .map((meal) => (
              <MealCard
                key={meal.data.docID}
                mealInfo={meal.data}
                isMealActive={
                  sectionMeals.find((sectionMeal) => sectionMeal.mealID === meal.data.docID)
                    ?.isActive
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
