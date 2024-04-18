import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';

// @mui
import {
  Box,
  Card,
  Table,
  Button,
  TableRow,
  TableBody,
  Container,
  TableCell,
  TableContainer,
  TablePagination,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import Iconify from 'src/components/iconify';
// redux
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
// sections
// hooks
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import TableToolbar from 'src/sections/branches/list/TableToolbar';
import TableDataRows from 'src/sections/branches/list/TableDataRows';
// components
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

const monthLong = new Date(`${new Date().getMonth() + 1}`).toLocaleDateString('en-US', {
  month: 'long',
});

const TABLE_HEAD = [
  { id: 'title', label: 'Branch Name', align: 'left', width: '40%' },
  { id: 'orders', label: `(${monthLong}) Orders`, align: 'center', width: '15%' },
  { id: 'income', label: `(${monthLong}) Income`, align: 'center', width: '15%' },
  { id: 'scans', label: `(${monthLong}) Scans`, align: 'center', width: '15%' },
  { id: 'status', label: 'Status', align: 'center', width: '15%' },
];

// ----------------------------------------------------------------------

export default function BranchesListView() {
  const { dense, page, order, orderBy, rowsPerPage, setPage, onChangePage, onChangeRowsPerPage } =
    useTable({
      defaultOrderBy: 'title',
      defaultRowsPerPage: 10,
    });
  const { themeStretch } = useSettingsContext();
  const router = useRouter();
  const { fsGetAllBranches } = useAuthContext();
  const [filterName, setFilterName] = useState('');

  const {
    data: tableData = [],
    isFetching,
    failureCount,
  } = useQuery({
    queryKey: ['branches'],
    queryFn: () => fsGetAllBranches(),
  });

  const handleFilterName = (filteredName) => {
    setFilterName(filteredName);
    setPage(0);
  };

  const handleEditRow = (id) => {
    // dispatch(rdxSetBranchByID(id));
    router.push(paths.dashboard.branches.manage(id));
  };

  const dataFiltered = applySortFilter({
    tableData,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const isNotFound = !dataFiltered.length && !!filterName;

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Branches List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.branches.root },
          {
            name: 'Branches',
          },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            component={RouterLink}
            to={paths.dashboard.branches.new}
          >
            New Branch
          </Button>
        }
      />

      <Card sx={{ mt: 4 }}>
        <TableToolbar filterName={filterName} onFilterName={handleFilterName} />

        <Scrollbar>
          <TableContainer sx={{ minWidth: 960, position: 'relative' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                disableSelectAllRows
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                // numSelected={selected.length}
                // onSort={onSort}
              />

              <TableBody>
                {(isFetching || failureCount !== 0) && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                )}
                {!isFetching &&
                  failureCount === 0 &&
                  dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) =>
                      row ? (
                        <TableDataRows
                          key={row.docID}
                          row={row}
                          onEditRow={() => handleEditRow(row.docID)}
                        />
                      ) : (
                        !isNotFound && <TableSkeleton key={index} sx={{ height: 60 }} />
                      )
                    )}

                <TableEmptyRows
                  height={60}
                  emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
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
    </Container>
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
      (item) => item.title.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return tableData;
}
