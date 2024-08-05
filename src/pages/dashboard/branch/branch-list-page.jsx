import { Helmet } from 'react-helmet-async';

import BranchListView from 'src/sections/branches/view/branch-list-view';

function BranchListPage() {
  return (
    <>
      <Helmet>
        <title> User: Profile | Minimal UI</title>
      </Helmet>
      <BranchListView />
    </>
  );
}
export default BranchListPage;
