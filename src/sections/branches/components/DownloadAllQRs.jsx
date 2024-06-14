import PropTypes from 'prop-types';
import { QRCodeCanvas } from 'qrcode.react';

import { useAuthContext } from 'src/auth/hooks';

DownloadAllQRs.propTypes = { tables: PropTypes.array };

function DownloadAllQRs({ tables }) {
  const { user } = useAuthContext();
  return tables.map((table) => {
    const qrURL = `${window.location.protocol}//${window.location.host}/qrMenu/${user.id}-${table.id}`;
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
