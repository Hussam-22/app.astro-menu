import { useState } from 'react';

import { Box, Card, Table, TableBody, TableContainer, TablePagination } from '@mui/material';

import Scrollbar from 'src/components/scrollbar';
import TableToolbarOrders from 'src/sections/orders/table/orders-table-toolbar';
import OrderDetailsDrawer from 'src/sections/orders/drawers/order-details-drawer';
import TableOrdersTableRow from 'src/sections/branches/components/table/TableOrdersTableRow';
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
  { id: 'meals', label: 'Meals', align: 'left', width: '10%' },
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
  const [orderDrawer, setOrderDrawer] = useState({ isOpen: false, orderInfo: {} });
  const [tableData, setOrdersData] = useState({ data: [], loading: false });

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

  const onDialogClose = () => setOrderDrawer({ isOpen: false, orderInfo: {} });

  const handleViewRow = (orderInfo) => {
    setOrderDrawer({ isOpen: true, orderInfo });
  };

  const dataFiltered = applySortFilter({
    tableData: tableData.data,
    comparator: getComparator(order, orderBy),
  });

  const isNotFound = !tableData.data?.length;

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
              {tableData.loading && <TableSkeleton />}
              {!tableData.loading &&
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
                      branchID={row?.branchID}
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
      <OrderDetailsDrawer
        isOpen={orderDrawer.isOpen}
        onClose={onDialogClose}
        orderInfo={orderDrawer.orderInfo}
      />
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
