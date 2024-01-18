import { Helmet } from 'react-helmet-async';

import MenuManageView from 'src/sections/menu/view/menu-manage-view';

function MenuManagePage() {
  return (
    <>
      <Helmet>
        <title> Menu | Manage</title>
      </Helmet>
      <MenuManageView />
    </>
  );
}
export default MenuManagePage;
