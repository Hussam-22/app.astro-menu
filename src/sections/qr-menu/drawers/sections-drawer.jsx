import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useQueries } from '@tanstack/react-query';

import { Box } from '@mui/system';
import { Chip, Stack, Button, Drawer, Divider, Typography } from '@mui/material';

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
  const { setLabel, labels, reset, selectedLanguage, mealsLabel, getTranslation } =
    useQrMenuContext();

  const getLabel = (label) => {
    const { title, translation } = label;
    if (selectedLanguage === 'en') return title;
    return translation?.[selectedLanguage]?.title || title;
  };

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

  const onMealLabelClick = (labelID) => {
    setLabel(labelID);
  };

  const resetHandler = () => reset();

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
        {type === 'sections' && (
          <>
            <Typography variant="h4">{getTranslation('menu sections')}</Typography>
            {menuSections.length !== 0 && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(1,1fr)',
                  gap: 1,
                }}
              >
                {[...menuSections]
                  .filter((section) =>
                    section.meals.every((mealID) => !inActiveMeals.includes(mealID))
                  )
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
                      {getTitle(section)}
                    </Typography>
                  ))}
              </Box>
            )}
          </>
        )}

        {type === 'filter' && (
          <>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {getTranslation('meal type')}
            </Typography>
            {mealsLabel.length !== 0 && (
              <Box
                sx={{
                  display: 'grid',
                  gap: 1,
                  gridTemplateColumns: 'repeat(1,1fr)',
                }}
              >
                {mealsLabel.map((label) => (
                  <Chip
                    key={label.docID}
                    label={`#${getLabel(label)}`}
                    onClick={() => onMealLabelClick(label.docID)}
                    size="small"
                    color={labels.includes(label.docID) ? 'primary' : 'default'}
                    variant="soft"
                  />
                ))}
              </Box>
            )}
          </>
        )}

        <Divider sx={{ my: 1, gridColumn: '1/-1' }} />
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          alignSelf="flex-end"
        >
          {type === 'filter' && (
            <Button
              variant="contained"
              color="warning"
              size="small"
              onClick={resetHandler}
              disabled={labels.length === 0}
            >
              {getTranslation('reset')}
            </Button>
          )}
          <Button variant="soft" size="small" onClick={() => toggleDrawer('menu')}>
            {getTranslation('close')}
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

export default SectionsDrawer;
