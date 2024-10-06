import { useState } from 'react';

import { Box, Card, Table, TableBody, TableContainer, TablePagination } from '@mui/material';

import Scrollbar from 'src/components/scrollbar';
import TableToolbarOrders from 'src/sections/customers/table/orders-table-toolbar';
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

// ----------------------------------------------------------------------
const TABLE_HEAD = [
  { id: 'id', label: 'Order #', align: 'left', width: '15%' },
  { id: 'closingTime', label: 'Closed At', align: 'left', width: '20%' },
  { id: 'duration', label: 'Duration', align: 'left', width: '15%' },
  { id: 'totalBill', label: 'Amount', align: 'left', width: '15%' },
  { id: 'staff', label: 'Waiter/ess', align: 'left', width: '20%' },
  { id: 'statusName', label: 'Status', align: 'left' },
];
// ----------------------------------------------------------------------
// OrdersListTable.propTypes = {
//   branchID: PropTypes.string,
//   startTime: PropTypes.string,
//   endTime: PropTypes.string,
//   status: PropTypes.string,
// };

export default function OrdersListTable() {
  const [dialogState, setDialogState] = useState({ isOpen: false, orderInfo: {} });
  const [tableData, setOrdersData] = useState([]);

  console.log(tableData);

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
  } = useTable({ defaultOrderBy: 'id', defaultOrder: 'desc', defaultRowsPerPage: 50 });

  const getData = (data) => setOrdersData(data);

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
    <Card sx={{ p: 3 }}>
      <TableToolbarOrders getData={getData} />
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
              {tableData?.length === 0 && <TableSkeleton />}
              {!tableData?.length !== 0 &&
                dataFiltered
                  .sort(
                    (a, b) =>
                      new Date(b.initiationTime.seconds * 1000) -
                      new Date(a.initiationTime.seconds * 1000)
                  )
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableOrdersTableRow
                      key={row.docID}
                      row={row}
                      onOrderClick={() => handleViewRow(row)}
                      branchID={tableData?.branchID}
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
      </Box>
      {dialogState.isOpen && (
        <ShowOrderDetailsDialog
          isOpen={dialogState.isOpen}
          onClose={onDialogClose}
          orderInfo={dialogState.orderInfo}
        />
      )}
    </Card>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ tableData, comparator, filterName }) {
  const stabilizedThis = tableData?.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  tableData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    tableData = tableData?.filter(
      (item) => item.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return tableData;
}
