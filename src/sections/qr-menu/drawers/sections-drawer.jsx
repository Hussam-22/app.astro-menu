import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useQueries } from '@tanstack/react-query';

import { Box } from '@mui/system';
import { Stack, Button, Drawer, Divider, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

SectionsDrawer.propTypes = {
  openState: PropTypes.bool,
  toggleDrawer: PropTypes.func,
  type: PropTypes.string,
};

function SectionsDrawer({ openState, toggleDrawer, type }) {
  const { businessProfileID } = useParams();
  const { menuSections, fsGetMeal } = useAuthContext();
  const { selectedLanguage, getTranslation, mostOrderedMeals } = useQrMenuContext();

  const menuSectionsWithMostOrderedMeals = useMemo(
    () =>
      mostOrderedMeals === undefined || mostOrderedMeals?.length === 0
        ? menuSections
        : [
            ...menuSections,
            {
              order: 0,
              isActive: true,
              meals: [...mostOrderedMeals],
              title: 'most ordered meals',
              docID: 'most-ordered-meals',
            },
          ],
    [menuSections, mostOrderedMeals]
  );

  const getTitle = (section) => {
    const { title, translation, translationEdited } = section;
    if (selectedLanguage === 'en') return title;
    return translationEdited?.[selectedLanguage]?.title
      ? translationEdited?.[selectedLanguage]?.title
      : translation?.[selectedLanguage]?.title;
  };

  const onSectionClickHandler = (sectionID) => {
    const sectionElement = document.getElementById(sectionID);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
      toggleDrawer('menu');
    }
  };

  const sectionsMealsID = useMemo(
    () => menuSections.flatMap((section) => section.meals.map((meal) => meal)),
    [menuSections]
  );

  const mealsData = useQueries({
    queries: sectionsMealsID.map((mealID) => ({
      queryKey: ['meal', mealID, businessProfileID],
      queryFn: () => fsGetMeal(mealID, '800x800', businessProfileID),
      staleTime: Infinity,
    })),
  });

  if (mealsData[0].isLoading) return <div>Loading...</div>;

  const inActiveMeals = mealsData
    .map((meal) => meal?.data)
    .filter((meal) => !meal?.isActive)
    .map((meal) => meal?.docID);

  return (
    <Drawer
      anchor="right"
      open={openState}
      onClose={() => toggleDrawer('menu')}
      PaperProps={{ sx: { minWidth: 200 } }}
    >
      <Stack
        direction="column"
        spacing={{ sm: 3, xs: 1 }}
        divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
        sx={{ p: 2, direction: selectedLanguage === 'ar' ? 'rtl' : 'ltr' }}
      >
        <Typography variant="h4">{getTranslation('menu sections')}</Typography>
        {menuSectionsWithMostOrderedMeals.length !== 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(1,1fr)',
              gap: 1,
            }}
          >
            {[...menuSectionsWithMostOrderedMeals]
              .filter((section) => section.meals.every((mealID) => !inActiveMeals.includes(mealID)))
              .filter(
                (section) =>
                  section.isActive &&
                  section.meals.length !== 0 &&
                  !section.meals.every((meal) => inActiveMeals.includes(meal))
              )
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <Typography
                  key={section.docID}
                  onClick={() => onSectionClickHandler(section.docID)}
                >
                  {section?.order === 0 ? getTranslation(section.title) : getTitle(section)}
                </Typography>
              ))}
          </Box>
        )}

        <Divider sx={{ my: 1, gridColumn: '1/-1' }} />
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          alignSelf="flex-end"
        >
          <Button variant="soft" size="small" onClick={() => toggleDrawer('menu')}>
            {getTranslation('close')}
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

export default SectionsDrawer;
