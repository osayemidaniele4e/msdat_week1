<template>
  <!-- <header id="the-header" class="sticky"> Moses changed from this -->
  <div>
    <header id="the-header" class="position-relative" data-testid="header">
      <b-container fluid>
        <b-row class="d-flex justify-content-between align-items-center">
          <b-col cols="2" md="2" lg="2" class="main">
            <div v-if="dashboardName == 'MSDAT PLATFORM'" style="cursor: pointer; display: flex; align-items: center;" @click="goToHome">
              <b-icon icon="house" font-scale="2.0" class="home-icon mr-1" v-b-tooltip.hover="'Home'"></b-icon>
              <img src="@/assets/img/Logo.svg" alt="FMOH Logo" class="img-fluid" v-b-tooltip.hover="'Home'" />
            </div>
            <div v-if="dashboardName != 'MSDAT PLATFORM'" style="cursor: pointer; display: flex; align-items: center;" @click="goToHome">
              <b-icon icon="house" font-scale="1.5" class="home-icon mr-1" v-b-tooltip.hover="'Home'"></b-icon>
              <img
                :src="resolvedDashboardImage"
                alt="Dashboard logo"
                class="img-fluid"
                v-b-tooltip.hover="'Home'"
                @error="setDashboardPlaceholder"
              />
            </div>
          </b-col>
          <b-col
            cols="10"
            md="10"
            lg="10"
            class="d-flex justify-content-between align-items-center border-left main mains"
          >
            <!-- testing for mobile -->
            <div class="mobile-flex">
              <!-- <div ><img src="@/assets/img/Logo.svg" alt="FMOH Logo" class="mob-img" /></div> -->
              <img
                src="@/assets/img/Logo-mob.svg"
                alt="FMOH Logo"
                class="mob-img"
                variant="primary"
              />
              <div class="mobile-flex-col" v-if="this.customDashboard">
                <small class="mobile-flex-col-text1">{{
                  this.$store.getters.dashboardDetails.name
                }}</small>
                <div class="mobile-flex-col-text2">
                  {{ this.$store.getters.dashboardDetails.description }}
                  <!-- <small v-if="isAuthenticated && isAuthor" class="text-warning ml-2 tools"> -->
                  <small v-if="isAuthenticated" class="text-warning ml-2 tools">
                    <!-- <span style="cursor: pointer" @click="editDashboard">Edit Dashboard</span>
                  <b-icon font-scale="2" icon="dot"></b-icon> -->
                    <span style="cursor: pointer" @click="$router.push('/my-dashboard/details')"
                      >Create New</span
                    >
                    <b-icon font-scale="2" icon="dot"></b-icon>
                    <span style="cursor: pointer" @click="$router.push('/custom')">Home</span>
                  </small>
                </div>
              </div>
              <div class="mobile-flex-col" v-else>
                <small class="mobile-flex-col-text1">MSDAT PLATFORM</small>
                <div class="mobile-flex-col-text2">{{ $route.meta.title }}</div>
              </div>

              <div v-if="$route.path !== '/account'">
                <b-dropdown
                  text="Select Section"
                  toggle-class="select-dropdown"
                  variant="none"
                  text-variant="none"
                  right
                >
                  <b-dropdown-item
                    id="dropdownMenuButton"
                    class="select-dropdown-item"
                    v-for="(control, index) in $store.state.MSDAT_STORE.controlConfig"
                    :key="index"
                    :href="
                      $route.path == '/advanced_analytics'
                        ? `/dashboard/Advanced_Analytics?index=${index}`
                        : '#'
                    "
                    @click="emitIndex(index)"
                    >{{ control.label }}
                  </b-dropdown-item>
                </b-dropdown>
              </div>

              <b-sidebar id="sidebar-1" title="" right shadow>
                <SideBar @show-auth-modal="showAuthModal" />
              </b-sidebar>
            </div>

            <div class="main-text" v-if="this.$store.getters.customDashboard === true">
              <h2 class="main-text">
                <small>{{ this.$store.getters.dashboardDetails.name }}</small>
                <div>
                  {{ this.$store.getters.dashboardDetails.description }}
                  <small v-if="isAuthenticated && isAuthor" class="text-warning ml-2 tools">
                    <span style="cursor: pointer" @click="editDashboard">Edit Dashboard</span>
                    <b-icon font-scale="2" icon="dot"></b-icon>
                    <span style="cursor: pointer" @click="$router.push('/my-dashboard/details')"
                      >Create New</span
                    >
                    <b-icon font-scale="2" icon="dot"></b-icon>
                    <span style="cursor: pointer" @click="$router.push('/custom')">Home</span>
                    <!-- Modal for share Dashboard -->
                    <b-icon font-scale="2" icon="dot"></b-icon>
                    <span style="cursor: pointer" @click="shareDash">Share Dashboardxz</span>

                    <b-modal id="share-dashboard-modal" title="Share Dashboard" hide-footer>
                      <shareDashboard />
                    </b-modal>
                  </small>
                </div>
              </h2>
            </div>
            <div class="main-text" v-else>
               <h2 class="main-text d-inline-block">
                <small>MSDAT PLATFORM</small>
                <br />
                {{ $route.meta.title }}
              </h2>

              <!-- <span
                class="share-button d-inline-block ml-3"
                v-b-tooltip.hover
                title="Share Dashboard "
                @click="toggleSocialModal"
              >
                <a href="#" @click.prevent>
                  <img src="@/assets/share.png" alt="share-btn" class="share-icon" />
                </a>
              </span> -->
            </div>

            <!-- <div class="main-text" v-if="dashboardName == 'MSDAT PLATFORM'">
            <h2 class="main-text">
              <small>MSDAT PLATFORM</small>
              <br />
              {{ $route.meta.title }}
            </h2>
          </div>

          <div class="main-text" v-if="dashboardName != 'MSDAT PLATFORM'">
            <h2 class="main-text">
              <small>MSDAT PLATFORM</small>
              <br />
              {{ dashboardName }}
            </h2>
          </div> -->

            <!-- <b-col cols md="6" lg="6"> -->
            <div class="d-flex justify-content-end h-100 align-items-center header-navs main">
              <b-nav class="h-100 align-items-center main d-flex">
                <!-- @click="showExpandedDropdown = !showExpandedDropdown" -->
                <a
                  href="#"
                  class="nav-link share-link d-flex align-items-center"
                  @click.prevent="toggleSocialModal"
                  >Share <img src="@/assets/share.png" alt="Share" class="share-nav-icon ml-1" /></a
                >
                <div @click="showExpandedDropdown = !showExpandedDropdown">
                  <button class="btn btn-outline-primary border-light rounded-0 header-action-btn">
                    Select&nbsp;Dashboard&nbsp;<b-icon
                      icon="triangle-fill"
                      font-scale="0.5"
                      class="btn-icon"
                      :class="[showExpandedDropdown ? 'down' : 'up']"
                    ></b-icon>
                  </button>
                  <DropCard
                    v-if="showExpandedDropdown"
                    @click="showExpandedDropdown = false"
                    :class="{ dropcard: showExpandedDropdown }"
                  />
                </div>
                <router-link
                  to="/about"
                  class="nav-link"
                  v-if="!this.$store.state.CUSTOM_DASHBOARD_STORE.customDashboard"
                  >About</router-link
                >
                <router-link
                  to="/faq"
                  class="nav-link"
                  v-if="!this.$store.state.CUSTOM_DASHBOARD_STORE.customDashboard"
                  >Help & FAQ</router-link
                >

                <div @click="showVersionsDropdown = !showVersionsDropdown" class="">
                  <button class="btn btn-2 btn-outline-primary border-light rounded-0 header-action-btn">
                    MSDAT Old Versions&nbsp;<b-icon
                      icon="triangle-fill"
                      font-scale="0.5"
                      class="btn-icon"
                      :class="[showVersionsDropdown ? 'down' : 'up']"
                    ></b-icon>
                  </button>
                </div>

                <!-- Modal for Sign In/Sign Up -->
                <b-modal
                  id="auth-modal"
                  title=""
                  centered
                  size="lg"
                  hide-footer
                  @hide="hideAuthModal"
                >
                  <div v-if="show">
                    <LoginSidebar @login-success="hideAuthModal" />
                  </div>
                  <div v-else>
                    <SignUp @login-success="hideAuthModal" />
                  </div>

                  <div class="signup-main text-center mt-4" v-if="show">
                    <h4 style="font-size: 15px; font-family: Work sans">Don't have an account?</h4>
                    <p class="sign-uptxt" @click.prevent="showLoginForm">Create an Account</p>
                  </div>

                  <div class="signup-main text-center mt-4" v-else>
                    <h4 style="font-size: 15px; font-family: Work sans">
                      Already have an account?
                    </h4>
                    <p class="sign-uptxt" @click="showRegForm">Log In</p>
                  </div>
                </b-modal>

                <!-- Trigger button for modal -->
                <div
                  v-if="!isAuthenticated"
                  class="auth ml-2 d-flex align-items-center"
                  @click="showAuthModal"
                >
                  <b-icon-person-circle style="width: 18px; height: 18px"></b-icon-person-circle>
                  &nbsp;<span class="d-none d-md-inline">Login/Register</span>
                </div>
                <div v-else @click="showCard = !showCard">
                  <div class="ml-2 profile d-flex align-items-center">
                    <img
                      :src="resolvedUserAvatar"
                      class="profile-picture mr-1"
                      width="48"
                      height="48"
                    />
                    Hi,&nbsp;{{ getUser.username !== undefined ? getUser.username : getUser.email }}
                  </div>
                </div>
              </b-nav>
              <b-icon
                @click="toggleOption = !toggleOption"
                icon="three-dots-vertical"
                font-scale="1.5"
                class="main"
              />
              <b-icon icon="grid-fill" class="mob-grid-icon" v-b-toggle.sidebar-1></b-icon>
              <b-icon
                @click="toggleOption = !toggleOption"
                icon="three-dots-vertical"
                font-scale="1.5"
                class="mob"
              />
              <header-option
                v-if="toggleOption"
                v-on:showContact="contactBtn = true"
                v-on:tour="runIntro"
                v-on:print="print"
                v-on:closeoptions="toggleOption = false"
              />
            </div>
          </b-col>
        </b-row>
        <!--  please someone show separate the
      header for the about page from this it going to cause issues  -->
        <b-row v-show="aboutPage" class="main">
          <b-col cols="1">
            <!-- <a href=""> -->
            <b-icon @click="$router.go(-1)" class="back-icn main" icon="chevron-left" />
            <!-- </a> -->
          </b-col>
        </b-row>
      </b-container>

      <!-- <DropCard v-show="showExpandedDropdown" /> -->
      <div v-if="isAuthenticated === true">
        <div class="dropCard work-sans" v-if="showCard" @mouseleave="showCard = false">
          <div class="dropcard-shell">
            <button type="button" class="dropcard-close" @click.prevent="showCard = false">
              ×
            </button>
            <div class="dropcard-top">
              <img
                :src="resolvedUserAvatar"
                class="dropcard-avatar"
                width="60"
                height="60"
              />
              <div class="dropcard-copy">
                <span class="dropcard-kicker">Signed in as</span>
                <h3>{{ getUser.username || 'MSDAT User' }}</h3>
                <h4>{{ getUser.email }}</h4>
              </div>
            </div>
            <div class="dropcard-divider"></div>
            <div class="dropcard-actions">
              <router-link to="/account" class="dropcard-link" @click.native="showCard = false">
                View Account
              </router-link>
              <button type="button" class="dropcard-logout" @click.prevent="logout">
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        class="container card shadow versionsDropCard work-sans"
        v-if="showVersionsDropdown"
        @mouseleave="showVersionsDropdown = false"
      >
        <div class="p-1 user-details">
          <b-list-group>
            <div class="tooltip-wrapper">
              <a href="https://msdat.old.fmohconnect.gov.ng" target="_blank">
                <b-list-group-item @click="toggleDropdown"> MSDAT 1.5</b-list-group-item>
              </a>
            </div>
            <div class="tooltip-wrapper">
              <a href="https://msdat2.6.fmohconnect.gov.ng/" target="_blank">
                <b-list-group-item @click="toggleDropdown"> MSDAT 2.6</b-list-group-item>
              </a>
            </div>
          </b-list-group>
        </div>
      </div>
    </header>
    <base-modal :showModal="socialModal" :size="'xl'" @hide="handleModalHide">
      <template #title>
        <h6 class="mb-0 font-weight-bold work-sans">Share Dashboard</h6>
      </template>
      <Socials />
    </base-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Socials from '@/modules/msdat-dashboard/components/social_media/SocialMediaModal.vue';
import defaultDashboardLogo from '@/assets/img/Logo.svg';
import defaultUserAvatar from '@/assets/img/Logo-mob.svg';
import HeaderOption from '../components/HeaderOption.vue';
import DropCard from '../components/DropCard.vue';
import Sidebar from '../components/Sidebar.vue';
import shareDashboard from '../components/shareDashboard.vue';
import LoginSidebar from '../components/Login.vue';
import SignUp from '../components/SignUp.vue';

export default {
  name: 'theHeader',
  components: {
    HeaderOption,
    DropCard,
    SideBar: Sidebar,
    LoginSidebar,
    SignUp,
    shareDashboard,
    Socials,
  },
  data() {
    return {
      show: true,
      customImg: '',
      showCard: false,
      showExpandedDropdown: false,
      showVersionsDropdown: false,
      userName: sessionStorage.getItem('username'),
      toggleOption: false,
      contactBtn: false,
      aboutPage: false,
      headerDropdown: [
        { title: 'Health Outcomes', link: '/dashboard/Health_Outcomes' },
        {
          title: 'Health Facility Surveys',
          link: '/dashboard/Health_Facility',
        },
        { title: 'NHMIS Analysis', link: '/' },

        { title: 'Health Financing', link: '/' },
        { title: 'State Profiles', link: '/' },
        { title: 'Demographics', link: '/' },
        { title: 'Create Dashboard +', link: '/' },
      ],
      controls: [],
      screenWidth: 0,
      showClearDataModal: false,
      socialModal: false,
      showClearDBModal: false,
      dashboardImageFailed: false,
      selectedVersion: { version: 'MSDAT 2.7', link: 'https://msdat.fmohconnect.gov.ng/' },
      versions: [
        { version: 'MSDAT 1.5', link: 'https://msdat.old.fmohconnect.gov.ng' },
        { version: 'MSDAT 2.6', link: 'https://msdat2.6.fmohconnect.gov.ng/' },
        { version: 'MSDAT 2.7', link: 'https://msdat.fmohconnect.gov.ng/' },
      ],
    };
  },
  computed: {
    ...mapGetters('AUTH_STORE', ['isAuthenticated', 'getUser']),

    // check if current user is author of displayed custom dashboard
    isAuthor() {
      // retrieve all saved dashboards
      const customDashboardsList = JSON.parse(
        localStorage.getItem('customDashboardsList') || JSON.stringify({}),
      );
      // retrieve dashboards belonging to current user
      const list = customDashboardsList[this.getUser.username || this.getUser.id];
      // find currently loaded dashboard in list
      const { name, description } = this.$store.getters.dashboardDetails;
      return list?.find(
        (dashb) => dashb.config.dashboardDetails.name === name
          && dashb.config.dashboardDetails.description === description
      );
    },
    customDashboard() {
      return this.$store.state.CUSTOM_DASHBOARD_STORE.customDashboard;
    },
    resolvedUserAvatar() {
      if (this.getUser?.avatar) {
        return `https://msdat-api.fmohconnect.gov.ng${this.getUser.avatar}`;
      }

      return defaultUserAvatar;
    },
    resolvedDashboardImage() {
      if (!this.dashboardImage || this.dashboardImageFailed) {
        return defaultDashboardLogo;
      }

      return this.dashboardImage;
    },
  },
  created() {
    this.controls = this.$children;
    this.screenWidth = window.innerWidth;
  },

  methods: {
    showAuthModal() {
      this.$bvModal.show('auth-modal');
    },

    toggleDropdown() {
      this.showVersionsDropdown = false;
    },

    hideAuthModal() {
      this.$bvModal.hide('auth-modal');
    },
    togglemodal() {
      this.modal = !this.modal;
    },
    toggleSocialModal() {
      this.socialModal = !this.socialModal;
    },

    handleModalHide() {
      this.socialModal = false;
    },
    showRegForm() {
      // eslint-disable-next-line no-unused-expressions
      this.show = true;
    },
    showLoginForm() {
      // eslint-disable-next-line no-unused-expressions
      this.show = false;
    },
    // function to logout a particular user
    async logout() {
      this.$store.dispatch('AUTH_STORE/logout');
      if (!this.$route.fullPath.includes('dashboard')) {
        this.$router.push('/');
      }
    },
    runIntro() {
      this.toggleOption = !this.toggleOption;
      this.$emit('tour');
    },
    print() {
      this.toggleOption = !this.toggleOption;
      setTimeout(() => {
        window.print();
      }, 500);
    },
    close() {
      this.toggleOption = false;
    },
    emitIndex(index) {
      this.$emit('index', index);
    },
    showC() {
      this.showCard = true;
    },
    editDashboard() {
      this.$store.commit('startEdit');
      this.$router.push('/my-dashboard/details');
    },
    shareDash() {
      this.$bvModal.show('share-dashboard-modal');
    },
    async clearDB() {
      this.showClearDataModal = true;
    },
    goToHome() {
      this.$router.push('/');
    },
    setDashboardPlaceholder() {
      this.dashboardImageFailed = true;
    },
  },
  watch: {
    $route: {
      // eslint-disable-next-line object-shorthand
      handler(e) {
        if (e.name === 'About') {
          this.aboutPage = true;
        } else {
          this.aboutPage = false;
        }
      },
      deep: true,
      immediate: true,
    },
    selectedVersion: {
      handler(e) {
        if (e && e.link) {
          window.open(e.link, '_blank');
        }
      },
    },
  },
  props: {
    dashboardName: {
      type: String,
      default: 'MSDAT PLATFORM',
    },
    dashboardImage: {
      type: [String, File],
      default: '',
    },
  },
  mounted() {
    if (this.$route.query.code) {
      this.showAuthModal();
    }
  },
};
</script>

<style lang="scss" scoped>
@import '@/scss/abstracts/_variables.scss';

.tools {
  display: inline-flex;
  align-items: center;
}

.share-button {
  cursor: pointer;
}

.share-icon {
  width: 26px;
  height: 24px;
  margin-top: -5px;
  background-color: white;
  border: 1px solid black;
  border-radius: 6px;
  padding: 4px;
}

.share-nav-icon {
  width: 16px;
  height: 16px;
  filter: brightness(0) invert(1);
}
.home-icon {
  color: white;
  cursor: pointer;
}
.tools span:hover {
  text-decoration: underline;
}

.signup-main {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  gap: 2px;
}

.sign-uptxt {
  cursor: pointer;
  color: #348481;
  margin-top: 9px;
  font-weight: 600;
  font-size: 15px;
}
.sign-uptxt:hover {
  text-decoration: underline;
}
.custom-header {
  color: #ffffff;
  padding: 10px;
  font-size: 20px;
}
button {
  color: white;
}

.btn {
  color: white;
  font-weight: 500;
  font-size: 14px;
  border-radius: 5px !important;
}
.btn-2 {
  font-size: 10px !important;
  font-weight: 500 !important;
  border-radius: 5px !important;
}
.btn:hover {
  background-color: white;
  color: $primary;
}

.main {
  display: inherit;
}
.auth {
  display: inherit;
  cursor: pointer;
}
.mob {
  display: none;
}

.main-sub-text {
  margin-left: -4px;
}

.mobile-flex {
  display: none;
}

.mob-grid-icon {
  display: none;
}

.external {
  text-decoration: none;
  color: white;
  font: normal normal 600 12px/20px Muli;
  &-link {
    text-decoration: none;
    color: black;
  }
  .active {
    color: white;
  }
  .hover {
    color: white;
  }
}

header#the-header {
  .header-action-btn {
    color: #ffffff;
    background-color: transparent;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;

    &:hover,
    &:focus,
    &:active {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.8);
      box-shadow: none;
    }
  }
  .btn-icon {
    margin-bottom: 0.35rem;
    margin-left: 0.5rem;
  }
  .up {
    transition: all 0.15s ease-in-out;
    transform: rotate(0deg);
  }
  .down {
    transform: rotate(180deg);
    transition: all 0.15s ease-in-out;
  }
  .drop-card {
    transition: all 1s ease-in-out;
  }
  div.header-navs {
    a.nav-link {
      text-decoration: none;
      color: white;
      font: normal normal 600 12px/20px Muli;
      &.active {
        background: #154736;
        border-radius: 5px;
      }
    }
    a.links {
      text-decoration: none;
      font: normal normal normal 14px/16px Work Sans;
      letter-spacing: 0px;
      color: #494949;
      text-transform: uppercase;
      margin-bottom: 0.4rem;
    }
    div.drop-container {
      padding: 0.75rem;
      width: 14rem;
    }
  }
  & > .container-fluid {
    & > .row {
      height: 65px;
      padding: 0 10px;

      // first row
      &:first-child {
        background-color: $primary;

        & > div {
          &:first-child {
            img {
              width: auto;
              height: 30px;
              float: left;
            }
          }

          &:last-child {
            padding: 0 10px 0 30px;
            color: #fbfbfb;

            h2 {
              font: normal normal 600 18px/20px Work Sans;
              // text-transform: uppercase;

              // 3-dots icon
              & ~ div {
                font-size: 15px;

                svg {
                  cursor: pointer;
                }
              }
            }
          }
        }
      }

      // second row
      &:last-child {
        background-color: #ffffff;
        box-shadow: 0px 3px 4px #00000029;

        & > :first-child {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          text-align: end;

          // back icon
          .back-icn {
            padding: 8px;
            background-color: #007d537f;
            border-radius: 100%;
            font-size: 40px;
            color: #ffffff;
            transition: all 0.4s;

            &:hover {
              background-color: $primary;
            }
          }
        }

        & > :last-child {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          letter-spacing: 0px;

          h4 {
            // padding-bottom: 5px;
            font-family: 'Source Sans Pro';
            font-size: 18px !important;
            font-weight: bolder;
            color: #232323;

            & ~ p {
              color: #232323;
              font-size: 12px;

              &:last-child {
                margin-bottom: 0;
              }
            }
          }
        }
      }
    }
  }
}

// MEDIA QUERY

/* EXTRA EXTRA SMALL */
@media (max-width: 676px) {
  .main {
    display: none;
  }
  .auth {
    display: none !important;
  }
  .profile {
    display: none !important;
  }
  .mobile-flex-col {
    display: none;
  }
  .mob {
    display: none;
  }
  .mains .header-navs a {
    display: none;
  }
  .mains .header-navs button {
    display: none;
  }

  .mains .main-text {
    display: none;
  }

  .mobile-flex {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    width: 100%;
  }
  .mob-grid-icon {
    display: inherit;
  }

  .btn {
    color: white;
    font-weight: 500;
    font-size: 14px;
  }

  #about-wrap {
    header#the-header {
      & > .container-fluid {
        & > .row {
          height: 80px;
          // padding: 10px 0;

          // first row
          &:first-child {
            & > div {
              &:first-child {
                padding-left: 0;
                img {
                  float: left;
                  height: 37px !important;
                }
              }

              &:last-child {
                padding: 0 5px;

                h2 {
                  font: normal normal 600 14px/20px Work Sans;

                  // 3-dots icon
                  & ~ div {
                    font-size: 13px;
                  }
                }
              }
            }
          }

          // second row
          &:last-child {
            height: 70px;
            padding: 0 10px;
            & > :first-child {
              justify-content: center;

              .back-icn {
                padding: 8px;
                font-size: 35px;
              }
            }

            & > :last-child {
              line-height: 14.5px;

              h4 {
                padding-bottom: 2px;
                font-size: 15px !important;
              }
            }
          }
        }
      }
    }
  }
}

/* SMALL */
@media (min-width: 676px) and (max-width: 1000px) {
  .main {
    display: none;
  }
  .profile {
    margin: 0px 20px 0px 0px;
  }
  .auth {
    margin: 0px 20px 0px 0px !important;
  }
  .mains .header-navs a {
    display: none;
  }
  .mains .header-navs button {
    display: none;
  }
  .mob {
    display: inherit;
  }

  .main-text {
    display: none;
    font-size: 1rem;
  }

  .mobile-flex {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    width: 100%;
  }

  .mob-grid-icon {
    display: inherit;
  }

  .btn {
    color: white;
    font-weight: 500;
    font-size: 14px;
  }

  #about-wrap {
    header#the-header {
      & > .container-fluid {
        & > .row {
          height: 80px;
          padding: 10px 0;

          // first row
          &:first-child {
            & > div {
              &:first-child {
                padding-left: 1%;
                img {
                  float: left;
                  height: 40px !important;
                  margin-bottom: 0;
                }
              }

              &:last-child {
                padding: 0 10px;

                h2 {
                  font: normal normal 600 16px/20px Work Sans;

                  // 3-dots icon
                  & ~ div {
                    font-size: 13px;
                  }
                }
              }
            }
          }

          // second row
          &:last-child {
            height: 70px;
            padding: 0 10px;

            & > :first-child {
              justify-content: center;
              .back-icn {
                padding: 8px;
                font-size: 37px;
              }
            }

            & > :last-child {
              padding: 0 5% !important;
              line-height: 15px;

              h4 {
                padding-bottom: 2px;
                font-size: 16px !important;
              }
            }
          }
        }
      }
    }
  }
}

#about-wrap {
  header#the-header {
    & > .container-fluid {
      & > .row {
        height: 65px;
        padding: 10px;

        // first row
        &:first-child {
          & > div {
            &:first-child {
              padding-left: 0.5%;
              img {
                float: left;
                height: 40px !important;
              }
            }

            &:last-child {
              padding: 0 10px;

              h2 {
                font: normal normal 600 17px/20px Work Sans;

                // 3-dots icon
                & ~ div {
                  font-size: 13px;
                }
              }
            }
          }
        }

        // second row
        &:last-child {
          padding: 0 10px;

          & > :first-child {
            justify-content: center;
            padding: 8px;
            font-size: 38px;
          }

          & > :last-child {
            // padding: 0 5% !important;
            line-height: 16px;

            h4 {
              margin-bottom: 4px;
              padding-bottom: 2px;
              font-size: 17px !important;
            }
          }
        }
      }
    }
  }
}

/* LARGE */
@media (min-width: 1000px) and (max-width: 1300px) {
  .main-text {
    display: none;
  }
  .profile {
    margin: 0px 20px 0px 0px;
  }
  .mains .header-navs {
    margin-left: 100px;
  }
  #about-wrap {
    header#the-header {
      & > .container-fluid {
        & > .row {
          // first row
          &:first-child {
            & > div {
              &:first-child {
                padding-left: 0.5%;
              }
            }
          }
        }
      }
    }
  }

  .select-dropdown {
    margin-left: 100px;
  }
}
</style>
<style lang="scss" scoped>
header#the-header {
  div.header-navs {
    button.btn-secondary {
      background-color: transparent;
      color: white;
      border: 0;
      box-shadow: none;
      &:focus,
      &:active,
      &:hover {
        color: white;
        border: 0;
        background-color: transparent;
      }
    }
  }
}
div {
  &.dropCard {
    position: absolute;
    width: 320px;
    z-index: 8;
    right: 1rem;
    top: 72px;
    a {
      color: inherit;
    }
  }
}

div {
  &.versionsDropCard {
    position: absolute;
    width: 8vw;
    z-index: 5;
    right: 11rem;
    color: black;
    max-height: 30rem;
    overflow-y: auto;
    a {
      color: inherit;
    }
  }
}
.dropcard-shell {
  position: relative;
  overflow: hidden;
  padding: 22px 20px 18px;
  border: 1px solid rgba(21, 71, 54, 0.08);
  border-radius: 22px;
  background:
    radial-gradient(circle at top right, rgba(0, 125, 83, 0.12), transparent 32%),
    linear-gradient(180deg, #ffffff, #f5faf8);
  box-shadow: 0 24px 50px rgba(16, 44, 35, 0.16);
}

.dropcard-top {
  display: flex;
  gap: 14px;
  align-items: center;
  padding-right: 28px;
}

.dropcard-avatar {
  flex-shrink: 0;
  border-radius: 18px;
  object-fit: cover;
  background: #edf4f1;
  box-shadow: 0 12px 24px rgba(0, 125, 83, 0.12);
}

.dropcard-copy {
  min-width: 0;

  h3 {
    margin: 4px 0 6px;
    color: #173a33;
    font: 700 1rem/1.2 'Work Sans', sans-serif;
    word-break: break-word;
  }

  h4 {
    margin: 0;
    color: #5d746d;
    font: 500 0.86rem/1.5 'Work Sans', sans-serif;
    word-break: break-word;
  }
}

.dropcard-kicker {
  color: #007d53;
  font: 700 0.72rem/1 'Work Sans', sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dropcard-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(21, 71, 54, 0.08);
  color: #173a33;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.dropcard-divider {
  height: 1px;
  margin: 16px 0 14px;
  background: rgba(21, 71, 54, 0.1);
}

.dropcard-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.dropcard-link,
.dropcard-logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border-radius: 12px;
  font: 700 0.84rem/1 'Work Sans', sans-serif;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.dropcard-link {
  border: 1px solid rgba(0, 125, 83, 0.16);
  background: #eef7f3;
  color: #0c5f48;
}

.dropcard-logout {
  border: none;
  background: linear-gradient(135deg, #0f7b64, #125a4a);
  color: #ffffff;
  cursor: pointer;
}

.dropcard-link:hover,
.dropcard-logout:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 24px rgba(15, 123, 100, 0.16);
}

.profile-picture {
  border-radius: 48px;
  object-fit: cover;
  background: #edf4f1;
}
.profile {
  cursor: pointer;
  font: normal normal 600 12px/20px Muli;
  color: white;
}
.auth {
  font: normal normal 600 12px/20px Muli;
  color: white;
}

@media (max-width: 767px) {
  div {
    &.dropCard {
      width: min(320px, calc(100vw - 24px));
      right: 12px;
    }
  }

  .dropcard-actions {
    grid-template-columns: 1fr;
  }
}
</style>

<style scoped>
/*  styling for mobile responsiveness */

.select-indicator-mob {
  border: 1px solid white;
  background-color: none;
  color: white;
  font-size: 13px;
  padding: 10px;
}

.mobile-flex-col {
  display: flex;
  flex-direction: column;
  margin: 5px;
  justify-content: center;
  margin-left: 5px;
  width: 48vw;
  position: relative;
  left: -20px;
}

.mobile-flex-col-text1 {
  color: white;
  font-weight: 200;
  font-size: 2vw;
}

.mobile-flex-col-text2 {
  color: white;
  font-weight: 500;
  font-size: 2vw;
}

.mob-img {
  width: 50px;
  height: 50px;
  position: relative;
  left: -30px;
}

.mob-select1 {
  height: 40px;
  width: 100px;
  font-size: 13px;
  padding: 5px;
  margin: 10px;
  background-color: #007d537f;
  border: 1px solid white;
  color: white;
}

.mob-grid-icon {
  color: white;
  cursor: pointer;
  outline: none;
  position: relative;
  left: -10px;
}

.dropdownMenuButton {
  background-color: none;
  border: 1px solid green;
}
</style>

<style scoped>
/* styling to overide bootstrap component (select dropdown) */

.select-dropdown {
  background-color: none;
  height: 30px;
  outline: none;
  border: 1px solid white;
  color: white !important;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  margin-top: 12px;
  border-radius: 2px;
  position: relative;
  left: -25px;
}
.btn:hover {
  color: #fff;
}
.enable-btn:hover {
  background-color: #fff;
  color: #000000;
  border: 1px solid black;
}
.plugin-row {
  display: flex;
  flex-direction: row;
  /* justify-content: center; */
  align-items: center;
  justify-content: space-between;
}

@media print {
  @page {
    size: landscape;
  }
  body {
    -webkit-print-color-adjust: exact !important;
  }
}
.close img {
  width: 30px;
  height: 30px;
  cursor: pointer;
}

.name h3 {
  font-size: 30px;
  text-transform: capitalize;
}
.name h4 {
  font-size: 16px;
}

.clearCacheSubtitle {
  font-size: 16px;
}

.data-source-info {
  cursor: pointer;
  color: #ebf3f3 !important;
  font-size: 14px;
  margin-left: 8px;
}

.drop-down-wrapper {
  width: 130px;
  position: relative;
}

.icon-span {
  position: absolute;
  right: 15px;
  top: 13px;
}
.drop-down-wrapper .multiselect .multiselect__tags {
  background: transparent;
  border: 1px solid #fff !important;
}

.drop-down-wrapper .multiselect .multiselect__select {
  color: #8b2b2b !important;
  display: none;
}

.drop-down-wrapper .multiselect .multiselect__tags .multiselect__single {
  background: transparent;
  color: #fff !important;
}
.btn-icon-2 {
  height: 8px;
  width: 8px;
}
</style>
