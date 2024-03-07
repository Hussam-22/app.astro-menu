import PropTypes from 'prop-types';

import { Box } from '@mui/system';
import { Chip, Stack, Drawer, Button, Divider, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

SectionsDrawer.propTypes = {
  openState: PropTypes.bool,
  toggleDrawer: PropTypes.func,
};

function SectionsDrawer({ openState, toggleDrawer }) {
  const { menuSections } = useAuthContext();
  const { setLabel, labels, reset, selectedLanguage, user, mealsLabel } = useQrMenuContext();

  const getTitle = (section) => {
    const { title, translation, translationEdited } = section;
    if (selectedLanguage === user.defaultLanguage) return title;
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

  return (
    <Drawer anchor="bottom" open={openState} onClose={() => toggleDrawer('menu')}>
      <Box sx={{ p: 3, mx: { sm: 'auto' } }}>
        <Stack
          direction={{ sm: 'row', xs: 'column' }}
          spacing={{ sm: 3, xs: 1 }}
          divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
        >
          <Box>
            <Typography variant="h4">Menu Sections</Typography>
            {menuSections.length !== 0 && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(1,1fr)' },
                  gap: 1,
                }}
              >
                {[...menuSections]
                  .filter(
                    (section) =>
                      section.isActive &&
                      section.meals.length !== 0 &&
                      section.meals.filter((meal) => meal.isActive).length !== 0
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
          </Box>

          {mealsLabel.length !== 0 && (
            <Box
              sx={{
                display: 'grid',
                gap: 1,
                gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(4, 1fr)' },
              }}
            >
              <Typography variant="h4" sx={{ gridColumn: '1/-1' }}>
                Meal Type
              </Typography>
              {mealsLabel.map((label) => (
                <Chip
                  key={label.docID}
                  label={`#${label.title}`}
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
            </Box>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}

export default SectionsDrawer;
