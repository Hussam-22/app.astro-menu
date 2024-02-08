import { Helmet } from 'react-helmet-async';

import QrMenuView from 'src/sections/qr-menu/qr-menu-view';

export default function QrMenuPage() {
  return (
    <>
      <Helmet>
        <title> QR-Menu-Page</title>
      </Helmet>
      <QrMenuView />
    </>
  );
}
