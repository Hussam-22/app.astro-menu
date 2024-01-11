import { Helmet } from 'react-helmet-async';

import BranchNewView from 'src/sections/branches/view/branch-new-view';

function BranchNewPage() {
  return (
    <>
      <Helmet>
        <title> Branch | New</title>
      </Helmet>
      <BranchNewView />
    </>
  );
}
export default BranchNewPage;
