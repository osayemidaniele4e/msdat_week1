<template>
  <!-- <header id="the-header" class="sticky"> Moses changed from this -->
  <header id="the-header" class="position-relative">
    <b-container fluid>
      <b-row class="d-flex justify-content-between align-items-center">
        <b-col cols md="1" lg="1" class="main">
          <div v-if="dashboardName == 'MSDAT PLATFORM'">
            <img src="@/assets/img/Logo.svg" alt="FMOH Logo" class="img-fluid" />
          </div>
          <div v-if="dashboardName != 'MSDAT PLATFORM'">
            <img :src="dashboardImage" alt="FMOH Logo" class="img-fluid" />
          </div>
        </b-col>
        <b-col
          cols
          md="11"
          lg="11"
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
            <div class="mobile-flex-col" v-if="this.$store.getters.customDashboard === true">
              <small class="mobile-flex-col-text1">{{
                this.$store.getters.dashboardDetails.name
              }}</small>
              <div class="mobile-flex-col-text2">
                {{ this.$store.getters.dashboardDetails.description }}
                <small v-if="isAuthenticated && isAuthor" class="text-warning ml-2 tools">
                  <span style="cursor: pointer" @click="editDashboard">Edit Dashboard</span>
                  <b-icon font-scale="2" icon="dot"></b-icon>
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
              <SideBar />
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
                </small>
              </div>
            </h2>
          </div>
          <div class="main-text" v-else>
            <h2 class="main-text">
              <small>MSDAT PLATFORM</small>
              <br />
              {{ $route.meta.title }}
            </h2>
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
                href="https://msdat.fmohconnect.gov.ng/"
                target="_blank"
                class="nav-link"
                v-if="isAuthenticated === false"
                >Home</a
              >
              <router-link
                to="/about"
                class="nav-link"
                v-if="!this.$store.state.CUSTOM_DASHBOARD_STORE.customDashboard"
                >About</router-link
              >
              <div
                @mouseover="showExpandedDropdown = true"
                @mouseleave="showExpandedDropdown = false"
              >
                <button class="btn btn-outline-primary border-light rounded-0">
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
                to="/faq"
                class="nav-link"
                v-if="!this.$store.state.CUSTOM_DASHBOARD_STORE.customDashboard"
                >Help & FAQ</router-link
              >
              <!-- <router-link
                to="/custom"
                class="nav-link"
                v-if="!this.$store.state.CUSTOM_DASHBOARD_STORE.customDashboard"
                >Create New Dashboard</router-link
              > -->
              <div></div>
              <a
                href="https://msdat.old.fmohconnect.gov.ng"
                class="nav-link"
                v-if="isAuthenticated === false"
                >MSDAT 1.5</a
              >
              <!-- button to view the list of plugins -->
              <!-- <button
                v-b-modal.modal-apps
                class="btn btn-outline-primary border-light rounded-0 ml-3"
                style="font-size: 13px !important"
              >
                Plugins
              </button> -->
              <!-- <b-nav-item>
                <b-dropdown text="Other Dashboards" class="border-0">
                  <div class="drop-container" v-for="(item, index) in headerDropdown" :key="index">
                    <router-link class="links" :to="item.link">{{ item.title }}</router-link>
                  </div>
                </b-dropdown>
              </b-nav-item> -->
              <div
                v-b-toggle.sidebar-2
                v-if="isAuthenticated === false"
                class="auth ml-2 d-flex align-items-center"
              >
                <b-icon-person-circle style="width: 18px; height: 18px"></b-icon-person-circle
                >&nbsp;<span class="d-none d-md-inline">Login/Register</span>
              </div>
              <div v-else @click="showCard = true">
                <div class="ml-2 profile d-flex align-items-center">
                  <img
                    :src="
                      getUser.avatar !== undefined
                        ? 'https://msdat-api.fmohconnect.gov.ng' + getUser.avatar
                        : 'https://w7.pngwing.com/pngs/754/2/png-transparent-samsung-galaxy-a8-a8-user-login-telephone-avatar-pawn-blue-angle-sphere-thumbnail.png'
                    "
                    class="profile-picture mr-1"
                    width="48"
                    height="48"
                  />
                  Hi,&nbsp;{{ getUser.username !== undefined ? getUser.username : getUser.email }}
                </div>
              </div>
              <b-sidebar
                id="sidebar-2"
                title=""
                right
                shadow
                style="background: #fff"
                v-if="isAuthenticated === false"
              >
                <LoginSidebar v-if="show" />
                <SignUp v-else />
                <div class="row" v-if="show">
                  <div class="col-12 text-center">
                    <h4 class="py-3" style="font-size: 15px">Don't have an account?</h4>
                    <button
                      class="btn btn-lg btn-light btn-outline-dark text-dark"
                      style="font-size: 15px; background: #f7f7f7; border: 1px solid #707070"
                      @click.prevent="showLoginForm"
                    >
                      CREATE AN ACCOUNT
                    </button>
                  </div>
                </div>

                <div v-else>
                  <div class="justify-content-center text-center">
                    <button
                      class="btn btn-lg btn-light btn-outline-dark text-dark mb-3"
                      style="background: #f7f7f7; border: 1px solid #707070"
                      @click="showRegForm"
                    >
                      LOGIN
                    </button>
                  </div>
                </div>
              </b-sidebar>
            </b-nav>
            <b-icon
              @click="toggleOption = !toggleOption"
              icon="three-dots-vertical"
              font-scale="1.5"
              class="main"
            />
            <b-icon icon="grid3x3-gap-fill" class="mob-grid-icon" v-b-toggle.sidebar-1></b-icon>
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
        <b-col class="main">
          <h4 class="mt-4">About the MSDAT Platform</h4>
          <p>
            This dashboard is developed and managed by the Department of Health Planning Research
            and Statistics (DHPRS)
          </p>
        </b-col>
      </b-row>
    </b-container>

    <!-- <DropCard v-show="showExpandedDropdown" /> -->
    <div v-if="isAuthenticated === true">
      <div class="container card shadow dropCard work-sans" v-if="showCard">
        <div class="row p-3 d-flex user-details">
          <div class="col-3">
            <img
              :src="
                getUser.avatar !== undefined
                  ? 'https://msdat-api.fmohconnect.gov.ng' + getUser.avatar
                  : 'https://w7.pngwing.com/pngs/754/2/png-transparent-samsung-galaxy-a8-a8-user-login-telephone-avatar-pawn-blue-angle-sphere-thumbnail.png'
              "
              class="profile-picture mr-1"
              width="48"
              height="48"
            />
          </div>
          <div class="col-8">
            <div>{{ getUser.username }}</div>
            <div>{{ getUser.email }}</div>
          </div>
          <div class="close mr-2" @click.prevent="showCard = false">
            <b-icon-x-circle></b-icon-x-circle>
          </div>
        </div>
        <div class="d-flex py-2">
          <router-link to="/account"><a href="#" class="ml-2">View Account</a></router-link>
          <div class="logout">
            <a href="#" class="mr-2" @click.prevent="logout">Log Out</a>
          </div>
        </div>
      </div>
    </div>

    <!-- plugin modal -->
    <b-modal id="modal-apps" title="MSDAT Apps Plugins" hide-footer>
      <b-collapse id="collapse-1" class="mt-2">
        <b-card>
          This enables you to comment on any section in the MSDAT Platform just by clicking the
          headings
        </b-card>
      </b-collapse>
      <!-- Example plugin section -->
      <div class="plugin-row">
        <h5>
          <span v-b-toggle.collapse-2>
            Context Plugin
            <b-icon-info-circle></b-icon-info-circle>
          </span>
        </h5>

        <div>
          <button
            class="enable-btn"
            @click="contextPluginActive('true')"
            v-if="isContextPluginActive === 'false'"
          >
            Enable
          </button>
          <button
            class="enable-btn"
            @click="contextPluginActive('false')"
            v-if="isContextPluginActive === 'true'"
          >
            Disable
          </button>
        </div>
      </div>
      <b-collapse id="collapse-2" class="mt-2">
        <b-card> This is an example plugin for demonstration purposes </b-card>
      </b-collapse>
    </b-modal>
  </header>
</template>

<script>
import { mapGetters } from 'vuex';
import HeaderOption from '../components/HeaderOption.vue';
import DropCard from '../components/DropCard.vue';
import Sidebar from '../components/Sidebar.vue';
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
  },
  data() {
    return {
      show: true,
      customImg: '',
      showCard: false,
      showExpandedDropdown: false,
      userName: sessionStorage.getItem('username'),
      toggleOption: false,
      isContextPluginActive: 'false',
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
    };
  },
  computed: {
    ...mapGetters('AUTH_STORE', ['isAuthenticated', 'getUser']),

    // check if current user is author of displayed custom dashboard
    isAuthor() {
      // retrieve all saved dashboards
      const customDashboardsList = JSON.parse(
        localStorage.getItem('customDashboardsList') || JSON.stringify({})
      );
      // retrieve dashboards belonging to current user
      const list = customDashboardsList[this.getUser.username];
      // find currently loaded dashboard in list
      const { name, description } = this.$store.getters.dashboardDetails;
      return list?.find(
        (dashb) =>
          dashb.config.dashboardDetails.name === name &&
          dashb.config.dashboardDetails.description === description
      );
    },
  },
  created() {
    this.controls = this.$children;
    this.screenWidth = window.innerWidth;
    // console.log('MSDAT store',  $store.state.MSDAT_STORE.controlConfig)

    // boolean to store project context availability
    this.isContextPluginActive = localStorage.getItem('contextPlugin');
  },

  methods: {
    contextPluginActive(data) {
      this.isContextPluginActive = localStorage.getItem('contextPlugin');
      localStorage.setItem('contextPlugin', data);
      this.$router.go();
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
  },
  props: {
    dashboardName: {
      type: String,
      default: 'MSDAT PLATFORM',
    },
    dashboardImage: {
      type: File,
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/scss/abstracts/_variables.scss';

.tools {
  display: inline-flex;
  align-items: center;
}
.tools span:hover {
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
}

.main {
  display: inherit;
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
  .btn-icon {
    margin-bottom: 0.35rem;
    margin-left: 0.5rem;
  }
  .up {
    transition: all 0.5s ease-in-out;
    transform: rotate(0deg);
  }
  .down {
    transform: rotate(180deg);
    transition: all 0.5s ease-in-out;
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
              height: 50px;
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
    width: 26vw;
    z-index: 5;
    right: 1rem;
    color: black;
    max-height: 30rem;
    overflow-y: auto;
    a {
      color: inherit;
    }
  }
}
.user-details {
  background: #fafafa;
}
.logout {
  position: absolute;
  right: 0;
}
.close {
  position: absolute;
  right: 0;
}
.profile-picture {
  border-radius: 48px;
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

<style>
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
</style>
