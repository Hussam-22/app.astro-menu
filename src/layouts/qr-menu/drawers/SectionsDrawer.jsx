import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Box } from '@mui/system';
import { Chip, Stack, Drawer, Button, Divider, Typography } from '@mui/material';

import {
  rdxScrollTo,
  rdxResetFilter,
  rdxResetKeywords,
  rdxAddFilteredMeals,
  rdxToggleFilterKeyword,
} from '../../../redux/slices/qrMenu';

SectionsDrawer.propTypes = {
  openState: PropTypes.bool,
  toggleDrawer: PropTypes.func,
};

function SectionsDrawer({ openState, toggleDrawer }) {
  const dispatch = useDispatch();
  const {
    menuSections,
    menuMeals,
    filterKeywords,
    sectionTitlesRefs,
    selectedLanguage,
    defaultLanguage,
  } = useSelector((state) => state.qrMenu);

  const onSectionClickHandler = (section) => {
    const sectionElement = sectionTitlesRefs.find((item) => item.id === section.id);
    dispatch(rdxScrollTo(sectionElement.element));
    // sectionElement.element.scrollIntoView({ behavior: 'smooth' });
    toggleDrawer('menu');
  };

  const onKeywordClickHandler = (key) => {
    // TOGGLE KEYWORD SELECTION
    dispatch(rdxToggleFilterKeyword(key));
  };

  const filterByKeywordHandler = () => {
    const selectedKeywords = Object.entries(filterKeywords)
      .map(([key, value]) => value === true && key)
      .filter((value) => value !== false);

    const mealsWithSelectedKeywords = menuMeals
      .filter((meal) => meal.metaKeywords.some((keyword) => selectedKeywords.includes(keyword)))
      .map((meal) => meal.id);

    // ADD MEALS THAT HAS SELECTED KEYWORDS TO RDX
    dispatch(rdxAddFilteredMeals(mealsWithSelectedKeywords));
    toggleDrawer('menu');
  };

  const resetHandler = () => {
    dispatch(rdxResetFilter());
    dispatch(rdxResetKeywords());
  };

  return (
    <Drawer
      anchor="bottom"
      open={openState}
      onClose={() => toggleDrawer('menu')}
      sx={{ width: '80%' }}
    >
      <Box sx={{ p: 3 }}>
        <Stack
          direction="row"
          spacing={3}
          divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
        >
          {menuSections.length !== 0 && (
            <Stack direction="column" spacing={0.5}>
              <Typography variant="h4">Menu Sections</Typography>
              {[...menuSections]
                .filter((section) => section.meals.length !== 0)
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <Typography
                    onClick={() => onSectionClickHandler(section)}
                    key={section.id}
                    sx={{ fontWeight: '700' }}
                  >
                    {selectedLanguage === defaultLanguage
                      ? section.title
                      : section.translationEdited[selectedLanguage]}
                  </Typography>
                ))}
            </Stack>
          )}

          {filterKeywords.length !== 0 && (
            <Box
              sx={{
                display: 'grid',
                gap: 1,
                p: { md: 1 },
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              }}
            >
              <Typography variant="h4" sx={{ gridColumn: '1/-1' }}>
                Meals Type
              </Typography>
              {Object.entries(filterKeywords).map(([key, value]) => (
                <Chip
                  key={key}
                  label={`#${key}`}
                  sx={{ fontWeight: '700' }}
                  onClick={() => onKeywordClickHandler(key, value)}
                  size="small"
                  color={value ? 'primary' : 'default'}
                />
              ))}

              <Divider sx={{ my: 1, gridColumn: '1/-1' }} />
              <Button variant="contained" size="small" onClick={filterByKeywordHandler}>
                Filter
              </Button>
              <Button variant="outlined" size="small" onClick={resetHandler}>
                Reset
              </Button>
            </Box>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}

export default SectionsDrawer;
