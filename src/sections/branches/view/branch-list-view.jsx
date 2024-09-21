import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  Box,
  Card,
  Table,
  Button,
  Container,
  TableBody,
  Typography,
  TableContainer,
  TablePagination,
} from '@mui/material';

import Label from 'src/components/label';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useGetProductInfo } from 'src/hooks/use-get-product';
import MenusTableToolbar from 'src/sections/menu/list/menu-table-toolbar';
import BranchTableRow from 'src/sections/branches/components/table/branch-table-row';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
} from 'src/components/table';

const TABLE_HEAD = [
  { id: 'title', label: 'Menu Name', align: 'left', width: '25%' },
  { id: 'totalOrders', label: 'Total Orders', align: 'center', width: '10%' },
  { id: 'totalScans', label: 'Total Scans', align: 'center', width: '10%' },
  { id: 'totalTurnover', label: 'Total Turnover', align: 'center', width: '15%' },
  { id: 'avgTurnover', label: 'Avg Turnover', align: 'center', width: '10%' },
  { id: 'totalIncome', label: 'Total Income', align: 'center', width: '10%' },
  { id: 'avg', label: 'Avg Income', align: 'center', width: '10%' },
  { id: 'status', label: 'Status', align: 'center', width: '10%' },
];

// ----------------------------------------------------------------------

function BranchListView() {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    //
    onSort,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrderBy: 'title',
    defaultRowsPerPage: 25,
  });

  const router = useRouter();
  const { themeStretch } = useSettingsContext();
  const { fsGetAllBranches } = useAuthContext();
  const [filterName, setFilterName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { branches: maxBranchesAllowed } = useGetProductInfo();

  const { data: branchesData, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: fsGetAllBranches,
  });

  const handleFilterName = (filteredName) => {
    setFilterName(filteredName);
    setPage(0);
  };

  const handleEditRow = (id) => {
    router.push(paths.dashboard.branches.manage(id));
  };

  const dataFiltered = applySortFilter({
    tableData: branchesData,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const isNotFound = (!dataFiltered.length && !!filterName) || (!isLoading && !dataFiltered.length);

  const handleAddNewBranch = () => {
    // router.push(paths.dashboard.branches.new);
    if (branchesData?.length >= maxBranchesAllowed) {
      setIsOpen(true);
    } else {
      router.push(paths.dashboard.branches.new);
    }
  };

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Branches List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Branches List',
          },
        ]}
        action={
          <Button onClick={handleAddNewBranch} variant="contained">
            New Branch
          </Button>
        }
      />

      <Card>
        <MenusTableToolbar filterName={filterName} onFilterName={handleFilterName} />

        <Scrollbar>
          <TableContainer sx={{ minWidth: 960, position: 'relative' }}>
            <Table size="small">
              <TableHeadCustom
                disableSelectAllRows
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={branchesData?.length}
                numSelected={selected.length}
                onSort={onSort}
              />

              <TableBody>
                {!isLoading &&
                  dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <BranchTableRow
                        key={row?.docID}
                        row={row}
                        onEditRow={() => handleEditRow(row?.docID)}
                      />
                    ))}

                <TableEmptyRows
                  height={60}
                  emptyRows={emptyRows(page, rowsPerPage, branchesData?.length)}
                />

                <TableNoData isNotFound={isNotFound} />
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <Box sx={{ position: 'relative' }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={dataFiltered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
          />
        </Box>
      </Card>

      <ConfirmDialog
        maxWidth="md"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        closeText="Close"
        title="Max Allowed Branched Reached !"
        content={
          <Typography>
            You have reached your plan max allowed branches of{' '}
            <Label color="info"> {`${maxBranchesAllowed}`}</Label> , Please contact our sales team
            on{' '}
            <Box component="span" sx={{ fontWeight: 600 }}>
              hello@astro-menu.com{' '}
            </Box>
            to include more branches to your plan.
          </Typography>
        }
      />
    </Container>
  );
}
export default BranchListView;
// BranchListView.propTypes = { tables: PropTypes.array };

function applySortFilter({ tableData, comparator, filterName }) {
  const stabilizedThis = tableData?.map((el, index) => [el, index]) || [];

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  tableData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    tableData = tableData.filter(
      (item) => item.title.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return tableData;
}
