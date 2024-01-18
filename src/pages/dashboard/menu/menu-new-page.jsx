import { Helmet } from 'react-helmet-async';

import MealNewView from 'src/sections/meal/view/meal-new-view';

function MenuNewPage() {
  return (
    <>
      <Helmet>
        <title> Menu | New</title>
      </Helmet>
      <MealNewView />
    </>
  );
}
export default MenuNewPage;
