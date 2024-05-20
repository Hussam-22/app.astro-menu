import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useQueries } from '@tanstack/react-query';

import { Box } from '@mui/system';
import { Chip, Stack, Button, Drawer, Divider, Container, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

SectionsDrawer.propTypes = {
  openState: PropTypes.bool,
  toggleDrawer: PropTypes.func,
};

function SectionsDrawer({ openState, toggleDrawer }) {
  const { businessProfileID } = useParams();
  const { menuSections, fsGetMeal } = useAuthContext();
  const { setLabel, labels, reset, selectedLanguage, branchInfo, mealsLabel } = useQrMenuContext();

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

  const inActiveMeals = mealsData
    .map((meal) => meal.data)
    .filter((meal) => !meal.isActive)
    .map((meal) => meal.docID);

  return (
    <Drawer anchor="bottom" open={openState} onClose={() => toggleDrawer('menu')}>
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Stack
          direction={{ sm: 'row', xs: 'column' }}
          spacing={{ sm: 3, xs: 1 }}
          divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
        >
          <Box sx={{ width: 1 }}>
            <Scrollbar sx={{ maxHeight: 250 }}>
              <Typography variant="h4">Menu Sections</Typography>
              {menuSections.length !== 0 && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(1,1fr)' },
                    gap: 1,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    p: 1,
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
                      <Button
                        onClick={() => onSectionClickHandler(section.docID)}
                        key={section.docID}
                        sx={{ fontWeight: '700' }}
                        variant="outlined"
                        disableRipple
                      >
                        {getTitle(section)}
                      </Button>
                    ))}
                </Box>
              )}
            </Scrollbar>
          </Box>

          <Box>
            {mealsLabel.length !== 0 && (
              <Box
                sx={{
                  display: 'grid',
                  gap: 1,
                  gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(2, 1fr)' },
                }}
              >
                <Typography variant="h4" sx={{ gridColumn: '1/-1' }}>
                  Meal Type
                </Typography>
                {mealsLabel.map((label) => (
                  <Chip
                    key={label.docID}
                    label={`#${getLabel(label)}`}
                    sx={{ fontWeight: '700' }}
                    onClick={() => onMealLabelClick(label.docID)}
                    size="small"
                    color={labels.includes(label.docID) ? 'primary' : 'default'}
                    variant="soft"
                  />
                ))}

                <Divider sx={{ my: 1, gridColumn: '1/-1' }} />
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={resetHandler}
                  disabled={labels.length === 0}
                >
                  Reset
                </Button>
                <Button variant="soft" size="small" onClick={() => toggleDrawer('menu')}>
                  Close
                </Button>
              </Box>
            )}
          </Box>
        </Stack>
      </Container>
    </Drawer>
  );
}

export default SectionsDrawer;
