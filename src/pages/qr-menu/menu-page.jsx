import { Helmet } from 'react-helmet-async';

import QrMenuView from 'src/sections/qr-menu/view/menu-view';

export default function QrMenuPage() {
  return (
    <>
      <Helmet>
        <title>Menu</title>
      </Helmet>
      <QrMenuView />
    </>
  );
}
