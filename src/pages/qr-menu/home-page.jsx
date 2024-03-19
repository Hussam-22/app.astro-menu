import { Helmet } from 'react-helmet-async';

import QRMenuHomeView from 'src/sections/qr-menu/view/home-view';

export default function QrMenuHomePage() {
  return (
    <>
      <Helmet>
        <title>Welcome to ProzEffect Menu</title>
      </Helmet>
      <QRMenuHomeView />
    </>
  );
}
