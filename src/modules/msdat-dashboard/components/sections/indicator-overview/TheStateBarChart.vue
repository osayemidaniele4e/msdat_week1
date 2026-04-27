<!-- eslint-disable camelcase -->
<!-- eslint-disable camelcase -->
<template>
  <div
    class="position-relative"
    id="stateBarChartComponent"
    style="display: flex; flex-direction: column; align-items: center; justify-content: center"
  >
    <base-overlay :show="loading">
      <base-sub-card
        :showDropdown="false"
        ref="SubCard"
        showControls
        v-if="Object.keys(values).length"
        @dropdownTypeSelected="mapDownload($event)"
      >
        <template #title>
          <div class="w-100 d-flex flex-column">
            <div class="d-flex justify-content-between align-items-center">
              <p class="work-sans mb-0 line-height sub-title" v-if="level === 1">
                Distribution of
                <!-- Made the setAcrossRegion dynamic to change whenever a user selects a state -->
                <b>{{ indicatorLabel }}</b> across
                <b>{{ visualization === 'map' ? 'Nigeria' : locationLabel }}.</b> Source:<b>
                  {{ datasourceLabel }} {{ yearLabel }}</b
                >
              </p>
              <p class="work-sans mb-0 line-height sub-title" v-if="level === 3">
                Distribution of
                <b>{{ indicatorLabel }}</b> across
                <b>{{ locationLabel }}.</b> Source:<b>
                  {{ datasourceLabel }} {{ yearLabel }}</b
                >
              </p>
              <div class="d-flex align-items-center">
                <div class="summary-btn"
                     @click.prevent="openSmartNarrative"
                     title="Smart Summary"
                >
                  <img src="@/assets/icons/smart-narrative-icon.svg" alt="Smart Summary" class="smart-narrative-icon" />
                </div>
              </div>
            </div>
          </div>
        </template>
        <button
          @click="returnToNational"
          v-show="level !== 1"
          class="bg-transparent text-dark font-weight-bold"
        >
          <b-icon icon="chevron-left" />
          &nbsp;Back to National
        </button>
        <div class="d-flex justify-content-start work-sans">
          <button
            type="button"
            @click="setVisualization('bar')"
            class="btn btn-sm btn-outline-primary mr-2 d-flex align-items-center"
            :class="[activeToggleButton === 'bar' ? 'active' : '']"
          >
            <b-icon icon="bar-chart-fill" class="ml-1"></b-icon>
             Bar
          </button>
          <button
            type="button"
            @click="setVisualization('map')"
            class="btn btn-sm btn-outline-primary d-flex align-items-center"
            :class="[activeToggleButton === 'map' ? 'active' : '']"
          >
            <b-icon icon="map" class="ml-1"></b-icon>
             Map
          </button>
        </div>
        <div v-if="visualization === 'bar'" @click="handleChartClick">
          <BarChart ref="BaseChart" :chartOptions="BarChartOptions" :title="title" :watermarkPosition="{ x: '80%', y: '80%', textXPercent: 90, textYPercent: 90 }" />
        </div>
        <BaseMap
          v-else
          ref="BaseMap"
          :mapObject="mapObject"
          :level="mapLevel"
          :lgaState="values.location.name"
          :title="title"
        />
      </base-sub-card>
    </base-overlay>
    <NoSubNationalData
      v-if="showNoSubNationalData"
      class="position-absolute"
      style="top: 15%; width: 80%"
    />
    <NoAvailableData
      v-if="showNoAvailableData"
      class="position-absolute"
      style="top: 16%; width: 50%; left: 25%"
    />
    <SmartNarrativeModal
      :show="showSmartNarrative"
      :values="values"
      :chartImage="capturedChartImage"
      @close="showSmartNarrative = false"
    />
  </div>
</template>
<script>
import { mapState } from 'vuex';
import Highcharts from 'highcharts';
import BarChart from '@/components/Barchart/BaseBarChart.vue';
import formatter from '@/modules/msdat-dashboard/mixins/formatter';
import { eventBus } from '@/main';
import ApiServices from '@/modules/data-layer/services/ApiServices';
import BaseMap from '@/components/maps/ZonalBaseMap.vue';
import { validateDataValue } from '@/util/dataValidation';
import chartDownload from '../../../mixins/chart_download';
import NoSubNationalData from '../../NoData.vue';
import NoAvailableData from '../../NoData2.vue';
import SmartNarrativeModal from './SmartNarrativeModal.vue';

export default {
  mixins: [chartDownload, formatter],
  components: {
    BarChart,
    NoSubNationalData,
    BaseMap,
    NoAvailableData,
    SmartNarrativeModal,
  },
  data() {
    return {
      title: '',
      BarChartOptions: {},
      loading: false,
      showNoSubNationalData: false,
      level: 1,
      mapLevel: 1,
      updateData: 0,
      desirable_slope: '',
      acrossRegion: 'Country',
      visualization: 'bar',
      activeToggleButton: 'bar',
      mapObject: {
        series: [
          {
            name: 'Nigeria',
            data: [],
          },
        ],
        title: {
          text: 'Indicator Name',
        },
        subtitle: {
          text: 'NHMIS = 2018',
        },
      },
      showNoAvailableData: false,
      showSmartNarrative: false,
      capturedChartImage: null,
      // Request tracking to prevent race conditions
      requestId: 0,
      // Prevent duplicate fetches when unrelated nested payload fields mutate
      lastChartQueryKey: '',
    };
  },
  props: {
    /**
     * input values
     */
    values: {
      type: [Object, String, Array],
      required: true,
    },
    closeOverlay: {
      type: Boolean,
    },
  },
  computed: {
    ...mapState('MSDAT_STORE', ['selectedState', 'datasetComperision']),
    setAcrossRegion() {
      return this.acrossRegion;
    },
    indicatorLabel() {
      return this.resolveDisplayText(this.values?.indicator, ['short_name', 'full_name', 'name']);
    },
    locationLabel() {
      return this.resolveDisplayText(this.values?.location, ['name']);
    },
    datasourceLabel() {
      return this.resolveDisplayText(this.values?.datasource, ['datasource', 'name', 'item']);
    },
    yearLabel() {
      return this.resolveDisplayText(this.values?.year);
    },
  },
  watch: {
    // Watch closeOverlay
    closeOverlay: {
      handler(newValue) {
        if (newValue) {
          this.closeOverlay = true;
          this.$refs.SubCard.close();
        }
      },
      deep: true,
    },

    // Watches selected state in store for if it is nigeria it changes title if it nots it displays accross country
    selectedState(newValue) {
      if (newValue.name !== 'Nigeria') {
        this.acrossRegion = 'State';
      } else {
        this.acrossRegion = 'Country';
      }
    },
    values: {
      async handler() {
        const chartQueryKey = [
          this.values?.indicator?.id,
          this.values?.datasource?.id,
          this.values?.location?.id,
          this.values?.year,
          this.values?.numdenum,
          this.values?.target?.national,
          this.values?.target?.sdg,
          this.visualization,
        ].join('|');

        if (chartQueryKey === this.lastChartQueryKey) {
          return;
        }
        this.lastChartQueryKey = chartQueryKey;

        await this.updateValue();
        const factorObj = this.dlGetFactor(this.values.indicator?.factor);
        const factor = factorObj.display_factor;
        const indicatorWithFactor = `${this.indicatorLabel}${factor.trim() ? ` (${factor})` : ''}`;
        // For map: always show "across the country" (Nigeria), for bar chart it will show the selected location
        this.title = `Distribution Of ${indicatorWithFactor} across the country. Source: ${this.datasourceLabel} ${this.yearLabel}`;
      },
      deep: true,
      immediate: true,
    },
    'BarChartOptions.series': {
      handler(newSeries) {
        if (!Array.isArray(newSeries) || newSeries.length === 0) {
          this.showNoSubNationalData = false;
          return;
        }

        if (!newSeries[0] || !Array.isArray(newSeries[0].data)) {
          this.showNoSubNationalData = false;
          return;
        }

        for (let i = 0; i < newSeries.length; i += 1) {
          if (newSeries[0].data.length <= 0) {
            this.showNoSubNationalData = true;
            return;
          }
          if (i > 0) {
            this.showNoSubNationalData = false;
            if (newSeries[i].data.length > 0) {
              this.showNoSubNationalData = false;
              return;
            }
          }
        }
      },
    },
  },
  methods: {
    async openSmartNarrative() {
      // Show modal immediately - image capture happens in background
      this.showSmartNarrative = true;
      // Capture image asynchronously
      this.captureChartImage().then((base64) => {
        this.capturedChartImage = base64;
      });
    },
    async captureChartImage() {
      try {
        let chart;
        if (this.visualization === 'bar') {
          chart = this.$refs.BaseChart?.$refs.lineCharts?.chart;
        } else {
          chart = this.$refs.BaseMap?.$refs.mapChart?.chart;
        }

        if (!chart) return null;

        const svg = chart.getSVG();
        const base64 = await this.svgToPng(svg);
        console.log('StateBarChart Image Base64:', `${base64.substring(0, 100)}...`);
        return base64;
      } catch (e) {
        console.error('Failed to capture chart image', e);
        return null;
      }
    },
    svgToPng(svg) {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        const svgData = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          // Fill white background (charts are often transparent)
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (e) => {
          console.error('SVG to PNG conversion failed', e);
          reject(e);
        };
        img.src = svgData;
      });
    },
    async getNDData(queryArray) {
      const nums = await queryArray.map((item) => this.queryDBForNumDenum({
        datasource: item.datasource,
        period: item.period,
        indicator: item.indicator,
        location: item.location,
      }));
      const returnedNums = await Promise.allSettled(nums);
      const noData = returnedNums.every((value) => value.value.length === 0);
      if (!noData) {
        const mappedValues = returnedNums.map((item) => {
          const num = item?.value.find((el) => el.value_type === 6);
          const denum = item?.value.find((el) => el.value_type === 7);
          return {
            datasource: denum?.datasource || null,
            period: denum?.period || null,
            indicator: denum?.indicator || null,
            location: denum?.location || null,
            numerator: num?.value || null,
            denominator: denum?.value || null,
          };
        });
        return mappedValues;
      }
      return [];
    },
    async updateValue() {
      // Increment request ID to track this specific request
      this.requestId += 1;
      const currentRequestId = this.requestId;

      // Immediately show loading state and clear previous data
      this.loading = true;
      this.showNoAvailableData = false;
      this.showNoSubNationalData = false;

      if (this.visualization === 'map') {
        // Clear previous map data immediately
        this.mapObject = {
          series: [{ name: 'Nigeria', data: [] }],
          title: { text: 'Loading...' },
          subtitle: { text: '' },
        };

        // Determine map level and location query based on selected location
        const isNationalLevel = this.values.location.id === 1;
        let locationQuery = {};

        if (isNationalLevel) {
          // National level: show all states on national map
          locationQuery = { level: 3 };
          this.mapLevel = 1;
        } else {
          // State level: show LGAs for the selected state (level 4)
          locationQuery = { parent: this.values.location.id, level: 4 };
          this.mapLevel = 3;
        }

        const data = await this.dlQuery({
          indicator: this.values.indicator.id,
          datasource: this.values.datasource.id,
          period: this.values.year,
          location: locationQuery,
        });

        // Check if this request is still the latest one
        if (currentRequestId !== this.requestId) {
          return; // A newer request has been made, discard this result
        }

        if (data?.length === 0) {
          this.showNoAvailableData = true;
        } else {
          this.showNoAvailableData = false;
        }
        const formattedData = this.formatDataToSeriesMapFormat(data);
        this.mapObject = this.formatToHighChartOptionForMap(formattedData, this.values);
        this.loading = false;
        return;
      }

      // Bar chart logic - Clear previous chart data immediately
      this.BarChartOptions = {};

      const data = await this.getData(this.values);

      // Check if this request is still the latest one
      if (currentRequestId !== this.requestId) {
        return; // A newer request has been made, discard this result
      }

      if (this.values.indicator?.id === undefined) {
        this.loading = false;
        return;
      }
      // eslint-disable-next-line camelcase
      const { national_target, sdg_target, desirable_slope } = this.dlGetIndicator(
        this.values.indicator.id,
      );
      const displayFactor = this.dlGetFactor(this.values.indicator?.factor).display_factor;
      const national = await this.computeNationalND();

      // Check again after async operations
      if (currentRequestId !== this.requestId) {
        return; // A newer request has been made, discard this result
      }

      let ndData = [];
      if (this.values.numdenum === true) {
        ndData = await this.getNDData(data);

        // Check again after async operations
        if (currentRequestId !== this.requestId) {
          return; // A newer request has been made, discard this result
        }
      }

      const chartOptions = this.genHighChartOption(
        data,
        {
          nationalTarget: {
            value: national_target,
            show: this.values.target.national,
            slope: desirable_slope,
          },
          sdgTarget: {
            value: sdg_target,
            show: this.values.target.sdg,
            slope: desirable_slope,
          },
        },
        await ndData,
        this.values.numdenum,
      );

      // Validate and flag anomalous data points inside the chart
      const factorObj = this.dlGetFactor(this.values.indicator?.factor);
      const isPercentage = factorObj && factorObj.display_factor && (factorObj.display_factor === 'in percentage' || factorObj.display_factor.includes('%'));
      const validationContext = {
        is_percentage: isPercentage,
        indicator_name: this.values.indicator.full_name,
      };
      if (chartOptions.series) {
        chartOptions.series.forEach((series) => {
          if (series.data) {
            series.data.forEach((point) => {
              if (point && typeof point === 'object' && point.y !== undefined) {
                const flags = validateDataValue(point.y, validationContext);
                if (flags.length > 0) {
                  // eslint-disable-next-line no-param-reassign
                  point.anomalyFlags = flags;
                }
              }
            });
          }
        });
      }

      chartOptions.plotOptions = {
        series: {
          dataLabels: {
            enabled: true,
            useHTML: true,
            formatter() {
              let label;
              if (Number.isInteger(this.y)) {
                label = this.y >= 1000 ? Highcharts.numberFormat(this.y, 0, '.', ',') : this.y;
              } else {
                label = this.y;
              }
              if (this.point.anomalyFlags && this.point.anomalyFlags.length > 0) {
                return `${label} <span style="color:#ffc107;font-size:12px;" title="Data anomaly detected">&#9888;</span>`;
              }
              return label;
            },
          },
          pointWidth: 10,
        },
      };

      // Adding tooltip formatter with anomaly info
      chartOptions.tooltip = {
        useHTML: true,
        pointFormatter() {
          let valueLabel;
          if (Number.isInteger(this.y)) {
            valueLabel = this.y >= 1000 ? Highcharts.numberFormat(this.y, 0, '.', ',') : this.y;
          } else {
            valueLabel = this.y;
          }
          let html = `<span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b>${valueLabel}</b><br/>`;
          if (this.anomalyFlags && this.anomalyFlags.length > 0) {
            html += '<br/><span style="color:#ffc107;font-weight:bold;">&#9888; Anomaly Detected:</span><br/>';
            this.anomalyFlags.forEach((flag) => {
              html += `<span style="font-size:11px;">• ${flag.message}</span><br/>`;
            });
          }
          return html;
        },
      };

      chartOptions.yAxis.title.text = `${displayFactor}`;

      // Only adjust yAxis for target lines if targets exceed data range
      chartOptions.yAxis = this.adjustYAxisForTargetLines(
        chartOptions.yAxis,
        chartOptions.series,
        {
          nationalTarget: national_target,
          sdgTarget: sdg_target,
          showNational: this.values.target.national,
          showSdg: this.values.target.sdg,
        },
      );

      // add nation and state selected to fit according to mockup :cry: :worried: :rage:
      // const parentValue = await this.dlQuery({
      //   indicator: this.values.indicator.id,
      //   datasource: this.values.datasource.id,
      //   period: this.values.year,
      //   // value_type: 5,
      //   location: this.values.location.id,
      // });
      const response = await ApiServices.getParentData({
        indicator: this.values.indicator.id,
        datasource: this.values.datasource.id,
        period: this.values.year,
        // value_type: 5,
        location: this.values.location.id,
      });

      // Check if this request is still the latest one
      if (currentRequestId !== this.requestId) {
        return; // A newer request has been made, discard this result
      }

      const parentValue = response.data.results;

      // because i know i am expecting only on value in the array of results
      if (parentValue.length > 0) {
        const parent = parentValue[0];
        // eslint-disable-next-line camelcase
        if (national_target === null) {
          const seriesObject = {
            showInLegend: false,
            // eslint-disable-next-line camelcase
            color: '#58a5e8',
            // eslint-disable-next-line camelcase
            name: 'No Target',
            data: [
              {
                name: this.values.location.name,
                y: Number(parseFloat(parent.value).toFixed(1)),
                nd: national.numerator || 0,
                dn: national.denominator || 0,
              },
            ],
          };
          chartOptions.series.unshift(seriesObject);
        }

        // eslint-disable-next-line camelcase
        if (national_target !== null) {
          // eslint-disable-next-line camelcase
          if (desirable_slope === 'Positive') {
            const seriesObject = {
              showInLegend: false,
              // eslint-disable-next-line camelcase
              color: parseFloat(parent.value) > national_target ? '#00a65a' : '#E85D58',
              // eslint-disable-next-line camelcase
              name: parseFloat(parent.value) > national_target ? 'On Target' : 'Below Target',
              data: [
                {
                  name: this.values.location.name,
                  y: Number(parseFloat(parent.value).toFixed(1)),
                  nd: national.numerator || 0,
                  dn: national.denominator || 0,
                },
              ],
            };
            chartOptions.series.unshift(seriesObject);
          }
          // eslint-disable-next-line camelcase
          if (desirable_slope === 'Negative') {
            const seriesObject = {
              showInLegend: false,
              // eslint-disable-next-line camelcase
              color: parseFloat(parent.value) > national_target ? '#E85D58' : '#00a65a',
              // eslint-disable-next-line camelcase
              name: parseFloat(parent.value) > national_target ? 'On Target' : 'Below Target',
              data: [
                {
                  name: this.values.location.name,
                  y: Number(parseFloat(parent.value).toFixed(1)),
                  nd: national.numerator || 0,
                  dn: national.denominator || 0,
                },
              ],
            };
            chartOptions.series.unshift(seriesObject);
          }
        }
      }

      // Re-adjust yAxis range after adding parent data
      chartOptions.yAxis = this.adjustYAxisForTargetLines(
        chartOptions.yAxis,
        chartOptions.series,
        {
          nationalTarget: national_target,
          sdgTarget: sdg_target,
          showNational: this.values.target.national,
          showSdg: this.values.target.sdg,
        },
      );

      if (this.values.numdenum === true) {
        chartOptions.tooltip.backgroundColor = 'rgba(255, 255, 255, 1)';
        chartOptions.tooltip.outside = true;
        chartOptions.tooltip.pointFormat
          = `${
            '<span style="font-size:10px; color:black;font-weight:bold;">'
            + '{series.name}:'
            + ' {point.y:.2f}'
            // eslint-disable-next-line indent
          }<br>`
          + '<span style="font-size:10px; color:black;">'
          + '('
          + '{point.nd} '
          + 'of'
          + ' {point.dn}'
          + ')'
          + '</span>';
      }
      this.BarChartOptions = chartOptions;
      this.loading = false;
    },
    async computeNationalND() {
      if (this.values.numdenum === true) {
        const numResponse = await ApiServices.getDataWithPeriod({
          indicator: this.values.indicator.id,
          datasource: this.values.datasource.id,
          period: this.values.year,
          value_type: 6,
          location: this.values.location.id,
        });
        const numeratorData = numResponse.data.results;
        const denumResponse = await ApiServices.getDataWithPeriod({
          indicator: this.values.indicator.id,
          datasource: this.values.datasource.id,
          period: this.values.year,
          value_type: 7,
          location: this.values.location.id,
        });
        const denominatorData = denumResponse.data.results;
        // const denominatorData = await this.dlQuery({
        //   datasource: this.values.datasource.id,
        //   indicator: this.values.indicator.id,
        //   period: this.values.year,
        //   location: this.values.location.id,
        //   value_type: 7, // denominator
        // });
        if (numeratorData.length > 0 || denominatorData.length > 0) {
          return {
            numerator: Number(numeratorData[0]?.value).toLocaleString(),
            denominator: Number(denominatorData[0]?.value).toLocaleString(),
          };
        }
        return {
          numerator: null,
          denominator: null,
        };
      }
      return {
        numerator: null,
        denominator: null,
      };
    },
    async getData(optionsObject) {
      const {
        datasource, indicator, location, year,
      } = optionsObject;
      let locationValue = location;
      if (location.id === 1) {
        locationValue = { level: 3 };
      } else {
        locationValue = { parent: location.id };
      }
      // debugger;
      const data = await this.dlQuery({
        datasource: datasource.id,
        indicator: indicator.id,
        period: year,
        location: locationValue,
        // value_type: 5,
      });

      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }

      // loop through data and parseFloat the value toFixed(1)
      for (let i = 0; i < data.length; i += 1) {
        data[i].value = parseFloat(data[i].value).toFixed(1);
      }

      return data;
    },
    adjustYAxisForTargetLines(yAxis, series, targetConfig) {
      const nextYAxis = { ...yAxis };
      const {
        nationalTarget,
        sdgTarget,
        showNational,
        showSdg,
      } = targetConfig;
      // Collect target values that should be visible
      const targetValues = [];

      if (nationalTarget !== null && showNational) {
        targetValues.push(nationalTarget);
      }

      if (sdgTarget !== null && showSdg) {
        targetValues.push(sdgTarget);
      }

      // Only adjust if we have targets
      if (targetValues.length === 0) {
        return nextYAxis;
      }

      // Get all data values from the chart
      const allDataValues = [];

      if (series) {
        series.forEach((seriesItem) => {
          if (seriesItem.data) {
            seriesItem.data.forEach((point) => {
              if (typeof point === 'object' && typeof point.y === 'number') {
                allDataValues.push(point.y);
              } else if (typeof point === 'number') {
                allDataValues.push(point);
              }
            });
          }
        });
      }

      if (allDataValues.length > 0) {
        const dataMin = Math.min(...allDataValues);
        const dataMax = Math.max(...allDataValues);
        const targetMin = Math.min(...targetValues);
        const targetMax = Math.max(...targetValues);

        // Check if ANY targets are outside data range
        const targetsExceedDataRange = targetMax > dataMax || targetMin < dataMin;

        if (targetsExceedDataRange) {
          // Targets are outside data range - need to adjust range to include both data and targets
          const overallMin = Math.min(dataMin, targetMin);
          const overallMax = Math.max(dataMax, targetMax);

          // Use reasonable padding based on the overall range
          const range = overallMax - overallMin;
          const padding = Math.max(range * 0.05, 1); // 5% padding or minimum 1 unit

          nextYAxis.min = Math.max(0, overallMin - padding);
          nextYAxis.max = overallMax + padding;

          console.log('YAxis adjusted to include targets outside data range:', {
            dataRange: `${dataMin} - ${dataMax}`,
            targetRange: `${targetMin} - ${targetMax}`,
            finalRange: `${nextYAxis.min.toFixed(1)} - ${nextYAxis.max.toFixed(1)}`,
            reason: targetMax > dataMax ? 'Target above data' : 'Target below data',
          });
        } else {
          // Targets are within data range - remove any fixed scaling to let Highcharts auto-scale
          if (nextYAxis.min !== undefined) {
            delete nextYAxis.min;
          }
          if (nextYAxis.max !== undefined) {
            delete nextYAxis.max;
          }

          console.log('YAxis auto-scaling enabled - targets within data range:', {
            dataRange: `${dataMin} - ${dataMax}`,
            targetRange: `${targetMin} - ${targetMax}`,
            message: 'Using Highcharts default scaling',
          });
        }
      } else {
        // No data, only targets - use minimal range around targets
        const targetMin = Math.min(...targetValues);
        const targetMax = Math.max(...targetValues);
        const targetRange = Math.max(targetMax - targetMin, Math.abs(targetMax * 0.2), 10);
        const padding = Math.max(targetRange * 0.1, 2);

        nextYAxis.min = Math.max(0, targetMin - padding);
        nextYAxis.max = targetMax + padding;

        console.log('YAxis adjusted for targets only:', {
          targetValues,
          finalRange: `${nextYAxis.min.toFixed(1)} - ${nextYAxis.max.toFixed(1)}`,
        });
      }
      return nextYAxis;
    },
    handleChartClick(e) {
      const point = e?.point?.name;
      const selectedPlace = this.dlGetLocation({ level: 3 }).filter((val) => val.name === point);
      if (selectedPlace.length !== 0) {
        eventBus.$emit('handleClick', selectedPlace[0]);
      }
      this.level = 3;
    },
    returnToNational() {
      const selectedPlace = this.dlGetLocation({ level: 1 });
      if (selectedPlace.length !== 0) {
        eventBus.$emit('handleClick', selectedPlace[0]);
      }
      this.level = 1;
    },
    setVisualization(vis) {
      this.visualization = vis;
      this.activeToggleButton = vis;
      this.updateValue();
    },
    resolveDisplayText(value, preferredKeys = []) {
      if (value == null) return '';
      if (typeof value === 'string' || typeof value === 'number') return String(value);
      if (Array.isArray(value)) return '';
      if (typeof value === 'object') {
        for (let i = 0; i < preferredKeys.length; i += 1) {
          const key = preferredKeys[i];
          if (typeof value[key] === 'string' || typeof value[key] === 'number') {
            return String(value[key]);
          }
        }
      }
      return '';
    },
    mapDownload(e) {
      if (this.visualization === 'bar') {
        this.downLoadType(e, {
          indicator: this.values.indicator.short_name,
          datasource: this.values.datasource.datasource,
          year: this.values.year,
        });
      } else {
        this.downLoadTypeMap(e, {
          indicator: this.values.indicator.short_name,
          datasource: this.values.datasource.datasource,
          year: this.values.year,
        });
      }
    },
    formatDataToSeriesMapFormat(data) {
      return data?.map((item) => {
        const locationName = this.dlGetLocation(item.location).name;
        // Remove " LGA" suffix for map matching
        const cleanedName = locationName.replace(/ LGA$/i, '');
        return [cleanedName, Number.parseFloat(item.value) || 0];
      });
    },
    formatToHighChartOptionForMap(data, controlPanelObject) {
      const factor = this.dlGetFactor(controlPanelObject.indicator?.factor).display_factor;
      const indicatorText = this.resolveDisplayText(controlPanelObject?.indicator, [
        'short_name',
        'full_name',
        'name',
      ]);
      const datasourceText = this.resolveDisplayText(controlPanelObject?.datasource, [
        'datasource',
        'name',
        'item',
      ]);
      const yearText = this.resolveDisplayText(controlPanelObject?.year);
      const titleText = `${indicatorText}${factor.trim() ? ` (${factor})` : ''}`;

      return {
        title: {
          text: titleText,
          style: {
            fontSize: '13px',
            fontFamily: '"Work Sans", sans-serif',
            fontWeight: 'normal',
          },
        },
        subtitle: {
          text: `${datasourceText} - ${yearText}`,
          style: {
            fontSize: '13px',
            fontFamily: '"Work Sans", sans-serif',
            fontWeight: 'normal',
          },
        },
        colors: ['#114663'],
        colorAxis: {
          min: 0,
          minColor: '#E6E6E6',
          maxColor: '#114663',
        },
        series: [
          {
            //  borderColor: 'white',
            borderWidth: 0,
            name: 'Nigeria',
            data,
          },
        ],
      };
    },
  },
  mounted() {
    const factor = this.dlGetFactor(this.values.indicator?.factor).display_factor;
    const indicatorWithFactor = `${this.indicatorLabel}${factor.trim() ? ` (${factor})` : ''}`;
    this.title = `Distribution Of ${indicatorWithFactor} across the country. Source: ${this.datasourceLabel} ${this.yearLabel}`;
  },
};
</script>
<style lang="scss" scoped>
.sub-title {
  font-size: 14px !important;
}

.btn-outline-primary:not(.active) {
  background-color: white !important;
  color: #348481 !important;
  border-color: #348481 !important;
}

.btn-outline-primary.active {
  background-color: #348481 !important;
  color: white !important;
  border-color: #348481 !important;
}

.summary-btn {
  height: 32px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #b3b3b3;
  border-radius: 50px;
  cursor: pointer;
  margin: 0 5px;

  &:hover {
    border: 1px solid #348481;
  }

  .smart-narrative-icon {
    width: 32px;
    height: 32px;
  }

  &:has(.smart-narrative-icon) {
    border: none;
    width: auto;
    height: auto;
  }
}
</style>
