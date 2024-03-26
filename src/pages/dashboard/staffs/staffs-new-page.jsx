import { Helmet } from 'react-helmet-async';

import StaffsManageView from 'src/sections/staffs/view/staffs-manage.-view';

function StaffsNewPage() {
  return (
    <>
      <Helmet>
        <title> Staffs: New</title>
      </Helmet>
      <StaffsManageView />
    </>
  );
}
export default StaffsNewPage;
