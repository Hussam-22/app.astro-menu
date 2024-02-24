import PropTypes from 'prop-types';

import { LoadingButton } from '@mui/lab';
import { Card, Stack, Button } from '@mui/material';

import Iconify from 'src/components/iconify';

function TableActionBar({ openDrawer }) {
  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <LoadingButton variant="soft" color="warning">
          Status Update
        </LoadingButton>
        <Button
          variant="soft"
          color="info"
          startIcon={<Iconify icon="mdi:food-outline" />}
          onClick={openDrawer}
        >
          Open Menu
        </Button>
      </Stack>
    </Card>
  );
}
export default TableActionBar;
TableActionBar.propTypes = { openDrawer: PropTypes.func };
