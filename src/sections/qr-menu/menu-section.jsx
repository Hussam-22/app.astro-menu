import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useQueries } from '@tanstack/react-query';

import { Box, Stack, Divider, useTheme, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import MealCard from 'src/sections/qr-menu/meal-card';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

function MenuSection({ sectionInfo }) {
  const theme = useTheme();
  const { businessProfileID } = useParams();
  const {
    title,
    meals: sectionMeals,
    docID: sectionID,
    translationEdited,
    translation,
    order,
  } = sectionInfo;
  const { fsGetMeal } = useAuthContext();
  const { labels, selectedLanguage, branchInfo, getTranslation } = useQrMenuContext();

  const getTitle = () => {
    if (selectedLanguage === branchInfo.defaultLanguage) return title;
    return translationEdited?.[selectedLanguage]?.title
      ? translationEdited?.[selectedLanguage]?.title
      : translation?.[selectedLanguage]?.title;
  };

  const mealsData = useQueries({
    queries: sectionMeals.map((mealID) => ({
      queryKey: ['meal', mealID, businessProfileID],
      queryFn: () => fsGetMeal(mealID, '800x800', businessProfileID),
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
          px: 1,
          color: order === 0 && 'rose.400',
        }}
      >
        {sectionInfo?.order === 0 ? getTranslation(sectionInfo.title) : getTitle()}
      </Typography>
      <Stack
        spacing={2}
        sx={{
          bgcolor: order === 0 ? 'rose.50' : 'background.paper',
          border: `3px solid ${order === 0 ? theme.palette.rose[300] : 'transparent'}`,
          borderRadius: 2,
          py: order === 0 ? 0 : 2,
        }}
      >
        <Stack
          direction="column"
          spacing={0.5}
          divider={<Divider sx={{ borderStyle: 'dashed' }} />}
        >
          {filteredMeals
            .filter((meal) => meal.data?.isActive)
            .map((meal) => (
              <MealCard key={meal.data.docID} mealInfo={meal.data} />
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
    order: PropTypes.number,
    translation: PropTypes.object,
    translationEdited: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  }),
};
