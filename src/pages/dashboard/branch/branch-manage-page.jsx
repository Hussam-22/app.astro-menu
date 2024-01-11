import { Helmet } from 'react-helmet-async';

import BranchNewView from 'src/sections/branches/view/branch-new-view';

function BranchManagePage() {
  return (
    <>
      <Helmet>
        <title> Branch | Manage</title>
      </Helmet>
      <BranchNewView />
    </>
  );
}
export default BranchManagePage;
