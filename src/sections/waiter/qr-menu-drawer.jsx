import React from 'react';
import PropTypes from 'prop-types';

import { Box } from '@mui/material';

import Scrollbar from 'src/components/scrollbar';
import FoodMenu from 'src/sections/waiter/food-menu/food-menu';

QrMenuDrawer.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

function QrMenuDrawer({ isOpen, onClose }) {
  return (
    // <Drawer
    //   anchor="right"
    //   open={isOpen}
    //   PaperProps={{
    //     sx: {
    //       // maxHeight: '50%',
    //       // minHeight: '20%',
    //       maxWidth: 400,
    //     },
    //   }}
    //   onClose={onClose}
    // >
    <Scrollbar sx={{ height: '100dvh' }}>
      <Box>
        <FoodMenu />
      </Box>
    </Scrollbar>
    // </Drawer>
  );
}

export default QrMenuDrawer;
