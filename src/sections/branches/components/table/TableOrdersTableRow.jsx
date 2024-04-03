import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Link, TableRow, TableCell } from '@mui/material';

import Label from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { useAuthContext } from 'src/auth/hooks';
import { fCurrency } from 'src/utils/format-number';
// ----------------------------------------------------------------------

TableOrdersTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  selected: PropTypes.bool,
  onViewRow: PropTypes.func,
};

export default function TableOrdersTableRow({ row, selected, onViewRow }) {
  const { fsGetMenu, fsGetStaffInfo } = useAuthContext();
  const {
    docID,
    menuID,
    cart,
    lastUpdate,
    isPaid,
    isCanceled,
    isInKitchen,
    isReadyToServe,
    staffID,
  } = row;
  const totalBill = cart.reduce((sum, meal) => sum + meal.price, 0);

  const { data: menuInfo } = useQuery({
    queryKey: ['menu', menuID],
    queryFn: () => fsGetMenu(menuID),
  });

  const { data: staffInfo = {} } = useQuery({
    queryKey: ['staff', staffID],
    queryFn: () => fsGetStaffInfo(staffID),
    enabled: staffID !== '' || staffID !== undefined,
  });

  console.log(staffInfo);

  const orderStatus = () => {
    if (isPaid) return ['Paid', 'success'];
    if (isCanceled) return ['Canceled', 'error'];
    if (isReadyToServe.length !== 0) return ['Ready to Serve', 'info'];
    if (isInKitchen.length !== 0) return ['Sent to Kitchen', 'warning'];
    if (isCanceled) return ['Canceled', 'error'];
    return ['In Progress', 'default'];
  };

  return (
    <TableRow hover selected={selected}>
      <TableCell>
        <Link
          noWrap
          variant="caption"
          onClick={onViewRow}
          sx={{ color: 'text.disabled', cursor: 'pointer' }}
        >
          {docID}
        </Link>
      </TableCell>
      <TableCell align="left">{fDate(new Date(lastUpdate.seconds * 1000))}</TableCell>
      <TableCell align="left">{menuInfo?.title}</TableCell>
      <TableCell align="center">{fCurrency(totalBill)}</TableCell>
      <TableCell align="center" sx={{ textTransform: 'capitalize' }}>
        {staffInfo?.fullname || ''}
      </TableCell>

      <TableCell align="left">
        <Label variant="filled" color={orderStatus()[1]} sx={{ textTransform: 'capitalize' }}>
          {orderStatus()[0]}
        </Label>
      </TableCell>
    </TableRow>
  );
}
