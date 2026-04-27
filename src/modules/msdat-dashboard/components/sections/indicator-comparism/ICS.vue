<template>
  <div class="ics_wrapper">
    <base-overlay :show="loading">
      <base-sub-card
        buttonToggle
        showControls
        :sideControl="false"
        :ConfidenceOptions="false"
        :showToggle="false"
        v-if="Object.keys(values).length"
        @dropdownTypeSelected="
          downLoadType($event, {
            indicator: values.indicator.short_name,
            datasource: values.datasource.datasource,
            year: '',
          })
        "
      >
        <!-- <template #title>
          <p
            class="work-sans mb-0 line-height"
            v-if="!Array.isArray(values.indicator.length)"
          >
           Comparison of <b>{{ values.indicator.short_name }}</b> according to
            the <b> {{ values.datasource.datasource }} </b> across
            {{ values.compareBy.name }}
          </p>
          <p class="text-dark work-sans mb-0 line-height" v-else>
           Comparison of <b>{{ values.indicator[0].short_name }}</b> and
            <b>{{ values.indicator[1].short_name }}</b>
            according to the
            <b> {{ values.datasource.datasource }} </b> across
            {{ values.compareBy.name }}s
          </p>
        </template> -->

        <template #title>
          <div class="w-100 d-flex flex-column">
            <div class="d-flex align-items-center justify-content-between">
              <p class="work-sans mb-0 line-height">
                Comparison of <b>selected indicators</b> according to the
                <b> {{ values.datasource.datasource }} </b> across {{ values.compareBy.name }} in
                <b> {{ values.location.name }} </b>
              </p>
              <button
                v-if="showRelationshipFeature"
                class="relationship-btn"
                @click="showRelationshipPopup = true"
                title="Show indicator relationships"
                type="button"
                aria-haspopup="dialog"
              >
                Show indicator relationships
              </button>
            </div>
          </div>
        </template>
        <BarChart
          ref="BaseChart"
          :title="title"
          :categoryLabel="'Indicators'"
          :chartOptions="chartOptions"
        />
      </base-sub-card>
    </base-overlay>
    <!-- Display 'no_data' block when there's no data and we're not loading -->
    <!-- <div v-if="!loading && !checkData() && validateRequiredValues(values)" class="no_data">
      <img
        :src="require('@/assets/no-data/No_Available_Data.svg')"
        alt="no data"
        class="img-fluid"
        height="auto"
        width="240px"
      />
    </div>
    -->
    <div v-if="!loading && filteredIndicators.length > 0" class="no_ind_data">
      <!--list to present indicators without available data -->
      <span>Data not available for one or more selected filters</span>
    </div>
    <!-- Initial state message -->
    <div v-if="!loading && !validateRequiredValues(values)" class="no_data">
      <p class="text-muted">Please select all required values to view the comparison</p>
    </div>
    <!-- Indicator Relationship Popup -->
    <IndicatorRelationshipPopup
      v-if="showRelationshipFeature"
      :show="showRelationshipPopup"
      :indicators="getIndicatorsWithRelations"
      @close="showRelationshipPopup = false"
    />
  </div>
</template>

<script>
import { mapMutations, mapActions, mapGetters } from 'vuex';
import moment from 'moment';
import ControlPanelSetup from '@/modules/msdat-dashboard/mixins/control-panel-setup';
import BarChart from '@/components/Barchart/BaseBarChart.vue';
import defaultOptions from '@/components/Barchart/defaultOption';
import apiServices from '@/modules/data-layer/services/ApiServices';
import { groupIndicator } from '@/util/helper';
import IndicatorRelationshipPopup from '../advanced/indicator-comparison-section/IndicatorRelationshipPopup.vue';
import chartDownload from '../../../mixins/chart_download';

export default {
  name: 'ICS',
  mixins: [chartDownload, ControlPanelSetup],
  components: {
    BarChart,
    IndicatorRelationshipPopup,
  },
  data() {
    return {
      title: '',
      color: ['#17606B', '#E85D58'],
      dataSeries: [],
      loading: false,
      chartOptions: {},
      datasources: [],
      showRelationshipPopup: false,
    };
  },

  props: {
    values: {
      type: [Object, String, Array],
      required: true,
    },
    controlIndex: {
      type: Number,
      required: true,
    },
    showRelationshipFeature: {
      type: Boolean,
      default: false,
    },
  },

  // methods: {
  //   formatHighChartData(dataSeries) {
  //     this.chartOptions = {
  //       chart: {
  //         type: 'line',
  //       },
  //       series: [],
  //     };
  //     this.chartOptions.series.push(dataSeries);
  //   },
  // },
  computed: {
    ...mapGetters('MSDAT_STORE', ['getIDCDatasources', 'getConfigObject']),

    getIndicatorsWithRelations() {
      const indicators = Array.isArray(this.values.indicator)
        ? this.values.indicator
        : [this.values.indicator];

      // Return selected indicators for analysis (not related indicators)
      return indicators.map((indicator) => ({
        ...indicator,
        selectedIndicators: indicators, // Pass all selected indicators for analysis
      }));
    },

    filteredIndicators() {
      // Check if this.values.indicator is an array before using filter
      if (Array.isArray(this.values.indicator)) {
        return this.values.indicator.filter((indicator) => !this.hasDataForIndicator(indicator));
      }
      // Handle the case when this.values.indicator is not an array
      // console.error('Indicator is not an array:', this.values.indicator);
      return [];
    },
  },
  methods: {
    ...mapActions('MSDAT_STORE', ['SET_CONTROL_OPTIONS']),
    ...mapMutations('MSDAT_STORE', [
      'TOGGLE_VISIBILITY',
      'SETUP_CONTROL_OPTIONS1',
      'UPDATE_IDC_DATASOURCEs',
      'UPDATE_IDC_INDICATORS',
    ]),

    hasDataForIndicator(indicator) {
      // Check if chartOptions and its series are defined
      if (this.chartOptions?.series) {
        // Exclude "Skilled birth attendance" from the check it is considered to have data
        if (indicator.short_name.toLowerCase() === 'skilled birth attendance') {
          return true;
        }
        // Find the series corresponding to the indicator
        const indicatorSeries = this.chartOptions.series.find((series) => series.name.toLowerCase().includes(indicator.full_name.toLowerCase()));

        // Check if the indicatorSeries has data points
        return indicatorSeries?.data && indicatorSeries.data.length > 0;
      }
      // Return false if chartOptions or series are not defined
      return false;
    },
    checkData() {
      // Check if we have any series data
      if (!this.chartOptions?.series?.length) {
        return false;
      }

      // Check if any series has data
      return this.chartOptions.series.some((series) => series.data && series.data.length > 0);
    },

    getDatasourceById(data) {
      const found = this.datasources.find((item) => item.id === data.datasource);
      return found;
    },

    async dashboardIndicators() {
      // const dashboardID = localStorage.getItem('activeDashboardID')
      // const response = await apiServices.getDashboardIndicators(dashboardID);
      console.log(this.dlDashboardDataSource, 'response');
      // this.indicators = response.data.indicators
    },

    async getDatasourcesObj() {
      const datasourcesIDs = this.getConfigObject.dataSources;

      const requests = datasourcesIDs.map((id) => apiServices.getSingleDataSourceObj(id));

      const responses = await Promise.all(requests);

      // Extract `data` from each response
      const results = responses.map((res) => res.data);
      this.UPDATE_IDC_DATASOURCEs(results);
    },

    async getAllIndicators() {
      const dashboardID = localStorage.getItem('activeDashboardID');
      const response = await apiServices.getDashboardIndicator(dashboardID);

      const indicators = response.data;

      const formattedData = groupIndicator(indicators, 'program_area');
      await this.UPDATE_IDC_INDICATORS(formattedData);
    },

    async fetchAllDataSources() {
      try {
        const requests = this.dlDashboardDataSource.map((id) => apiServices.getSingleDataSourceObj(id));
        const responses = await Promise.all(requests);

        // Extract data from each response
        this.datasources = responses.map((res) => res.data);

        // console.log('✅ DataSources:', data);
        // return data;
      } catch (err) {
        console.error('❌ Error fetching data sources:', err);
      }
    },
    displayFactorSign(factor) {
      const dpfactor = factor;
      let sign;
      switch (dpfactor) {
        case 'in percentage':
          sign = '%';
          break;
        case 'per 1000':
          sign = '/1000';
          break;
        default:
          sign = '';
      }
      return sign;
    },
    async plotForState(values) {
      const highChartOptions = {
        chart: {
          type: 'column',
        },
        series: [],
        yAxis: [],
        lang: defaultOptions.lang,
        navigation: defaultOptions.navigation,
        exporting: {
          ...defaultOptions.exporting,
          filename: `datasource-${values.datasource.datasource}`,
        },
        plotOptions: {
          series: {
            grouping: true,
            pointWidth: 10,
            connectNulls: false,
            pointPlacement: 'between',
            // borderWidth: 0,
          },
        },
      };
      let indicators = '';
      if (!Array.isArray(values.indicator)) {
        indicators = [values.indicator];
      } else {
        indicators = values.indicator;
      }
      const dataPromises = indicators?.map((item) => this.dlQuery({
        indicator: item.id,
        datasource: values.datasource.id,
        period: values.year,
        location: {
          level: 3,
        },
      })
      );

      const results = await Promise.all(dataPromises);

      /**
       * Map the display factors for the different indicators
       */
      const yTitles = [];
      for (let i = 0; i < results.length; i += 1) {
        const indicator = indicators[i];
        const displayFactor = this.dlGetFactor(indicator.factor) || { display_factor: '' };
        yTitles.push(displayFactor.display_factor);
      }

      for (let i = 0; i < results.length; i += 1) {
        // formate result to HighChart Format
        const indicator = indicators[i];
        const data = results[i];
        const toHighChartFormat = data?.map((item) => [
          this.dlGetLocation(item.location).name,
          parseFloat(item.value),
        ]);
        const displayFactor = this.dlGetFactor(indicator.factor) || { display_factor: '' };
        const yAxis = {
          yAxis: [
            {
              plotLines: [],
              labels: {
                style: {
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '11px',
                },
              },
              title: {
                style: {
                  ...defaultOptions.yAxis.title.style,
                  fontSize: '10px',
                },
              },
            },
          ],
          title: {
            ...defaultOptions.yAxis.title,
            // text: displayFactor.display_factor,
            text: [...new Set(yTitles)].join(' | '),
          },
          opposite: !!i, // this will become either true of false as 0 or 1
        };

        const obj = {
          // color: this.color[i],
          dataLabels: {
            enabled: true,
            format: `{y}${this.displayFactorSign(displayFactor.display_factor)}`,
            style: {
              ...defaultOptions.yAxis.title.style,
              fontSize: '10px',
            },
          },
          // name: indicator.full_name,
          // eslint-disable-next-line camelcase
          name: `${indicator.full_name} ${
            displayFactor.display_factor.trim() ? `(${displayFactor.display_factor})` : ''
          }`,
          data: toHighChartFormat,
        };
        if (i === 0) highChartOptions.yAxis.push(yAxis);
        highChartOptions.series.push(obj);
      }
      return highChartOptions;
    },

    async plotForNational(values) {
      const highChartOptions = {
        chart: {
          type: 'column',
        },
        series: [],
        yAxis: [],
        lang: defaultOptions.lang,
        navigation: defaultOptions.navigation,
        exporting: {
          ...defaultOptions.exporting,
          filename: `datasource-${values.datasource.datasource}`,
        },
        plotOptions: {
          series: {
            grouping: true,
            pointWidth: 10,
            connectNulls: false,
            pointPlacement: 'between',
            // borderWidth: 0,
          },
        },
      };
      let indicators = '';
      if (!Array.isArray(values.indicator)) {
        indicators = [values.indicator];
      } else {
        indicators = values.indicator;
      }
      const dataPromises = indicators?.map((item) => this.dlQuery({
        indicator: item.id,
        datasource: values.datasource.id,
        period: values.year,
        location: {
          level: 1,
        },
      })
      );

      const results = await Promise.all(dataPromises);

      /**
       * Map the display factors for the different indicators
       */
      const yTitles = [];
      for (let i = 0; i < results.length; i += 1) {
        const indicator = indicators[i];
        const displayFactor = this.dlGetFactor(indicator.factor) || { display_factor: '' };
        yTitles.push(displayFactor.display_factor);
      }

      for (let i = 0; i < results.length; i += 1) {
        // formate result to HighChart Format
        const indicator = indicators[i];
        const data = results[i];
        const toHighChartFormat = data?.map((item) => [
          this.dlGetLocation(item.location).name,
          parseFloat(item.value),
        ]);
        const displayFactor = this.dlGetFactor(indicator.factor) || { display_factor: '' };
        const yAxis = {
          yAxis: [
            {
              plotLines: [],
              labels: {
                style: {
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '11px',
                },
              },
              title: {
                style: {
                  ...defaultOptions.yAxis.title.style,
                  fontSize: '10px',
                },
              },
            },
          ],
          title: {
            ...defaultOptions.yAxis.title,
            // text: displayFactor.display_factor,
            text: [...new Set(yTitles)].join(' | '),
          },
          opposite: !!i, // this will become either true of false as 0 or 1
        };

        const obj = {
          // color: this.color[i],
          dataLabels: {
            enabled: true,
            format: `{y}${this.displayFactorSign(displayFactor.display_factor)}`,
            style: {
              ...defaultOptions.yAxis.title.style,
              fontSize: '10px',
            },
          },
          // name: indicator.full_name,
          name: `${indicator.full_name} ${
            displayFactor.display_factor.trim() ? `(${displayFactor.display_factor})` : ''
          }`,
          data: toHighChartFormat,
        };
        if (i === 0) highChartOptions.yAxis.push(yAxis);
        highChartOptions.series.push(obj);
      }
      return highChartOptions;
    },

    async plotForZonal(values) {
      const highChartOptions = {
        chart: {
          type: 'column',
        },
        series: [],
        yAxis: [],
        lang: defaultOptions.lang,
        navigation: defaultOptions.navigation,
        exporting: {
          ...defaultOptions.exporting,
          filename: `datasource-${values.datasource.datasource}`,
        },
        plotOptions: {
          series: {
            grouping: true,
            pointWidth: 10,
            connectNulls: false,
            pointPlacement: 'between',
            // borderWidth: 0,
          },
        },
      };
      let indicators = '';
      if (!Array.isArray(values.indicator)) {
        indicators = [values.indicator];
      } else {
        indicators = values.indicator;
      }
      const dataPromises = indicators?.map((item) => this.dlQuery({
        indicator: item.id,
        datasource: values.datasource.id,
        period: values.year,
        location: {
          level: 2,
        },
      })
      );

      const results = await Promise.all(dataPromises);

      /**
       * Map the display factors for the different indicators
       */
      const yTitles = [];
      for (let i = 0; i < results.length; i += 1) {
        const indicator = indicators[i];
        const displayFactor = this.dlGetFactor(indicator.factor) || { display_factor: '' };
        yTitles.push(displayFactor.display_factor);
      }

      for (let i = 0; i < results.length; i += 1) {
        // formate result to HighChart Format
        const indicator = indicators[i];
        const data = results[i];
        const toHighChartFormat = data?.map((item) => [
          this.dlGetLocation(item.location).name,
          parseFloat(item.value),
        ]);
        const displayFactor = this.dlGetFactor(indicator.factor) || { display_factor: '' };
        const yAxis = {
          yAxis: [
            {
              plotLines: [],
              labels: {
                style: {
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '11px',
                },
              },
              title: {
                style: {
                  ...defaultOptions.yAxis.title.style,
                  fontSize: '10px',
                },
              },
            },
          ],
          title: {
            ...defaultOptions.yAxis.title,
            // text: displayFactor.display_factor,
            text: [...new Set(yTitles)].join(' | '),
          },
          opposite: !!i, // this will become either true of false as 0 or 1
        };

        const obj = {
          // color: this.color[i],
          dataLabels: {
            enabled: true,
            format: `{y}${this.displayFactorSign(displayFactor.display_factor)}`,
            style: {
              ...defaultOptions.yAxis.title.style,
              fontSize: '10px',
            },
          },
          // name: indicator.full_name,
          name: `${indicator.full_name} ${
            displayFactor.display_factor.trim() ? `(${displayFactor.display_factor})` : ''
          }`,
          data: toHighChartFormat,
        };
        if (i === 0) highChartOptions.yAxis.push(yAxis);
        highChartOptions.series.push(obj);
      }
      return highChartOptions;
    },
    /**
     * This method loops through the list of indicators
     * and creates the SDG target line object if the
     * target exists and finally adds it to the chart
     */
    toggleSDGTargetLine(val) {
      let indicators = null;
      const plotLines = [];
      const options = { ...this.chartOptions };
      if (val) {
        if (!Array.isArray(this.values.indicator)) {
          indicators = [this.values.indicator];
        } else {
          indicators = this.values.indicator;
        }
        for (let n = 0; n < indicators.length; n++) {
          if (indicators[n].sdg_target) {
            plotLines.push({
              width: 0.5,
              id: 'sdgTarget',
              color: '#222222',
              value: indicators[n].sdg_target,
              dashStyle: 'longdashdot',
              label: {
                text: 'SDG',
                verticalAlign: 'top',
                rotation: 0,
                textAlign: 'right',
                y: 0,
                x: 0,
                style: {
                  fontSize: '10px',
                  fontFamily: '"Open Sans", sans-serif',
                },
              },
            });
            // Checks if the plotLines object exists
            if (options.yAxis[0]?.plotLines) {
              options.yAxis[0].plotLines.push(...plotLines);
            } else {
              options.yAxis[0].plotLines = [];
              options.yAxis[0].plotLines.push(...plotLines);
            }
            this.chartOptions = { ...options };
          }
        }
      } else {
        // Checks if the plotLines object exists
        if (options.yAxis[0]?.plotLines) {
          const temp = options.yAxis[0].plotLines.filter((line) => line.id !== 'sdgTarget');
          options.yAxis[0].plotLines = temp;
        } else {
          options.yAxis[0].plotLines = [];
          const temp = options.yAxis[0].plotLines.filter((line) => line.id !== 'sdgTarget');
          options.yAxis[0].plotLines = temp;
        }
        this.chartOptions = { ...options };
      }
    },
    /**
     * This method loops through the list of indicators
     * and creates the national target line object if the
     * target exists and finally adds it to the chart
     */
    toggleNationalTargetLine(val) {
      let indicators = null;
      const plotLines = [];
      const options = { ...this.chartOptions };
      if (val) {
        if (!Array.isArray(this.values.indicator)) {
          indicators = [this.values.indicator];
        } else {
          indicators = this.values.indicator;
        }
        for (let n = 0; n < indicators.length; n++) {
          if (indicators[n].national_target) {
            plotLines.push({
              width: 0.5,
              color: '#222222',
              id: 'ntLine',
              value: indicators[n].national_target,
              label: {
                text: 'NT',
                verticalAlign: 'top',
                rotation: 0,
                textAlign: 'left',
                y: 0,
                x: -13,
                style: {
                  fontSize: '10px',
                  fontFamily: '"Open Sans", sans-serif',
                },
              },
            });
            // Checks if the plotLines object exists
            if (options.yAxis[0]?.plotLines) {
              options.yAxis[0].plotLines.push(...plotLines);
            } else {
              options.yAxis[0].plotLines = [];
              options.yAxis[0].plotLines.push(...plotLines);
            }
            this.chartOptions = { ...options };
          }
        }
      } else {
        // Checks if the plotLines object exists
        if (options.yAxis[0]?.plotLines) {
          const temp = options.yAxis[0].plotLines.filter((line) => line.id !== 'ntLine');
          options.yAxis[0].plotLines = temp;
        } else {
          options.yAxis[0].plotLines = [];
          const temp = options.yAxis[0].plotLines.filter((line) => line.id !== 'ntLine');
          options.yAxis[0].plotLines = temp;
        }

        this.chartOptions = { ...options };
      }
    },
    async plotForPeriods(values) {
      const highChartOptions = {
        chart: {
          type: 'line',
        },
        yAxis: [],
        series: [],
        exporting: {
          filename: `datasource-${values.datasource.datasource}`,
        },
      };
      let indicators = '';
      if (!Array.isArray(values.indicator)) {
        indicators = [values.indicator];
      } else {
        indicators = values.indicator;
      }

      const dataPromises = indicators?.map((item) => this.dlQuery({
        indicator: item.id,
        datasource: values.datasource.id,
        location: values.location.id,
      })
      );

      const results = await Promise.all(dataPromises);
      // debugger;
      /**
       * Map the display factors for the different indicators
       */
      const yTitles = [];
      for (let i = 0; i < results.length; i += 1) {
        const indicator = indicators[i];
        const displayFactor = this.dlGetFactor(indicator.factor) || { display_factor: '' };
        yTitles.push(displayFactor.display_factor);
      }

      if (values.datasource.id === 30) {
        for (let i = 0; i < results.length; i += 1) {
          const result = results[i];
          const indicator = indicators[i];
          // const filterOnlyYearlyValues = result.filter((item) => moment(item.period, 'YYYY', true).isValid());
          const formatToHighChartFormat = result?.map((item) => [
            item.period,
            Number.parseFloat(item.value),
          ]);
          // const sortTheYear = formatToHighChartFormat.sort((a, b) => a[0] - b[0]);

          const displayFactor = this.dlGetFactor(indicator.factor) || { display_factor: '' };
          if (i === 0) {
            highChartOptions.yAxis.push({
              yAxis: [
                {
                  plotLines: [],
                  labels: {
                    style: {
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: '11px',
                    },
                  },
                  title: {
                    style: {
                      ...defaultOptions.yAxis.title.style,
                      fontSize: '10px',
                    },
                  },
                },
              ],
              title: {
                ...defaultOptions.yAxis.title,
                // text: displayFactor.display_factor,
                text: [...new Set(yTitles)].join(' | '),
              },
              opposite: !!i, // this will become either true of false as 0 or 1
            });
          }
          const obj = {
            color: this.color[i],
            lineWidth: 3,
            // name: indicator.full_name,
            name: `${indicator.full_name} ${
              displayFactor.display_factor.trim() ? `(${displayFactor.display_factor})` : ''
            }`,
            data: formatToHighChartFormat,
          };
          highChartOptions.series.push(obj);
        }

        // this functions checks to make years apear from smallest to highest when the first selected indicator
        // year have higher values than that of the second selected indicator
        if (
          highChartOptions.series.length > 1
          && highChartOptions.series[0].data[0] > highChartOptions.series[1].data[0]
        ) {
          const temporary = highChartOptions.series[1];
          highChartOptions.series[1] = highChartOptions.series[0];
          highChartOptions.series[0] = temporary;
        }
        return highChartOptions;
      }

      for (let i = 0; i < results.length; i += 1) {
        const result = results[i];
        const indicator = indicators[i];
        const filterOnlyYearlyValues = result.filter((item) => moment(item.period, 'YYYY', true).isValid());
        const formatToHighChartFormat = filterOnlyYearlyValues?.map((item) => [
          item.period,
          Number.parseFloat(item.value),
        ]);
        const sortTheYear = formatToHighChartFormat.sort((a, b) => a[0] - b[0]);

        const displayFactor = this.dlGetFactor(indicator.factor) || { display_factor: '' };
        if (i === 0) {
          highChartOptions.yAxis.push({
            yAxis: [
              {
                plotLines: [],
                labels: {
                  style: {
                    fontFamily: 'Work Sans, sans-serif',
                    fontSize: '11px',
                  },
                },
                title: {
                  style: {
                    ...defaultOptions.yAxis.title.style,
                    fontSize: '10px',
                  },
                },
              },
            ],
            title: {
              ...defaultOptions.yAxis.title,
              // text: displayFactor.display_factor,
              text: [...new Set(yTitles)].join(' | '),
            },
            opposite: !!i, // this will become either true of false as 0 or 1
          });
        }
        const obj = {
          color: this.color[i],
          lineWidth: 3,
          // name: indicator.full_name,
          name: `${indicator.full_name} ${
            displayFactor.display_factor.trim() ? `(${displayFactor.display_factor})` : ''
          }`,
          data: sortTheYear,
        };
        highChartOptions.series.push(obj);
      }

      //  console.log(highChartOptions, 'formatToHighChartFormat 4');
      // this functions checks to make years apear from smallest to highest when the first selected indicator
      // year have higher values than that of the second selected indicator
      if (
        highChartOptions.series.length > 1
        && highChartOptions.series[0].data[0] > highChartOptions.series[1].data[0]
      ) {
        const temporary = highChartOptions.series[1];
        highChartOptions.series[1] = highChartOptions.series[0];
        highChartOptions.series[0] = temporary;
      }
      return highChartOptions;
    },

    async renderChart(panelValues) {
      const { sdg, national } = this.values.target;
      this.chartOptions = {};
      if (panelValues.compareBy.name === 'Period') {
        const highChartOptions = await this.plotForPeriods(panelValues);
        this.chartOptions = { ...highChartOptions };
        /**
         * the purpose of the if check is to make sure we
         * don't try to add plotlines before the chart is
         * rendered
         */
        if (Object.keys(this.chartOptions).length !== 0) {
          this.toggleSDGTargetLine(sdg);
          this.toggleNationalTargetLine(national);
        }
      }

      if (panelValues.compareBy.name === 'State') {
        const highChartOptions = await this.plotForState(panelValues);
        this.chartOptions = { ...highChartOptions };
        if (Object.keys(this.chartOptions).length !== 0) {
          this.toggleSDGTargetLine(sdg);
          this.toggleNationalTargetLine(national);
        }
      }

      if (panelValues.compareBy.name === 'National') {
        const highChartOptions = await this.plotForNational(panelValues);
        this.chartOptions = { ...highChartOptions };
        if (Object.keys(this.chartOptions).length !== 0) {
          this.toggleSDGTargetLine(sdg);
          this.toggleNationalTargetLine(national);
        }
      }
      if (panelValues.compareBy.name === 'Zonal') {
        const highChartOptions = await this.plotForZonal(panelValues);
        this.chartOptions = { ...highChartOptions };
        if (Object.keys(this.chartOptions).length !== 0) {
          this.toggleSDGTargetLine(sdg);
          this.toggleNationalTargetLine(national);
        }
      }
    },
    validateRequiredValues(values) {
      if (!values) return false;

      // ✅ Accept 0 as a valid datasource ID
      if (
        values.datasource?.id === undefined
        || values.datasource?.id === null
        || !values.indicator
      ) return false;

      // For Period comparison
      if (values.compareBy?.name === 'Period' && !values.location?.id) return false;

      // For State comparison
      if (values.compareBy?.name === 'State' && !values.year) return false;

      // If indicator is an array, validate each item
      if (Array.isArray(values.indicator)) {
        return values.indicator.every((ind) => ind && ind.id);
      }

      // If single indicator
      return !!values.indicator.id;
    },

    async safeRenderChart(values) {
      if (!this.validateRequiredValues(values)) {
        console.log('Missing required values for chart rendering');
        return;
      }

      this.loading = true;
      try {
        await this.renderChart(values);
      } catch (error) {
        console.error('Error rendering chart:', error);
      } finally {
        this.loading = false;
      }
    },
  },
  watch: {
    values: {
      immediate: true, // This ensures the watcher runs on component creation
      handler(newValues) {
        if (this.validateRequiredValues(newValues)) {
          this.safeRenderChart(newValues);
        }
      },
      deep: true,
    },

    'values.compareBy': {
      async handler(data) {
        if (data.name === 'Period') {
          this.TOGGLE_VISIBILITY({
            panelIndex: this.controlIndex,
            key: 'year',
            value: false,
          });
          this.TOGGLE_VISIBILITY({
            panelIndex: this.controlIndex,
            key: 'location',
            value: true,
          });
        } else if (data.name === 'State') {
          this.TOGGLE_VISIBILITY({
            panelIndex: this.controlIndex,
            key: 'year',
            value: true,
          });
          this.TOGGLE_VISIBILITY({
            panelIndex: this.controlIndex,
            key: 'location',
            value: false,
          });

          // get the list of years by datasource
          const setYearDropdown = await this.setYearDropdown();
          // period dropdown;
          this.SET_CONTROL_OPTIONS({
            panelIndex: 2,
            controlIndex: 2,
            values: setYearDropdown,
          });
          this.loading = true;
          await this.renderChart(this.values);
          this.loading = false;
        } else if (data.name === 'National') {
          this.TOGGLE_VISIBILITY({
            panelIndex: this.controlIndex,
            key: 'year',
            value: true,
          });
          this.TOGGLE_VISIBILITY({
            panelIndex: this.controlIndex,
            key: 'location',
            value: false,
          });

          // get the list of years by datasource
          const setYearDropdown = await this.setYearDropdown();
          // period dropdown;
          this.SET_CONTROL_OPTIONS({
            panelIndex: 2,
            controlIndex: 2,
            values: setYearDropdown,
          });
          this.loading = true;
          await this.renderChart(this.values);
          this.loading = false;
        } else if (data.name === 'Zonal') {
          this.TOGGLE_VISIBILITY({
            panelIndex: this.controlIndex,
            key: 'year',
            value: true,
          });
          this.TOGGLE_VISIBILITY({
            panelIndex: this.controlIndex,
            key: 'location',
            value: false,
          });

          // get the list of years by datasource
          const setYearDropdown = await this.setYearDropdown();
          // period dropdown;
          this.SET_CONTROL_OPTIONS({
            panelIndex: 2,
            controlIndex: 2,
            values: setYearDropdown,
          });
          this.loading = true;
          await this.renderChart(this.values);
          this.loading = false;
        }
      },
      immediate: false,
    },
    /**
     * This adds or removes the target line
     * without re-plotting the entire chart
     */
    'values.target.sdg': {
      handler(val) {
        this.toggleSDGTargetLine(val);
      },
    },
    /**
     * This adds or removes the target line
     * without re-plotting the entire chart
     */
    'values.target.national': {
      handler(val) {
        this.toggleNationalTargetLine(val);
      },
    },
  },

  async mounted() {
    this.getDatasourcesObj();
    this.getAllIndicators();
    // console.log(this.defaultDataSourceDropdown, 'this.defaultDataSourceDropdown');

    // Initial render if we have the required values
    if (this.validateRequiredValues(this.values)) {
      this.$nextTick(() => {
        this.safeRenderChart(this.values);
      });
    }
    if (!Array.isArray(this.values.indicator.length)) {
      this.title = ` Comparison Of ${this.values.indicator.short_name} according to the ${this.values.datasource.datasource} across ${this.values.compareBy.name}`;
    } else {
      this.title = ` Comparison Of ${this.values.indicator[0].short_name} and ${this.values.indicator[1].short_name} according to the ${this.values.datasource.datasource} across ${this.values.compareBy.name}s`;
    }
  },
  created() {
    this.fetchAllDataSources();
  },
};
</script>

<style lang="scss" scoped>
div.ics_wrapper {
  position: relative;
  div.no_data {
    position: absolute;
    top: 0;

    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
}
.no_ind_data {
  position: fixed;
  top: 280px;
  right: 110px;
  padding: 4px 14px;
  background-color: #ffffff;
  z-index: 1;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  height: fit-content;

  span {
    font-size: 12px;
    color: #333333;
  }
}
.relationship-btn {
  background: transparent;
  color: #17606B;
  cursor: pointer;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #E85D58;
    text-decoration: underline;
    background-color: rgba(23, 96, 107, 0.06);
  }
}
</style>
