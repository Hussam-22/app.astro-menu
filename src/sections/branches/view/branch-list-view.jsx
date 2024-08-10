import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  Box,
  Card,
  Table,
  TableBody,
  Container,
  TableContainer,
  TablePagination,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import MenusTableToolbar from 'src/sections/menu/list/menu-table-toolbar';
import BranchTableRow from 'src/sections/branches/components/table/branch-table-row';
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
  { id: 'title', label: 'Menu Name', align: 'left', width: '40%' },
  { id: 'lastUpdate', label: 'Last Update', align: 'center', width: '30%' },
  { id: 'selfOrder', label: 'Self-Order', align: 'center', width: '15%' },
  { id: 'skipKitchen', label: 'Skip Kitchen', align: 'center', width: '15%' },
  { id: 'status', label: 'Status', align: 'center', width: '15%' },
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
  const { fsGetAllBranches, fbTranslateKeyword } = useAuthContext();
  const [tableData, setTableData] = useState([]);
  const [filterName, setFilterName] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: fsGetAllBranches,
  });

  useEffect(() => {
    if (data?.length !== 0) {
      setTableData(data);
    }
  }, [data]);

  const handleFilterName = (filteredName) => {
    setFilterName(filteredName);
    setPage(0);
  };

  const handleEditRow = (id) => {
    router.push(paths.dashboard.branches.manage(id));
  };

  const dataFiltered = applySortFilter({
    tableData,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const isNotFound = (!dataFiltered.length && !!filterName) || (!isLoading && !dataFiltered.length);

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
                rowCount={tableData?.length}
                numSelected={selected.length}
                onSort={onSort}
              />

              <TableBody>
                {(isLoading ? [...Array(rowsPerPage)] : dataFiltered)
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) =>
                    row ? (
                      <BranchTableRow
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
                  emptyRows={emptyRows(page, rowsPerPage, tableData?.length)}
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
