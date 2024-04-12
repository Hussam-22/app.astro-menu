import { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Card, Table, TableBody, TableContainer, TablePagination } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import TableOrdersTableRow from 'src/sections/branches/components/table/TableOrdersTableRow';
import ShowOrderDetailsDialog from 'src/sections/branches/components/dialogs/ShowOrderDetailsDialog';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableSkeleton,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
} from 'src/components/table';

const TABLE_HEAD = [
  { id: 'id', label: 'Order #', align: 'left', width: '10%' },
  { id: 'status', label: 'Last Update', align: 'left', width: '15%' },
  { id: 'menuID', label: 'Menu', align: 'left', width: '20%' },
  { id: 'totalBill', label: 'Amount', align: 'center', width: '10%' },
  { id: 'staffID', label: 'waiter(ess)', align: 'center', width: '25%' },
  { id: 'statusName', label: 'Status', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

OrdersListCard.propTypes = {
  tableInfo: PropTypes.object,
};

// TODO: FIX TABLE ORDER, ADD FILTER BY STATUS OPTION

export default function OrdersListCard({ tableInfo }) {
  const { fsGetAllTableOrders, fsGetTableOrdersByPeriod } = useAuthContext();
  const [dialogState, setDialogState] = useState({ isOpen: false, orderInfo: {} });

  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    //
    selected,
    onSelectAllRows,
    //
    onSort,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({ defaultOrderBy: 'LastUpdate', defaultOrder: 'desc', defaultRowsPerPage: 10 });

  const {
    data: tableData = [],
    isFetching,
    error,
  } = useQuery({
    queryKey: ['tableOrders', tableInfo.docID, tableInfo.branchID],
    queryFn: () => fsGetTableOrdersByPeriod(tableInfo.docID, tableInfo.branchID),
    // queryFn: async () => {
    //   await delay(1000);
    //   // return fsGetAllTableOrders(tableInfo.docID);
    //   return fsGetTableOrdersByPeriod(tableInfo.docID, tableInfo.branchID);
    // },
    // refetchInterval: 60 * 1000,
  });

  console.log(error);

  const onDialogClose = () => setDialogState({ isOpen: false, orderInfo: {} });

  const handleViewRow = (orderInfo) => {
    setDialogState({ isOpen: true, orderInfo });
  };

  const dataFiltered = applySortFilter({
    tableData,
    comparator: getComparator(order, orderBy),
  });

  const isNotFound = !tableData?.length;

  const denseHeight = 56;

  return (
    <Grid xs={12}>
      <Card sx={{ p: 3 }}>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', pt: 1 }}>
            <Table size={!dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={dataFiltered.length}
                numSelected={selected.length}
                onSort={onSort}
                onSelectAllRows={(checked) =>
                  onSelectAllRows(
                    checked,
                    dataFiltered.map((row) => row.id)
                  )
                }
              />

              <TableBody>
                {isFetching && <TableSkeleton />}
                {!isFetching &&
                  dataFiltered
                    .sort(
                      (a, b) =>
                        new Date(b.lastUpdate.seconds * 1000) -
                        new Date(a.lastUpdate.seconds * 1000)
                    )
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableOrdersTableRow
                        key={row.docID}
                        row={row}
                        onOrderClick={() => handleViewRow(row)}
                        branchID={tableInfo.branchID}
                      />
                    ))}

                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(page, rowsPerPage, dataFiltered.length)}
                />

                <TableNoData isNotFound={isNotFound} />
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <Box sx={{ position: 'relative' }}>
          <TablePagination
            rowsPerPageOptions={[10, 50, 100]}
            component="div"
            count={dataFiltered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
          />

          {/* <FormControlLabel
            control={<Switch checked={dense} onChange={onChangeDense} />}
            label="Dense"
            sx={{ px: 3, py: 1.5, top: 0, position: { md: 'absolute' } }}
          /> */}
        </Box>
      </Card>
      {dialogState.isOpen && (
        <ShowOrderDetailsDialog
          isOpen={dialogState.isOpen}
          onClose={onDialogClose}
          orderInfo={dialogState.orderInfo}
        />
      )}
    </Grid>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ tableData, comparator, filterName }) {
  const stabilizedThis = tableData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  tableData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    tableData = tableData.filter(
      (item) => item.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return tableData;
}
