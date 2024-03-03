import { useQuery } from '@tanstack/react-query';

import { Stack, Typography } from '@mui/material';

import { useParams } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import { useWaiterContext } from 'src/sections/waiter/context/waiter-context';
import WaiterMenuSections from 'src/sections/waiter/food-menu/waiter-menu-sections';

function FoodMenu() {
  const { userID } = useParams();
  const { selectedTable } = useWaiterContext();
  const { fsGetSections, fsGetMenu } = useAuthContext();

  const { data: sections = [] } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: selectedTable.menuID ? ['sections', userID, selectedTable.menuID] : null,
    queryFn: () => fsGetSections(selectedTable.menuID, userID),
    enabled: selectedTable.isActive && selectedTable.menuID !== null,
  });

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
      <Scrollbar sx={{ height: '80dvh' }}>
        <Stack direction="column" spacing={3}>
          {sections
            .filter((section) => section.isActive)
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <WaiterMenuSections key={section.docID} sectionInfo={section} />
            ))}
        </Stack>
      </Scrollbar>
    </Stack>
  );
}
export default FoodMenu;