import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';

// @mui
import {
  Box,
  Card,
  Table,
  Button,
  TableBody,
  Container,
  TableContainer,
  TablePagination,
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
import TableToolbar from 'src/sections/staffs/list/TableToolbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import TableDataRows from 'src/sections/staffs/list/TableDataRows';
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

const TABLE_HEAD = [
  { id: 'fullname', label: 'Full Name', align: 'left', width: '30%' },
  { id: 'branch', label: `Assigned Branch`, align: 'center', width: '25%' },
  { id: 'type', label: `Staff Type`, align: 'center', width: '15%' },
  { id: 'lastLogIn', label: 'Last Login', align: 'center', width: '15%' },
  { id: 'isActive', label: 'Status', align: 'center', width: '15%' },
];

// ----------------------------------------------------------------------

export default function StaffsListView() {
  const router = useRouter();
  const { themeStretch } = useSettingsContext();
  const { fsGetStaffList } = useAuthContext();
  const [filterName, setFilterName] = useState('');
  const { dense, page, order, orderBy, rowsPerPage, setPage, onChangePage, onChangeRowsPerPage } =
    useTable({
      defaultOrderBy: 'fullname',
      defaultRowsPerPage: 10,
    });

  const { data: tableData = [] } = useQuery({
    queryKey: ['staffs'],
    queryFn: () => fsGetStaffList(),
  });

  const handleFilterName = (filteredName) => {
    setFilterName(filteredName);
    setPage(0);
  };

  const handleEditRow = (id) => {
    router.push(paths.dashboard.staffs.manage(id));
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
        heading="Staffs List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.staffs.root },
          {
            name: 'Staffs',
          },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            component={RouterLink}
            to={paths.dashboard.staffs.new}
          >
            New Staff
          </Button>
        }
      />

      <Card sx={{ mt: 4 }}>
        <TableToolbar filterName={filterName} onFilterName={handleFilterName} />

        <Scrollbar>
          <TableContainer sx={{ minWidth: 960, position: 'relative' }}>
            <Table size="small">
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
                {dataFiltered
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
      (item) => item.fullname.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return tableData;
}
