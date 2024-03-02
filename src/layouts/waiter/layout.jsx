import PropTypes from 'prop-types';

import { Box } from '@mui/material';

import Main from 'src/layouts/waiter/main';
import { useAuthContext } from 'src/auth/hooks';
import RestaurantLoginLayout from 'src/layouts/waiter/auth';
import WaiterView from 'src/sections/waiter/view/waiter-view';
import TablesNavVertical from 'src/layouts/waiter/tables-nav-vertical';
import WaiterHorizontalNav from 'src/layouts/waiter/table-nav-horizontal';
import RestaurantLoginFormView from 'src/sections/waiter/view/loging-form-view';
import { WaiterContextProvider } from 'src/sections/waiter/context/waiter-context';

function WaiterLayout({ children }) {
  const { staff } = useAuthContext();

  if (!staff?.docID || !staff?.isActive || !staff?.isLoggedIn)
    return (
      <WaiterContextProvider>
        <RestaurantLoginLayout>
          <RestaurantLoginFormView />
        </RestaurantLoginLayout>
      </WaiterContextProvider>
    );

  if (staff?.docID && staff?.isActive && staff?.isLoggedIn)
    return (
      <WaiterContextProvider>
        <Box
          sx={{
            minHeight: 1,
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <TablesNavVertical />
          <Main>
            <WaiterHorizontalNav />
            <WaiterView>{children}</WaiterView>
          </Main>
        </Box>
      </WaiterContextProvider>
    );
}
export default WaiterLayout;

WaiterLayout.propTypes = { children: PropTypes.node };
