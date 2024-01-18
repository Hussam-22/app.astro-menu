import { Helmet } from 'react-helmet-async';

import MenuListView from 'src/sections/menu/view/menu-list-view';

function MenuListPage() {
  return (
    <>
      <Helmet>
        <title>Menu | List</title>
      </Helmet>
      <MenuListView />
    </>
  );
}
export default MenuListPage;
