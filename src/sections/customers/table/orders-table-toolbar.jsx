import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Stack, Select, MenuItem, Typography, CircularProgress } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

TableToolbarOrders.propTypes = {
  getData: PropTypes.func,
};

const ORDERS_STATUS = ['all', 'paid', 'cancelled'];
const PERIOD = [1, 8, 24];

export default function TableToolbarOrders({ getData }) {
  const { fsGetOrdersByFilter, fsGetAllBranches } = useAuthContext();
  const [search, setSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    branchID: 0,
    period: PERIOD[0],
    status: ORDERS_STATUS[0],
  });

  const { data: branchesData, isLoading: branchIsLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: fsGetAllBranches,
  });

  const {
    data: searchResults,
    isLoading: isSearchingLoading,
    isFetched,
    error,
  } = useQuery({
    queryKey: ['searchOrders', searchFilters],
    queryFn: () => fsGetOrdersByFilter(searchFilters),
    enabled: search,
  });

  console.log(error);

  useEffect(() => {
    if (isFetched) {
      getData(searchResults?.data || []);
      setSearch(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetched]);

  const onFilterChange = (filter, value) => {
    setSearchFilters((state) => ({ ...state, [filter]: value }));
  };

  if (branchIsLoading) return <div>Loading...</div>;

  return (
    <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
      {/* ------ BRANCH ------ */}
      <Select
        value={searchFilters.branchID}
        variant="outlined"
        onChange={(e) => onFilterChange('branchID', e.target.value)}
        sx={{ minWidth: 200 }}
      >
        <MenuItem value={0}>Select Branch</MenuItem>
        {branchesData?.map((branch) => (
          <MenuItem key={branch.docID} value={branch.docID}>
            {branch.title}
          </MenuItem>
        ))}
      </Select>
      {/* ------ STATUS ------ */}
      <Select
        value={searchFilters.status}
        variant="outlined"
        onChange={(e) => onFilterChange('status', e.target.value)}
        sx={{ minWidth: 200 }}
        disabled={searchFilters.branchID === 0}
      >
        <MenuItem value={ORDERS_STATUS[0]}>{ORDERS_STATUS[0]}</MenuItem>
        {ORDERS_STATUS.slice(1)?.map((status) => (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ))}
      </Select>
      {/* ------ PERIOD ------ */}
      <Select
        value={searchFilters.period}
        variant="outlined"
        onChange={(e) => onFilterChange('period', e.target.value)}
        sx={{ minWidth: 200 }}
        disabled={searchFilters.branchID === 0}
      >
        <MenuItem value={PERIOD[0]}>{`Last ${PERIOD[0]} Hour`}</MenuItem>
        {PERIOD.slice(1)?.map((period) => (
          <MenuItem key={period} value={period}>
            {`Last ${period} Hour`}
          </MenuItem>
        ))}
      </Select>
      <LoadingButton
        size="large"
        variant="soft"
        color="primary"
        onClick={() => setSearch(true)}
        disabled={searchFilters.branchID === 0}
        startIcon={<Iconify icon="line-md:list-3-twotone" />}
      >
        Get Orders
      </LoadingButton>
      <Typography>Total Orders: </Typography>
      {isSearchingLoading ? (
        <CircularProgress size={14} color="secondary" />
      ) : (
        searchResults?.count || 0
      )}
    </Stack>
  );
}
