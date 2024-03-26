import { Helmet } from 'react-helmet-async';

import StaffsNewView from 'src/sections/staffs/view/staffs-new-view';

function StaffsNewPage() {
  return (
    <>
      <Helmet>
        <title> Staffs: New</title>
      </Helmet>
      <StaffsNewView />
    </>
  );
}
export default StaffsNewPage;
