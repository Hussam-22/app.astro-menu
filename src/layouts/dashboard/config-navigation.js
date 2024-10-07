import { useMemo } from 'react';

import { paths } from 'src/routes/paths';
import { useLocales } from 'src/locales';
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
  label: icon('ic_label'),
  subscription: icon('ic_subscription'),
  translation: icon('ic_translation'),
  orders: icon('ic_customer-email'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();
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
          },

          { title: t('Meal Labels'), path: paths.dashboard.labels.root, icon: ICONS.label },

          // Staffs
          {
            title: t('staffs'),
            path: paths.dashboard.staffs.root,
            icon: ICONS.staffs,
          },
          {
            title: t('orders'),
            path: paths.dashboard.orders.root,
            icon: ICONS.orders,
          },
          {
            title: t('Translation Settings'),
            path: paths.dashboard.translationSettings.manage,
            icon: ICONS.translation,
            // children: [{ title: t('list'), path: paths.dashboard.branches.list }],
          },
          // Business Profile
          {
            title: t('Business Profile'),
            path: paths.dashboard.businessProfile.manage,
            icon: ICONS.businessProfile,
            // children: [{ title: t('list'), path: paths.dashboard.branches.list }],
          },
          {
            title: t('Subscription & Payments'),
            path: paths.dashboard.subscription.root,
            icon: ICONS.subscription,
            // children: [{ title: t('list'), path: paths.dashboard.branches.list }],
          },
        ].filter((item) =>
          isMenuOnly ? item.title !== 'staffs' && item.title !== 'orders' : true
        ),
      },
    ],
    [isMenuOnly, t]
  );

  return data;
}
