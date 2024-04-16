import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Link, TableRow, TableCell, ListItemText } from '@mui/material';

import Label from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { useAuthContext } from 'src/auth/hooks';
// ----------------------------------------------------------------------

TableOrdersTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  onOrderClick: PropTypes.func,
  branchID: PropTypes.string,
};

export default function TableOrdersTableRow({ row, onOrderClick, branchID }) {
  const { fsGetMenu, fsGetStaffInfo, fsGetBranch } = useAuthContext();
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
    totalBill,
  } = row;

  const { data: menuInfo } = useQuery({
    queryKey: ['menu', menuID],
    queryFn: () => fsGetMenu(menuID),
  });

  const { data: staffInfo = {} } = useQuery({
    queryKey: ['staff', staffID],
    queryFn: () => fsGetStaffInfo(staffID),
    enabled: staffID !== '' || staffID !== undefined,
  });

  const { data: branchInfo = {} } = useQuery({
    queryKey: ['branch', branchID],
    queryFn: () => fsGetBranch(branchID),
  });

  const orderStatus = () => {
    if (isPaid) return ['Paid', 'success'];
    if (isCanceled) return ['Canceled', 'error'];
    if (isReadyToServe.length !== 0) return ['Ready to Serve', 'info'];
    if (isInKitchen.length !== 0) return ['Sent to Kitchen', 'warning'];
    if (isCanceled) return ['Canceled', 'error'];
    return ['In Progress', 'default'];
  };

  return (
    <TableRow hover>
      <TableCell>
        <Link
          noWrap
          variant="caption"
          onClick={onOrderClick}
          sx={{ color: 'text.disabled', cursor: 'pointer' }}
        >
          <ListItemText
            primary={fDate(new Date(lastUpdate.seconds * 1000))}
            secondary={docID}
            primaryTypographyProps={{ typography: 'body2', color: 'text.primary' }}
            secondaryTypographyProps={{ typography: 'caption', color: 'text.disabled' }}
          />
        </Link>
      </TableCell>
      <TableCell>
        <Link
          noWrap
          variant="caption"
          onClick={onOrderClick}
          sx={{ color: 'text.disabled', cursor: 'pointer' }}
        >
          <ListItemText
            primary={`${totalBill || 0} 
            ${branchInfo.currency}`}
            secondary={menuInfo?.title}
            primaryTypographyProps={{ typography: 'body2', color: 'text.primary' }}
            secondaryTypographyProps={{ typography: 'caption', color: 'text.disabled' }}
          />
        </Link>
      </TableCell>

      <TableCell align="left">{staffInfo?.fullname || 'Self Order'} </TableCell>
      <TableCell align="left">
        {' '}
        <Label variant="soft" color={orderStatus()[1]} sx={{ textTransform: 'capitalize' }}>
          {orderStatus()[0]}
        </Label>
      </TableCell>
    </TableRow>
  );
}
