import { Helmet } from 'react-helmet-async';

import BranchesListView from 'src/sections/branches/view/branches-list-view';

function BranchListPage() {
  return (
    <>
      <Helmet>
        <title> User: Profile | Minimal UI</title>
      </Helmet>
      <BranchesListView />
    </>
  );
}
export default BranchListPage;
