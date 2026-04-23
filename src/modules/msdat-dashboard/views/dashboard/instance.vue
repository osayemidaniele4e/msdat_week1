<template>
  <BaseDashboard
    :updateValue="updateValue"
    :updateKey="updateKey"
    :resetData="resetData"
    @swipe="changeSwipe"
  >
    <template v-slot:section-before-0>
      <slot name="top-section"></slot>
    </template>

    <template
      v-slot:[`section-${sectionArray[setIndex(allSections[0])]}`]="{ payload, controlIndex }"
    >
      <div class="col-md-12">
        <base-sub-card :backgroundColor="'header'" class="my-2 shadow-sm">
          <template #title>
            <h5 class="font-weight-bold work-sans text-white">Indicator Overview</h5>
          </template>
          <!-- lazy loading for each section starts here -->
          <!-- the first section doesn't need the component
                 since it will be mounted first -->
          <template>
            <ControlPanelConfiguration :controlIndex="controlIndex">
              <BaseIndicatorOverview
                :controlPanelProps="payload"
                @value="getValue"
                @key="getKey"
                @reset="getReset"
              />
            </ControlPanelConfiguration>
          </template>
        </base-sub-card>
      </div>
    </template>

    <template
      v-slot:[`section-${sectionArray[setIndex(allSections[1])]}`]="{ payload, controlIndex }"
    >
      <div class="col-md-12" style="margin-bottom: 4rem">
        <base-sub-card :backgroundColor="'header'" class="my-2 shadow-sm">
          <template #title>
            <h5 class="font-weight-bold work-sans text-white">Zonal Analysis</h5>
          </template>
          <!-- lazy loading for each section starts here -->
          <!-- the first section doesn't need the component
                 since it will be mounted first -->
          <template>
            <LazyLoading>
              <ControlPanelConfiguration :controlIndex="controlIndex">
                <BaseZonalAnalysisSection :controlPanelProps="payload" />
              </ControlPanelConfiguration>
            </LazyLoading>
          </template>
        </base-sub-card>
      </div>
    </template>

    <template
      v-slot:[`section-${sectionArray[setIndex(allSections[2])]}`]="{ payload, controlIndex }"
    >
      <div class="col-md-12">
        <base-sub-card :backgroundColor="'header'" class="my-2 shadow-sm">
          <template #title>
            <h5 class="font-weight-bold work-sans text-white">
              Indicator Comparison - By Period/State
            </h5>
          </template>
          <template>
            <LazyLoading>
              <ControlPanelConfiguration :controlIndex="controlIndex">
                <ICS :values="payload" :controlIndex="controlIndex" :showRelationshipFeature="showIndicatorRelationship" />
              </ControlPanelConfiguration>
            </LazyLoading>
          </template>
        </base-sub-card>
      </div>
    </template>

    <template
      v-slot:[`section-${sectionArray[setIndex(allSections[3])]}`]="{ payload, controlIndex }"
    >
      <div class="col-md-12">
        <base-sub-card :backgroundColor="'header'" class="my-2 shadow-sm">
          <template #title>
            <h5 class="font-weight-bold work-sans text-white">Dataset Comparison</h5>
          </template>
          <template>
            <LazyLoading>
              <ControlPanelConfiguration :controlIndex="controlIndex">
                <DataSetComparison :values="payload" :controlIndex="controlIndex" />
              </ControlPanelConfiguration>
            </LazyLoading>
          </template>
        </base-sub-card>
      </div>
    </template>

    <template
      v-slot:[`section-${sectionArray[setIndex(allSections[4])]}`]="{ payload, controlIndex }"
    >
      <div class="col-md-12">
        <base-sub-card :backgroundColor="'header'" class="my-2 shadow-sm">
          <template #title>
            <h5 class="font-weight-bold work-sans text-white">Multi-Source Indicator Comparison</h5>
          </template>
          <template>
            <div class="dummy-row2 row">
              <div v-for="n in 3" :key="n" class="flex-item col-lg-4 col-12">
                <!-- <pre>{{ payload }}</pre> -->
                <div class="comparison-header">Comparison ({{ n }})</div>
                <LazyLoading>
                  <ControlPanelConfiguration :groupIndex="n - 1" :controlIndex="controlIndex">
                    <MultiSourceComponent :key="n" :values="payload[n - 1]" />
                  </ControlPanelConfiguration>
                </LazyLoading>
              </div>
            </div>
          </template>
        </base-sub-card>
      </div>
    </template>

    <template
      v-slot:[`section-${sectionArray[setIndex(allSections[5])]}`]="{ payload, controlIndex }"
    >
      <div class="col-md-12 overflow-auto">
        <base-sub-card :backgroundColor="'header'" class="my-2 shadow-sm disaggregation">
          <template #title>
            <h5 class="font-weight-bold work-sans text-white">Disaggregation Section</h5>
          </template>
          <template>
            <LazyLoading>
              <ControlPanelConfiguration :controlIndex="controlIndex">
                <DynamicSection :values="payload" :controlIndex="controlIndex" />
              </ControlPanelConfiguration>
            </LazyLoading>
          </template>
        </base-sub-card>
      </div>
    </template>
    <template v-if="shouldShowScorecard" v-slot:[`section-${sectionArray[setIndex(allSections[6])]}`]="{ payload, controlIndex }">
  <div class="col-md-12">
    <base-sub-card :backgroundColor="'header'" class="my-2 shadow-sm">
      <template #title>
        <h5 class="font-weight-bold work-sans text-white">Scorecard</h5>
      </template>
      <template>
        <LazyLoading>
          <ControlPanelConfiguration :controlIndex="controlIndex">
            <ScorecardSection :values="payload" :controlIndex="controlIndex" />
          </ControlPanelConfiguration>
        </LazyLoading>
      </template>
    </base-sub-card>
  </div>
</template>
    <template v-if="customDashboard" v-slot:[`section-${sectionArray[setIndex(allSections[8])]}`]="{ payload, controlIndex }">
      <div class="col-md-12">
        <base-sub-card :backgroundColor="'header'" class="my-2 shadow-sm">
          <template #title>
            <h5 class="font-weight-bold work-sans text-white">{{ customTitle }}</h5>
          </template>
          <template>
            <LazyLoading>
              <ControlPanelConfiguration :controlIndex="controlIndex">
                <EmbedDashboard :values="payload" :controlIndex="controlIndex" />
              </ControlPanelConfiguration>
            </LazyLoading>
          </template>
        </base-sub-card>
      </div>
    </template>

    <template
      v-if="customDashboard"
      v-slot:[`section-${sectionArray[setIndex(allSections[7])]}`]="{ payload, controlIndex }"
    >
      <div class="col-md-12">
        <base-sub-card :backgroundColor="'header'" class="my-2 shadow-sm">
           <template #title>
            <h5 class="font-weight-bold work-sans text-white">Map Visualization</h5>
          </template>
          <template>
            <LazyLoading>
              <ControlPanelConfiguration :controlIndex="controlIndex">
                <MapVisualizationSection :controlPanelProps="payload" />
              </ControlPanelConfiguration>
            </LazyLoading>
          </template>
        </base-sub-card>
      </div>
    </template>
  </BaseDashboard>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import BaseIndicatorOverview from '../../components/sections/indicator-overview/BaseIndicatorOverview.vue';
import IndicatorOverviewConfig from '../../components/sections/indicator-overview/control-panel-config';
import IndicatorOverviewConfig2 from '../../components/sections/indicator-overview/disease-surveliance-control-panel-config';
import ZonalAnalysisConfig from '../../components/sections/zonal-analysis/control-config';
import ICSConfig from '../../components/sections/indicator-comparism/indicator-comparism-config';
import DataSetComparisonConfig from '../../components/sections/dataset-comparison/control-panel-config';
import LazyLoading from '../../modules/onScroll/lazyLoading.vue';
// import StaticConfig from '../../components/sections/dynamic-section/config/dashboard_config';
import BaseMultiSourceConfig from '../../components/sections/multi-source-compare/control-config';
import DynamicSectionConfig from '../../components/sections/dynamic-section/dynamic-section-config';
import BaseDashboard from './BaseDashboard.vue';
import ControlPanelConfiguration from '../../modules/control_setup/ControlPanelConfiguration.vue';
import ScorecardConfig from '../../components/sections/scorecard/scorecard-config';
import EmbedDashboardConfig from '../../components/sections/embed-section/embed-configs';
import MapVisualizationConfig from '../../components/sections/map-visualization/map-visualization-config';
// eslint-disable-next-line import/extensions
// import PolicySimulatorConfiguration from '../../components/sections/policy-simulator/policy-simulator-config.js';
// import PolicySimulator from '../../components/sections/policy-simulator/policySimulator.vue';

export default {
  data() {
    return {
      isMobile: true,
      updateValue: {},
      updateKey: '',
      resetData: 1,
      sectionArray: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      allSections: [
        'Indicator Overview',
        'Zonal Analysis',
        'Indicator Comparison',
        'Dataset Comparison',
        'Multi-Source Comparison',
        'Disaggregation',
        'Scorecard',
        'Map Visualization',
        // 'Embedded Dashboard',
      ],
      customTitle: '',
    };
  },
  components: {
    BaseDashboard,
    BaseIndicatorOverview,
    ControlPanelConfiguration,
    LazyLoading,
    // Lazy-loaded section components for code-splitting
    BaseZonalAnalysisSection: () => import('../../components/sections/zonal-analysis/BaseZonalSectionComponent.vue'),
    ICS: () => import('../../components/sections/indicator-comparism/ICS.vue'),
    DataSetComparison: () => import('../../components/sections/dataset-comparison/datasetComparism.vue'),
    MultiSourceComponent: () => import('../../components/sections/multi-source-compare/multi-source.vue'),
    DynamicSection: () => import('../../components/sections/dynamic-section/DynamicSection.vue'),
    ScorecardSection: () => import('../../components/sections/scorecard/ScorecardSection.vue'),
    EmbedDashboard: () => import('../../components/sections/embed-section/EmbeddedSection.vue'),
    MapVisualizationSection: () => import('../../components/sections/map-visualization/MapVisualizationSection.vue'),
    // PolicySimulator,
  },
  props: {
    showTableRelatedIndicator: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    shouldShowScorecard() {
      const allowedDashboards = [
        '/dashboard/Demographics',
        '/dashboard/Health_Facility',
        '/dashboard/Health_Outcomes_and_Service_Coverage',
      ];
      return allowedDashboards.includes(this.$route.path);
    },
    showIndicatorRelationship() {
      const allowedDashboards = [
        '/dashboard/Demographics',
        '/dashboard/Health_Facility',
        '/dashboard/Health_Workforce',
        '/dashboard/Health_Outcomes_and_Service_Coverage',
      ];
      return allowedDashboards.includes(this.$route.path);
    },
    customDashboard() {
      return this.$store.state.CUSTOM_DASHBOARD_STORE.customDashboard;
    },
    fieldsArray() {
      return this.$store.getters.arrangedSections;
    },
    // Applies the config that disables the num/denum if the route is on these dashboards
    noNHMIS() {
      if (
        // eslint-disable-next-line operator-linebreak
        this.$route.path === '/dashboard/Disease_Surveillance' ||
        // eslint-disable-next-line operator-linebreak
        this.$route.path === '/dashboard/Health_Workforce' ||
        // eslint-disable-next-line operator-linebreak
        this.$route.path === '/dashboard/Health_Facility' ||
        // eslint-disable-next-line operator-linebreak
        this.$route.path === '/dashboard/Health_Service_Access'
      ) {
        return true;
      }
      return false;
    },
  },
  methods: {
    ...mapMutations('MSDAT_STORE', ['ADD_CONTROL_PANEL', 'CLEAR_CONTROL_PANEL']),
    ...mapGetters('MSDAT_STORE', ['getConfigObject']),
    // Function to handle Multi-Source mobile view
    scroll(timestamp) {
      // Calculate the timeelapsed
      const timeElapsed = timestamp - this.scrollStartTime;
      // Calculate progress
      const progress = Math.min(timeElapsed / this.scrollDuration, 1);
      // Set the scrolleft
      this.scrollElement.scrollLeft = this.scrollPos + this.scrollPixels * progress;
      // Check if elapsed time is less then duration then
      // call the requestAnimation, otherwise exit
      if (timeElapsed < this.scrollDuration) {
        // Request for animation
        window.requestAnimationFrame(this.scroll);
      }
    },
    reorderFields(fieldsArray, configs) {
      const tempArray = [];
      fieldsArray.map((item) => {
        if (item.isShow) {
          const tempItem = configs.find((el) => el.label.toLowerCase() === item.name.toLowerCase());
          tempArray.push(tempItem);
        }
        return null;
      });
      return tempArray;
    },
    setPresetSections(arg, configs) {
      const reorderedConfigs = this.reorderFields(this.fieldsArray, configs);
      reorderedConfigs.forEach((field) => {
        this.ADD_CONTROL_PANEL(field);
      });
      const { embeddedIframeTitle, embeddedUrlTitle } = this.$store.state.CUSTOM_DASHBOARD_STORE;

      let label = 'Dashboard';
      if (embeddedIframeTitle && embeddedIframeTitle.trim() !== '') {
        label = embeddedIframeTitle;
      } else if (embeddedUrlTitle && embeddedUrlTitle.trim() !== '') {
        label = embeddedUrlTitle;
      }

      const newEmbedConfig = {
        ...EmbedDashboardConfig,
        label,
      };
      this.allSections.push(newEmbedConfig.label);
      this.customTitle = newEmbedConfig.label;
      this.ADD_CONTROL_PANEL(newEmbedConfig);
    },
    setAllSections(configs) {
      for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        this.ADD_CONTROL_PANEL(config);
      }
      this.ADD_CONTROL_PANEL(DynamicSectionConfig);
      // Only add Scorecard config for specific dashboards
      if (this.shouldShowScorecard) {
        this.ADD_CONTROL_PANEL(ScorecardConfig);
      }
    },
    filterSectionArray(configs, activeSections) {
      const arrayCopyModified = this.fieldsArray.map((el) => ({
        isShow: activeSections.includes(el.name),
        ...el,
      }));

      arrayCopyModified.forEach((item, i) => {
        if (item.isShow) {
          this.ADD_CONTROL_PANEL(configs[i]);
        }
      });
    },

    changeSwipe(cord) {
      const content = document.querySelector('.row_alt');
      this.scrollTo(content, cord.x, cord.y);
    },

    scrollTo(element, scrollPixels, duration) {
      this.scrollPixels = scrollPixels;
      this.scrollElement = element;
      this.scrollDuration = duration;
      const scrollPos = element.scrollLeft;
      this.scrollPos = scrollPos;
      // Condition to check if scrolling is required
      if (
        !(
          (scrollPos === 0 || scrollPixels > 0)
          && (element.clientWidth + scrollPos === element.scrollWidth || scrollPixels < 0)
        )
      ) {
        // Get the start timestamp
        const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();
        this.scrollStartTime = startTime;
        // Call requestAnimationFrame on scroll function first time
        window.requestAnimationFrame(this.scroll);
      }
    },

    getValue(value) {
      this.updateValue = value;
    },

    getKey(key) {
      this.updateKey = key;
    },

    getReset() {
      this.resetData++;
    },
    setIndex(propertyName) {
      return this.$store.state.MSDAT_STORE.controlConfig.findIndex(
        (obj) => obj.label === propertyName,
      );
    },
  },
  async created() {
    await this.CLEAR_CONTROL_PANEL();
    /**
     * @author davebenard
     * passing indicator Overview first means it going to at  index 0
     * in the control Panel config Array
     * and so on and fort for the other sections
     */

    const DiseaseSurveillanceConfig = this.noNHMIS
      ? IndicatorOverviewConfig2
      : IndicatorOverviewConfig;
    const baseConfigs = [
      DiseaseSurveillanceConfig,
      ZonalAnalysisConfig,
      ICSConfig,
      DataSetComparisonConfig,
      BaseMultiSourceConfig,
    ];
    const customConfigs = [...baseConfigs, MapVisualizationConfig];

    // Updated flow
    const { name: queryParameter } = this.$route.params;
    if (this.customDashboard) {
      if (queryParameter) {
        // const preexistingDashboard = StaticConfig.find((item) => item.name === queryParameter);
        const retrievedSections = this.getConfigObject()?.sections;
        if (retrievedSections && retrievedSections.length > 0) {
          this.filterSectionArray(customConfigs, retrievedSections);
        } else {
          this.setPresetSections(this.fieldsArray, customConfigs);
        }
      } else {
        this.setPresetSections(this.fieldsArray, customConfigs);
      }
    } else {
      this.setAllSections(baseConfigs);
    }
  },

  destroyed() {
    window.removeEventListener('resize', this.onResize);
  },
};
</script>

<style scoped>
/* test css */
.row_alt {
  display: flex;
  flex-direction: row;
  /* justify-content: space-evenly; */
  overflow-x: hidden;
  flex-shrink: 0;
  flex-basis: 0;
  flex-wrap: nowrap;
}

.comparison-header {
  display: none;
}

@media (max-width: 800px) {
  .comparison-header {
    display: inherit;
    margin: 0 auto;
    text-align: center;
    font-weight: bold;
    margin: 5px;
  }
}
</style>
