import { Helmet } from 'react-helmet-async';

import MealNewView from 'src/sections/meal/view/meal-new-view';

function MealNewPage() {
  return (
    <>
      <Helmet>
        <title> Meal | New</title>
      </Helmet>
      <MealNewView />
    </>
  );
}
export default MealNewPage;
