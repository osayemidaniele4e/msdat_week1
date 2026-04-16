<template>
  <div class="">
    <ul>
      <draggable v-model="modifiedControls">
        <transition-group
          class="d-flex mr-2 list-unstyled step-sections pt-2 mb-0 border-b cursor-pointer main tabs-sec"
        >
          <li
            class="mb-0 tab-link h5 text-black-50 bg-tab-color work-sans main"
            :class="[el.index === selectedIndex ? 'active font-weight-bold' : '']"
            v-for="(el, i) in modifiedControls"
            :key="i"
            :id="`panel-${el.index}`"
            @click="changeControl(el.index, el.title)"
          >
            <div class="d-flex justify-content-between el-tit align-items-center">
              {{ el.title }}
              <div v-if="el.index === selectedIndex" class="share-icon-wrapper">
                <img
                  :id="`share-tooltip-${el.index}`"
                  src="@/assets/Share-button.png"
                  alt="share-btn"
                  class="share-icon"
                  @click.stop="toggleShareModal(el.title)"
                />
                <b-tooltip
                  :target="`share-tooltip-${el.index}`"
                  triggers="hover"
                  placement="top"
                  custom-class="share-tooltip"
                >
                  Share
                </b-tooltip>
              </div>
            </div>
          </li>
        </transition-group>
      </draggable>
    </ul>

    <div class="control-title">{{ title }}</div>
    <!-- Multi-select dropdown here -->
    <div class="mx-lg-2 px-3 mx-auto pb-3 step-controls styles">
      <slot v-bind:selectControl="selectControl" />
    </div>

    <!-- <div class="">
       <ShareSection />
    </div> -->
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import draggable from 'vuedraggable';
// import ShareSection from '@/modules/msdat-dashboard/components/ShareSection.vue';
import apiServices from '@/modules/data-layer/services/ApiServices';
import { groupIndicator } from '@/util/helper';
import controlSetup from '../../../modules/msdat-dashboard/mixins/control-panel-setup';

export default {
  name: 'BasePanel',
  mixins: [controlSetup],
  components: {
    draggable,
    // ShareSection,
  },
  data() {
    return {
      controls: [],
      modifiedControls: [],
      selectedIndex: 0,
      title: 'Indicator Overview',
      checkIndex: 0,
      showShareSectionModal: false,
    };
  },

  props: {
    tabs: {
      type: Array,
    },

    position: {
      type: Number,
      require: false,
      default: 0,
    },

    changeIndex: {
      require: false,
      default: 1,
    },

    selectedPanel: {
      require: false,
      default: 0,
    },
  },
  methods: {
    ...mapMutations('MSDAT_STORE', [
      'SET_SECTION_INDEX',
      'SET_SECTION',
      'toggleShowShareSection',
      'UPDATE_IDC_DATASOURCEs',
    ]),
    ...mapGetters('MSDAT_STORE', ['getSelectedConfig', 'getConfigObject']),

    filterModifiedControls() {
      const section = this.modifiedControls.filter(
        (item) => item?.title === this.$store.state.MSDAT_STORE.selectedSection
      );

      if (section.length > 0) {
        this.changeControl(section[0].index, section[0].title);
      }
    },

    switchToSection(title) {
      if (!title || this.modifiedControls.length === 0) return;

      const normalizedTitle = title.trim().toLowerCase();
      const targetSection = this.modifiedControls.find(
        (item) => item?.title?.trim().toLowerCase() === normalizedTitle
      );

      if (!targetSection) return;

      if (targetSection.index === this.selectedIndex) {
        return;
      }

      this.changeControl(targetSection.index, targetSection.title);
    },

    async changeControl(index, title) {
      // Set section title if provided
      if (title) {
        this.$store.commit('MSDAT_STORE/SET_SECTION', title);
      }
      const path = `/dashboard/Advanced_Analytics?index=${index}`;
      const fullUrl = `${window.location.origin}${path}`;
      localStorage.setItem('advanced_url', fullUrl);

      this.selectedIndex = index;
      this.checkIndex = index;
      this.selectControl(index);
      this.SET_SECTION_INDEX(index);

      const selectedConfig = this.getSelectedConfig();

      if (index !== 4) {
        if (selectedConfig.indicator !== null) {
          this.$store.commit('MSDAT_STORE/SET_PAYLOAD', {
            controlIndex: index,
            key: 'indicator',
            value: selectedConfig.indicator,
          });
        }
        // this.$store.commit('MSDAT_STORE/SET_PAYLOAD', {
        //   controlIndex: index,
        //   key: 'datasource',
        //   value: selectedConfig.dataSource,
        // });
        // this.$store.commit('MSDAT_STORE/SET_PAYLOAD', {
        //   controlIndex: index,
        //   key: 'period',
        //   value: '2020',
        // });
      } else {
        this.$store.commit('MSDAT_STORE/SET_MULTI_PAYLOAD', {
          controlIndex: index,
          key: 'indicator',
          value: selectedConfig.indicator,
        });
        this.$store.commit('MSDAT_STORE/SET_MULTI_DATASOURCE_PAYLOAD', {
          controlIndex: index,
          key: 'datasource',
          value: selectedConfig.dataSource,
        });
        this.$store.commit('MSDAT_STORE/SET_MULTI_YEAR_PAYLOAD', {
          controlIndex: index,
          key: 'period',
          value: selectedConfig.period,
        });
      }

      if (
        index === 2 &&
        this.getConfigObject().name !== 'GIS_Mapping_Dashboard' &&
        title === 'Indicator Comparison'
      ) {
        const dashboardID = localStorage.getItem('activeDashboardID');

        await this.setIDCIndicatorDropdown(selectedConfig.dataSource.id);

        const response = await apiServices.getDashboardIndicator(dashboardID);

        const indicators = response.data;
        const formattedData = groupIndicator(indicators, 'program_area');

        this.$store.commit('MSDAT_STORE/SET_IDC_INDICATOR_OPTIONS', {
          value: formattedData,
        });

        this.$store.commit('MSDAT_STORE/SET_PAYLOAD', {
          controlIndex: index,
          key: 'indicator',
          value: selectedConfig.indicator,
        });
        this.$store.commit('MSDAT_STORE/SET_PAYLOAD', {
          controlIndex: index,
          key: 'datasource',
          value: selectedConfig.dataSource,
        });
      }

      this.$emit('showSection', index);
    },

    toggleShareModal(title) {
      this.SET_SECTION(title);
      this.toggleShowShareSection();
    },

    selectControl(controlIndex) {
      this.selectedIndex = controlIndex;
      // loop over all the tabs
      this.controls.forEach((control, index) => {
        // eslint-disable-next-line no-param-reassign
        control.active = index === controlIndex + 1;
      });
    },

    async setAllICSDatasources() {
      const datasourcesIDs = this.getConfigObject().dataSources;

      const requests = datasourcesIDs.map((id) => apiServices.getSingleDataSourceObj(id));

      const responses = await Promise.all(requests);

      // Extract `data` from each response
      const results = responses.map((res) => res.data);
      this.UPDATE_IDC_DATASOURCEs(results);

      // return results;
    },
    // selectControll(controlIndex) {
    //   this.selectedIndex = controlIndex;
    //   // loop over all the tabs

    //   this.abc.forEach((control) => {
    //     // eslint-disable-next-line no-param-reassign
    //     control.active = control.id === controlIndex;
    //   });
    // },
  },

  watch: {
    controls(value) {
      for (let i = 0; i < value.length; i++) {
        if (value[i].title) {
          if (!this.modifiedControls.includes(value[i])) {
            const data = value[i];
            data.index = i - 1;
            this.modifiedControls.push(data);
          }
        }
      }
    },
    position(newValue) {
      this.selectedIndex = newValue;
      this.selectControl(this.selectedIndex);
    },

    // if the index is changed
    changeIndex(newValue) {
      this.selectedIndex = newValue;
      this.changeControl(newValue);
    },

    selectedIndex(newValue) {
      this.changeControl(newValue);

      const { name } = this.$route.params;
      if (name === 'Advanced_Analytics') {
        if (newValue === 0) {
          this.title = 'Correlation Analysis';
          this.$store.dispatch('setSectionTitle', 'Correlation Analysis');
        }
        if (newValue === 1) {
          this.title = 'Descriptive Analysis';
          this.$store.dispatch('setSectionTitle', 'Descriptive Analysis');
        }
        if (newValue === 2) {
          this.title = 'Indicator Comparison';
          this.$store.dispatch('setSectionTitle', 'Indicator Comparison');
        }
        if (newValue === 3) {
          this.title = 'Predictive Analysis';
          this.$store.dispatch('setSectionTitle', 'Predictive Analysis');
        }
        if (newValue === 4) {
          this.title = 'Multisource Inidcator Comparison';
          this.$store.dispatch('setSectionTitle', 'Multisource Inidcator Comparison');
        }
      }
      if (name !== 'Advanced_Analytics') {
        if (newValue === 0) {
          this.title = 'Indicator Overview';
        }
        if (newValue === 1) {
          this.title = 'Zonal Analysis';
        }
        if (newValue === 2) {
          this.title = 'Indicator Comparison';
        }
        if (newValue === 3) {
          this.title = 'Dataset Comparison';
        }
        if (newValue === 4) {
          this.title = 'Multi-Source Overview';
        }
        if (newValue === 5) {
          this.title = 'Disaggregation';
        }
      }
    },
    '$store.state.MSDAT_STORE.selectedSection'(newValue) {
      this.switchToSection(newValue);
    },
  },
  computed: {
    // abc() {
    //   return this.$store.getters.arrangedSections.filter((element) => element.isShow === true);
    // },
    customDashboard() {
      return this.$store.state.CUSTOM_DASHBOARD_STORE.customDashboard;
    },
  },
  mounted() {
    const index = parseInt(this.$route.query.index, 10) || 0;
    this.selectControl(index);
    this.$nextTick(() => {
      if (this.modifiedControls.length > 0) {
        this.filterModifiedControls();
      }
    });
    // this.setAllICSDatasources();
  },
  created() {
    this.controls = this.$children;
  },
};
</script>

<style lang="scss" scoped>
// $primary: #2b5d5b;
@import '@/scss/abstracts/_variables.scss';

.main {
  display: inherit;
}

.share-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #2b5d5b;
  margin-left: 15px;
  padding: 4px;
  border-radius: 3px;
  flex-shrink: 0;
}

.share-icon {
  cursor: pointer;
}

.share-tooltip ::v-deep .tooltip-inner {
  background-color: #ffffff;
  color: #1f2d2d;
  padding: 4px 10px;
  border: 1px solid #d9e3e3;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.12);
  font-size: 0.8rem;
  font-weight: 600;
}

.share-tooltip ::v-deep .arrow::before {
  border-top-color: #ffffff;
}

.share-icon-wrapper img {
  width: 16px;
  height: 14px;
}
.el-tit {
  font-size: 0.9rem;
  white-space: nowrap;
}

.border-b {
  border-bottom: 0.5px solid #759b99;
}
.bg-tab-color {
  color: #515151;
}

.tab-link.active {
  // border-bottom: 2.5px solid $primary;
  // border: 1px solid #2B5D5B;
  // background-color: #2B5D5B;
  border: 1px solid $primary;
  background-color: $primary;
  color: white !important;
  // padding: 20px;
}

.tab-link.active .share-icon-wrapper {
  background-color: white;
  color: white !important;
}

.tab-link {
  // border-bottom: 2.5px solid $primary;
  // border: 1.0px solid #007d53;
  border: 1px solid $primary;
  background-color: white;
  color: black !important;
  padding: 1rem 1rem;
  height: 1rem;
  max-width: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px;
  font-weight: 200;
  font-size: 0.9rem !important;
  &:first-child {
    margin-left: 0;
  }
}

.cursor-pointer {
  cursor: pointer;
}

.control-title {
  display: none;
}

@media (max-width: 876px) {
  .main {
    display: none;
  }

  .section-tab {
    display: none;
  }

  .control-title {
    display: inherit;
    font: var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-bold) 16px/19px
      var(--unnamed-font-family-work-sans);
    letter-spacing: var(--unnamed-character-spacing-0);
    text-align: left;
    font: normal normal bold 16px/19px Work Sans;
    letter-spacing: 0px;
    // color: #2b5d5b;
    color: $primary;
    opacity: 1;
    text-decoration: underline;
    margin: 5px;
    padding: 5px;
  }
}
</style>
