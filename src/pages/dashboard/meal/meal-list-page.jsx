import { Helmet } from 'react-helmet-async';

import MealListView from 'src/sections/meal/view/meal-list-view';

function MealListPage() {
  return (
    <>
      <Helmet>
        <title>Meal | List</title>
      </Helmet>
      <MealListView />
    </>
  );
}
export default MealListPage;
