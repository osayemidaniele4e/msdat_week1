<!-- eslint-disable no-undef -->
<template>
  <div class="temp">
    <TroubleShootingModal style="z-index: 1500" v-if="showTroubleShootingModal" />
    <template v-if="!showTroubleShootingModal">
      <Loading v-if="!loading" :noBackdrop="true" :showBackground="false" class="over">
        <div class="text-center">
          <img :src="loadingImg" alt="first_img" width="450px" />
          <div class="mr-4 loading-text">
            <h4>Initializing{{ loadingTitle }}</h4>
            <p>{{ loadingContent }}</p>
          </div>
        </div>
      </Loading>

      <div v-else class="position-relative">
        <!-- <BaseUpdate :showPopUp="popUp" v-if="popUp" @closePopUp="handleClosePopUp" /> -->
        <Header v-on:tour="runIntro" ref="theHeader" @index="getIndex"></Header>
        <section @click="$refs.theHeader.close()">
          <div
            :class="[
              isMobile ? 'position-relative animated_toggle' : 'sticky animated_toggle',
              show ? '' : 'hide',
            ]"
          >
            <!-- Moses changed from this -->
            <b-overlay :show="!cpIsLoading">
              <BasePanel
                :changeIndex="changeIndex"
                :position="position"
                :selectedPanel="selectedPanel"
                v-if="cpIsLoading"
                v-on:showSection="sectionFocus($event)"
              >
                <template v-slot:default>
                  <ControlBase
                    @selectedKey="changeKey($event)"
                    v-for="(control, index) in $store.state.MSDAT_STORE.controlConfig"
                    :key="index"
                    :title="control.label"
                  >
                    <template v-if="!Array.isArray(control.setup[0])">
                      <ControlPanel
                        :label="modifyLabel(control.label)"
                        :setup="control.setup"
                        :controlIndex="index"
                        :defaultIndicator="defaultIndicator"
                        :defaultDataSource="defaultDataSource"
                        :defaultLocation="defaultLocation"
                        :defaultYear="defaultYear"
                      />
                    </template>
                    <!-- MULTI SELECT SECTION -->
                    <div v-else>
                      <div class="icon-row">
                        <div v-b-toggle.collapse-1>
                          <b-icon-search v-b-tooltip.hover title="Search Program Areas" />
                        </div>
                        <div v-b-toggle.panel mt-1>
                          <b-icon-caret-down-fill />
                        </div>
                      </div>

                      <b-collapse id="panel" visible>
                        <template>
                          <div>
                            <!-- mobile view direction buttons -->
                            <div class="swipe-btn-flex">
                              <button @click="swipeLeft" class="swipe-btn">
                                <b-icon icon="chevron-left" />
                              </button>
                              <button @click="swipeRight" class="swipe-btn">
                                <b-icon icon="chevron-right" />
                              </button>
                            </div>
                            <!-- Getting information about a program area -->
                            <b-collapse id="collapse-1" class="mt-2">
                              <b-card>
                                <label class="text-uppercase work-sans label-text"
                                  >Search for Program Area</label
                                >
                                <SelectDropdown
                                  v-model="program_option"
                                  :value="null"
                                  :options="mappedProgramAreas(control.setup[0][0].options)"
                                />
                                <!-- <b-button v-b-toggle.collapse-1-inner size="sm">Toggle Inner Collapse</b-button> -->
                                <b-collapse id="collapse-1-inner" visible class="mt-2">
                                  <div v-if="program_selected.length > 0">
                                    <b-card>
                                      <div class="program-area">
                                        <span>
                                          <strong> Program area </strong> :
                                          {{ program_selected[0].program_area }}
                                        </span>
                                      </div>
                                    </b-card>
                                  </div>
                                </b-collapse>
                              </b-card>
                            </b-collapse>

                            <div class="row dummy-row">
                              <div
                                class="col-md-4"
                                v-for="(item, index2) in control.setup"
                                :key="index2"
                              >
                                <h3 class="control-header">Control ({{ index2 + 1 }})</h3>
                                <!-- ADVANCED ANALYTICS PROGRAM-AREA -->
                                <!-- <pre>{{  item[0].options }}</pre> -->
                                <div v-if="isAdvanced">
                                  <label class="text-uppercase work-sans label-text"
                                    >program areas</label
                                  >
                                  <SelectDropdown
                                    v-model="$data[indexModel(index2)]"
                                    :value="null"
                                    v-if="item[0].options"
                                    :options="getProgramArea(item[0].options)"
                                    @input="updateProgram($event, item[0].options, index2)"
                                  />
                                </div>
                                <ControlPanel
                                  :label="modifyLabel(control.label, index2)"
                                  :setup="item"
                                  :groupIndex="index2"
                                  :controlIndex="index"
                                  :defaultIndicator="defaultIndicator"
                                  :defaultDataSource="defaultDataSource"
                                  :defaultLocation="defaultLocation"
                                  :defaultYear="defaultYear"
                                  :updateValue="updateValue"
                                  :updateKey="updateKey"
                                  :resetData="resetData"
                                  :indicatorList="$data[indexModel(index2)]"
                                />
                              </div>
                            </div>
                          </div>
                        </template>
                      </b-collapse>
                    </div>
                  </ControlBase>
                </template>
              </BasePanel>
            </b-overlay>
          </div>
          <!-- control Panels ends here  -->

          <div class="container-fluid lessVisible mb-5">
            <template v-for="(controlPanel, index) in $store.state.MSDAT_STORE.controlConfig">
              <!-- <slot
                :name="`section-before-${index}`"
                v-if="index === selectedPanel"
              ></slot> -->
              <!-- ========= -->
              <div
                class="row observable"
                :id="index"
                v-if="index === selectedPanel"
                :ref="index"
                :key="index"
              >
                <!-- <slot
                v-if="controlPanel.payload === undefined"
                :name="`section-${index}`"
                :controlIndex="index"
              ></slot> -->
                <slot
                  :name="`section-${index}`"
                  :payload="controlPanel.payload"
                  :controlIndex="index"
                ></slot>
                <!-- ======== -->
                <slot :name="`section-after-${index}`" v-if="index === selectedPanel" :ref="index">
                </slot>
              </div>
            </template>
          </div>
        </section>
        <!-- lazy loading ends here -->

        <Footer class="visible"> </Footer>
        <!-- <div v-if="configObject.name !== 'Demographics'"> -->
        <Onboarding v-if="firstTime" v-on:closeOnboard="onCloseOnBoarding"></Onboarding>
        <!-- </div> -->
      </div>
    </template>
    <!-- <button class="btn btn-primary toggle_btn" @click="show = !show">toggle</button> -->
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import { BasePanel, ControlBase, ControlPanel, SelectDropdown } from '@/components/ControlPanel';
// import BaseUpdate from '@/modules/msdat-dashboard/components/NewUpdate.vue';
import config from '@/modules/dynamic_dashboard/config/dashboard_config';
import apiServices from '@/modules/data-layer/services/ApiServices';
import formatter from '../../mixins/formatter';
import controlPanelSetup from '../../mixins/control-panel-setup';
import tour from '../onboarding/tour';
import Header from '../about/layout/theHeader.vue';
import Footer from '../about/layout/theFooter.vue';
import scroll from '../../modules/onScroll/onscroll';
import SharingDashboardState from '../../modules/dashboard_state_share/mixins';
import Loading from '../../mixins/loading';
import Onboarding from '../onboarding/onboarding';
import TroubleShootingModal from '../../modules/troubleshooting/modal.vue';

export default {
  // head() {
  //   return {
  //     meta: [
  //       {
  //         name: 'twitter:description',
  //         content: 'Your Page Description',
  //       },
  //     ],
  //   };
  // },
  name: 'BaseDashboard',
  mixins: [Loading, formatter, controlPanelSetup, Onboarding, tour, scroll, SharingDashboardState],
  components: {
    TroubleShootingModal,
    ControlBase,
    BasePanel,
    ControlPanel,
    SelectDropdown,
    Header,
    Footer,
    // BaseUpdate,
  },
  data() {
    const index = parseInt(this.$route.query.index, 10) || 0;
    return {
      isAdvanced: false,
      showPanel: false,
      showTroubleShootingModal: false,
      position: 3,
      selectedPanel: index,
      dashboardConfig: config,
      show: false,
      changeIndex: '',
      isMobile: false,
      winSize: window.width,
      scrollCont: 0,
      scrollDuration: 0,
      scrollStartTime: 0,
      scrollElement: 0,
      scrollPixels: 0,
      scrollPos: '',
      sectionKey: 0,
      popUp: true,
      value: null,
      detect: false,
      value0: null,
      value1: null,
      value2: null,
      program_option: '',
      selected: {},
      program_areas: [],
      testt: [],
      program_selected: {},
      indicators: [],
      dataSources: [],
      defaultIndicators: [],
      initialIndicator: null,
      initialDataSource: null,
      initialLocation: null,
    };
  },
  computed: {
    ...mapGetters(['getSectionTitle']),
  },
  props: {
    updateValue: {
      type: Object,
      required: false,
    },

    updateKey: {
      type: String,
      required: false,
    },

    resetData: {
      type: Number,
      required: false,
    },

    scrollLeft2: {
      type: Number,
    },
  },

  async created() {
    // log route path Health_Outcomes_and_Service_Coverage
    this.indicators = this.getConfigObject().indicators;
    this.dataSources = this.getConfigObject().dataSources;
    this.defaultIndicators = this.getConfigObject().defaultIndicators;
    this.initialIndicator = this.getConfigObject().initialIndicator;
    this.initialDataSource = this.getConfigObject().initialDataSource;
    this.initialLocation = this.getConfigObject().initialLocation;
    window.addEventListener('resize', this.onResize);

    const { name } = this.$route.params;
    if (name === 'Advanced_Analytics') {
      this.isAdvanced = true;
    }
    if (name === 'Advanced_Analytics') {
      this.isAdvanced = true;
    }
    // try {
    //   const response = await apiServices.getDashboard();
    //   const { results } = response.data;
    //   this.configObject = results.find((item) => item.name === name);
    // } catch {
    // this.configObject = this.dashboardConfig.find((item) => item.name === name);
    // }
    // this.configObject = this.dashboardConfig.find((item) => item.name === name);

    // checking if in Mobile view
    if (window.innerWidth < 769) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }

    window.addEventListener('wheel', this.handleScroll);

    /**
     * Update Site-Wide OG tags for crawlers
     */
    // eslint-disable-next-line camelcase
    const indicator =
      // eslint-disable-next-line camelcase
      this.getSelectedConfig().indicator?.full_name ||
      // eslint-disable-next-line camelcase
      this.dlIndicator.find((ind) => ind.id === this.initialIndicator?.full_name) ||
      'Skilled attendance at delivery or birth';
    const pageDesc = `Take a look at '${indicator}' on the Multi-Source Data and Triangulation (MSDAT) platform`;

    const descEl = document.querySelector('head meta[property="og:description"]');
    const descEl2 = document.querySelector('head meta[name="twitter:description"]');
    descEl.setAttribute('content', pageDesc);
    descEl2.setAttribute('content', pageDesc);
  },

  destroyed() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('wheel', this.handleScroll);
  },
  methods: {
    ...mapMutations('MSDAT_STORE', [
      'SET_CONFIGURATIONS',
      'UPDATE_PROGRAM_AREAS',
      'SET_SECTION',
      'SET_URL_DATASOURCE',
      'SET_SECTION_PAYLOAD',
      'SET_MULTI_DATASOURCE_PAYLOAD',
      'SET_DATASET_DATASOURCE_PAYLOAD',
      'SET_URL_LOCATION',
      'SET_URL_PERIOD',
      'SET_MULTI_LOCATION_PAYLOAD',
      'SET_MULTI_PERIOD_PAYLOAD',
    ]),
    ...mapGetters('MSDAT_STORE', ['getConfigObject', 'getSelectedConfig', 'getLoadingStatus']),
    //  passing the value of the v-model for program areas dynamically
    indexModel(index) {
      return `value${index}`;
    },

    // function to get program areas
    getProgramArea(data) {
      return data.map((el) => el.program_area);
    },
    mappedProgramAreas(data) {
      this.program_areas = data;
      const indicators = data.map((p) => p.indicators);
      const singleArr = indicators.flat();
      const indicatorArr = [];
      singleArr.forEach((el) => {
        const indicatorName = el.full_name;
        indicatorArr.push(indicatorName);
      });
      return indicatorArr;
    },
    /**
     * Function to handle show welcome modal
     */
    handleClosePopUp() {
      this.popUp = false;
    },
    // log(event, index, index2) {
    //   console.log('log function =>', event, index, index2);
    // },

    changeKey(n) {
      this.sectionKey = n;
    },
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
    closeAlert() {
      this.detect = false;
    },
    handleScroll() {
      this.scrollCont = document.querySelector('.dummy-row').scrollLeft;
      this.$emit('scrollN', this.scrollCont);
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
          (scrollPos === 0 || scrollPixels > 0) &&
          (element.clientWidth + scrollPos === element.scrollWidth || scrollPixels < 0)
        )
      ) {
        // Get the start timestamp
        const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();
        this.scrollStartTime = startTime;
        // Call requestAnimationFrame on scroll function first time
        window.requestAnimationFrame(this.scroll);
      }
    },

    swipeLeft() {
      // const content = this.$refs.dummy-row;
      const content = document.querySelector('.dummy-row');
      this.scrollTo(content, -300, 800);
      const cord = {
        x: -370,
        y: 800,
      };
      this.$emit('swipe', cord);
    },

    swipeRight() {
      const content = document.querySelector('.dummy-row');
      this.scrollTo(content, 300, 800);
      const cord = {
        x: 370,
        y: 800,
      };
      this.$emit('swipe', cord);
    },

    getIndex(index) {
      this.changeIndex = index;
    },
    /**
     * Since the purpose of providing labels to
     * the multiselects is so they can have unique,
     * dynamic IDs, this function converts it to a
     * HTML
     * ID fit format, i.e without spaces
     */
    modifyLabel(fullName, index) {
      if (index) {
        return fullName.replace(' ', '_') + index;
      }
      return fullName.replace(' ', '_');
    },
    /**
     * This handles hiding the other sections
     * based on the index of the selected section
     */
    sectionFocus(event) {
      this.selectedPanel = event;
    },
    /**
     * @param optionsObject The return a control Options objects when ever any control
     * in a control panel changes
     * @param index The index of the control panel that changes
     * you can use this to check which control panel changed
     *
     */
    setState(val) {
      this.selectedMapName = val;
    },

    onResize() {
      if (window.innerWidth < 769) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    },
    applyRoutePayloadValue(key, value) {
      const sharedSections = key === 'datasource' ? [0, 1, 2, 5] : [0, 1, 2, 3, 5];

      sharedSections.forEach((controlIndex) => {
        this.SET_SECTION_PAYLOAD({
          controlIndex,
          key,
          value,
        });
      });

      if (key === 'datasource') {
        this.SET_DATASET_DATASOURCE_PAYLOAD({
          controlIndex: 3,
          key,
          value,
        });
        this.SET_MULTI_DATASOURCE_PAYLOAD({
          controlIndex: 4,
          key,
          value,
        });
        return;
      }

      this.SET_MULTI_LOCATION_PAYLOAD({
        controlIndex: 4,
        key,
        value,
      });
    },
    async applyRouteSelections() {
      const { datasource, location, section, indicator } = this.$route.query;

      if (datasource) {
        this.SET_URL_DATASOURCE(datasource);
      }

      if (location) {
        this.SET_URL_LOCATION(location);
      }

      const [datasourceResponse, locationResponse] = await Promise.all([
        datasource ? apiServices.getSingleDataSourceObj(datasource) : Promise.resolve(null),
        location ? apiServices.getSingleLocationObj(location) : Promise.resolve(null),
      ]);

      if (datasourceResponse?.data) {
        this.applyRoutePayloadValue('datasource', datasourceResponse.data);
      }

      if (locationResponse?.data) {
        this.applyRoutePayloadValue('location', locationResponse.data);
      }

      if (section) {
        this.SET_SECTION(section);
      }

      return indicator ? this.getRouteIndicatorRelatedIndicators() : [];
    },
    async initializeDashboardData(urlRequestedIndicator) {
      const dashboardID = localStorage.getItem('activeDashboardID');

      await this.$DL.init({
        dashboardIndicators: this.indicators,
        defaultIndicators:
          urlRequestedIndicator.length > 0 ? urlRequestedIndicator : this.defaultIndicators,
        dashboardDataSources: this.dataSources,
        dashboardID,
      });

      this.loading = true;

      this.$store.commit('MSDAT_STORE/SET_INITIAL', {
        indicator: this.initialIndicator,
        datasource: this.initialDataSource,
        location: this.initialLocation,
      });

      await this.setDefaults();
      await this.setUpControlPanelDropDown();
    },
    async finalizeDashboardSetup() {
      this.defaultYearDropdown = await this.setYearDropdown();
      if (this.defaultYearDropdown.length > 0) {
        this.defaultYear = this.defaultYearDropdown[0];
      }

      this.cpIsLoading = true;
      this.$nextTick(() => {
        this.startScroll();
      });
    },
    hidePrerenderModal() {
      const bvModal = document.querySelector('#__BVID__13___BV_modal_outer_');
      if (bvModal) bvModal.style.display = 'none';
    },
    updateProgram(item, indicators, index2) {
      const filteredIndicator = indicators.filter((indicator) => indicator.program_area === item);
      const data = {
        content: filteredIndicator[0],
        index: index2,
      };

      this.UPDATE_PROGRAM_AREAS(data);
    },
  },

  watch: {
    async program_option(newVal) {
      const indicators = this.program_areas.map((p) => p.indicators);
      const singleArr = indicators.flat();
      this.program_selected = singleArr.filter((item) => item.full_name === newVal);
    },
  },

  async mounted() {
    this.loading = false;

    const urlRequestedIndicator = await this.applyRouteSelections();

    setTimeout(() => {
      if (this.detect) {
        this.closeAlert();
      }
    }, 60000);

    try {
      await this.initializeDashboardData(urlRequestedIndicator);
      await this.finalizeDashboardSetup();
    } catch (error) {
      if (!error.isAxiosError) {
        this.showTroubleShootingModal = true;
      }
    } finally {
      this.hidePrerenderModal();
    }
  },
};
</script>

<style lang="scss">
/* Temporary fix for the font-sizes irregularities for the table data on the dashboard*/
div.temp {
  a {
    font-size: 13px !important;
  }
  h5,
  h2,
  h3,
  h4,
  h1 {
    // font-size: 3rem !important;
  }
  li {
    font-size: 0.7rem !important;
  }
  table span {
    // font-size: 1rem !important;
  }
  .sticky {
    position: sticky;
    position: -webkit-sticky;
    top: 0px;
    z-index: 2;
    background-color: white;
    box-shadow: 0px 3px 8px 0px #888888;
  }
  .visible {
    z-index: 10;
  }
  .lessVisible {
    z-index: -1;
    margin-top: 1px;
  }
}
div#browserSupport {
  position: fixed;
  margin: 5px 5px 0 0;
  background-color: #fff3cd;
  color: #583e03;
  top: 0;
  border: 0.5px solid #583e03;
  font-size: 12px;
  box-shadow: -3px 5px 10px #00000029;
  right: 0;
  border-radius: 5px;
  z-index: 900;
}
div#browserSupport img {
  width: 34px;
  height: 30px;
}
.alertBold {
  color: #583e03;
}
.swipe-btn-flex {
  display: none;
}

.control-header {
  display: none;
}
.label-text {
  font-size: 10px;
  font-weight: bold;
}
.program {
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 18px;
  margin: 10px;
}
.program label {
  font-size: 12px;
  font-weight: bold;
}
.prog-drop {
  width: 450px;
}
.prog-visual {
  font-size: 12px;
  font-weight: bold;
  padding: 10px;
  width: 400px;
  border: 1px solid#007D53;
  border-radius: 5px;
  background-color: #ffffff;
  color: #000;
}

.rotated {
  transform: rotate(180deg);
}
@media (max-width: 800px) {
  .swipe-btn-flex {
    display: flex;
    flex-direction: row;
    position: sticky;
    justify-content: space-between;
    /* z-index: 10; */
    margin: 10px;
  }

  .control-header {
    display: inherit;
    margin: 0 auto;
    text-align: center;
    font-weight: bold;
    margin: 5px;
  }

  /* testing for mobile */
  .dummy-row {
    display: flex;
    flex-direction: row;
    overflow: scroll;
    flex-wrap: nowrap;
  }
}
// .togglePanel {
//   margin-left: 84vw;
// }

.program-area {
  font-size: 12px;
}

.icon-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.loading-text h4 {
  font-size: 40px;
}

.loading-text p {
  font-size: 20px;
}
</style>
