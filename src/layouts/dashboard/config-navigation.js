import { useMemo } from 'react';

import { paths } from 'src/routes/paths';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import SvgColor from 'src/components/svg-color';
import { useGetProductInfo } from 'src/hooks/use-get-product';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  blank: icon('ic_blank'),
  branch: icon('ic_branch'),
  menu: icon('ic_menu'),
  meal: icon('ic_meal'),
  staffs: icon('ic_staffs'),
  businessProfile: icon('ic_businessProfile'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();
  const { businessProfile } = useAuthContext();
  const { isMenuOnly } = useGetProductInfo();

  const data = useMemo(
    () => [
      // MANAGEMENT
      {
        // subheader: t('management'),
        items: [
          // Branches
          {
            title: t('branches'),
            path: paths.dashboard.branches.root,
            icon: ICONS.branch,
            // children: [{ title: t('list'), path: paths.dashboard.branches.list }],
          },

          // Menu
          {
            title: t('Menus'),
            path: paths.dashboard.menu.root,
            icon: ICONS.menu,
            // children: [{ title: t('list'), path: paths.dashboard.branches.list }],
          },

          // Meal
          {
            title: t('Meals'),
            path: paths.dashboard.meal.root,
            icon: ICONS.meal,
            children: [
              { title: t('list'), path: paths.dashboard.meal.list },
              { title: t('labels'), path: paths.dashboard.meal.labels },
            ],
          },

          // Staffs
          {
            title: t('staffs'),
            path: paths.dashboard.staffs.root,
            icon: ICONS.staffs,
          },
          // Business Profile
          {
            title: t('Business Profile'),
            path: paths.dashboard.businessProfile.manage(businessProfile.docID),
            icon: ICONS.businessProfile,
            // children: [{ title: t('list'), path: paths.dashboard.branches.list }],
          },
          {
            title: t('Subscription & Payments'),
            path: paths.dashboard.subscription.root,
            icon: ICONS.blank,
            // children: [{ title: t('list'), path: paths.dashboard.branches.list }],
          },
        ],
      },
    ],
    [t, businessProfile]
  );

  // MenuOnly Plans don't have access to "Staffs" page
  const filteredData = useMemo(
    () =>
      (businessProfile?.docID &&
        (isMenuOnly
          ? data.map((item) => ({
              subheader: item.subheader,
              items: item.items.filter((tab) => tab.path !== paths.dashboard.staffs.root),
            }))
          : data)) ||
      [],
    [businessProfile?.docID, data, isMenuOnly]
  );

  return filteredData;
}
