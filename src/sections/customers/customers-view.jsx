import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  Box,
  Card,
  Table,
  Dialog,
  Container,
  TableBody,
  DialogTitle,
  DialogContent,
  TableContainer,
  TablePagination,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';
import DownloadCSV from 'src/utils/download-csv';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import TableToolbar from 'src/components/table/table-toolbar';
import CustomersTableRow from 'src/sections/customers/customers-table-row';
import MealLabelNewEditForm from 'src/sections/meal-labels/meal-label-new-edit-form';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
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
  { id: 'customerEmail', label: 'Customer Email', align: 'left', width: '30%' },
  { id: 'lastOrder', label: 'Last Visit', align: 'left', width: '15%' },
  { id: 'branch', label: 'Last Branch', align: 'left', width: '20%' },
  { id: 'visits', label: 'Visits', align: 'left', width: '15%' },
  { id: 'actionButtons', label: '', align: 'left', width: '6%' },
];
// ----------------------------------------------------------------------

function CustomersView() {
  const { themeStretch } = useSettingsContext();
  const { fsGetCustomers, fsGetAllBranches } = useAuthContext();
  const [filterName, setFilterName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { page, order, orderBy, rowsPerPage, setPage, onSort, onChangePage, onChangeRowsPerPage } =
    useTable({
      defaultOrderBy: 'visits',
    });

  const onClose = () => setIsOpen(false);

  const { data: customersList = [], error } = useQuery({
    queryKey: ['customers'],
    queryFn: fsGetCustomers,
  });

  const { data: branchesData, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: fsGetAllBranches,
    enabled: customersList.length > 0,
  });

  const handleFilterName = (filteredName) => {
    setFilterName(filteredName);
    setPage(0);
  };

  const dataFiltered = applySortFilter({
    customersList,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const isNotFound = (!dataFiltered.length && !!filterName) || !dataFiltered.length;

  const handleExportCustomers = () => {};

  return (
    <>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Customers List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Customers', href: paths.dashboard.meal.list },
            {
              name: 'Customers List',
            },
          ]}
          action={<DownloadCSV data={customersList} name="customers-list" />}
        />

        <Card>
          <TableToolbar filterName={filterName} onFilterName={handleFilterName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 960, position: 'relative' }}>
              <Table size="small">
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={customersList.length}
                  onSort={onSort}
                />

                <TableBody>
                  {(customersList.length === 0 ? [...Array(rowsPerPage)] : dataFiltered)
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .sort((a, b) => new Date(b.lastOrder?.seconds) - new Date(a.lastOrder?.seconds))
                    .map((row, index) =>
                      row && branchesData && branchesData?.length !== 0 ? (
                        <CustomersTableRow key={row.docID} row={row} branchesData={branchesData} />
                      ) : (
                        !isNotFound && <TableSkeleton key={index} sx={{ height: 60 }} />
                      )
                    )}

                  <TableEmptyRows
                    height={60}
                    emptyRows={emptyRows(page, rowsPerPage, customersList.length)}
                  />

                  <TableNoData isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <Box sx={{ position: 'relative' }}>
            <TablePagination
              rowsPerPageOptions={[25, 50, 100]}
              component="div"
              count={dataFiltered.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
            />
          </Box>
        </Card>
      </Container>

      {isOpen && (
        <Dialog fullWidth maxWidth="md" open={isOpen} onClose={onClose}>
          <DialogTitle sx={{ pb: 2 }}>Add New Meal Label</DialogTitle>

          <DialogContent>
            <MealLabelNewEditForm onClose={onClose} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
export default CustomersView;
// CustomersView.propTypes = { tables: PropTypes.array };

function applySortFilter({ customersList, comparator, filterName }) {
  const stabilizedThis = customersList?.map((el, index) => [el, index]) || [];

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  customersList = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    customersList = customersList.filter(
      (item) => item.email.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return customersList;
}
