import React from 'react';
import PropTypes from 'prop-types';

import { Box, Drawer } from '@mui/material';

import FoodMenu from 'src/sections/waiter/food-menu/food-menu';

QrMenuDrawer.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

function QrMenuDrawer({ isOpen, onClose }) {
  return (
    <Drawer
      anchor="right"
      open={isOpen}
      PaperProps={{
        sx: {
          // maxHeight: '50%',
          // minHeight: '20%',
          maxWidth: 400,
        },
      }}
      onClose={onClose}
    >
      <Box sx={{ p: 2 }}>
        <FoodMenu />
      </Box>
    </Drawer>
  );
}

export default QrMenuDrawer;
