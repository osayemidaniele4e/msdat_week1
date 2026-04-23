<template>
  <div>
    <Header ref="theHeader" />
    <div @click="$refs.theHeader.close()">
      <div class="d-flex" style="font-family: Work sans">
        <div class="d-flex flex-column pt-4 px-4 border-right">
          <div class="b-dashboard row align-items-center ml-2" @click="$router.go(-1)">
            <b-icon-chevron-left></b-icon-chevron-left>
            <div class="ml-2 d-none d-lg-inline">Back to Dashboard</div>
          </div>
          <!-- Search field intentionally removed in favor of dashboard navigation shortcuts. -->
          <div class="mt-4">
            <p style="font-size: 17px;">User Profile</p>
          </div>
          <div class="d-flex flex-column px-2 py-1 text-nowrap">
            <a
              href="#/userActivity"
              class="item"
              :class="{ active: isCurrentRoute('/userActivity') }"
            >
              <b-icon-clock-history></b-icon-clock-history>&nbsp;&nbsp;
              <span class="d-none d-lg-inline">User Activity</span>
            </a>
            <a
              href="#/savedDashboards"
              class="item"
              :class="{ active: isCurrentRoute('/savedDashboards') }"
            >
              <b-icon-card-heading></b-icon-card-heading>&nbsp;&nbsp;
              <span class="d-none d-lg-inline">Saved Dashboards</span>
            </a>

            <a
              href="#/createPlugin"
              class="item blue"
              :class="{ active: isCurrentRoute('/createPlugin') }"
            >
              <b-icon-plus-square></b-icon-plus-square>&nbsp;&nbsp;
              <span class="d-none d-lg-inline">Create Plugin</span>
            </a>
            <a
              href="#/approvePlugin"
              class="item blue"
              :class="{ active: isCurrentRoute('/approvePlugin') }"
            >
              <b-icon-check2-square></b-icon-check2-square>&nbsp;&nbsp;
              <span class="d-none d-lg-inline">Approve Plugins</span>
            </a>
            <a
              href="#/notification"
              class="item"
              :class="{ active: isCurrentRoute('/notification') }"
            >
              <b-icon-bell-fill></b-icon-bell-fill>&nbsp;&nbsp;
              <span class="d-none d-lg-inline">Notifications</span>
            </a>
          </div>
          <div class="my-5">
            <div class="border-top"></div>
            <a
              href="#/settings"
              class="item mt-2"
              :class="{ active: isCurrentRoute('/settings') }"
            >
              <b-icon-gear></b-icon-gear>&nbsp;&nbsp;
              <span class="d-none d-lg-inline">Settings</span>
            </a>
            <a
              href="#"
              class="item"
              @click.prevent="logout"
            >
              <b-icon-box-arrow-right></b-icon-box-arrow-right>&nbsp;&nbsp;
              <span class="d-none d-lg-inline">Logout</span>
            </a>
          </div>
        </div>
        <div class="col-lg-10 col-10">
          <div class="section-title">
            <h3 class="mt-2 text-center" style="font-family: Work sans">
              {{ currentTitle }}
            </h3>
          </div>
          <savedDashboards :is="currentView" />
        </div>
      </div>
    </div>
    <Footer style="z-index: 10;"> </Footer>
  </div>
</template>

<script>
import Header from '@/modules/msdat-dashboard/views/about/layout/theHeader.vue';
import Footer from '@/modules/msdat-dashboard/views/about/layout/theFooter.vue';
import Profile from './profile.vue';
import Notification from './notifications.vue';
import userActivity from './userActivity.vue';
import savedDashboards from './UpdatedSavedDashboard.vue';
import createPlugin from './createPlugin.vue';
import approvePlugin from './approvePlugin.vue';
import userSettings from './usersettings.vue';

const routes = {
  '/': userActivity,
  '/profile': Profile,
  '/notification': Notification,
  '/userActivity': userActivity,
  '/savedDashboards': savedDashboards,
  '/createPlugin': createPlugin,
  '/approvePlugin': approvePlugin,
  '/settings': userSettings,
};

const titles = {
  '/': 'User Activity',
  '/profile': 'Profile',
  '/notification': 'Notifications',
  '/userActivity': 'User Activity',
  '/savedDashboards': 'Saved Dashboards',
  '/createPlugin': 'Create Plugin',
  '/approvePlugin': 'Approve Plugins',
  '/settings': 'User Settings',

};

export default {
  components: {
    Header,
    Footer,
  },
  data() {
    return {
      currentPath: window.location.hash,
    };
  },
  computed: {
    currentView() {
      return routes[this.currentPath.slice(1) || '/'];
    },
    currentTitle() {
      return titles[this.currentPath.slice(1) || '/'];
    },
  },
  methods: {
    isCurrentRoute(route) {
      return this.currentPath === `#${route}`;
    },

    // function to logout a particular user
    async logout() {
      this.$store.dispatch('AUTH_STORE/logout');
      if (!this.$route.fullPath.includes('dashboard')) {
        this.$router.push('/');
      }
    },
  },
  mounted() {
    window.addEventListener('hashchange', () => {
      this.currentPath = window.location.hash;
    });
  },
};
</script>
<style scoped>
.section-title {
display: flex;
justify-content: center;
  height: 70px;
  align-items: center;
  background-color: #DFF3F3;
 margin-left: -16px;
}
h3 {
  font-weight: bold;
}

.item {
  display: flex;
  align-items: center;
  padding:10px;
  font-size: 15px;
  font-weight: 500;
  color: black !important;
}

.item:hover {
  text-decoration: none;
}

.active {
border: none;
background-color: #DFF3F3;
border-radius: 5px;

}

a {
  color: #000 !important;
}

.blue {
  color: blue;
}
.search-btn{
  background-color: #007D53;
  color: #fff;
  border-radius: 10px;
  border: none;
  outline: none;
  width: 100%;
  height: 40px;
  font-size: 10px;
  cursor: pointer;
}
.search-btn:hover{
  background-color: #007D53;
}

  .search-btn:active{
    background-color: #007D53;
    outline: none;
    border: none;
  }

  .search-btn:focus{
    background-color: #007D53;
    outline: none;
    border: none;
  }
  .search-input{
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #D4D4D4;
    border-radius: 8px;

  }

  .b-dashboard{
    cursor: pointer;
    color: #007D53;
  }

  .b-dashboard:hover{
   color: #40ac88;
  }

  .search-input input{
    border: none;
    outline: none;
    width: 100%;
  }
  .search-icon{
    height:35px;
    width: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: medium;
    box-shadow: none;
  }
  .search-icon:hover{
    color: #000;
  }
  .search-icon:focus{
    color: #000;
    box-shadow: none;
    border: none;

  }
</style>
