import { Helmet } from 'react-helmet-async';

import BranchManageView from 'src/sections/branches/view/branch-manage-view';

function BranchManagePage() {
  return (
    <>
      <Helmet>
        <title> Branch | Manage</title>
      </Helmet>
      <BranchManageView />
    </>
  );
}
export default BranchManagePage;
