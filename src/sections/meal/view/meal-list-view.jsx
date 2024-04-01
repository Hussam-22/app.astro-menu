import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

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
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import MealTableRow from 'src/sections/meal/list/MealTableRow';
import MealTableToolbar from 'src/sections/meal/list/MealTableToolbar';
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
  { id: 'title', label: 'Meal', align: 'center', width: '40%' },
  { id: 'portions', label: 'Portions', align: 'center', width: '5%' },
  { id: 'meal-labels', label: 'Meal Labels', align: 'center', width: '25%' },
  { id: 'isNew', label: 'New', align: 'center', width: '5%' },
  { id: 'status', label: 'Status', align: 'center', width: '15%' },
];
// ----------------------------------------------------------------------

function MealListView() {
  const { page, order, orderBy, rowsPerPage, setPage, onSort, onChangePage, onChangeRowsPerPage } =
    useTable({
      defaultOrderBy: 'title',
    });
  const { themeStretch } = useSettingsContext();
  const router = useRouter();
  const { fsGetAllMeals, fsGetMealLabels } = useAuthContext();
  const [filterName, setFilterName] = useState('');

  const {
    data: allMeals = [],
    isLoading,
    isError,
    isLoadingError,
    failureCount,
    isFetching,
  } = useQuery({
    queryKey: [`meals`],
    queryFn: () => fsGetAllMeals(),
  });

  console.log({ isLoading, isError, isLoadingError, failureCount, isFetching });

  const { data: mealLabelsList = [] } = useQuery({
    queryKey: ['meal-labels'],
    queryFn: () => fsGetMealLabels(),
  });

  const handleFilterName = (filteredName) => {
    setFilterName(filteredName);
    setPage(0);
  };

  const handleEditRow = (id) => {
    router.push(paths.dashboard.meal.manage(id));
  };

  const dataFiltered = applySortFilter({
    allMeals,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const isNotFound = (!dataFiltered.length && !!filterName) || !dataFiltered.length;

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Meals List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Meals List',
          },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => router.push(paths.dashboard.meal.new)}
          >
            New Meal
          </Button>
        }
      />

      <Card>
        <MealTableToolbar filterName={filterName} onFilterName={handleFilterName} />

        <Scrollbar>
          <TableContainer sx={{ minWidth: 960, position: 'relative' }}>
            <Table size="small">
              <TableHeadCustom
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={allMeals.length}
                onSort={onSort}
              />
              {failureCount !== 0 && (
                <TableBody>
                  {[...Array(rowsPerPage)].map((_, index) => (
                    <TableSkeleton key={index} sx={{ height: 60 }} />
                  ))}
                </TableBody>
              )}

              <TableBody>
                {(allMeals.length === 0 ? [...Array(rowsPerPage)] : dataFiltered)
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((row, index) =>
                    row ? (
                      <MealTableRow
                        key={row.docID}
                        row={row}
                        onEditRow={() => handleEditRow(row.docID)}
                        mealLabelsList={mealLabelsList}
                      />
                    ) : (
                      !isNotFound && <TableSkeleton key={index} sx={{ height: 60 }} />
                    )
                  )}

                <TableEmptyRows
                  height={60}
                  emptyRows={emptyRows(page, rowsPerPage, allMeals.length)}
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
  );
}
export default MealListView;
// MealListView.propTypes = { tables: PropTypes.array };

function applySortFilter({ allMeals, comparator, filterName }) {
  const stabilizedThis = allMeals?.map((el, index) => [el, index]) || [];

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  allMeals = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    allMeals = allMeals.filter(
      (item) => item.title.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return allMeals;
}
