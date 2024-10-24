import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Link, TableRow, TableCell, ListItemText } from '@mui/material';

import Label from 'src/components/label';
import { useAuthContext } from 'src/auth/hooks';
import { fDateTime, fDistance } from 'src/utils/format-time';
// ----------------------------------------------------------------------

TableOrdersTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  onOrderClick: PropTypes.func,
  branchID: PropTypes.string,
};

export default function TableOrdersTableRow({ row, onOrderClick, branchID }) {
  const { fsGetMenu, fsGetStaffInfo, fsGetBranch, fsGetTableInfo } = useAuthContext();
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
    tableID,
    businessProfileID,
  } = row;

  const { data: menuInfo = {} } = useQuery({
    queryKey: ['menu', menuID],
    queryFn: () => fsGetMenu(menuID),
    enabled: docID !== undefined,
  });

  const { data: staffInfo = {} } = useQuery({
    queryKey: ['staff', staffID],
    queryFn: () => fsGetStaffInfo(staffID),
    enabled: staffID !== '' || staffID !== undefined,
  });

  const { data: branchInfo = {} } = useQuery({
    queryKey: ['branch', branchID],
    queryFn: () => fsGetBranch(branchID),
    enabled: docID !== undefined,
  });

  const { data: tableInfo = [] } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [`table`, branchID, tableID],
    queryFn: () => fsGetTableInfo(businessProfileID, branchID, tableID),
    enabled: docID !== undefined,
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
            primary={docID}
            primaryTypographyProps={{ typography: 'body2', color: 'text.primary' }}
          />
        </Link>
      </TableCell>
      <TableCell>{closingTime !== '' && fDateTime(new Date(closingTime.seconds * 1000))}</TableCell>
      <TableCell>
        {closingTime !== '' &&
          initiationTime !== '' &&
          fDistance(new Date(initiationTime.seconds * 1000), new Date(closingTime.seconds * 1000))}
      </TableCell>
      <TableCell>
        <ListItemText
          primary={`${totalBill || 0} 
            ${branchInfo.currency}`}
          secondary={menuInfo?.title}
          primaryTypographyProps={{
            typography: 'caption',
            color: orderStatus()[0] === 'Paid' ? 'success.main' : 'text.disabled',
          }}
          secondaryTypographyProps={{ typography: 'body2', color: 'text.disabled' }}
        />
      </TableCell>

      <TableCell align="left">{cart.length} </TableCell>
      <TableCell align="left">{staffInfo?.fullname || 'Self Order'} </TableCell>
      <TableCell align="center">{tableInfo.index} </TableCell>
      <TableCell align="left">
        <Label variant="soft" color={orderStatus()[1]} sx={{ textTransform: 'capitalize' }}>
          {orderStatus()[0]}
        </Label>
      </TableCell>
    </TableRow>
  );
}
