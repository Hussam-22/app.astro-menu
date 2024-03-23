import { Helmet } from 'react-helmet-async';

import StaffsListView from 'src/sections/staffs/view/staffs-list-view';

function BranchListPage() {
  return (
    <>
      <Helmet>
        <title> Staffs: List</title>
      </Helmet>
      <StaffsListView />
    </>
  );
}
export default BranchListPage;
