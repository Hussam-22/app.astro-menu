import PropTypes from 'prop-types';
import { QRCodeCanvas } from 'qrcode.react';

import { DOMAINS } from 'src/config-global';
import { useAuthContext } from 'src/auth/hooks';

DownloadAllQRs.propTypes = { tables: PropTypes.array };

// const qrURL = `https://menu-astro-menu.vercel.app/${user.businessProfileID}/${tableInfo?.branchID}/${tableInfo?.docID}/home`;

function DownloadAllQRs({ tables }) {
  const { user } = useAuthContext();
  return tables.map((table) => {
    const qrURL = `${DOMAINS.menu}/${user.businessProfileID}/${table?.branchID}/${table?.docID}/home`;
    return (
      <QRCodeCanvas
        value={qrURL}
        size={200}
        id={table.docID}
        key={table.docID}
        style={{ display: 'none' }}
      />
    );
  });
}
export default DownloadAllQRs;
