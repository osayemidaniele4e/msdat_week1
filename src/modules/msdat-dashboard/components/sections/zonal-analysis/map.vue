<template>
  <div class="container">
    <base-overlay :show="loader">
      <base-sub-card
        v-if="Object.keys(controlPanelProps).length"
        showControls
        @dropdownTypeSelected="
          downLoadTypeMap($event, {
            indicator: indicatorLabel,
            datasource: datasourceLabel,
            year: yearLabel,
          })
        "
      >
        <template #title>
          <p class="work-sans mb-0 line-height">
            Distribution of
            <span class="font-weight-bold"> {{ indicatorLabel }} </span
            >across
            <span class="font-weight-bold"> {{ locationLabel }}.</span> Source:
            <span class="font-weight-bold">
              {{ datasourceLabel }}
              {{ yearLabel }}</span
            >
          </p>
        </template>
        <div id="zonalMapComponent" class="col-12 position-relative">
          <button
            title="Back to National"
            @click="returnToNational"
            v-if="level === 4"
            class="bg-primary font-weight-bold"
          >
            <b-icon icon="chevron-left" />
            &nbsp;Back to National
          </button>
          <button
            title="Back to National"
            @click="returnToNational"
            v-if="showBackButton"
            class="bg-primary font-weight-bold"
          >
            <b-icon icon="chevron-left" />
            &nbsp;Back to National
          </button>
          <button
            title="Back to Zonal "
            @click="returnToZonal"
            v-if="level === 3"
            class="bg-primary font-weight-bold"
          >
            <b-icon icon="chevron-left" />
            &nbsp;Back to Zonal
          </button>
          <BaseMap
            ref="BaseMap"
            :title="title"
            :mapObject="chart"
            :level="level"
            :lgaState="stateName"
            :categoryLabel="'Location'"
            :watermarkPosition="{ x: '2%', y: '2%', textXPercent: 2, textYPercent: 7 }"
          />

          <NoAvailableData
            v-if="showNoAvailableData"
            class="position-absolute"
            style="top: 9%; width: 50%; left: 25%"
          />
        </div>
      </base-sub-card>
    </base-overlay>
    <div class="py-3">
      <div v-if="shovViz" class="d-flex">
        <div class="visualization">
          <img @click="switchToState" src="../../../../../assets/img/stateMap.png" alt="" />
          <div @click="switchToState" class="btn-switch">Switch to State</div>
        </div>
        <div class="visualization">
          <img @click="switchToZonal" src="../../../../../assets/img/Zones.svg" alt="" />
          <div @click="switchToZonal" class="btn-switch">Switch to Zonal</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseMap from '@/components/maps/BaseMap.vue';
import { eventBus } from '@/main';
import ApiServices from '@/modules/data-layer/services/ApiServices';
import chartDownload from '../../../mixins/chart_download';
import NoAvailableData from '../../NoData2.vue';
import { sortHighChartDataFormat } from '../../../mixins/util';

export default {
  mixins: [chartDownload],
  props: {
    controlPanelProps: {
      type: Object,
    },
    colors: {
      type: [Object, Array],
      required: true,
    },
    categoryLabel: {
      type: String,
      default: 'Category',
    },
  },
  components: {
    BaseMap,
    NoAvailableData,
  },
  data() {
    return {
      title: '',
      chart: {},
      loader: false,
      level: 1,
      zone: 2,
      stateName: 'Nigeria',
      showNoAvailableData: false,
      stateData: [],
      selectedState: null,
      showBackButton: false,
      shovViz: false,
      allData: [],
      zonalObj: null,
    };
  },
  computed: {
    indicatorLabel() {
      return this.resolveDisplayText(this.controlPanelProps?.indicator, [
        'full_name',
        'short_name',
        'name',
      ]);
    },
    locationLabel() {
      return this.resolveDisplayText(this.controlPanelProps?.location, ['name']);
    },
    datasourceLabel() {
      return this.resolveDisplayText(this.controlPanelProps?.datasource, [
        'datasource',
        'name',
        'item',
      ]);
    },
    yearLabel() {
      return this.resolveDisplayText(this.controlPanelProps?.year);
    },
  },
  methods: {
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
    returnToNational() {
      const selectedPlace = this.dlGetLocation({ level: 1 });
      if (selectedPlace.length !== 0) {
        eventBus.$emit('handleClick', selectedPlace[0]);
      }
    },
    returnToZonal() {
      const selectedPlace = this.dlGetLocation({ level: 2 });
      // check if the selectedPlace is an array, if it is filter it by this.zone and then emit the first item item.id === this.controlPanelProps.location.id
      if (Array.isArray(selectedPlace)) {
        const selectedPlace2 = selectedPlace.filter(
          (item) => item.id === this.controlPanelProps.location.parent,
        );
        if (selectedPlace2.length !== 0) {
          eventBus.$emit('handleClick', selectedPlace2[0]);
        }
      }
    },

    updatedSeries() {
      return this.stateData.map((region) => {
        // Check if the region contains the selected state
        const containsSelectedState = region.data.some(([state]) => state === this.selectedState);
        return {
          ...region,
          // Change color to grey if region does not contain the selected state
          color: containsSelectedState ? region.color : '#808080', // Grey color
        };
      });
    },
    switchToZonal() {
      const formatToHighChart = (dataValues) => dataValues.map((item) => [this.dlGetLocation(item.location).name, parseFloat(item.value)]);

      const chartSeries = [];

      for (let index = 0; index < this.colors.length; index += 1) {
        const group = this.allData?.filter(
          (item) => this.dlGetLocation(item.location).parent === this.colors[index].id
        );

        const { color } = this.colors.find((item) => item.id === this.colors[index].id);
        const formattedData = formatToHighChart(group);
        const sortedData = formattedData.sort(sortHighChartDataFormat);
        const series = this.dlGetLocation(this.colors[index].id);

        chartSeries.push({
          color,
          name: series.name,
          data: sortedData,
        });

        /**
         * Function no fully functional
         * ! Need to fix the issue
         */
        for (let i = 0; i < chartSeries.length; i += 1) {
          if (chartSeries[i].data.length === 0) {
            // this.showNoAvailableData = true;
          } else {
            this.showNoAvailableData = false;
          }
        }
      }

      const filteredSeries = chartSeries.filter((item) => item.data.length > 0);
      const temp = [];

      const zonalChatSerries = filteredSeries[0];
      temp.push(zonalChatSerries);
      this.stateData = temp;

      this.showBackButton = false;
      const groupP = this.allData.filter((item) => this.dlGetLocation(item.location).parent === 1);
      if (groupP.length === 0) {
        this.showNoAvailableData = true;
        this.chart = {
          series: [],
        };
        this.loader = false;
        return;
      }

      this.showNoAvailableData = false;
      const zData = groupP.map((item) => ({
        color: this.colors.find((item2) => item2.id === item.location).color,
        name: this.dlGetLocation(item.location).name,
        data: [[this.dlGetLocation(item.location).name, parseFloat(item.value)]],
      }));

      this.chart = {
        series: zData,
      };
      // this.title = `Distribution of ${val.indicator.full_name} Across ${this.controlPanelProps.location.name}`;
      this.level = 2;
      this.stateName = 'Nigeria';
    },
    switchToState() {
      const formatToHighChart = (dataValues) => dataValues.map((item) => [this.dlGetLocation(item.location).name, parseFloat(item.value)]);

      const chartSeries = [];

      for (let index = 0; index < this.colors.length; index += 1) {
        const group = this.allData?.filter(
          (item) => this.dlGetLocation(item.location).parent === this.colors[index].id
        );

        const { color } = this.colors.find((item) => item.id === this.colors[index].id);
        const formattedData = formatToHighChart(group);
        const sortedData = formattedData.sort(sortHighChartDataFormat);
        const series = this.dlGetLocation(this.colors[index].id);

        chartSeries.push({
          color,
          name: series.name,
          data: sortedData,
        });

        /**
         * Function no fully functional
         * ! Need to fix the issue
         */
        for (let i = 0; i < chartSeries.length; i += 1) {
          if (chartSeries[i].data.length === 0) {
            // this.showNoAvailableData = true;
          } else {
            this.showNoAvailableData = false;
          }
        }
      }

      this.showBackButton = false;
      // this.stateName = stateObject.name; // Please always change the state name before
      // changing the level else you would get an error
      this.level = 1;
      // this.chart = {
      //   series: chartSeries,
      // };

      // Modify the chartSeries to exclude "Nigeria" if it exists
      const chartSeriesWithoutNigeria = chartSeries.filter((item) => item.name !== 'Nigeria');
      console.log(chartSeriesWithoutNigeria, 'chartSeriesWithoutNigeria');

      this.chart = {
        series: chartSeriesWithoutNigeria,
      };
    },
  },

  watch: {
    controlPanelProps: {
      async handler(val) {
        this.loader = true;

        const zonalResponse = await ApiServices.getZonalData({
          indicator: val.indicator.id,
          datasource: val.datasource.id,
          period: val.year,
        });
        const data = zonalResponse.data.results;
        this.allData = data;
        if (data.length) {
          this.shovViz = true;
        } else {
          this.shovViz = false;
        }

        this.selectedState = val.location.name;

        const stateObject = this.dlGetLocation(val.location.id);
        this.zonalObj = this.dlGetLocation(val.location.id);
        // console.log(specificData, 'filteredLGADataForState 4');

        // PLOT 1ST MAP AS ZOANL
        if (stateObject.level === 1) {
          const formatToHighChart = (dataValues) => dataValues.map((item) => [
            this.dlGetLocation(item.location).name,
            parseFloat(item.value),
          ]);

          const chartSeries = [];

          for (let index = 0; index < this.colors.length; index += 1) {
            const group = data?.filter(
              (item) => this.dlGetLocation(item.location).parent === this.colors[index].id
            );

            const { color } = this.colors.find((item) => item.id === this.colors[index].id);
            const formattedData = formatToHighChart(group);
            const sortedData = formattedData.sort(sortHighChartDataFormat);
            const series = this.dlGetLocation(this.colors[index].id);

            chartSeries.push({
              color,
              name: series.name,
              data: sortedData,
              dataLabels: {
                enabled: true,
                format: '{point.name}<br>{point.value}', // show location name + value
                style: {
                  fontSize: '8px',
                  fontWeight: 'bold',
                  textOutline: 'none',
                },
              },
            });

            /**
             * Function no fully functional
             * ! Need to fix the issue
             */
            for (let i = 0; i < chartSeries.length; i += 1) {
              if (chartSeries[i].data.length === 0) {
                // this.showNoAvailableData = true;
              } else {
                this.showNoAvailableData = false;
              }
            }
          }

          const filteredSeries = chartSeries.filter((item) => item.data.length > 0);
          this.stateData = filteredSeries;

          if (filteredSeries.length === 0) {
            this.showBackButton = false;
            const groupP = data.filter((item) => this.dlGetLocation(item.location).parent === 1);

            if (groupP.length === 0) {
              this.showNoAvailableData = true;
              this.chart = {
                series: [],
              };
              this.loader = false;
              return;
            }

            this.showNoAvailableData = false;
            const zData = groupP.map((item) => ({
              color: this.colors.find((item2) => item2.id === item.location).color,
              name: this.dlGetLocation(item.location).name,
              data: [[this.dlGetLocation(item.location).name, parseFloat(item.value)]],
              dataLabels: {
                enabled: true,
                format: '{point.name}: {point.value}', // show location name + value
                style: {
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textOutline: 'none',
                },
              },
            }));

            this.chart = {
              series: zData,
            };
            this.title = `Distribution of ${this.indicatorLabel} Across ${this.locationLabel}`;
            this.level = 2;
            this.stateName = 'Nigeria';
          } else {
            this.showBackButton = false;
            this.stateName = stateObject.name; // Please always change the state name before
            // changing the level else you would get an error
            this.level = 1;
            // this.chart = {
            //   series: chartSeries,
            // };

            // Modify the chartSeries to exclude "Nigeria" if it exists
            const chartSeriesWithoutNigeria = chartSeries.filter((item) => item.name !== 'Nigeria');

            this.chart = {
              series: chartSeriesWithoutNigeria,
            };
          }
        }
        // PLOT 2ND MAP AS STATE
        if (stateObject.level === 2) {
          this.showBackButton = false;
          this.zone = stateObject.id;
          const filteredStateDataForZone = data.filter(
            (item) => this.dlGetLocation(item.location).parent === stateObject.id,
          );
          if (filteredStateDataForZone.length === 0) {
            this.showNoAvailableData = true;
          } else {
            this.showNoAvailableData = false;
          }

          const sData = filteredStateDataForZone.map((item) => ({
            color: this.colors.find((item2) => item2.id === stateObject.id).color,
            name: this.dlGetLocation(item.location).name,
            data: [[this.dlGetLocation(item.location).name, parseFloat(item.value)]],
          }));

          const stateData = data.find((item) => item.location === val.location.id);

          sData.unshift({
            name: stateObject.name,
            y: parseFloat(stateData?.value),
            color: this.colors.find((item) => item.id === stateObject.id).color,
          });
          this.stateName = stateObject?.name;
          this.level = 4; // for tracking purposes
          this.chart = {
            series: sData,
          };
        }
        // PLOT 3RD MAP AS LGA
        if (stateObject.level === 3) {
          this.showBackButton = false;

          const filteredLGADataForState = data.filter(
            (item) => this.dlGetLocation(item.location).parent === stateObject.id,
          );

          if (filteredLGADataForState.length === 0) {
            this.showNoAvailableData = true;
            this.loader = false;
          } else {
            this.showNoAvailableData = false;
          }

          if (filteredLGADataForState.length === 0) {
            this.showBackButton = true;
            this.showNoAvailableData = true;
            this.loader = false;
            this.chart = {
              series: [],
            };
          } else {
            this.showBackButton = false;
            const formatToHighChart = (dataValues) => dataValues.map((item) => [
              this.dlGetLocation(item.location).name,
              parseFloat(item.value),
            ]);
            const chartSeries = [];
            const formattedData = formatToHighChart(filteredLGADataForState);
            const sortedData = formattedData.sort(sortHighChartDataFormat);
            // remove LGAs sting from LGA name cause mapdata does not support the format
            sortedData.forEach((item) => {
              const newItem = item;
              newItem[0] = newItem[0].split('LGA')[0].trim();
              return newItem;
            });

            const stateData = data.find((item) => item.location === val.location.id);

            sortedData.unshift({
              name: stateObject.name,
              y: parseFloat(stateData?.value),
              color: this.colors[0].color,
            });
            chartSeries.push({
              color: this.colors.find((item) => item.id === stateObject.parent).color,
              name: stateObject.name,
              data: sortedData,
            });
            this.stateName = stateObject.name; // Please always change the state name before
            // changing the level else you would get an error
            this.level = 3;
            this.chart = {
              series: chartSeries,
            };
          }
        }
        this.loader = false;
      },
      deep: true,
      immediate: true,
    },
  },

  mounted() {
    this.title = ` Distribution of ${this.indicatorLabel} across ${this.locationLabel}. Source: ${this.datasourceLabel} ${this.yearLabel}`;
  },
};
</script>
<style scoped>
.visualization {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.visualization img {
  width: 50px;
  height: 50px;
  cursor: pointer;
  margin: 0 5px;
}

.visualization .btn-switch {
  font-size: 12px;
  background-color: #007d53;
  color: white;
  padding: 4px 10px;
  margin-right: 2px;
  border-radius: 4px;
}
</style>
