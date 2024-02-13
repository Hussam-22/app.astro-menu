import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { Stack, Paper, Divider } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import CartDrawer from 'src/layouts/qr-menu/drawers/CartDrawer';
import ActionButton from 'src/layouts/qr-menu/components/ActionButton';
import LanguageDrawer from 'src/layouts/qr-menu/drawers/LanguageDrawer';
import SectionsDrawer from 'src/layouts/qr-menu/drawers/SectionsDrawer';

BottomNavModern.propTypes = {
  containerWidth: PropTypes.number,
};

function BottomNavModern({ containerWidth }) {
  const { orderSnapShot } = useAuthContext();
  const [drawerStates, setDrawerStates] = useState({
    menu: false,
    cart: false,
    language: false,
  });
  const { selectedLanguage, languages, defaultLanguage, filterKeywords } = useSelector(
    (state) => state.qrMenu
  );

  // const totalCartItems =
  //   (dataSnapshotListener?.isPaid === false &&
  //     dataSnapshotListener?.isCanceled === false &&
  //     dataSnapshotListener?.id &&
  //     dataSnapshotListener?.cart?.length) ||
  //   0;

  const totalCartItems = useMemo(
    () =>
      orderSnapShot?.cart?.reduce((accumulator, cartPortion) => cartPortion.qty + accumulator, 0),
    [orderSnapShot?.cart]
  );

  const isFilterApplied = useMemo(
    () => Object.values(filterKeywords).includes(true),
    [filterKeywords]
  );

  const toggleDrawer = (drawer) => {
    setDrawerStates((state) => ({ ...state, [drawer]: !state[drawer] }));
  };

  return (
    <>
      <Paper
        sx={{
          p: 0.4,
          position: 'fixed',
          bottom: 15,
          left: ' 50%',
          transform: 'translateX(-50%)',
          width: containerWidth,
          height: 50,
          background: 'linear-gradient(15deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,1) 82%)',
          backdropFilter: 'blur(8px)',
          // border: 'solid 2px #494949',
          borderRadius: 2,
          zIndex: 12,
        }}
      >
        <Stack
          direction="row"
          spacing={-1}
          sx={{ display: 'flex', justifyContent: 'space-around', my: 0.85, position: 'relative' }}
          divider={
            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderStyle: 'dashed', borderColor: '#494949' }}
            />
          }
        >
          <ActionButton
            clickAction={() => {}}
            icon="ph:arrow-fat-left-fill"
            label="Home"
            sx={{ color: '#FFF' }}
          />
          <ActionButton
            clickAction={() => toggleDrawer('menu')}
            icon="mdi:food"
            label="Menu"
            sx={{ color: '#FFF' }}
            badgeContent={isFilterApplied ? ' ' : null}
          />
          <ActionButton
            clickAction={() => toggleDrawer('cart')}
            icon="ph:shopping-cart-simple-fill"
            label="Cart"
            sx={{ color: '#FFF' }}
            badgeContent={totalCartItems || 0}
          />
          <ActionButton
            clickAction={() => toggleDrawer('language')}
            icon="material-symbols:language"
            label={LANGUAGE_CODES[selectedLanguage]}
            sx={{ color: '#FFF' }}
          />
        </Stack>
      </Paper>

      {drawerStates.menu && (
        <SectionsDrawer openState={drawerStates.menu} toggleDrawer={setDrawerStates} />
      )}
      {drawerStates.cart && (
        <CartDrawer openState={drawerStates.cart} toggleDrawer={setDrawerStates} />
      )}
      {drawerStates.language && (
        <LanguageDrawer
          openState={drawerStates.language}
          toggleDrawer={setDrawerStates}
          lang={{ selectedLanguage, languages, defaultLanguage }}
        />
      )}
    </>
  );
}

export default BottomNavModern;
