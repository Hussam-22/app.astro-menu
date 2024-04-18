import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

import { Box, Stack } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { useParams, useRouter } from 'src/routes/hook';
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
  const { userID, branchID } = useParams();
  const router = useRouter();
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
    <Box
      sx={{
        py: 1.5,
        height: 70,
        position: 'fixed',
        bottom: 0,
        left: '50%',
        bgcolor: 'grey.900',
        width: 'inherit',
        maxWidth: 'inherit',
        transform: 'translateX(-50%)',
        borderRadius: '25px 25px 0 0',
      }}
    >
      <Stack
        direction="row"
        spacing={-1}
        sx={{ display: 'flex', justifyContent: 'space-around', my: 0.85, position: 'relative' }}
      >
        <ActionButton
          clickAction={() => router.push('.')}
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
          label={LANGUAGE_CODES[selectedLanguage].value}
          sx={{ color: '#FFF' }}
        />
      </Stack>

      {drawerStates.menu && (
        <SectionsDrawer openState={drawerStates.menu} toggleDrawer={setDrawerStates} />
      )}
      {drawerStates.cart && (
        <CartDrawer openState={drawerStates.cart} toggleDrawer={setDrawerStates} />
      )}
      {drawerStates.language && (
        <LanguageDrawer openState={drawerStates.language} toggleDrawer={setDrawerStates} />
      )}
    </Box>
  );
}

export default BottomNavModern;
