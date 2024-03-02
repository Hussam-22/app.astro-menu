import { Helmet } from 'react-helmet-async';

// sections
import RestaurantLoginView from 'src/sections/auth/restaurant/loging-view';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title>Restaurant Name Login</title>
      </Helmet>

      <RestaurantLoginView />
    </>
  );
}
