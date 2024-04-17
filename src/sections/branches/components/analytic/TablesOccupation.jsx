import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Box, Chip, Card, Stack, useTheme, Typography, CardHeader } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

TablesOccupation.propTypes = {
  branch: PropTypes.object,
  month: PropTypes.number,
  year: PropTypes.number,
};

export default function TablesOccupation({ branch, month, year }) {
  const theme = useTheme();
  const { fsGetBranchTables } = useAuthContext();
  const monthLong = new Date(`${month + 1}/01/${year}`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const { data: tables = [] } = useQuery({
    queryKey: ['branch-tables', branch.docID],
    queryFn: () => fsGetBranchTables(branch.docID),
  });

  const tablesScansUsage = tables
    .sort(
      (a, b) =>
        (b?.statisticsSummary?.scans?.[year]?.[month] || 0) -
        (a?.statisticsSummary?.scans?.[year]?.[month] || 0)
    )
    .slice(0, 10);

  const contentToRender = (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 1, p: 3 }}>
      {tablesScansUsage.map((table) => {
        if (!table?.statisticsSummary?.scans?.[year]?.[month]) return null;
        return (
          <Box
            key={table.docID}
            sx={{ border: `dashed 1px ${theme.palette.divider}`, borderRadius: 1, p: 1 }}
          >
            <Typography>Table# {table.index}</Typography>
            <Stack direction="row" spacing={1}>
              <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                Total Scans:
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                {table?.statisticsSummary?.scans?.[year]?.[month] || 0}
              </Typography>
            </Stack>
          </Box>
        );
      })}
    </Box>
  );

  if (
    tablesScansUsage.filter((table) => table?.statisticsSummary?.scans?.[year]?.[month]).length ===
    0
  )
    return (
      <Card sx={{ p: 3, height: 1 }}>
        <Stack
          alignItems="center"
          justifyContent="center"
          direction="row"
          spacing={1}
          sx={{ my: 'auto', height: 1 }}
        >
          <Iconify
            icon="ph:warning-circle-light"
            sx={{ width: 28, height: 28, color: theme.palette.text.disabled }}
          />
          <Typography variant="h4" sx={{ color: theme.palette.text.disabled }}>
            No Statistics Available
          </Typography>
        </Stack>
      </Card>
    );

  return (
    <Card>
      <CardHeader
        title="Top 10 Tables Scans Overview"
        subheader="tables with ZERO scans will not show"
        action={<Chip label={monthLong} />}
      />
      {contentToRender}
    </Card>
  );
}
