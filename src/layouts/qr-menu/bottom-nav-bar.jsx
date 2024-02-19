import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

import { Stack, Paper, Divider } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import CartDrawer from 'src/sections/qr-menu/drawers/cart-drawer';
import ActionButton from 'src/sections/qr-menu/components/ActionButton';
import LanguageDrawer from 'src/sections/qr-menu/drawers/language-drawer';
import SectionsDrawer from 'src/sections/qr-menu/drawers/sections-drawer';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

BottomNavModern.propTypes = {
  containerWidth: PropTypes.number,
};

function BottomNavModern({ containerWidth }) {
  const { orderSnapShot } = useAuthContext();
  const { labels, selectedLanguage } = useQrMenuContext();
  const [drawerStates, setDrawerStates] = useState({
    menu: false,
    cart: false,
    language: false,
  });

  const totalCartItems = useMemo(
    () =>
      orderSnapShot?.cart?.reduce((accumulator, cartPortion) => cartPortion.qty + accumulator, 0),
    [orderSnapShot?.cart]
  );

  const toggleDrawer = (drawer) => {
    setDrawerStates((state) => ({ ...state, [drawer]: !state[drawer] }));
  };

  if (orderSnapShot?.docID === undefined) return null;

  return (
    <>
      <Paper
        sx={{
          p: 0.4,
          position: 'fixed',
          bottom: 15,
          left: ' 50%',
          transform: 'translateX(-50%)',
          width: containerWidth - 50,
          height: 50,
          // background: 'linear-gradient(15deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,1) 82%)',
          backdropFilter: 'blur(8px)',
          // border: 'solid 2px #494949',
          borderRadius: 1,
          zIndex: 12,
          background:
            'linear-gradient(55deg, #212121 0%, #212121 40%, #323232 calc(40% + 1px), #323232 60%, #323232 calc(60% + 1px), #323232 70%, #992f54 calc(70% + 1px), #992f54 100%)',
          backgroundBlendMode: 'screen, overlay, hard-light, normal',
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
            badgeContent={labels.length === 0 ? null : ''}
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
        <LanguageDrawer openState={drawerStates.language} toggleDrawer={setDrawerStates} />
      )}
    </>
  );
}

export default BottomNavModern;
