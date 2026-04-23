<!-- Auther: Ghufran Ahmed -->
<template>
  <b-container class="text-justify px-5" fluid>
    <div class="top-cont">
      <p style="font-size: 28px; font-weight: 700; color: #035c6e; font-family: Work Sans">
        <b>Select your preferences</b>
      </p>
      <p style="font-size: 16px; font-family: Work Sans; margin-top: -17px">
        Select the Program Areas, Data Sources, Period and Coverage Levels you are interested in.
      </p>
    </div>
    <div class="d-flex align-items-center justify-content-between">
      <!-- <p @click="viewAllData" id="link-to-about" style="font-size: 13px; font-family: Work Sans; cursor: pointer">
        <b>View datasheet</b>- see all available data in database
      </p> -->
    </div>
    <b-card>
      <b-row>
        <!-- **** Preferences Selection *****  -->

        <b-col sm="12" lg="4">
          <div class="d-flex row justify-content-between preferences">
            <p
              style="
                font-size: 18px;
                font-weight: 700;
                color: #035c6e;
                font-family: Work Sans;
                margin-top: 10px;
                align-items: center;
                margin: 0;
              "
            >
              Selection
            </p>
            <!-- advanved search btn -->
            <b-button
              @click="showModal = true"
              style="
                font-size: 12.000004px;
                font-family: Work Sans;
                border-color: #3f8994;
                color: #3f8994;
                background-color: #ffffff;
              "
              >Advanced Search</b-button
            >

            <!-- Advanced Search Modal -->
            <AdvancedSearchModal
              v-if="showModal"
              @close="showModal = false"
              @apply="updateSelections"
            />
          </div>

          <indicators-selection
            :selected-indicators.sync="selectedIndicators"
            :selected-program-area.sync="selectedProgramArea"
          />
          <br />
          <data-source />
          <br />
          <div v-if="showList">
            <years-selection />
            <br />
            <level-selection />
          </div>
          <br />
          <div v-if="showNotes">
            <notes />
          </div>
        </b-col>

        <!-- ****** Selected Items Table ****** -->

        <b-col sm="12" lg="8">
          <div style="display: flex; justify-content: space-between; padding: 0px 15px">
            <p style="font-size: 20px; font-weight: 700; color: #035c6e; font-family: Work Sans">
              Selected Preferences
            </p>
            <span class="approve"
              ><b-button
                @click="approveData"
                style="
                  font-size: 12.000004px;
                  font-family: Work Sans;
                  background-color: #035c6e;
                  color: #ffffff;
                "
                >approve Data</b-button
              ></span
            >
          </div>
          <!-- <data-table class="data-table" /> -->
          <SelectedInfoTable :selected-levels="selectedLevel" />

          <b-row align-h="end" class="text-right">
            <b-col cols="auto" style="font-size: 13px; font-family: Work Sans"
              >Indicators: <b>{{ indicatorsCount }} Selected</b></b-col
            >
            <b-col cols="auto" style="font-size: 13px; font-family: Work Sans"
              >Data Sources: <b>{{ dataSourceCount }} Selected</b></b-col
            >
            <b-col cols="auto" style="font-size: 13px; font-family: Work Sans"
              >Period: <b>{{ yearsCount }} Years</b></b-col
            >
            <b-col cols="auto" style="font-size: 13px; font-family: Work Sans"
              >Levels: <b v-for="level in selectedLevel" :key="level">{{ level }},</b></b-col
            >
          </b-row>
          <div class="d-flex align-self-end justify-content-end w-100">
            <b-row
              align-h="end"
              class="mt-5 mr-5 text-right"
              v-if="indicatorsCount && dataSourceCount && yearsCount && selectedLevel.length > 0"
            >
              <b-col class="align-baseline" cols="auto" style=""
                ><p class="baseline mt-5" style="font-size: 12.000004px; font-family: Work Sans">
                  <!-- Save for Later -->
                </p>
              </b-col>
            </b-row>
            <!-- <b-row align-h="end" class="mt-5 text-right">
              <b-col cols="auto" class="approve"
                ><b-button
                  @click="approveData"
                  style="font-size: 12.000004px; font-family: Work Sans"
                  >approve Data</b-button
                ></b-col
              >
            </b-row> -->
          </div>
        </b-col>
      </b-row>
    </b-card>
  </b-container>
</template>

<script>
import AdvancedSearchModal from '../components/AdvancedSearch.vue';
import IndicatorsSelection from '../components/preferences/selection/IndicatorsSelection.vue';
import DataSource from '../components/preferences/selection/DataSourceSelection.vue';
import YearsSelection from '../components/preferences/selection/YearsSelection.vue';
import LevelSelection from '../components/preferences/selection/LevelSelection.vue';
import Notes from '../components/preferences/notes/Notes.vue';
import SelectedInfoTable from './SelectedInfo.vue';

export default {
  name: 'data-preferences',
  components: {
    AdvancedSearchModal,
    IndicatorsSelection,
    DataSource,
    YearsSelection,
    LevelSelection,
    Notes,
    SelectedInfoTable,
  },
  mounted() {
    this.$store.commit('updateStep', 2);
  },
  data() {
    return {
      showNotes: false,
      showList: false,
      destroyPage: false,
      showAll: false,
      showSearchComponent: false,
      showModal: false,
      selectedProgramArea: null,
      selectedIndicators: [],
    };
  },
  beforeDestroy() {
    if (this.destroyPage === false && !this.$store.getters.editMode) {
      // eslint-disable-next-line no-restricted-globals
      // location.reload(true);
      this.$store.dispatch('resetState');
    } else {
      console.log('nothing');
    }
  },
  computed: {
    // Show the loader when all data is selected
    showLoader() {
      return this.$store.getters.showloader;
    },
    // Count Number of Indicators Selected
    indicatorsCount() {
      let count = 0;
      this.$store.getters.getprogramArea.map((element) => {
        if (element.parent.isChildSelected === true) {
          element.children.map((child) => {
            if (child.selected === true) {
              count++;
            }
            return child;
          });
          this.showList = element.showList;
        }
        return element;
      });
      return count;
    },
    // Count Number of Datasource Selected
    dataSourceCount() {
      let count = 0;
      this.$store.getters.getDataSource.map((element) => {
        element.children.map((child) => {
          if (child.selected === true) {
            count++;
          }
          return child;
        });
        return element;
      });
      return count;
    },
    // Count Number of Years Selected
    yearsCount() {
      let count = 0;
      const yearsArray = [];

      // eslint-disable-next-line no-unused-vars
      const newMap = this.$store.getters.getprogramArea.map((element) => {
        element.children.map((child) => {
          if (child.years) {
            child.years.map((year) => {
              if (year.value !== undefined) {
                yearsArray[`year${year.value}`] = { ...year };
              }
              return year;
            });
          }
          return child;
        });
        this.showNotes = element.showNotes;
        return element;
      });
      const DArray = [];
      // eslint-disable-next-line no-restricted-syntax
      // eslint-disable-next-line guard-for-in
      Object.keys(yearsArray).forEach((key) => {
        DArray.push(yearsArray[key]);
      });
      DArray.sort((a, b) => b.value - a.value);
      DArray.map((dyear) => {
        if (dyear.selected === true) {
          count++;
        }
        return dyear;
      });

      return count;
    },
    // Count Number of Levels Selected
    selectedLevel() {
      let selectedLevels = [];
      this.$store.getters.getprogramArea.map((element) => {
        if (element.parent.isChildSelected === true) {
          element.children.map((child) => {
            if (child.selected === true) {
              child.levels.map((level) => {
                if (level.selected === true) {
                  selectedLevels.push(level.value);
                } else {
                  // eslint-disable-next-line no-unused-expressions
                  return selectedLevels;
                }
                return level;
              });
            }
            return child;
          });
        }
        return element;
      });
      selectedLevels = [...new Set(selectedLevels)];
      this.$store.commit('setLevels', selectedLevels);
      return selectedLevels;
    },
  },
  methods: {
    // handleApply(selectedData) {
    //   // Process the selected data
    //   console.log("Selected Indicators:", selectedData);
    //   this.showModal = false; // Close the modal
    // },

    updateSelections({ programArea, indicators }) {
      this.selectedProgramArea = programArea;
      this.selectedIndicators = indicators;
      this.showModal = false;
      // console log the selected indicators
      console.log('Selected Indicators:', indicators);
    },

    // Toggle the Search Component
    toggleSearchComponent() {
      this.showSearchComponent = !this.showSearchComponent;
    },
    async viewAllData() {
      this.showAll = !this.showAll;
      this.$store.dispatch('allSelection', { allselected: this.showAll });
      this.$store.dispatch('clearAllData', []);
      await this.$store.dispatch('loadIndicators');
      await this.$store.dispatch('loadDataSource');
    },
    // The below function is called when approve button is clicked at Table maker page.
    approveData() {
      if (
        this.indicatorsCount
        && this.dataSourceCount
        && this.yearsCount
        && this.selectedLevel.length > 0
      ) {
        if (this.$store.getters.dashboardMode === 'map') {
          this.$router.push('publish-map');
        } else {
          this.$router.push('data-table');
        }
        this.destroyPage = true;
      } else {
        this.$swal('You have to select atleast one item from every box');
        // console.log('You have to select atleast one item from every box');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.program-areas {
  background-color: #f3f3f3;
  border-color: #f3f3f3;
  max-height: 27.00000675px;
  color: #202020;
  font-family: 'Work Sans', sans-serif;
  font-weight: normal;
  font-size: 12.000003px;
}

.preferences {
  padding: 0 10px;
}
.indicators {
  max-height: 27.00000675px;
  color: #202020;
  font-family: 'Work Sans', sans-serif;
  font-weight: normal;
  font-size: 12.000003px;
}
input {
  margin: 0px 7.342501836px 0px 0px;
}
.baseline {
  margin-top: auto !important;
}
.top-cont {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}
div.scroll {
  // max-height: 110px;
  overflow-x: hidden;
  overflow-y: auto;
  margin-bottom: 27.750006938px;
}
.selection-header {
  color: #202020;
  font-size: 13.5px;
}
.table-responsive {
  font-family: 'Work Sans', sans-serif;
  font-weight: normal;
}
.b-table-top-row {
  background-color: #cee4e9;
  color: #000000;
  font-weight: bold;
  font-size: 12px;
  height: 33.750000008px;
  pointer-events: none;
}
thead {
  font-weight: normal !important;
  font-size: 10.500000003px;
  color: #202020;
  height: 73px;
}
.table td {
  padding-right: 40px !important;
  padding-left: 25.384615385px;
  font-size: 10.769230769px;
}

.other-tables {
  thead {
    display: none;
  }
}
.btn {
  background-color: #3f8994;
  color: #ffffff;
  max-width: 253.500000063px;
  text-transform: uppercase;
  border-color: #3f8994;
  font-size: 15.00000375px;
}
#link-to-about {
  color: #1496b1;
}
@media (max-width: 680px) {
  .data-table {
    display: none;
  }
}
</style>
