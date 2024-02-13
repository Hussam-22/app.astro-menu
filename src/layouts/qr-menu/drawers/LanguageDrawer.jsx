import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { Box } from '@mui/system';
import { Drawer } from '@mui/material';

import LanguageButton from '../components/LanguageButton';
import { rdxChangeLanguage } from '../../../redux/slices/qrMenu';

LanguageDrawer.propTypes = {
  openState: PropTypes.bool,
  toggleDrawer: PropTypes.func,
  lang: PropTypes.object,
};

function LanguageDrawer({ openState, toggleDrawer, lang }) {
  const dispatch = useDispatch();

  const onlanguagechange = (code) => {
    dispatch(rdxChangeLanguage(code));
    toggleDrawer('cart');
  };

  return (
    <Drawer
      anchor="bottom"
      open={openState}
      PaperProps={{
        sx: {
          maxHeight: '50%',
          minHeight: '20%',
          width: '100%',
        },
      }}
      onClose={() => toggleDrawer('cart')}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
        {lang.languages &&
          lang.languages.map((language) => (
            <LanguageButton code={language} key={language} onlanguagechange={onlanguagechange} />
          ))}
      </Box>
    </Drawer>
  );
}

export default LanguageDrawer;
