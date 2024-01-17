import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { Box, Chip, Card, Stack, Typography, CardHeader } from '@mui/material';

// ----------------------------------------------------------------------

TablesOccupation.propTypes = {
  branch: PropTypes.object,
  month: PropTypes.number,
  year: PropTypes.number,
};

export default function TablesOccupation({ branch, month, year }) {
  const tables = useSelector((state) => state.branch.tables);
  const monthLong = new Date(`${month + 1}/01/${year}`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const contentToRender = tables.map((table) => (
    <Stack
      direction="row"
      key={table.id}
      sx={{ display: 'flex', justifyContent: 'space-around', gap: 3 }}
    >
      <Typography sx={{ flexGrow: 1 }}>
        # {table.index} - {table.title}
      </Typography>
      <Typography>
        {branch.statisticsSummary?.tables?.[table.id]?.income?.[year]?.[month] || 0}
      </Typography>
      <Typography>
        {branch.statisticsSummary?.tables?.[table.id]?.scans?.[year]?.[month] || 0}
      </Typography>
    </Stack>
  ));

  return (
    <Card>
      <CardHeader title="Tables Income/Scans" action={<Chip label={monthLong} />} />
      <Box sx={{ p: 3 }}>
        <Stack direction="row" sx={{ display: 'flex', justifyContent: 'space-around', gap: 3 }}>
          <Stack direction="column" sx={{ flexGrow: 1 }}>
            <Typography variant="h6">Table</Typography>
          </Stack>
          <Typography variant="h6">Income</Typography>
          <Typography variant="h6">Scans</Typography>
        </Stack>
        {contentToRender}
      </Box>
    </Card>
  );
}
