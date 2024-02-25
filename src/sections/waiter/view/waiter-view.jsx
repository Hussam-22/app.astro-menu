// import PropTypes from 'prop-types';

import { useState } from 'react';
import { useParams } from 'react-router';
import { useQuery, useQueries } from '@tanstack/react-query';

import { Stack, Divider } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import TableOrder from 'src/sections/waiter/table-order';
import QrMenuDrawer from 'src/sections/waiter/qr-menu-drawer';
import TableActionBar from 'src/sections/waiter/table-action-bar';
import { useWaiterContext } from 'src/sections/waiter/context/waiter-context';

function WaiterView() {
  const { userID } = useParams();
  const { fsGetSectionMeals, fsGetSections } = useAuthContext();
  const { selectedTable: tableInfo } = useWaiterContext();
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

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

  return (
    <Stack
      direction="row"
      spacing={3}
      sx={{ py: 2 }}
      divider={<Divider sx={{ borderStyle: 'dashed' }} flexItem orientation="vertical" />}
    >
      <Stack direction="column" spacing={2} sx={{ width: '50%' }}>
        {tableInfo?.docID && sections.length !== 0 && <TableActionBar openDrawer={onOpen} />}
        {tableInfo?.docID && sections.length !== 0 && <TableOrder />}
      </Stack>

      {tableInfo?.docID && sections.length !== 0 && (
        <QrMenuDrawer isOpen={isOpen} onClose={onClose} />
      )}
    </Stack>
  );
}
export default WaiterView;
// WaiterView.propTypes = { tables: PropTypes.array };
