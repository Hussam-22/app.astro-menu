import { Helmet } from 'react-helmet-async';

import BusinessProfileManageView from 'src/sections/business-profile/view/business-profile-manage-view';

function BusinessProfileManagePage() {
  return (
    <>
      <Helmet>
        <title> Business Profile | Manage</title>
      </Helmet>
      <BusinessProfileManageView />
    </>
  );
}
export default BusinessProfileManagePage;
