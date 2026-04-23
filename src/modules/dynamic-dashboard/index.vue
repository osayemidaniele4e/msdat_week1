<template>
  <div class="mb-3 index-app">
    <!-- <h1>HELLOOOOO</h1> -->
    <keep-alive :max="3">
    <MSDAT
      v-if="
        Object.entries(configObject).length > 0 &&
        isAdvanced === false &&
        isGIS === false &&
        loading === false
      "
      :key="$route.params.name"
    />
    </keep-alive>
    <keep-alive :max="3">
    <AdvanceMSDAT
      v-if="
        Object.entries(configObject).length > 0 &&
        isAdvanced === true &&
        isGIS === false &&
        loading === false
      "
      :indicators="configObject.indicators"
      :dataSources="configObject.dataSources"
      :defaultIndicators="configObject.defaultIndicators"
      :initialIndicator="configObject.initialIndicator"
      :initialDataSource="configObject.initialDataSource"
      :initialLocation="configObject.initialLocation"
      :showTableRelatedIndicator="
        configObject.showTableRelatedIndicator != undefined
          ? configObject.showTableRelatedIndicator
          : true
      "
      :key="$route.params.name"
    />
    </keep-alive>
    <keep-alive :max="3">
    <GisMSDAT
      v-if="
        Object.entries(configObject).length > 0 &&
        isGIS === true &&
        isAdvanced === false &&
        loading === false
      "
      :indicators="configObject.indicators"
      :dataSources="configObject.dataSources"
      :defaultIndicators="configObject.defaultIndicators"
      :initialIndicator="configObject.initialIndicator"
      :initialDataSource="configObject.initialDataSource"
      :initialLocation="configObject.initialLocation"
      :showTableRelatedIndicator="
        configObject.showTableRelatedIndicator != undefined
          ? configObject.showTableRelatedIndicator
          : true
      "
      :key="$route.params.name"
    />
    </keep-alive>
    <!-- <ClearDBModal style="z-index: 1500" v-if="showClearDataModal" /> -->
    <div class="preview" v-if="$route.query.prev">
      <b-button
        @click="$router.push('/custom/requests')"
        size="lg"
        variant="info"
        style="font-size: 1.5rem"
        >Back to Requests</b-button
      >
    </div>

    <!-- <div
      v-if="
        isCustomDashboard &&
        $store.getters.getEmbedIframe !== null &&
        $store.getters.getEmbedIframe !== ''
      "
      class="mt-5"
    >
      <h1 class="url_title">{{ this.$store.getters.dashboardDetails.description }} - (Iframe)</h1>
      <div class="w-100 url_height">
        <div v-html="$store.getters.getEmbedIframe"></div>
      </div>
    </div>

    <div
      v-if="
        isCustomDashboard &&
        $store.getters.getEmbedUrl !== null &&
        $store.getters.getEmbedUrl !== ''
      "
      :class="[
        $store.getters.getEmbedIframe === null || $store.getters.getEmbedIframe === ''
          ? 'url_body_2'
          : 'url_body',
      ]"
    >
      <h1 class="url_title">{{ this.$store.getters.dashboardDetails.description }} - (URL)</h1>
      <div class="w-100 url_height">
        <iframe
          :src="$store.getters.getEmbedUrl"
          style="width: 100%; height: 800px; border: none"
        ></iframe>
      </div>
    </div> -->

    <!-- <NewsLetter v-if="!loading" /> -->

    <NewsLetter />
  </div>
</template>
<script>
import moment from 'moment';
import VueCookies from 'vue-cookies';
import { mapActions, mapMutations } from 'vuex';
import apiServices from '@/modules/data-layer/services/ApiServices';
import advanceInstance from '@/modules/msdat-dashboard/views/dashboard/instance-advanced.vue';
import gisInstance from '@/modules/msdat-dashboard/views/dashboard/instance-gis.vue';
import instance from '@/modules/msdat-dashboard/views/dashboard/instance.vue';
// import ClearDBModal from './ClearDBModal.vue';
import config from './config/dashboard_config';
import NewsLetter from '../msdat-dashboard/modules/newsletters/index.vue';

export default {
  name: 'DynamicDashboard',
  components: {
    MSDAT: instance,
    AdvanceMSDAT: advanceInstance,
    GisMSDAT: gisInstance,
    // ClearDBModal,
    NewsLetter,
  },
  data() {
    return {
      isAdvanced: false,
      isGIS: false,
      dashboardConfig: config,
      configObject: {
        name: '',
        title: '',
        indicators: [],
        defaultIndicators: [],
        dataSources: [],
        initialIndicator: 0,
        initialDataSource: 0,
        initialLocation: 1,
        showTableRelatedIndicator: true,
      },
      showClearDataModal: false,
      loading: false,
      longitude: '',
      latitude: '',
      userLocation: null,
      error: null,
      isCustomDashboard: false,
      height: '800px',
    };
  },
  computed: {
    modalShown() {
      return localStorage.getItem('modalShown') === 'true';
    },
  },
  methods: {
    ...mapMutations('MSDAT_STORE', [
      'ADD_CONTROL_PANEL',
      'CLEAR_CONTROL_PANEL',
      'SET_CONFIGURATIONS',
      'SET_SELECTED_CONFIG',
      'SET_DASHBOARDS',
      'UPDATE_LOADING_STATUS',
    ]),
    ...mapActions('AUTH_STORE', ['LOGIN_USER', 'SAVE_USER_DASHBOARD']),
    ...mapActions(['SET_DASHBOARD_LOCATION']),
    /**
     * Fetch dashboards from API and cache in Vuex store.
     * Subsequent calls return the cached list without hitting the API.
     */
    async getCachedDashboards() {
      const cached = this.$store.state.MSDAT_STORE.dashboards;
      if (cached && cached.length > 0) {
        return cached;
      }
      const response = await apiServices.getDashboard();
      const results = response.data.results;
      this.SET_DASHBOARDS(results);
      return results;
    },
    /**
     * Extracted dashboard initialization logic so it can be called
     * both from created() and from the $route watcher without a full page reload.
     */
    async initDashboard(dashboardName) {
      const name = dashboardName || this.$route.params.name;

      if (this.$store.getters.customDashboard && name === 'Health_Outcomes_and_Service_Coverage') {
        this.$store.dispatch('customDashboard', false);
        await this.$store.dispatch('DL/CLEAR_DB');
      }

      // CUSTOM-DASHBOARD flow
      if (this.$store.state.CUSTOM_DASHBOARD_STORE.customDashboard === true) {
        this.isCustomDashboard = true;
        sessionStorage.setItem('composedData', JSON.stringify(this.$store.getters.getprogramArea));
        sessionStorage.setItem('surveyArray', JSON.stringify(this.$store.getters.getDataSource));
        sessionStorage.setItem('sectionsArray', JSON.stringify(this.$store.getters.arrangedSections));
        sessionStorage.setItem('embedUrl', JSON.stringify(this.$store.getters.getEmbedUrl));
        sessionStorage.setItem('setEmbedUrlTitle', JSON.stringify(this.$store.getters.getNewEmbedUrlTitle));
        sessionStorage.setItem('setEmbedIframeTitle', JSON.stringify(this.$store.getters.getNewEmbedIframeTitle));
        sessionStorage.setItem('embedIframe', JSON.stringify(this.$store.getters.getEmbedIframe));
        sessionStorage.setItem('embedUrlTitle', JSON.stringify(this.$store.getters.getEmbedUrlTitle));
        sessionStorage.setItem('embedIframeTitle', JSON.stringify(this.$store.getters.getEmbedIframeTitle));
        sessionStorage.setItem('setEmbedDashboardDesc', JSON.stringify(this.$store.getters.getNewEmbedDashboardDescription));

        const ids = [];
        const sourcesID = [];
        this.$store.getters.getprogramArea.map((element) => {
          if (element.parent.isChildSelected === true) {
            element.children.map((child) => {
              if (child.selected === true) {
                ids.push(child.id);
              }
              return child;
            });
          }
          return element;
        });

        this.$store.getters.getDataSource.map((element) => {
          element.children.map((child) => {
            if (child.selected === true) {
              sourcesID.push(child.id);
            }
            return child;
          });
          return element;
        });

        const formattedConfig = {
          name: this.$store.state.CUSTOM_DASHBOARD_STORE.dashboardDetails.name
            .replace(/\s+/g, '_')
            .toLowerCase(),
          title: this.$store.state.CUSTOM_DASHBOARD_STORE.dashboardDetails.name
            .replace(/\s+/g, '_')
            .toLowerCase(),
          indicators: ids,
          defaultIndicators: ids.slice(0, 3),
          dataSources: sourcesID,
          initialIndicator: ids[0],
          initialDataSource: sourcesID[0],
          initialLocation: 1,
        };
        VueCookies.set('customDashboardConfig', formattedConfig);
        const getFormattedConfig = VueCookies.get('customDashboardConfig');
        this.configObject = formattedConfig?.name === '' ? getFormattedConfig : formattedConfig;
        this.SET_CONFIGURATIONS(getFormattedConfig || this.configObject);
        localStorage.setItem('lsDataSourceCount', this.configObject.dataSources.length);
        localStorage.setItem('lsIndicatorCount', this.configObject.indicators.length);
        window.document.title = 'MSDAT Nigeria | Custom Dashboard';
        this.$nextTick(() => {
          this.UPDATE_LOADING_STATUS();
        });
        return;
      }

      localStorage.setItem('customDashboardStatus', JSON.stringify(false));

      if (name === 'Advanced_Analytics') {
        this.$store.dispatch('customDashboard', false);
      }

      if (name === 'GIS_Mapping_Dashboard') {
        this.isCustomDashboard = false;
        this.$store.dispatch('customDashboard', false);
        const results = await this.getCachedDashboards();
        const dashboard = results.find((item) => item?.name === name);
        if (dashboard === undefined) {
          this.$router.push('/*');
          return;
        }
        this.isGIS = true;
        this.configObject = '';
        this.configObject = dashboard;
        localStorage.setItem('activeDashboardID', dashboard.id);
        this.SET_CONFIGURATIONS(dashboard);
        this.$nextTick(() => {
          this.UPDATE_LOADING_STATUS();
        });
        return;
      }

      // Standard dashboard flow
      if (this.$store.state.CUSTOM_DASHBOARD_STORE.customDashboard === false) {
        this.isCustomDashboard = false;
        try {
          this.loading = true;
          this.$store.dispatch('customDashboard', false);
          const results = await this.getCachedDashboards();
          const dashboard = results.find((item) => item?.name === name);
          if (dashboard === undefined) {
            this.$router.push('/*');
            return;
          }
          this.configObject = '';
          this.configObject = {
            id: dashboard.id,
            name: dashboard.name,
            title: dashboard.title,
            indicators: dashboard.indicators,
            defaultIndicators: dashboard.defaultIndicators,
            dataSources: dashboard.dataSources,
            initialIndicator: dashboard.initialIndicator,
            sections: dashboard.sections,
            initialDataSource: dashboard.initialDataSource,
            initialLocation: dashboard.initialLocation,
            showTableRelatedIndicator: dashboard.showTableRelatedIndicator,
          };
          localStorage.setItem('activeDashboardID', dashboard.id);
          this.SET_CONFIGURATIONS(this.configObject);
          this.isAdvanced = false;
          this.isGIS = false;
          if (name === 'Advanced_Analytics') {
            this.isAdvanced = true;
          }
        } catch (err) {
          // intentionally suppressed
        } finally {
          this.loading = false;
          if (this.configObject && this.configObject.id) {
            this.$nextTick(() => {
              this.UPDATE_LOADING_STATUS();
            });
          }
        }
      }

      if (this.$store.state.MSDAT_STORE.configObject.title) {
        this.$route.meta.title = this.$store.state.MSDAT_STORE.configObject.title;
        window.document.title = `MSDAT Nigeria | ${this.$store.state.MSDAT_STORE.configObject.title}`;
      }
    },
    /**
     * @function clearData
     * @author davebenard
     * @description clear cache data after 10days
     * @return Boolean
     */
    async clearData() {
      const { data } = await apiServices.getLatestDate();
      localStorage.removeItem('lastUpdateDate'); // previous clear cache variable
      const clearedDate = localStorage.getItem('lastUpdatedDate');
      if (clearedDate === null) {
        console.warn('Data not available for clearing');
        try {
          await this.$store.dispatch('DL/CLEAR_DB'); // first clear is BY-FORCE, in order to set the date variable for subsequent comparisons
        } catch (error) {
          console.log('an error occured in dispatching clearDb:', error);
        }
      }
      if (data.results[0].updated_at) {
        const lastDateMoment = moment(data.results[0].updated_at);
        const formattedClearedDate = moment(clearedDate);
        const diff = lastDateMoment.diff(formattedClearedDate, 'days');
        // check if api date is greater than localstorage date by 9 days
        if (diff > 9) {
          this.showClearDataModal = true; // subsequent clear is by users choice, update localstorage lastUpdatedDate variable
        }
      }
      return Promise.resolve(false);
    },
    async saveDashboard(indicators, sources, dashboardTitle) {
      const sections = this.fieldsArray
        .filter((item) => item.isShow === true)
        .map((item) => item.name);
      if (this.$store.getters.getVisibility === 'private') {
        const payload = {
          title: dashboardTitle,
          showTableRelatedIndicator: false,
          visibility: 'private',
          user: this.getUser.id,
          initial_indicator: indicators[0],
          initial_datasource: sources[0],
          indicators,
          dataSources: sources,
          initial_location: 1,
          default_indictors: [indicators[0]],
          sections,
        };
        await this.SAVE_USER_DASHBOARD(payload);
      }

      if (this.$store.getters.getVisibility === 'public') {
        const payload = {
          title: dashboardTitle,
          showTableRelatedIndicator: false,
          visibility: 'pending',
          user: this.getUser.id,
          initial_indicator: indicators[0],
          initial_datasource: sources[0],
          indicators,
          dataSources: sources,
          initial_location: 1,
          default_indictors: [indicators[0]],
          sections,
        };
        await this.SAVE_USER_DASHBOARD(payload);
      }
    },

    getUserLocation() {
      if ('geolocation' in navigator) {
        // Get the user's location
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.userLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            // Store location data for future visits
            localStorage.setItem('userLocationProvided', 'true');
            localStorage.setItem('userLatitude', position.coords.latitude);
            localStorage.setItem('userLongitude', position.coords.longitude);
          },
          (error) => {
            this.error = error.message;
            // eslint-disable-next-line comma-dangle
          }
        );
      } else {
        this.error = 'Geolocation is not supported in your browser.';
      }
    },

    async clearDBCache() {
      await this.$store.dispatch('DL/CLEAR_DB');
      this.showModal = false;
      const dashboard = this.$route.params.name;
      this.$router.push({ path: `/dashboard/${dashboard}` });
      window.location.reload();
    },
    // saveIndicatorToStorage(item) {
    //   localStorage.setItem('indicatorId', 7);
    // },
    // saveDataSourceToStorage(item) {
    //   localStorage.setItem('datasourceId', 6);
    // },
    // getIndicator(id){
    // }
  },
  async mounted() {
    // Check if user has already provided location before
    const hasProvidedLocation = localStorage.getItem('userLocationProvided');

    console.log('modal', this.modalShown);

    if (!hasProvidedLocation) {
      // Only prompt first-time users
      this.getUserLocation();

      await navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;

        // Mark that user has provided location
        localStorage.setItem('userLocationProvided', 'true');
        localStorage.setItem('userLatitude', this.latitude);
        localStorage.setItem('userLongitude', this.longitude);

        // Now that you have the geolocation data, you can use it here
        const data = {
          dashboard: this.$route.params.name,
          longitude: this.longitude,
          latitude: this.latitude,
          time: Date.now(),
        };

        this.SET_DASHBOARD_LOCATION(data);
      }, () => {
        // Continue without location data
        this.clearData();
      });
    } else {
      // Use stored location for returning users
      this.latitude = localStorage.getItem('userLatitude') || '';
      this.longitude = localStorage.getItem('userLongitude') || '';

      if (this.latitude && this.longitude) {
        const data = {
          dashboard: this.$route.params.name,
          longitude: this.longitude,
          latitude: this.latitude,
          time: Date.now(),
        };

        this.SET_DASHBOARD_LOCATION(data);
      }
    }

    this.clearData();

    // if (this.$route.params.name === 'Health_Outcomes_and_Service_Coverage') {
    //   // this sets skilled attendance at birth indicator on mounted
    //   // this.SET_SELECTED_CONFIG(defaultData);
    // } else if (this.$route.params.name === 'Disease_Surveillance') {
    //   // this sets covid 19 confirmed cases indicator on mounted
    //   // this.SET_SELECTED_CONFIG(defaultDiseaseSurveillanceData);
    //   // this.SET_SELECTED_CONFIG(defaultDSyear);
    // } else if (this.$route.params.name === 'Advanced_Analytics') {
    //   this.SET_SELECTED_CONFIG(defaultData);
    //   this.SET_SELECTED_CONFIG(defaultAdvancedYear);
    // } else if (this.$route.params.name === 'GIS_Mapping_Dashboard') {
    //   this.SET_SELECTED_CONFIG(defaultGISIndicator);
    //   this.SET_SELECTED_CONFIG(defaultGISDatasource);
    //   this.SET_SELECTED_CONFIG(defaultGISYear);
    // }
  },
  async created() {
    await this.initDashboard();
  },
  watch: {
    async $route(to, from) {
      // react to route changes — re-initialize dashboard without full page reload
      if (to.params.name !== from.params.name) {
        this.loading = true;
        this.configObject = {
          name: '',
          title: '',
          indicators: [],
          defaultIndicators: [],
          dataSources: [],
          initialIndicator: 0,
          initialDataSource: 0,
          initialLocation: 1,
          showTableRelatedIndicator: true,
        };
        await this.initDashboard(to.params.name);
      }
    },
  },
};
</script>

<style lang="scss">
main.main_field {
  min-height: 45vh;
  width: 100%;
}

iframe {
  body {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px !important;
  }
}

.iframe_container {
  max-height: 450px;
  overflow-y: auto;
}
.preview {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1500;
}
.url_height {
  height: 600px;
  width: 100%;
}

iframe {
  width: 100%;
  height: 800px; /* Adjust as needed */
  border: none;
}

.url_title {
  margin-bottom: 10px;
  font-weight: bold;
  color: gray;
  padding: 10px;
}
.url_body {
  margin-top: 20rem;
  margin-bottom: 25rem;
}
.url_body_2 {
  margin-top: 5rem;
  margin-bottom: 22rem;
}
</style>
