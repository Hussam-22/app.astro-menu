import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Link, TableRow, TableCell, ListItemText } from '@mui/material';

import Label from 'src/components/label';
import { useAuthContext } from 'src/auth/hooks';
import getCartTotal from 'src/utils/getCartTotal';
import { fDateTime, fDistance } from 'src/utils/format-time';
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
    closingTime,
    isPaid,
    isCanceled,
    isInKitchen,
    isReadyToServe,
    staffID,
    totalBill,
    initiationTime,
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

  const calculatedTotalBill = getCartTotal(cart, branchInfo.taxValue);

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
            primary={docID}
            secondary={fDateTime(new Date(initiationTime.seconds * 1000))}
            primaryTypographyProps={{ typography: 'body2', color: 'text.primary' }}
            secondaryTypographyProps={{ typography: 'caption', color: 'text.disabled' }}
          />
        </Link>
      </TableCell>
      <TableCell>{closingTime !== '' && fDateTime(new Date(closingTime.seconds * 1000))}</TableCell>
      <TableCell>
        {closingTime !== '' &&
          fDistance(new Date(initiationTime.seconds * 1000), new Date(closingTime.seconds * 1000))}
      </TableCell>
      <TableCell>
        <Link
          noWrap
          variant="caption"
          onClick={onOrderClick}
          sx={{ color: 'text.disabled', cursor: 'pointer' }}
        >
          <ListItemText
            primary={`${calculatedTotalBill || 0} 
            ${branchInfo.currency}`}
            secondary={menuInfo?.title}
            primaryTypographyProps={{
              typography: 'body2',
              color: orderStatus()[0] === 'Paid' ? 'success.main' : 'text.disabled',
            }}
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
