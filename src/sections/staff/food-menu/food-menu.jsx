import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Stack, Typography } from '@mui/material';

import { useParams } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import { useStaffContext } from 'src/sections/staff/context/staff-context';
import StaffMenuSections from 'src/sections/staff/food-menu/staff-menu-sections';

FoodMenu.propTypes = { sections: PropTypes.array };

function FoodMenu({ sections }) {
  const { userID } = useParams();
  const { selectedTable } = useStaffContext();
  const { fsGetMenu } = useAuthContext();

  console.log(sections);

  const { data: menuInfo = {} } = useQuery({
    queryKey: ['menu', userID, selectedTable.menuID],
    queryFn: () => fsGetMenu(selectedTable.menuID, userID),
    enabled: selectedTable.isActive && selectedTable.menuID !== null,
  });

  if (!selectedTable?.isActive)
    return <Typography variant="h6">Sorry this table is not taking orders !!</Typography>;

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="column">
        <Typography variant="overline">Menu</Typography>
        <Typography variant="caption">{menuInfo?.title}</Typography>
      </Stack>
      <Scrollbar sx={{ height: '100dvh' }}>
        <Stack direction="column" spacing={3}>
          {sections
            .filter((section) => section.isActive)
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <StaffMenuSections key={section.docID} sectionInfo={section} />
            ))}
        </Stack>
      </Scrollbar>
    </Stack>
  );
}
export default FoodMenu;
