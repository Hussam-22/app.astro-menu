import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Box } from '@mui/system';
import { Chip, Stack, Drawer, Button, Divider, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

SectionsDrawer.propTypes = {
  openState: PropTypes.bool,
  toggleDrawer: PropTypes.func,
};

function SectionsDrawer({ openState, toggleDrawer }) {
  const { userID } = useParams();
  const { fsGetMealLabels } = useAuthContext();
  const { setLabel, labels, reset } = useQrMenuContext();

  const { data: mealsLabel = [] } = useQuery({
    queryKey: ['mealsLabel', userID],
    queryFn: () => fsGetMealLabels(userID),
  });

  const onSectionClickHandler = (sectionID) => {
    const sectionElement = document.getElementById(sectionID);
    sectionElement.scrollIntoView({ behavior: 'smooth' });
    toggleDrawer('menu');
  };

  const onMealLabelClick = (labelID) => {
    setLabel(labelID);
  };

  const resetHandler = () => reset();

  const queryClient = useQueryClient();
  const cachedSections = queryClient.getQueriesData({ queryKey: ['sections'] }) || [];
  const menuSections = cachedSections[0][1];

  return (
    <Drawer anchor="bottom" open={openState} onClose={() => toggleDrawer('menu')}>
      <Box sx={{ p: 3, mx: 'auto' }}>
        <Stack
          direction="row"
          spacing={3}
          divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
        >
          {menuSections.length !== 0 && (
            <Stack direction="column" spacing={0.5}>
              <Typography variant="h4">Menu Sections</Typography>
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
                    {/* {selectedLanguage === defaultLanguage
                      ? section.title
                      : section.translationEdited[selectedLanguage]} */}
                    {section.title}
                  </Button>
                ))}
            </Stack>
          )}

          {mealsLabel.length !== 0 && (
            <Box
              sx={{
                display: 'grid',
                gap: 1,
                p: { md: 1 },
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
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
