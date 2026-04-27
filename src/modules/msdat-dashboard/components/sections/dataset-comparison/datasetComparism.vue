/* eslint-disable no-await-in-loop */
<template>
  <base-overlay :show="loading">
    <base-sub-card
      showControls
      v-if="Object.keys(values).length"
      @dropdownTypeSelected="
        downLoadType($event, {
          indicator: values.indicator.short_name,
          datasource: '',
          year: '',
        })
      "
    >
      <template #title>
        <div class="w-100 d-flex flex-column">
          <p class="work-sans mb-0 line-height">
            Comparison of
            <span class="font-weight-bold">{{ values.indicator.full_name }}</span>
            <span class="font-weight-bold"> {{ values.datasource.full_name }} </span>across
            <span class="font-weight-bold">different sources </span>by
            <span class="font-weight-bold">states</span>
          </p>
        </div>
      </template>
      <transition name="fade">
      <div class="datasetComparison" v-show="showNationalComparison">
        <div class="noComparison" v-if="comparisonUnavailable">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 8.4502V12.4502M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 15.4502V15.5502L11.9502 15.5498V15.4502H12.0498Z"
                stroke="#E85D58"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <div>
            <p>Interpretation is only available when comparing two datasets</p>
          </div>
        </div>
        <div class="comparison" v-else>
          <div>
            <p v-if="this.value === 'N/A'">
              The value of <strong>{{ indicatorOne }}</strong> cannot be compared with <strong>{{ indicatorTwo }}</strong>
              due to zero values
            </p>
            <p v-else>
              The value of <strong>{{ indicatorOne }}</strong> is
              <span v-if="this.value > 1">
                {{ (this.value).toFixed(2) }} times {{ this.positiveDifference === true ? 'HIGHER' : 'LOWER' }} than
              </span>
              <span v-else>
                {{ (1/this.value).toFixed(2) }} times {{ this.positiveDifference === true ? 'HIGHER' : 'LOWER' }} than
              </span>
              <strong>{{ indicatorTwo }}</strong>
            </p>
          </div>
          <div style="display: flex; flex-direction:row; gap: 5px; align-items:center; padding-left:-10%; font-size: 14px;">
            <!-- <h6 v-if="this.value === 'N/A'">N/A</h6>
            <h6 v-else-if="this.value > 1">{{ (this.value).toFixed(2) }} times</h6>
            <h6 v-else>{{ (1/this.value).toFixed(2) }} times</h6>
            <p> -->
              <span>in {{ this.comparisonLocation }}</span>
          </div>
        </div>
      </div>
      </transition>
      <BaseChart
        ref="BaseChart"
        :title="title"
        :categoryLabel="'Datasources'"
        :chartOptions="chartConfig"
      />
    </base-sub-card>
  </base-overlay>
</template>

<script>
import Highcharts from 'highcharts';
import { mapMutations } from 'vuex';
import { uniq } from 'lodash';
import ControlPanelSetup from '@/modules/msdat-dashboard/mixins/control-panel-setup';
import { isDataYearly } from '@/util/helper';
import BaseChart from '../../../../../components/Barchart/BaseBarChart.vue';
import defaultOptions from '../../../../../components/Barchart/defaultOption';
import dataPipelineMixin from '../../../mixins/dataPipeline';
import chartDownload from '../../../mixins/chart_download';

export default {
  mixins: [chartDownload, dataPipelineMixin, ControlPanelSetup],
  components: {
    BaseChart,
  },
  data() {
    return {
      title: '',
      showNationalComparison: false,
      comparisonUnavailable: true,
      chartConfig: {},
      indicatorOne: null,
      comparisonLocation: null,
      indicatorTwo: null,
      value: null,
      positiveDifference: false,
      // DataSetConfig: cloneDeep(DataSetConfig),
      loading: true,
    };
  },
  methods: {
    ...mapMutations('MSDAT_STORE', [
      'SETUP_CONTROL_OPTIONS1', // -> this.foo()
    ]),
    sortLocationsWithNigeriaFirst(locations) {
      return locations.sort((a, b) => {
        // Nigeria should always come first
        if (a.name === 'Nigeria') return -1;
        if (b.name === 'Nigeria') return 1;
        // All other locations sorted alphabetically
        return a.name.localeCompare(b.name);
      });
    },
    getOlderYear(year1, year2) {
      // eslint-disable-next-line radix
      const extractYear = (str) => parseInt(str.match(/\d{4}/)?.[0] || 0);
      const yearValue1 = extractYear(year1);
      const yearValue2 = extractYear(year2);

      if (yearValue1 < yearValue2) {
        return year1;
      }
      if (yearValue1 > yearValue2) {
        return year2;
      }
      return 'equal';
    },
    configureDifferenceForAllLocations() {
      const series = this.chartConfig.series;
      if (series.length === 2) {
        this.comparisonUnavailable = false;
        const obj1Data = series[0].data;
        const obj2Data = series[1].data;
        if (obj1Data.length && obj2Data.length) {
          this.indicatorOne = series[0].name;
          this.indicatorTwo = series[1].name;

          // Create a master list of all unique locations from both datasets
          const allLocationNames = [...new Set([
            ...obj1Data.map((item) => item.name),
            ...obj2Data.map((item) => item.name),
          ])];

          // Sort the master list with Nigeria first
          const sortedLocationNames = allLocationNames.sort((a, b) => {
            if (a === 'Nigeria') return -1;
            if (b === 'Nigeria') return 1;
            return a.localeCompare(b);
          });

          // Create updated arrays in the correct order
          const updatedObj1 = sortedLocationNames.map((locationName) => {
            const item1 = obj1Data.find((item) => item.name === locationName);
            const item2 = obj2Data.find((item) => item.name === locationName);

            if (item1 && item2) {
              const diffData = this.computeDiffValues(item1, item2);
              return {
                ...item1,
                extraData: diffData.value,
                isPositive: diffData.isPositive,
              };
            }
            return item1 || {
              name: locationName,
              y: 0,
              extraData: '',
              isPositive: false,
            };
          }).filter((item) => item.y !== undefined); // Remove items that don't exist in obj1

          const updatedObj2 = sortedLocationNames.map((locationName) => {
            const item1 = obj1Data.find((item) => item.name === locationName);
            const item2 = obj2Data.find((item) => item.name === locationName);

            if (item1 && item2) {
              const diffData = this.computeDiffValues(item1, item2);
              return {
                ...item2,
                extraData: diffData.value,
                isPositive: diffData.isPositive,
              };
            }
            return item2 || {
              name: locationName,
              y: 0,
              extraData: '',
              isPositive: false,
            };
          }).filter((item) => item.y !== undefined); // Remove items that don't exist in obj2

          this.chartConfig.series[0].data = updatedObj1;
          this.chartConfig.series[1].data = updatedObj2;
          this.chartConfig.tooltip.pointFormatter = function pointFormatter() {
            let multiplierText = '';
            if (this.extraData === 'N/A') {
              multiplierText = 'N/A';
            } else if (this.extraData > 1) {
              multiplierText = `${this.extraData.toFixed(2)} times`;
            } else {
              multiplierText = `${(1 / this.extraData).toFixed(2)} times`;
            }
            return `${this.name}: <b>${Highcharts.numberFormat(this.y, 1)}</b><br>Multiplier: ${multiplierText}`;
          };
        }
      } else {
        this.comparisonUnavailable = true;
      }
      return null;
    },
    handleMouseOut(data) {
      if (data.comparisonData) {
        this.comparisonLocation = 'Nigeria';
        this.value = data.comparisonData;
      }
    },
    handlePointMouseOver(data) {
      if (data.comparisonData) {
        this.showNationalComparison = true;
        if (data.location === 'Nigeria') {
          this.comparisonLocation = data.location;
        } else {
          this.comparisonLocation = `${data.location} state`;
        }
        this.value = data.comparisonData;
        this.positiveDifference = data.isPositive;
      } else {
        this.showNationalComparison = false;
      }
    },
    computeDiffValues(indicatorOne, indicatorTwo) {
      let final = 0;
      let initial = 0;
      const denominator = indicatorTwo.y;
      initial = indicatorTwo.y;
      final = indicatorOne.y;

      // Handle zero values
      if (initial === 0 || final === 0) {
        return { value: 'N/A', isPositive: false };
      }

      const isPositive = final >= initial;

      // Calculate multiplier instead of percentage
      const multiplier = final / denominator;

      return { value: multiplier, isPositive };
    },
    customRound(number) {
      if (number < 1 && number % 1 !== 0) {
        return parseFloat(number.toFixed(1));
      }
      return Math.round(number);
    },
    formatYear(option) {
      const year = parseInt(option, 10);
      const currentYear = new Date().getFullYear();
      return year > currentYear ? `${option} (P)` : option;
    },
    async setUpDataSourceNYearDropdown() {
      const multiSelectGroup = [];
      const dataSources = this.dlGetDashboardDataSource();
      console.log(dataSources, '@ERASMUS 3X');
      for (let index = 0; index < dataSources.length; index += 1) {
        const dataSourceObject = dataSources[index];
        // eslint-disable-next-line no-await-in-loop
        const data = await this.dlQuery({
          indicator: this.values.indicator.id,
          datasource: dataSourceObject.id,
        });

        console.log(data, dataSourceObject, 'availableDS@ 3');
        if (data.length > 0) {
          const onlyYearlyData = data.filter((item) => {
            if (isDataYearly(item.period)) {
              return item;
            }
            return false;
          });
          const dates = onlyYearlyData.map((item) => item.period);
          const sortedDates = uniq(dates).sort((a, b) => b - a);

          const mapToDropdown = sortedDates.map((item) => ({
            id: `${dataSourceObject.id}-${item}`,
            item: `${dataSourceObject.datasource} ${this.formatYear(item)}`,
          }));

          multiSelectGroup.push({
            datasource: dataSourceObject.datasource,
            options: mapToDropdown,
          });
        }
      }

      console.log(multiSelectGroup, 'multiSelectGroup@ 3');
      return multiSelectGroup;
    },
  },
  props: {
    values: {
      type: Object,
      default() {
        return {};
      },
    },
    controlIndex: {
      type: Number,
      required: true,
    },
  },
  computed: {
    payload() {
      return this.$store.state.MSDAT_STORE.controlConfig[this.controlIndex].payload;
    },
  },
  async mounted() {
    this.$on('pointMouseOver', this.handlePointMouseOver);
    this.$on('mouseOut', this.handleMouseOut);
    this.title = ` Comparison of ${this.values.indicator.full_name} ${this.values.datasource.full_name}} across different sources by states`;
    this.loading = true;
    const dropDown = await this.setUpDataSourceNYearDropdown();
    this.SETUP_CONTROL_OPTIONS1({
      panelIndex: this.controlIndex,
      key: 'datasource',
      values: dropDown,
    });
    this.loading = false;
  },

  watch: {
    values: {
      async handler(controlValues) {
        this.loading = true;
        let dataSourcesNYear = [];
        if (!Array.isArray(controlValues.datasource)) {
          dataSourcesNYear = [controlValues.datasource];
        } else {
          dataSourcesNYear = controlValues.datasource;
        }
        const queryObject = dataSourcesNYear.map((element) => {
          const spiltDataSourcesNYear = element.id.split('-');
          const datasourceObject = this.dlGetDataSource(
            Number.parseInt(spiltDataSourcesNYear[0], 10),
          );
          return {
            indicator: controlValues.indicator.id,
            datasource: datasourceObject.id,
            period: spiltDataSourcesNYear[1],
            location: {
              level: 3,
            },
          };
        });
        const promises = queryObject.map((item) => this.dlQuery(item));
        const result = await Promise.all(promises);
        const orderResult = [];
        for (let index = 0; index < queryObject.length; index += 1) {
          const response = result[index];
          const stateDataValues = response.map((element) => ({
            name: this.dlGetLocation(element.location).name,
            y: parseFloat(element.value),
            extraData: '',
            isPositive: false,
          }));

          // This adds national to the top;
          // eslint-disable-next-line no-await-in-loop
          const query = await this.dlQuery({
            indicator: controlValues.indicator.id,
            // eslint-disable-next-line radix
            datasource: parseInt(dataSourcesNYear[index].id.split('-')[0]),
            period: dataSourcesNYear[index].id.split('-')[1],
            location: 1,
          });

          const nationValueSeries = {
            name: this.dlGetLocation(query[0]?.location)?.name,
            y: parseFloat(query[0]?.value),
            extraData: '',
            isPositive: false,
          };

          // Combine national and state data, then sort with Nigeria first
          const allDataValues = [nationValueSeries, ...stateDataValues];
          const dataValues = this.sortLocationsWithNigeriaFirst(allDataValues);

          orderResult.push({
            name: dataSourcesNYear[index].item,
            data: dataValues,
          });
        }

        this.chartConfig = {
          plotOptions: {
            column: {
              dataLabels: {
                enabled: true,
                padding: 10,
                style: {
                  fontSize: '12px',
                  fontFamily: '"Work Sans", sans-serif',
                  backgroundColor: 'none',
                },
                formatter() {
                  return Highcharts.numberFormat(this.y, 1, '.', ',');
                },
              },
              groupPadding: 0.08,
              pointPadding: 0.16,
            },
          },
          chart: {
            type: 'column',
          },
          yAxis: {
            title: {
              text: 'Values',
              style: {
                fontSize: '11px',
                fontFamily: '"Work Sans", sans-serif',
              },
            },
          },
          lang: defaultOptions.lang,
          navigation: defaultOptions.navigation,
          exporting: {
            ...defaultOptions.exporting,
            filename: `indicator-${this.values.indicator.full_name}`,
          },
          colors: ['#17606B', '#E85D58', '#58B74E'],
        };
        const displayFactor = this.dlGetFactor(this.values.indicator?.factor).display_factor;
        this.chartConfig.yAxis.title.text = displayFactor;
        this.chartConfig.tooltip = {};
        this.chartConfig.plotOptions.series = {};
        this.chartConfig.plotOptions.series.point = {};
        this.chartConfig.plotOptions.series.point.events = {};
        this.chartConfig.series = orderResult;
        if (this.chartConfig.series.length === 2) {
          this.comparisonUnavailable = false;
          // Only add the event listeners if the series length is 2
          this.configureDifferenceForAllLocations();
          this.chartConfig.plotOptions.series.point.events.mouseOver = (event) => {
            this.$emit('pointMouseOver', {
              seriesName: event.target.series.name,
              isPositive: event.target.isPositive,
              comparisonData: event.target.extraData,
              location: event.target.name,
              value: event.target.y,
            });
          };

          this.chartConfig.plotOptions.series.point.events.mouseOut = (event) => {
            this.$emit('pointMouseOut', {
              seriesName: event.target.series.name,
              comparisonData: event.target.extraData,
              isPositive: event.target.isPositive,
              location: event.target.name,
              value: event.target.y,
            });
          };
        } else if (this.chartConfig.series.length > 2) {
          this.comparisonUnavailable = true;
        } else {
          this.showNationalComparison = false;
        }
        this.loading = false;
      },
      deep: true,
    },
    'payload.indicator': {
      async handler() {
        this.loading = true;
        const dropDown = await this.setUpDataSourceNYearDropdown();
        this.SETUP_CONTROL_OPTIONS1({
          panelIndex: this.controlIndex,
          key: 'datasource',
          values: dropDown,
        });
        this.loading = false;
      },
    },
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
.datasetComparison {
  height: 100px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.comparison {
  border-radius: 10px;
  border: 1px solid #c1c1c1;
  width: 45%;
  height: 63px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 7px;
}
.comparison span{
  margin-top: -5px;
}
.noComparison {
  border-radius: 10px;
  border: 1px solid #e85d58;
  width: 35%;
  height: 53px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
.comparison p {
  color: #000;
  font-size: 13px;
  font-weight: 400;
  padding-top: 10px;
  font-family: 'Inter', sans-serif;
}

.noComparison p {
  color: #e85d58;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  padding-top: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.comparison h6 {
  font-family: 'Inter', sans-serif;
  color: #000;
  font-size: 24px;
  font-style: normal;
  font-weight: 500;
}

@media only screen and (max-width: 768px) {
  .comparison, .noComparison {
    width: auto;
  }
}
</style>
