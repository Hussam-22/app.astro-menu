import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Stack, Typography } from '@mui/material';

import { useParams } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import { useStaffContext } from 'src/sections/waiter-staff-dashboard/context/staff-context';
import StaffMenuSections from 'src/sections/waiter-staff-dashboard/components/menu-sections';

FoodMenu.propTypes = { menuID: PropTypes.string };

function FoodMenu({ menuID }) {
  const { businessProfileID } = useParams();
  const { fsGetMenu, fsGetSections, menuSections } = useAuthContext();
  const { selectedTable } = useStaffContext();
  const queryClient = useQueryClient();

  const { data: menuInfo = {} } = useQuery({
    queryKey: ['menu', businessProfileID, menuID],
    queryFn: () => fsGetMenu(menuID, businessProfileID),
  });

  const { data: sectionsUnsubscribe = () => {} } = useQuery({
    queryKey: ['sections', businessProfileID, menuID],
    queryFn: () => fsGetSections(menuID, businessProfileID),
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (menuID)
      queryClient.invalidateQueries({ queryKey: ['sections', businessProfileID, menuID] });
  }, [businessProfileID, menuID, queryClient]);

  useEffect(
    () => () => {
      if (typeof sectionsUnsubscribe === 'function') {
        sectionsUnsubscribe();
      }
    },
    [sectionsUnsubscribe]
  );

  if (!selectedTable?.isActive)
    return <Typography variant="h6">Sorry this table is not taking orders !!</Typography>;

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="column">
        <Typography variant="overline" color="primary">
          Menu
        </Typography>
        <Typography variant="caption">{menuInfo?.title}</Typography>
      </Stack>
      <Scrollbar sx={{ height: '80dvh' }}>
        <Stack direction="column" spacing={3}>
          {menuSections
            .filter((section) => section.isActive)
            .filter((section) => section.meals.length > 0)
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
