// import PropTypes from 'prop-types';

import { useParams } from 'react-router';
import { useQuery, useQueries } from '@tanstack/react-query';

import { Box, Stack, Divider, Typography } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import TableOrder from 'src/sections/waiter/table-order';
import FoodMenu from 'src/sections/waiter/food-menu/food-menu';
import TableActionBar from 'src/sections/waiter/table-action-bar';
import { useWaiterContext } from 'src/sections/waiter/context/waiter-context';
import TableOrderSkeleton from 'src/sections/waiter/skeleton/table-order-skeleton';

function WaiterView() {
  const { userID } = useParams();
  const { fsGetSectionMeals, fsGetSections, activeOrders } = useAuthContext();
  const { selectedTable: tableInfo, isLoading } = useWaiterContext();

  const { data: sections = [] } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: tableInfo.menuID ? ['sections', userID, tableInfo.menuID] : null,
    queryFn: () => fsGetSections(tableInfo.menuID, userID),
    enabled: tableInfo?.docID !== undefined,
  });

  useQueries({
    queries: sections.map((section) => ({
      queryKey: ['sectionMeals', userID, section.docID],
      queryFn: () =>
        fsGetSectionMeals(
          userID,
          section.meals.flatMap((meal) => meal.mealID)
        ),
      enabled: sections.length !== 0,
    })),
  });

  // if (activeOrders.length === 0) return null;

  if (isLoading) return <TableOrderSkeleton />;

  return (
    <Stack
      direction="row"
      spacing={3}
      sx={{ py: 2 }}
      divider={<Divider sx={{ borderStyle: 'dashed' }} flexItem orientation="vertical" />}
    >
      <Stack direction="column" spacing={2} sx={{ width: { sm: '40%', lg: '50%' } }}>
        <Typography variant="h6">Table# {tableInfo.index}</Typography>
        {tableInfo?.docID && sections.length !== 0 && <TableActionBar />}
        {tableInfo?.docID && sections.length !== 0 && <TableOrder />}
      </Stack>
      <Box flexGrow={1}>{tableInfo?.docID && sections.length !== 0 && <FoodMenu />}</Box>
    </Stack>
  );
}
export default WaiterView;
// WaiterView.propTypes = { tables: PropTypes.array };
