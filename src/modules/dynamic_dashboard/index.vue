<template>
  <div class="position-relative">
    <MSDAT
      v-show="!isAdvanced"
      v-if="Object.entries(configObject).length"
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
    >
    </MSDAT>
    <advanceMSDAT
      v-show="isAdvanced"
      v-if="Object.entries(configObject).length"
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
    >
    </advanceMSDAT>
    <ClearDBModal style="z-index: 1500" v-if="showClearDataModal" :showModal="showClearDataModal" />
  </div>
</template>
<script>
import { mapMutations } from 'vuex';
import moment from 'moment';
// eslint-disable-next-line import/extensions, import/no-unresolved
import instance from '@/modules/msdat-dashboard/views/dashboard/instance.vue';
import advanceInstance from '@/modules/msdat-dashboard/views/dashboard/instance-advanced.vue';
import apiServices from '@/modules/data-layer/services/ApiServices';
import config from './config/dashboard_config';
// eslint-disable-next-line import/no-unresolved
import ClearDBModal from '../msdat-dashboard/views/about/components/ClearDBCache.vue';
// import ShowDataSourcesList from './components/ShowDataSourcesList.vue';

export default {
  name: 'DynamicDashboard',
  components: {
    MSDAT: instance,
    advanceMSDAT: advanceInstance,
    ClearDBModal,
    // ShowDataSourcesList,
  },
  data() {
    return {
      isAdvanced: false,
      dashboardConfig: config,
      configObject: {}, // This should be an Object initially
      // url: 'https://public.tableau.com/views/UpdatedDemographic1/Story?:language=en-US&:display_count=n&:origin=viz_share_link:showVizHome=no&:embed=true',
      url: 'https://public.tableau.com/views/UpdatedDemographic1/DemographicDashboard?:language=en-US&:display_count=n&:origin=viz_share_link:showVizHome=no&:embed=true',
      url2: 'https://public.tableau.com/views/HealthWorkforceworkingdocument_16472664254450/Dashboard1?:language=en-GB&:display_count=n&:origin=viz_share_link:showVizHome=no&:embed=true',
      url3: 'https://public.tableau.com/views/Financedashboard_16472462810160/Dashboard1?:language=en-US&publish=yes&:display_count=n&:origin=viz_share_link:showVizHome=no&:embed=true',
      width: '100%',
      height: '400',
      showClearDataModal: false,
    };
  },
  methods: {
    ...mapMutations('MSDAT_STORE', ['ADD_CONTROL_PANEL', 'CLEAR_CONTROL_PANEL', 'UPDATE_LOADING_STATUS']),
    /**
     * @author davidbenard
     * @function ClearDataFromDexie
     * @description - clear the dexie DB if the difference between the localStorage and api date is greater than 10
     */
    async clearData() {
      const { data } = await apiServices.getLatestDate();
      const clearedDate = localStorage.getItem('lastUpdateDate');
      if (clearedDate === null) {
        console.log('first clear, BYFORCE, in order to set the date variable');
        await this.$store.dispatch('DL/CLEAR_DB');
        return;
      }
      if (data.date) {
        const lastDateMoment = moment(data.date);
        const diff = lastDateMoment.diff(clearedDate, 'days');
        if (diff > 2) {
          this.showClearDataModal = true;
          console.log('subsequent clear by users choice, update localstorage variable');
        }
      }
      Promise.resolve(false);
    },
  },
  async mounted() {
    this.clearData();
  },
  async created() {
    const { name } = this.$route.params;
    // ==========================controlspoil=======================================//
    if (this.$store.state.CUSTOM_DASHBOARD_STORE.customDashboard === true) {
      this.isCustom = true;
      // FOR Indicators
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

          // console.log('ids', ids);
        }
        return element;
      });

      // For DataSources
      this.$store.getters.getDataSource.map((element) => {
        element.children.map((child) => {
          if (child.selected === true) {
            sourcesID.push(child.id);
          }
          return child;
        });
        return element;
      });
      // console.log(this.dashboardConfig, 'dashboadconfig 1')
      this.dashboardConfig.push({
        name: this.$store.state.CUSTOM_DASHBOARD_STORE.dashboardDetails.name
          .replace(/\s+/g, '_')
          .toLowerCase(),
        title: this.$store.state.CUSTOM_DASHBOARD_STORE.dashboardDetails.name
          .replace(/\s+/g, '_')
          .toLowerCase(),
        indicators: ids,
        defaultIndicators: [7, 6, 5],
        dataSources: sourcesID,
        initialIndicator: ids[0],
        initialDataSource: sourcesID[0],
        initialLocation: 1,
      });

      this.configObject = this.dashboardConfig.find((item) => item.name === name);
      // console.log(this.dashboardConfig, 'dashboadconfig 2');
      // this.configObject = {
      //   name: this.$store.state.CUSTOM_DASHBOARD_STORE.dashboardDetails.name
      //     .replace(/\s+/g, '_')
      //     .toLowerCase(),
      //   title: this.$store.state.CUSTOM_DASHBOARD_STORE.dashboardDetails.name
      //     .replace(/\s+/g, '_')
      //     .toLowerCase(),
      //   indicators: ids,
      //   defaultIndicators: [7, 6, 5],
      //   dataSources: sourcesID,
      //   initialIndicator: ids[0],
      //   initialDataSource: sourcesID[0],
      //   initialLocation: 1,
      // };
    }
    // ==========================controlspoil=======================================//

    // this.CLEAR_CONTROL_PANEL();

    // this.$route.meta.title = 'Hello World From Route';
    try {
      // const response = await apiServices.getDashboard();
      // const { results } = response.data;
      // this.configObject = results.find((item) => item.name === name);
      // if (this.configObject === undefined) {
      this.configObject = this.dashboardConfig.find((item) => item.name === name);
      // }
    } catch {
      this.configObject = this.dashboardConfig.find((item) => item.name === name);
    }
    // this.configObject = this.dashboardConfig.find((item) => item.name === name);
    // if (this.configObject === undefined) {
    //   this.$router.push('/*');
    // }
    if (this.configObject.title) {
      this.$route.meta.title = this.configObject.title;
      window.document.title = `MSDAT Nigeria | ${this.configObject.title}`;
    }
    if (this.configObject.name === 'Advanced_Analytics') {
      this.isAdvanced = true;
      //   this.ADD_CONTROL_PANEL(configObj);
      // }
    }

    // Dynamic dashboards do not pass through the legacy footer flow that flips the
    // global loading flag, so mark the app as initialized once the dashboard config
    // has been resolved and the dashboard shell is ready to render.
    if (this.configObject && Object.keys(this.configObject).length) {
      this.$nextTick(() => {
        this.UPDATE_LOADING_STATUS();
      });
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
.text-finance {
  font-size: 25px;
  text-align: center;
}
.sub-text-finance {
  color: white;
  font-size: 15px;
  text-align: left;
  font-weight: 100;
}
</style>
