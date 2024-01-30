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
import MealTableToolbar from 'src/sections/meal/list/MealTableToolbar';
import MealLabelTableRow from 'src/sections/meal/list/MealLabelTableRow';
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
  { id: 'title', label: 'Meal', align: 'center', width: '60%' },
  { id: 'isActive', label: 'Status', align: 'center', width: '15%' },
  { id: 'actionButtons', label: '', align: 'center', width: '25%' },
];
// ----------------------------------------------------------------------

function MealLabelsView() {
  const router = useRouter();
  const { themeStretch } = useSettingsContext();
  const { page, order, orderBy, rowsPerPage, setPage, onSort, onChangePage, onChangeRowsPerPage } =
    useTable({
      defaultOrderBy: 'title',
    });

  const { fsGetMealLabels } = useAuthContext();
  const [filterName, setFilterName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // const { data: allMeals = [] } = useQuery({
  //   queryKey: [`meal-labels`],
  //   queryFn: fsGetMealLabels,
  // });

  const { data: mealLabelsList = [] } = useQuery({
    queryKey: ['meal-labels'],
    queryFn: fsGetMealLabels,
  });

  const handleFilterName = (filteredName) => {
    setFilterName(filteredName);
    setPage(0);
  };

  const handleEditRow = (id) => {
    router.push(paths.dashboard.meal.manage(id));
  };

  const dataFiltered = applySortFilter({
    mealLabelsList,
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
                rowCount={mealLabelsList.length}
                onSort={onSort}
              />

              <TableBody>
                {(mealLabelsList.length === 0 ? [...Array(rowsPerPage)] : dataFiltered)
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((row, index) =>
                    row ? (
                      <MealLabelTableRow
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
                  emptyRows={emptyRows(page, rowsPerPage, mealLabelsList.length)}
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
export default MealLabelsView;
// MealLabelsView.propTypes = { tables: PropTypes.array };

function applySortFilter({ mealLabelsList, comparator, filterName }) {
  const stabilizedThis = mealLabelsList?.map((el, index) => [el, index]) || [];

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  mealLabelsList = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    mealLabelsList = mealLabelsList.filter(
      (item) => item.title.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return mealLabelsList;
}
