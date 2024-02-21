import PropTypes from 'prop-types';

import { Box } from '@mui/material';

import Main from 'src/layouts/waiter/main';
import WaiterView from 'src/sections/waiter/view/waiter-view';
import TablesNavVertical from 'src/layouts/waiter/tables-nav-vertical';
import WaiterHorizontalNav from 'src/layouts/waiter/table-nav-horizontal';
import { WaiterContextProvider } from 'src/sections/waiter/context/waiter-context';

function WaiterLayout({ children }) {
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
