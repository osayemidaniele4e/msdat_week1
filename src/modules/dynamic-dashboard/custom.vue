<template>
  <div class="mb-3 index-app">
    <!-- <h1>HELLOOOOO</h1> -->
    <MSDAT
      v-if="
        Object.entries(configObject).length > 0 &&
        isAdvanced === false &&
        isGIS === false &&
        loading === false
      "
    />

    <div class="preview" v-if="$route.query.prev">
      <b-button
        @click="$router.push('/custom/requests')"
        size="lg"
        variant="info"
        style="font-size: 1.5rem"
        >Back to Requests</b-button
      >
    </div>

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
    ]),
    ...mapActions('AUTH_STORE', ['LOGIN_USER', 'SAVE_USER_DASHBOARD']),
    ...mapActions(['SET_DASHBOARD_LOCATION']),
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

    async clearDBCache() {
      await this.$store.dispatch('DL/CLEAR_DB');
      this.showModal = false;
      const dashboard = this.$route.params.name;
      this.$router.push({ path: `/dashboard/${dashboard}` });
      window.location.reload();
    },
  },
  async mounted() {
    const { name, id } = this.$route.params;

    console.log('<@@><@@> mounted');
    // Check if user has already provided location before
  },
  async created() {
    const { name, id } = this.$route.params;

    setTimeout(async () => {
      const { name, id } = this.$route.params;
      console.log('<@@><@@> mounted after 30s delay');
      // your mounted logic here...
    }, 30000);

    const composed = sessionStorage.getItem('composedData');
    console.log(composed, '@composed@');

    // const response = await apiServices.getSingleCustomDashboard(id);

    // const customDashboard = response.data.data;
    // const config = JSON.parse(customDashboard.config);
    // const { dashboardDetails, composedData, surveyArray, sectionsArray } = config;

    // this.$store.dispatch('resetState');
    // this.$store.dispatch('dashboardConfiguration', dashboardDetails);
    // this.$store.dispatch('customDashboard', true);

    // this.$store.commit('setPArea', composedData);
    // this.$store.commit('setDArea', surveyArray);
    // this.$store.commit('arrangedSections', sectionsArray);
    // this.$store.commit('setEmbedUrl', result.embedded_url);
    // this.$store.commit('setEmbedIframe', result.embedded_iframe);
    // this.$store.commit('setEmbedUrlTitle', result.embedded_url_title);
    // this.$store.commit('setEmbedIframeTitle', result.embedded_iframe_title);

    /**
     * @description CUSTOM-DASHBOARD
     * @description reformat selected data into msdat config structure
     * @author chisom.chima
     */
    if (this.$store.state.CUSTOM_DASHBOARD_STORE.customDashboard === true) {
      this.isCustomDashboard = true;
      console.log('<@@><@@> created');
      // this.isCustom = true; // this variable doesn't exist
      sessionStorage.setItem('composedData', JSON.stringify(this.$store.getters.getprogramArea));
      sessionStorage.setItem('surveyArray', JSON.stringify(this.$store.getters.getDataSource));
      sessionStorage.setItem('sectionsArray', JSON.stringify(this.$store.getters.arrangedSections));
      sessionStorage.setItem('embedUrl', JSON.stringify(this.$store.getters.getEmbedUrl));
      sessionStorage.setItem(
        'setEmbedUrlTitle',
        JSON.stringify(this.$store.getters.getNewEmbedUrlTitle)
      );
      sessionStorage.setItem(
        'setEmbedIframeTitle',
        JSON.stringify(this.$store.getters.getNewEmbedIframeTitle)
      );
      sessionStorage.setItem('embedIframe', JSON.stringify(this.$store.getters.getEmbedIframe));
      sessionStorage.setItem('embedUrlTitle', JSON.stringify(this.$store.getters.getEmbedUrlTitle));
      sessionStorage.setItem(
        'embedIframeTitle',
        JSON.stringify(this.$store.getters.getEmbedIframeTitle)
      );
      sessionStorage.setItem(
        'setEmbedDashboardDesc',
        JSON.stringify(this.$store.getters.getNewEmbedDashboardDescription)
      );
      // * FOR Indicators
      const ids = [];
      const sourcesID = [];
      this.$store.getters.getprogramArea.map((element) => {
        if (element.parent.isChildSelected === true) {
          element.children.map((child) => {
            if (child.selected === true) {
              ids.push(child.id);
            }
            // console.log(child, 'ind');
            return child;
          });
        }
        return element;
      });

      // * For DataSources
      this.$store.getters.getDataSource.map((element) => {
        element.children.map((child) => {
          if (child.selected === true) {
            sourcesID.push(child.id);
          }
          // console.log(child, 'dat');
          return child;
        });
        return element;
      });
      // try {
      //   const response = await apiServices.getDashboard();
      //   const results = response.data;
      //   console.log({ results }, 'dashboard results')
      //   // const dashboard = results.find((item) => item?.name === name);
      // } catch (e) {
      //   console.log({ e });
      // }

      // * create the config object
      const formattedConfig = {
        name: this.$store.state.CUSTOM_DASHBOARD_STORE.dashboardDetails.name
          .replace(/\s+/g, '_')
          .toLowerCase(),
        title: this.$store.state.CUSTOM_DASHBOARD_STORE.dashboardDetails.name
          .replace(/\s+/g, '_')
          .toLowerCase(),
        indicators: ids,
        // sections: dashboard.sections,
        defaultIndicators: ids.slice(0, 3),
        dataSources: sourcesID,
        initialIndicator: ids[0],
        initialDataSource: sourcesID[0],
        initialLocation: 1,
      };
      // this.saveDashboard(
      //   ids,
      //   sourcesID,
      //   // eslint-disable-next-line comma-dangle
      //   this.$store.state.CUSTOM_DASHBOARD_STORE.dashboardDetails.name
      // );
      VueCookies.set('customDashboardConfig', formattedConfig);
      const getFormattedConfig = VueCookies.get('customDashboardConfig');
      this.configObject = formattedConfig?.name === '' ? getFormattedConfig : formattedConfig;
      this.SET_CONFIGURATIONS(getFormattedConfig || this.configObject); // make use of the new state implementation to avoid prop drilling
      localStorage.setItem('lsDataSourceCount', this.configObject.dataSources.length);
      localStorage.setItem('lsIndicatorCount', this.configObject.indicators.length);

      window.document.title = 'MSDAT Nigeria | Custom Dashboard';

      return;
    }
    // if it is not custom dashboard for safety reasons set it to false
    localStorage.setItem('customDashboardStatus', JSON.stringify(false));
    // =======================
    /**
     * @author davebenard
     * @description check the route params if it is advanced analytics then fetch from the config file
     */

    // =======================
    /**
     * @description Msdat Api-Config for Dashboard
     * @description get dashboard config based on route name from the msdat api
     * @author sami56
     */

    // =======================
    // set the title from the config as the route title
    if (this.$store.state.MSDAT_STORE.configObject.title) {
      this.$route.meta.title = this.$store.state.MSDAT_STORE.configObject.title;
      window.document.title = `MSDAT Nigeria | ${this.$store.state.MSDAT_STORE.configObject.title}`;
    }
  },
  watch: {
    $route(to, from) {
      // react to route changes...
      if (to !== from) {
        window.location.reload();
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
