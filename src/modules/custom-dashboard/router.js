import VueCookies from 'vue-cookies';
// import Dashboard from '../dynamic-dashboard/index.vue';

export default [
  {
    path: '/custom',
    name: 'custom-dashboard',
    component: () => import('./views/landing.vue'),
    meta: {
      title: 'Custom Dashboard',
    },
  },
  {
    path: '/custom/login',
    name: 'custom-dashboard-login',
    beforeEnter: (to, from, next) => {
      const user = VueCookies.get('msdat-user-details');
      if (user) {
        next('/my-dashboard/details');
      } else {
        next();
      }
      return null;
    },
    component: () => import('../auth/views/login.vue'),
    meta: {
      title: 'Custom Dashboard',
    },
  },
  {
    path: '/custom/public/:id',
    name: 'custom-dashboard-public',
    component: () => import('./views/Public.vue'),
    meta: {
      title: 'Dashboards',
    },
  },
  {
    path: '/custom/private/:id',
    name: 'custom-dashboard-private',
    component: () => import('./views/Private.vue'),
    meta: {
      title: 'Custom Dashboard',
    },
  },
  {
    path: '/custom/requests',
    name: 'custom-dashboard-request',
    component: () => import('./views/DashboardRequests.vue'),
    meta: {
      title: 'Dashboard Requests',
    },
  },
  // {
  //   path: '/custom/details',
  //   name: 'dashboard-details',
  //   component: () => import('./views/dashboardDetails.vue'),
  // },
  {
    path: '/my-dashboard',
    name: 'my-dashboard',
    beforeEnter: (to, from, next) => {
      // const token = sessionStorage.getItem('username');
      const { tokens } = VueCookies.get('msdat-user-details');
      if (!tokens) {
        next('/custom/login');
      } else {
        return next();
      }
      return null;
    },
    component: () => import('./views/myDashboard.vue'),
    children: [
      // Page 1
      {
        path: 'details',
        name: 'my-dashboard-details',
        component: () => import('./views/dashboardDetails.vue'),
        meta: {
          title: 'Custom Dashboard',
        },
      },
      // Page 2
      {
        path: 'preference-table',
        name: 'preference-table',
        component: () => import('./views/preferenceTable.vue'),
        meta: {
          title: 'Custom Dashboard',
        },
      },
      // Page 3
      {
        path: 'data-table',
        name: 'data-table',
        component: () => import('./views/DataTable.vue'),
        meta: {
          title: 'Custom Dashboard',
        },
      },
      // Page 3
      {
        path: 'sections',
        name: 'sections',
        component: () => import('./views/ArrangeSections.vue'),
        meta: {
          title: 'Custom Dashboard',
        },
      },
      // Publish Map Dashboard
      {
        path: 'publish-map',
        name: 'publish-map',
        component: () => import('./views/PublishMapDashboard.vue'),
        meta: {
          title: 'Publish Map Visualization',
        },
      },
      // Page 4
      {
        path: 'embed-dashboard',
        name: 'embed-dashboard',
        component: () => import('./views/EmbedDashboardSection.vue'),
        meta: {
          title: 'Custom Dashboard',
        },
      },
      // Page 4
      {
        path: 'visibility',
        name: 'visibility',
        component: () => import('./views/ChooseVisibility.vue'),
        meta: {
          title: 'Custom Dashboard',
        },
      },
    ],
  },
  {
    path: '/account-settings',
    name: 'account-settings',
    // beforeEnter: (to, from, next) => {
    //   const user = VueCookies.get('msdat-user-details');
    //   if (!user) {
    //     next('/custom/login');
    //   } else {
    //     next();
    //   }
    //   return null;
    // },
    props: true,
    component: () => import('./views/AccountSettings.vue'),
  },
  {
    path: '/my-custom-dashboard/:title',
    name: 'my-custom-dashboard',
    beforeEnter: (to, from, next) => {
      // const token = sessionStorage.getItem('username');
      const token = VueCookies.get('msdat-access-token');
      if (!token) {
        next('/custom/login');
      } else {
        next();
      }
      return null;
    },
    props: true,
    component: () => import('./views/CustomDashboard.vue'),
    // component: () => import('../dynamic-dashboard/index.vue'),
  },
  {
    path: '/saved-dashboard',
    name: 'saved-dashboard',
    props: true,
    component: () => import('./components/SavedDashboardList.vue'),
  },
];
