async addCurrentToReport() { // Demo helper: build a context from current payload to add a chart and
table const payload = this.payload; // Example: send table with current payload as query const
tableQuery = { indicator: payload.indicator, datasource: payload.datasource, location:
payload.location, year: payload.year, }; if (this.$customreportbuilder && typeof
this.$customreportbuilder.addItemWithContext === 'function') { // add a table item await
this.$customreportbuilder.addItemWithContext('table', { query: tableQuery }); // try to snapshot a
chart container if present - host pages should pass real selector // here we attempt a common chart
container id '#main-chart' as an example await this.$customreportbuilder.addItemWithContext('chart',
{ chartSelector: '#main-chart' }); } else { // eslint-disable-next-line no-console
console.warn('Report builder plugin not available'); } },
<template>
  <div class="row" id="control-panel">
    <!-- <pre>{{ setup }}</pre> -->
    <div
      v-for="(values, index) in setup"
      :class="values.class"
      :key="index"
      v-show="values.visibility === undefined ? true : values.visibility"
    >
      <!-- <div v-if="values.visibility === undefined ? true : values.visibility"> -->

      <!-- THIS IS NOT CURRENTLY NEEDED AS IF THERE IS NO NHMIS THE NUM/DENOM IS BLURRED OUT ALREADY -->
      <!-- <label
        class="text-uppercase work-sans label-text "
        v-if="!hasNHMIS && values.label == 'Num/Denom'"
      >
        {{ '' }}
      </label> -->
      <label
        :class="
          disableTarget
            ? 'text-uppercase work-sans label-text'
            : 'text-uppercase work-sans label-text disabled_alt'
        "
        v-if="values.label == 'Target'"
      >
        {{ values.label }}
      </label>
      <label
        :class="
          values.label === 'Num/Denom'
            ? 'text-uppercase work-sans label-text d-flex justify-content-center'
            : 'text-uppercase work-sans label-text d-flex'
        "
        v-if="values.label !== 'Target' && values.label !== 'Year'"
      >
        {{ values.label }}
      </label>
      <label
        :class="
          values.label === 'Num/Denom'
            ? 'text-uppercase work-sans label-text d-flex justify-content-center'
            : 'text-uppercase work-sans label-text d-flex'
        "
        v-if="values.label === 'Year' && $store.getters.getSectionTitle !== 'Predictive Analysis'"
      >
        {{ values.label }}
      </label>

      <!-- <pre>{{ values }}</pre> -->

      <!-- ADVANCED ANALYTICS -->
      <!-- <pre>{{ values }}</pre> -->
      <selectWrapper
        v-if="values.type === 'dropdown' && values.key === 'indicator'"
        :id="label"
        :value="payload[values.key]"
        @input="updatePayload($event, values.key)"
        :options="getIndicatorList(values.options)"
        :multiSelectProps="values.dropdownProps"
        :NoDataLabel="values.label"
        :placeholder="'Select indicator'"
        :customFilter="customFilter"
      />
      {{ checkNHMISDHIS2() }}
      <!-- MSDAT SUB-DASHBOARDS -->
      <selectWrapper
        v-if="values.type === 'dropdown' && values.key === 'compareBy'"
        :id="label"
        :value="payload[values.key]"
        @input="updatePayload($event, values.key)"
        :options="locationCheck(values.options)"
        :multiSelectProps="values.dropdownProps"
        :NoDataLabel="values.label"
        :placeholder="'Select a value'"
      />
      <selectWrapper
        v-if="values.type === 'dropdown' && values.key === 'datasource'"
        :id="label"
        :value="payload[values.key]"
        @input="updatePayload($event, values.key)"
        :options="locationCheck(values.options)"
        :multiSelectProps="values.dropdownProps"
        :NoDataLabel="values.label"
        :placeholder="'Select datasource'"
      />
      <selectWrapper
        v-if="values.type === 'dropdown' && values.key === 'location'"
        :id="label"
        :value="payload[values.key]"
        @input="updatePayload($event, values.key)"
        :options="locationCheck(values.options, 'location')"
        :multiSelectProps="values.dropdownProps"
        :NoDataLabel="values.label"
        :placeholder="'Select location'"
      />

      <selectWrapper
        v-if="
          values.type === 'dropdown' &&
          values.key === 'year' &&
          $store.getters.getSectionTitle !== 'Predictive Analysis'
        "
        :id="label"
        :value="payload[values.key]"
        @input="updatePayload($event, values.key)"
        :options="locationCheck(values.options)"
        :multiSelectProps="values.dropdownProps"
        :NoDataLabel="values.label"
        :placeholder="'Select year'"
      />

      <selectWrapper
        v-if="values.type === 'dropdown' && values.key === 'visualization'"
        :id="label"
        :value="payload[values.key]"
        @input="updatePayload($event, values.key)"
        :options="locationCheck(values.options)"
        :multiSelectProps="values.dropdownProps"
        :NoDataLabel="values.label"
      />

      <!-- Policy Simulator -->
      <Generate
        v-if="values.type === 'generate'"
        :options="values.options"
        :value="payload[values.key]"
      ></Generate>

      <!-- history -->
      <History v-if="values.type === 'history'">Policy History</History>

      <!-- {{ showItem(values.options) }} -->
      <!-- </div> -->
      <!-- <div class="disabled_alt"> -->
      <div class="d-flex justify-content-center">
        <toggle v-if="values.type === 'toggle'" @change="updatePayload($event, values.key)" />
      </div>

      <div class="d-flex" v-if="values.type === 'checkbox'">
        <!-- National Target here -->
        <div :class="disableTarget ? 'd-flex ' : 'd-flex disabled_alt'">
          <BaseCheckbox
            :currentValue="payload.target.national"
            @input="updatePayload({ sdg: payload.target.sdg, national: $event }, 'target')"
          />
          <p class="check-label ml-1">National</p>
        </div>
        <!-- SDG Target here -->
        <div :class="disableTarget ? 'd-flex ml-3' : 'd-flex ml-3 disabled_alt'">
          <BaseCheckbox
            :currentValue="payload.target.sdg"
            @input="updatePayload({ sdg: $event, national: payload.target.national }, 'target')"
          />
          <p class="check-label ml-1">SDG</p>
        </div>
      </div>
      <div v-if="values.type === 'visualization'" class="btn-group d-flex work-sans" role="group">
        <button
          type="button"
          @click="updatePayload('zonal_map', values.key), (activeToggleButton = 'zonal_map')"
          class="btn btn-lg btn-outline-primary"
          :class="[activeToggleButton === 'zonal_map' ? 'active' : '']"
        >
          Zones Map
          <img
            :src="
              require(`../svg/${
                activeToggleButton === 'zonal_map' ? 'state_map_white' : 'zonal_map'
              }.svg`)
            "
            alt=""
            srcset=""
          />
        </button>
        <button
          type="button"
          @click="updatePayload('state_map', values.key), (activeToggleButton = 'state_map')"
          class="btn btn-lg btn-outline-primary"
          :class="[activeToggleButton === 'state_map' ? 'active' : '']"
        >
          State Map
          <img
            class="text-danger"
            :src="
              require(`../svg/${
                activeToggleButton === 'state_map' ? 'state_map_white' : 'state_map'
              }.svg`)
            "
            alt=""
            srcset=""
          />

          <!-- - {{ activeToggleButton === 'zonal_map' ? 'state_map_white' : 'zonal_map' }} -->
        </button>
        <button
          type="button"
          @click="updatePayload('line', values.key), (activeToggleButton = 'line')"
          class="btn btn-lg btn-outline-primary"
          :class="[activeToggleButton === 'line' ? 'active' : '']"
        >
          Line <b-icon icon="graph-up"></b-icon>
        </button>
        <button
          type="button"
          @click="updatePayload('column', values.key), (activeToggleButton = 'column')"
          class="btn btn-lg btn-outline-primary"
          :class="[activeToggleButton === 'column' ? 'active' : '']"
        >
          Column <b-icon icon="bar-chart-fill"></b-icon>
        </button>
      </div>
      <!-- <div v-if="values.key === 'indicator' && getSelectedSection === 'Indicator Overview'" class="prog-label">
  <p class="first-text">
    Program Area: {{ payload.indicator ? payload.indicator.program_area : '' }}
  </p>
  <p class="second-text">The program area will display for each indicator</p>
</div> -->
    </div>

    <!-- Voice Control Button -->
    <div class="col-auto d-flex align-items-start">
      <div @click="isVoiceModalVisible = true" class="voice-wrapper">
        <div class="d-flex align-items-center voice-item">
          <b-icon icon="mic-fill" class=""></b-icon>
          <span class="font-weight-bold">voice</span>
        </div>

        <span class="exp">(experimental)</span>
      </div>
    </div>

    <!-- (report builder capture is automatic demo button removed) -->

    <!-- Voice Control Modal Component -->
    <VoiceControlModal :show="isVoiceModalVisible" @close="isVoiceModalVisible = false" />
  </div>
</template>

<script>
// import ControlMixins from '@/components/ControlPanel/ControlMixins';
import { mapMutations, mapGetters } from 'vuex';
// eslint-disable-next-line import/no-unresolved
import BaseCheckbox from '@/components/ControlPanel/components/checkbox.vue';
// eslint-disable-next-line import/no-unresolved
import toggle from '@/components/ControlPanel/components/toggle-switch.vue';
import selectWrapper from './SelectDropdown.vue';
import Generate from '../components/generate.vue';
import VoiceControlModal from '../components/VoiceControl/voiceControlModal.vue';

export default {
  name: 'ControlPanel',
  data() {
    return {
      activeToggleButton: '',
      dashboardName: '',
      showVoiceControl: false,
      // using component data with 'Sub' addition to prevent prop mutations
      // (controlIndex & groupIndex)
      controlIndexSub: this.controlIndex,
      groupIndexSub: this.groupIndex,
      hasNHMIS: false,
      selectedSection: '',
      isVoiceModalVisible: false,
    };
  },
  components: {
    selectWrapper,
    BaseCheckbox,
    toggle,
    Generate,
    VoiceControlModal,
  },
  props: {
    setup: {
      type: Array,
      required: true,
    },
    indicatorList: {
      type: String,
      required: false,
      default: () => null,
    },
    groupIndex: {
      type: Number,
      default: () => null,
    },
    label: {
      type: String,
      default: () => null,
    },
    controlIndex: {
      type: Number,
      required: true,
    },
    defaultIndicator: {
      type: Object,
      required: false,
    },
    defaultDataSource: {
      type: Object,
      required: false,
    },
    defaultLocation: {
      type: Object,
      required: false,
    },
    defaultYear: {
      type: [Object, String],
      required: false,
    },
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
  },
  watch: {
    defaultDataSource(newValue) {
      this.payload.datasource = newValue;
    },
    payload: {
      handler(newValue) {
        this.$emit('data:options', newValue);
        this.saveNewActivity(newValue);
      },
      immediate: true,
      deep: true,
    },

    updateValue(newValue) {
      this.controlIndexSub = 0;
      this.groupIndexSub = null;
      this.updatePayload(newValue, 'datasource');
    },

    resetData: {
      handler() {
        this.controlIndexSub = 0;
        this.groupIndexSub = null;
        this.updatePayload(this.defaultDataSource, 'datasource');
      },
      immediate: true,
    },
  },
  methods: {
    // eslint-disable-next-line consistent-return
    // eslint-disable-next-line operator-linebreak
    // eslint-disable-next-line camelcase

    ...mapMutations('MSDAT_STORE', ['SET_SELECTED_CONFIG']),
    /**
     * @description check if datasource dropdown has NHMIS-DHIS2
     * checks if the key is datasource then create a new array of datasource id
     * checks if the array has NHMIS-DHIS2 with id of 6
     */
    saveNewActivity(newValue) {
      const { indicator, datasource, location, year } = newValue;
      // eslint-disable-next-line camelcase
      const ind = Array.isArray(indicator)
        ? // eslint-disable-next-line operator-linebreak
          // eslint-disable-next-line camelcase
          indicator[indicator.length - 1]?.short_name
        : // eslint-disable-next-line operator-linebreak
          // eslint-disable-next-line camelcase
          indicator?.short_name;

      // eslint-disable-next-line no-nested-ternary
      const dat = Array.isArray(datasource)
        ? datasource[datasource.length - 1]?.item
        : datasource.datasource
        ? datasource.datasource
        : datasource?.item;
      const loc = location?.name === 'Nigeria' ? 'National' : location?.name;
      if (ind && dat && this.getUser.id) {
        const activityObject = {
          id: `${this.getUser.id}${Date.now()}`,
          datetime: Date.now(),
          page: this.$route.params.name.split('_').slice(0, 2).join(' '),
          section: this.$store.state.MSDAT_STORE.controlConfig[this.controlIndex].label,
          parameters: `${ind}, ${dat}${year ? ` ${year}` : ''}${loc ? `, ${loc}` : ''}`,
        };
        const lastActivity = JSON.parse(localStorage.getItem('lastActivity') || '{}');
        const hold = (Date.now() - lastActivity.datetime || 0) >= 5000;
        const diff =
          lastActivity.page !== activityObject.page ||
          lastActivity.section !== activityObject.section ||
          lastActivity.parameters !== activityObject.parameters;
        if (hold && diff) {
          // send activity post request to backend
          // console.log('activity', activityObject);
        }
        localStorage.setItem('lastActivity', JSON.stringify(activityObject));
      }
    },
    // ...existing methods continue here
    locationCheck(options) {
      // I do not understand this logic, but it is used to filter out
      // the options in the dropdown based on the current route
      // if (
      //   // eslint-disable-next-line operator-linebreak
      //   this.$route.params.name === 'Disease_Surveillance' &&
      //   // eslint-disable-next-line operator-linebreak
      //   options !== null &&
      //   options.length === 38
      // ) {
      //   // const main = options.filter((s) => s.name === 'Nigeria');
      //   // console.log(main, 'Nigeria');
      //   return options.filter((s) => s.name === 'Nigeria');
      // }
      // am returning the options as is

      return options;
    },
    checkNHMISDHIS2() {
      this.setup.forEach((item) => {
        if (item.key === 'datasource') {
          const datasourceArr = item?.options?.map((el) => el.id);
          if (datasourceArr?.includes(6)) {
            this.hasNHMIS = true;
          } else {
            this.hasNHMIS = false;
          }
        }
      });
    },
    getIndicatorList(data) {
      // const { name } = this.$route.params;
      // if (name === 'Advanced_Analytics') {
      //   return data?.filter((item) => item.program_area === this.indicatorList);
      // }

      // console.log(this.$store.getters.getSectionTitle, 'XXXXX');

      const { name } = this.$route.params;
      if (
        name === 'Advanced_Analytics' &&
        this.$store.getters.getSectionTitle === 'Multisource Inidcator Comparison'
      ) {
        return data?.filter((item) => item.program_area === this.indicatorList);
      }

      return data;

      // if (this.indicatorList !== '' || this.indicatorList !== null) {
      //   return data?.filter((item) => item.program_area === this.indicatorList);
      // }
    },
    updatePayload(value, key) {
      if (this.groupIndexSub != null) {
        // this is to take into consideration control panel that
        // are grouped example is Multi-source comparison section
        // debugger;
        this.$store.commit('MSDAT_STORE/SET_PAYLOAD', {
          controlIndex: this.controlIndexSub,
          groupIndex: this.groupIndexSub,
          key,
          value,
        });
      } else {
        this.$store.commit('MSDAT_STORE/SET_PAYLOAD', {
          controlIndex: this.controlIndexSub,
          key,
          value,
        });
      }
      this.controlIndexSub = this.controlIndex;
      this.groupIndexSub = this.groupIndex;
      this.$emit('data:options', this.payload);
    },
    updateMultiIndicatorPayload(value) {
      if (this.groupIndexSub != null) {
        // this is to take into consideration control panel that
        // are grouped example is Multi-source comparison section
        // debugger;
        this.$store.commit('MSDAT_STORE/SET_SELECTED_CONFIG', {
          entity: 'indicator',
          payload: value,
        });
        this.$store.commit('MSDAT_STORE/SET_ALL_CONFIG_RESOURCE', {
          entity: 'indicator',
          value: value,
        });
      } else {
        this.$store.commit('MSDAT_STORE/SET_SELECTED_CONFIG', {
          entity: 'indicator',
          payload: value,
        });
        this.$store.commit('MSDAT_STORE/SET_ALL_CONFIG_RESOURCE', {
          entity: 'indicator',
          value: value,
        });
      }
      // this.controlIndexSub = this.controlIndex;
      // this.groupIndexSub = this.groupIndex;
      // this.$emit('data:options', this.payload);
    },
    updateMultiDatasourcePayload(value) {
      if (this.groupIndexSub != null) {
        // this is to take into consideration control panel that
        // are grouped example is Multi-source comparison section
        // debugger;
        this.$store.commit('MSDAT_STORE/SET_SELECTED_CONFIG', {
          entity: 'dataSource',
          payload: value,
        });

        this.$store.commit('MSDAT_STORE/SET_ALL_CONFIG_RESOURCE', {
          entity: 'datasource',
          value: value,
        });
      } else {
        this.$store.commit('MSDAT_STORE/SET_SELECTED_CONFIG', {
          entity: 'dataSource',
          payload: value,
        });
        this.$store.commit('MSDAT_STORE/SET_ALL_CONFIG_RESOURCE', {
          entity: 'datasource',
          value: value,
        });
      }
      // this.controlIndexSub = this.controlIndex;
      // this.groupIndexSub = this.groupIndex;
      // this.$emit('data:options', this.payload);
    },
    updateMultiPeriodPayload(value) {
      if (this.groupIndexSub != null) {
        // this is to take into consideration control panel that
        // are grouped example is Multi-source comparison section
        // debugger;
        this.$store.commit('MSDAT_STORE/SET_SELECTED_CONFIG', {
          entity: 'period',
          payload: value,
        });

        this.$store.commit('MSDAT_STORE/SET_ALL_CONFIG_RESOURCE', {
          entity: 'year',
          value: value,
        });
      } else {
        this.$store.commit('MSDAT_STORE/SET_SELECTED_CONFIG', {
          entity: 'period',
          payload: value,
        });
        this.$store.commit('MSDAT_STORE/SET_ALL_CONFIG_RESOURCE', {
          entity: 'year',
          value: value,
        });
      }
      // this.controlIndexSub = this.controlIndex;
      // this.groupIndexSub = this.groupIndex;
      // this.$emit('data:options', this.payload);
    },
    customFilter(option, search) {
      console.log('<<@>>');

      if (!search) return true;

      // if search starts with #
      if (search.startsWith('#')) {
        const tagSearch = search.slice(1); // remove #
        return option.tags.map((t) => String(t)).some((t) => t.includes(tagSearch));
      }

      // normal search
      return (
        option.full_name.toLowerCase().includes(search.toLowerCase()) ||
        option.short_name.toLowerCase().includes(search.toLowerCase())
      );
    },
  },
  computed: {
    ...mapGetters('AUTH_STORE', ['getUser']),
    ...mapGetters('MSDAT_STORE', ['getSelectedSection']),
    payload() {
      if (this.groupIndex != null) {
        // this is to take into consideration control panel that
        // are grouped example is Multi-source comparison section
        return this.$store.state.MSDAT_STORE.controlConfig[this.controlIndex].payload[
          this.groupIndex
        ];
      }
      return this.$store.state.MSDAT_STORE.controlConfig[this.controlIndex].payload;
    },
    disableTarget() {
      if (
        this.$route.path === '/dashboard/Health_Outcomes_and_Service_Coverage' ||
        this.$route.path === '/dashboard/Health_Financing' ||
        this.$route.path === '/dashboard/Health_Service_Access' ||
        this.$route.path === '/dashboard/Demographics'
      ) {
        return true;
      }
      return false;
    },
    // Show voice controls only on the Indicator Overview control panel
    isIndicatorOverviewPanel() {
      try {
        const configLabel = this.$store.state.MSDAT_STORE.controlConfig[this.controlIndex]?.label;
        return (
          configLabel === 'Indicator Overview' || this.getSelectedSection === 'Indicator Overview'
        );
      } catch (e) {
        return this.getSelectedSection === 'Indicator Overview';
      }
    },
  },

  mounted() {
    const { name } = this.$route.params;
    this.dashboardName = name;
    const date = new Date();
    const getYear = date.getFullYear() + 1;

    // Resolve year setup by key instead of hard-coded index so dashboards with
    // different setup shapes don't crash on mount.
    const yearSetup = Array.isArray(this.setup)
      ? this.setup.find((item) => item && item.key === 'year')
      : null;
    const defaultYears = Array.isArray(yearSetup?.options) ? yearSetup.options : [];

    const newArr = [];
    defaultYears.forEach((el) => {
      if (el < getYear) {
        newArr.push(el);
        this.defaultYearDropdown = newArr;
      }
    });
    const temp = {
      datasource: this.defaultDataSource,
      indicator: this.defaultIndicator,
      location: this.defaultLocation,
    };

    console.log(temp, 'OBO Main');

    if (this.defaultIndicator) {
      this.updatePayload(this.defaultIndicator, 'indicator');
      this.updateMultiIndicatorPayload(this.defaultIndicator);
    }

    if (this.defaultDataSource) {
      this.updatePayload(this.defaultDataSource, 'datasource');
      this.updateMultiDatasourcePayload(this.defaultDataSource);
    }

    if (this.defaultLocation) {
      this.updatePayload(this.defaultLocation, 'location');
    }

    if (this.defaultYear) {
      this.updatePayload(this.defaultYear, 'year');
      this.updateMultiPeriodPayload(this.defaultYear);
    }

    this.activeToggleButton = this.payload.visualization;
  },
};
</script>

<style lang="scss" scoped>
.label-text {
  padding-top: 6px;
  font-weight: bold;
  font-size: 14px;
}

button {
  font-size: 12px;
  font-weight: bold;
}

.voice-btn-custom {
  --custom-color: #007d53;
  color: var(--custom-color);
  border-color: var(--custom-color);
  background-color: #fff; /* Set default background to white */
}

.voice-btn-custom:hover,
.voice-btn-custom:focus,
.voice-btn-custom:active,
.voice-btn-custom.active {
  color: #fff; /* White text on hover/active */
  background-color: var(--custom-color);
  border-color: var(--custom-color);
  box-shadow: 0 0 0 0.2rem rgba(0, 125, 83, 0.5); /* Optional: Adjust focus shadow color */
}

.voice-btn-custom:hover small {
  color: white;
}
// .prog-label {
//   display: flex;
//   position: absolute;
//   align-items: center;
//   background-color: #DFF3F3;
//   border:1px solid #D6D6D6;
//   margin-top: 12px;
//   margin-left: -8px;
//   left: 0;
//   right: 0;
//   font-weight: 400;
//   width: 100vw;
//   flex-direction: row;
//   justify-content: space-between;
//   z-index: 10;
//   padding: 1px 16px;
// }

// .first-text {
//   font-size: 14px;
//   font-weight: 500;
//   margin-bottom: 0;
//   color: #232323;
// }

// .second-text {
//   font-size: 13px;
//   margin-bottom: 0;
//   color: #656565;
//   padding-right: 32px;
// }

@media (max-width: 900px) {
  .prog-label {
    display: none;
  }
}

.voice-wrapper {
  border: 0.5px solid var(--custom-color);
  padding: 5px 10px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 0 0.1rem rgba(0, 125, 83, 0.5);
  cursor: pointer;
  margin-top: 10px;
  margin-right: 40px;
}

.voice-wrapper .exp {
  margin-top: -5px;
  font-size: 10px;
}

.voice-wrapper:hover {
  background-color: rgba(21, 90, 67, 0.5);
  color: #fff;
}

.voice-wrapper:hover span {
  color: #fff;
}

.voice-item span {
  font-size: 14px;
}

.voice-item svg {
  font-size: 14px;
}
</style>
