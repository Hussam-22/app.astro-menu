import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// @mui
import { useTheme } from '@mui/material/styles';
import { Button, TableRow, TableCell, Typography } from '@mui/material';

import Image from 'src/components/image';
import Label from 'src/components/label';
import { useAuthContext } from 'src/auth/hooks';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

TableDataRows.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
};
const THIS_YEAR = new Date().getFullYear();
const THIS_MONTH = new Date().getMonth();

export default function TableDataRows({ row, onEditRow }) {
  const theme = useTheme();
  const { user, fsGetBranchTablesCount } = useAuthContext();
  const { title, cover, isActive, id } = row;
  const [tablesCount, setTablesCount] = useState(0);

  const ordersCount = user.statisticsSummary?.branches[id]?.orders?.[THIS_YEAR]?.[THIS_MONTH] || 0;
  const thisMonthIncome =
    user?.statisticsSummary?.branches[id]?.income?.[THIS_YEAR]?.[THIS_MONTH] || 0;
  const thisMonthScans =
    user?.statisticsSummary?.branches[id]?.scans?.[THIS_YEAR]?.[THIS_MONTH] || 0;

  const textColor =
    theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.light;

  useEffect(() => {
    const getTablesCount = async () => {
      const count = await fsGetBranchTablesCount(row.id);
      return setTablesCount(count);
    };
    getTablesCount();
  }, [fsGetBranchTablesCount, row.id]);

  return (
    <TableRow hover>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Image
          disabledEffect
          alt={title}
          src={cover.url}
          sx={{ borderRadius: 1.5, width: 48, height: 48, mr: 2 }}
        />

        <Button variant="text" onClick={onEditRow} sx={{ color: textColor }}>
          {title}
        </Button>
      </TableCell>

      <TableCell align="center">{ordersCount}</TableCell>
      <TableCell align="center">{fCurrency(thisMonthIncome)}</TableCell>
      <TableCell align="center">{tablesCount}</TableCell>
      <TableCell align="center">{thisMonthScans}</TableCell>

      <TableCell align="center">
        <Label variant="soft" color={isActive ? 'success' : 'error'}>
          <Typography variant="caption">{isActive ? 'Active' : 'Disabled'}</Typography>
        </Label>
      </TableCell>
    </TableRow>
  );
}
