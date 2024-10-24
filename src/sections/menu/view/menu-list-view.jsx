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
import TableToolbar from 'src/components/table/table-toolbar';
import MenuNewDialog from 'src/sections/menu/menu-new-dialog';
import MenusTableRow from 'src/sections/menu/list/menu-table-row';
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
  { id: 'mostOrderedMeals', label: 'Most Ordered#', align: 'center', width: '15%' },
  { id: 'lastUpdate', label: 'Last Update', align: 'center', width: '30%' },
  { id: 'isDefault', label: 'Default', align: 'center', width: '15%' },
];

// ----------------------------------------------------------------------

function MenuListView() {
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
  const { fsGetAllMenus } = useAuthContext();
  const [tableData, setTableData] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [menuData, setMenuData] = useState({});

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['menus'],
    queryFn: () => fsGetAllMenus(),
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
    router.push(paths.dashboard.menu.manage(id));
  };

  const onNewMenu = () => {
    setMenuData({});
    setIsDialogOpen(true);
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
        heading="Menus"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Menus',
          },
        ]}
        action={onNewMenu}
      />

      <Card>
        <TableToolbar filterName={filterName} onFilterName={handleFilterName} />

        <Scrollbar>
          <TableContainer sx={{ minWidth: 660, position: 'relative' }}>
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
                      <MenusTableRow
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
      <MenuNewDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        menuData={menuData}
      />
    </Container>
  );
}
export default MenuListView;
// MenuListView.propTypes = { tables: PropTypes.array };

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
