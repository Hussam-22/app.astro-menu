import { Box, Chip, Stack, Divider, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import { useStaffContext } from 'src/sections/waiter-staff-dashboard/context/staff-context';

function MenuNavigation() {
  const { menuSections } = useAuthContext();
  const { setLabel, mealsLabel, labels } = useStaffContext();

  const onSectionClickHandler = (sectionID) => {
    const sectionElement = document.getElementById(sectionID);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sections = (
    <Scrollbar sx={{ height: '42dvh', pb: 1 }}>
      <Typography variant="caption" sx={{ fontWeight: 'bolder' }} color="primary">
        Menu Sections
      </Typography>
      <Stack direction="column" spacing={1} sx={{ mt: 1 }}>
        {menuSections
          .filter((section) => section.isActive)
          .filter((section) => section.meals.length > 0)
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <Chip
              key={section.docID}
              label={section.title}
              onClick={() => onSectionClickHandler(section.docID)}
              size="small"
              variant="soft"
            />
          ))}
      </Stack>
    </Scrollbar>
  );

  // ----------------------------------------------------------------------------

  const onMealLabelClick = (labelID) => {
    setLabel(labelID);
  };

  const mealsType = (
    <Scrollbar sx={{ height: '42dvh', pb: 1 }}>
      <Typography variant="caption" sx={{ fontWeight: 'bolder' }} color="primary">
        Meal Types
      </Typography>
      <Stack
        direction="column"
        spacing={1}
        sx={{ mt: 1 }}
        divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
      >
        {mealsLabel?.length !== 0 && (
          <Stack direction="column" spacing={1}>
            {mealsLabel.map((label) => (
              <Chip
                key={label.docID}
                label={label.title}
                onClick={() => onMealLabelClick(label.docID)}
                size="small"
                color={labels.includes(label.docID) ? 'primary' : 'default'}
                variant="soft"
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Scrollbar>
  );

  // ----------------------------------------------------------------------------

  return (
    <Box sx={{ display: 'grid', textAlign: 'center', mx: 'auto' }}>
      {sections}
      <Divider sx={{ borderStyle: 'dashed', borderWidth: 2 }} />
      {mealsType}
    </Box>
  );
}
export default MenuNavigation;
