import { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

import { useAuthContext } from '../hooks';

const loginPaths = {
  waiter: paths.auth.restaurant.waiterLogin,
  kitchen: paths.auth.restaurant.kitchenLogin,
};

export default function StaffAuthGuard({ children }) {
  const page = useParams();
  const router = useRouter();
  const { isStaffAuthenticated } = useAuthContext();
  const [checked, setChecked] = useState(false);

  // const check = useCallback(() => {
  //   if (!isStaffAuthenticated) {
  //     const searchParams = new URLSearchParams({ returnTo: window.location.pathname }).toString();

  //     const loginPath = loginPaths[page];

  //     const href = `${loginPath}?${searchParams}`;

  //     router.replace(href);
  //   } else {
  //     setChecked(true);
  //   }
  // }, [isStaffAuthenticated, page, router]);

  // useEffect(() => {
  //   check();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // if (!checked) {
  //   return null;
  // }

  return <>{children}</>;
}

StaffAuthGuard.propTypes = {
  children: PropTypes.node,
};
