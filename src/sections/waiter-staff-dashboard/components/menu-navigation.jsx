import { Box, Chip, Stack, Divider } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import TextMaxLine from 'src/components/text-max-line';
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
    <Scrollbar sx={{ height: '40dvh', py: 1 }}>
      <Stack direction="column" spacing={1}>
        {menuSections
          .filter((section) => section.isActive)
          .filter((section) => section.meals.length > 0)
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <TextMaxLine
              line={1}
              variant="body2"
              key={section.docID}
              onClick={() => onSectionClickHandler(section.docID)}
              sx={{ cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
            >
              {section.title}
            </TextMaxLine>
          ))}
      </Stack>
    </Scrollbar>
  );

  // ----------------------------------------------------------------------------

  const onMealLabelClick = (labelID) => {
    setLabel(labelID);
  };

  const mealsType = (
    <Scrollbar sx={{ height: '40dvh', py: 1 }}>
      <Stack
        direction="column"
        spacing={1}
        divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
        alignItems="flex-start"
      >
        {mealsLabel?.length !== 0 && (
          <Box
            sx={{
              display: 'grid',
              gap: 1,
              gridTemplateRows: 'repeat(auto-fill, minmax(32px, 1fr))',
            }}
          >
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
          </Box>
        )}
      </Stack>
    </Scrollbar>
  );

  // ----------------------------------------------------------------------------

  return (
    <Stack direction="column" spacing={2} divider={<Divider sx={{ border: '1px dashed #999' }} />}>
      {sections}
      {mealsType}
    </Stack>
  );
}
export default MenuNavigation;
