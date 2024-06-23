import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { Box, Stack, useTheme } from '@mui/material';

import { useRouter } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import CartDrawer from 'src/sections/qr-menu/drawers/cart-drawer';
import ActionButton from 'src/sections/qr-menu/components/ActionButton';
import SectionsDrawer from 'src/sections/qr-menu/drawers/sections-drawer';
import LanguageDrawer from 'src/sections/qr-menu/drawers/language-drawer';
import MealTypeDrawer from 'src/sections/qr-menu/drawers/meal-type-drawer';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

// BottomNavModern.propTypes = {
//   containerWidth: PropTypes.number,
// };

function BottomNavModern() {
  const theme = useTheme();
  const router = useRouter();
  const navigate = useNavigate();
  const {
    orderSnapShot: { cart, docID },
    businessProfile,
  } = useAuthContext();
  const { labels, selectedLanguage, branchInfo, tableInfo, getTranslation } = useQrMenuContext();
  const [drawerStates, setDrawerStates] = useState({
    menu: false,
    cart: false,
    language: false,
    filter: false,
  });

  const isMenuOnly = useMemo(
    () => businessProfile?.planInfo?.at(-1)?.isMenuOnly,
    [businessProfile]
  );

  const totalCartItems = useMemo(
    () => cart?.reduce((accumulator, cartPortion) => cartPortion.qty + accumulator, 0),
    [cart]
  );

  const openDrawer = (drawer) => {
    setDrawerStates((state) => ({ ...state, [drawer]: true }));
  };

  const closeDrawer = (drawer) => {
    setDrawerStates((state) => ({ ...state, [drawer]: false }));
  };

  if (!branchInfo.isActive || !tableInfo.isActive) return null;

  return (
    <Box
      sx={{
        py: 1,
        height: 70,
        position: 'fixed',
        bottom: 0,
        left: '50%',
        bgcolor: 'grey.100',
        width: 'inherit',
        maxWidth: 'inherit',
        transform: 'translateX(-50%)',
        background: theme.palette.background.default,
        borderTop: `1px solid ${theme.palette.divider}`,
        overflow: 'visible',
      }}
    >
      <Stack
        direction="row"
        spacing={0}
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          position: 'relative',
          py: 0.75,
          overflow: 'visible',
        }}
      >
        <ActionButton
          onClick={() => router.push('.')}
          icon="/assets/icons/qr-menu/arrow-left.svg"
          label={getTranslation('home')}
          sx={{ color: '#000' }}
        />
        <ActionButton
          onClick={() => openDrawer('language')}
          icon="/assets/icons/qr-menu/language.svg"
          label={LANGUAGE_CODES[selectedLanguage].value}
          sx={{ color: '#000' }}
        />
        {docID && tableInfo.index !== 0 && !isMenuOnly && (
          <ActionButton
            onClick={() => openDrawer('cart')}
            icon="/assets/icons/qr-menu/bill.svg"
            label={getTranslation('bill')}
            sx={{ color: '#000' }}
            badgeContent={totalCartItems || 0}
          />
        )}
        <ActionButton
          onClick={() => openDrawer('filter')}
          icon="/assets/icons/qr-menu/filter.svg"
          label={getTranslation('filter')}
          sx={{ color: '#000' }}
          badgeContent={labels.length === 0 ? null : ''}
        />
        <ActionButton
          onClick={() => openDrawer('menu')}
          icon="/assets/icons/qr-menu/food-menu.svg"
          label={getTranslation('menu')}
          sx={{ color: '#000' }}
        />
      </Stack>

      <LanguageDrawer openState={drawerStates.language} onClose={() => closeDrawer('language')} />
      <CartDrawer openState={drawerStates.cart} onClose={() => closeDrawer('cart')} />
      <SectionsDrawer openState={drawerStates.menu} onClose={() => closeDrawer('menu')} />
      <MealTypeDrawer openState={drawerStates.filter} onClose={() => closeDrawer('filter')} />
    </Box>
  );
}

export default BottomNavModern;
