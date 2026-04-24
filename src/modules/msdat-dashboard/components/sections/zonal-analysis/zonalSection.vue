<template>
  <base-overlay :show="loader" class="main">
    <base-sub-card
      showControls
      v-if="Object.keys(controlPanelProps).length"
      @dropdownTypeSelected="
        downLoadType($event, {
          indicator: indicatorLabel,
          datasource: '',
          year: '',
        })
      "
    >
      <template #title>
        <p class="work-sans mb-0 line-height">
          Distribution of
          <span class="font-weight-bold">{{ indicatorLabel }} </span>across
          <span class="font-weight-bold"> {{ locationLabel }}.</span> Source:
          <span class="font-weight-bold"> {{ datasourceLabel }}</span>
          {{ yearLabel }}
        </p>
      </template>
      <BarChart ref="BaseChart" :title="title"  :categoryLabel="'Location'" :chartOptions="chart" class="barchart" />
    </base-sub-card>
  </base-overlay>
</template>

<script>
import Highcharts from 'highcharts';
import BarChart from '@/components/Barchart/BaseBarChart.vue';
import formatter from '@/modules/msdat-dashboard/mixins/formatter';
import ApiServices from '@/modules/data-layer/services/ApiServices';
import chartDownload from '../../../mixins/chart_download';
import { sortHighchartsDataInObjectFormat } from '../../../mixins/util';

export default {
  name: 'ZonalSectionChart',
  mixins: [chartDownload, formatter],
  data() {
    return {
      // later someone can add the name property
      // so that we can know to the zones as against to searching for the ids
      title: '',
      stateName: null,
      chart: {},
      loader: false,
      states: null,
    };
  },
  components: {
    BarChart,
  },
  props: {
    mapSelectedState: {
      type: String,
    },
    controlPanelProps: {
      type: Object,
      required: true,
    },
    colors: {
      type: [Object, Array],
      required: true,
    },
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
    /**
     * @method computeChartPlotLines is from the
     * @mixin formatter
     */
    formatToHighChart(dataSeries) {
      const displayFactor = this.dlGetFactor(
        this.controlPanelProps.indicator.factor,
        // eslint-disable-next-line
      )?.display_factor || 'Value'; // Add fallback for displayFactor

      // Calculate total data points across all series for responsive width
      let totalDataPoints = 0;
      dataSeries.forEach((series) => {
        totalDataPoints += Array.isArray(series.data) ? series.data.length : 1;
      });

      // Set point width based on data count - thinner bars for fewer points
      let pointWidth = null; // Default: let Highcharts decide
      if (totalDataPoints <= 2) {
        pointWidth = 20; // Very few data points
      } else if (totalDataPoints <= 5) {
        pointWidth = 30; // Few data points
      } else if (totalDataPoints <= 10) {
        pointWidth = 40; // Medium number of points
      }

      this.chart = {
        chart: {
          type: 'column',
          zoomType: 'xy',
        },
        xAxis: {
          type: 'category', // Use category axis for object names
          // Remove min/max - let Highcharts handle category spacing
          labels: {
            rotation: -45, // Rotate labels to prevent overlap if many categories
            style: {
              fontSize: '10px', // Adjust font size if needed
              textOverflow: 'none', // Prevent labels from being cut off (...)
            },
          },
        },
        yAxis: {
          gridLineWidth: 1,
          gridLineColor: '#e6e6e6',
          plotLines: [...this.computeChartPlotLines(this.controlPanelProps)],
          title: {
            text: displayFactor, // Set title directly here
            style: {
              fontSize: '13px',
              fontFamily: '"Work Sans", sans-serif',
            },
          },
        },
        tooltip: {
          // Use pointFormat to display series name, full location name, and value
          // Access the custom 'fullName' property using point.fullName
          pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.fullName} : {point.y}</b><br/>',
          // Use shared tooltip to show all series values for a category on hover
          // shared: true, // Uncomment if you want a shared tooltip
        },
        plotOptions: {
          series: {
            pointWidth, // Dynamic point width based on data count
            dataLabels: {
              enabled: true,
              format: '{y}', // Show value on top of column
              style: {
                fontSize: '10px', // Smaller font for data labels
                textOutline: 'none', // Remove outline for better readability
              },
            },
            // Adjust padding if columns overlap or are too far apart
            // pointPadding: 0.1,
            // groupPadding: 0.2,
          },
          column: {
            borderWidth: 0, // Remove column borders
          },
        },
        series: dataSeries, // dataSeries now contains objects with name, y, fullName
      };
      // yAxis title is already set above
      // this.chart.yAxis.title.text = displayFactor; // Remove this duplicate line
    },

    getZonalDataInHighChartFormat(data) {
      const zonalColors = {
        'North-West': '#5c3819',
        'North-East': '#8ab9bb',
        'North-Central': '#89d880',
        'South-West': '#7d8ade',
        'South-East': '#f872a0',
        'South-South': '#e1e164',
      };
      const zonesSeries = [];
      for (let index = 1; index < this.colors.length; index += 1) {
        const zonal = data.find((item) => item.location === this.colors[index].id);
        const series = this.dlGetLocation(this.colors[index].id);
        if (zonal && series) {
          // Check both exist
          zonesSeries.push({
            name: series.name, // Zone name (used for category axis if needed, and default tooltip)
            y: parseFloat(zonal.value),
            fullName: series.name, // Explicitly add fullName for tooltip consistency
            color: Highcharts.color(zonalColors[series.name]).get(),
          });
        }
      }
      // sort Zonal series data in ascending order (using the correct sorter)
      return zonesSeries.sort(sortHighchartsDataInObjectFormat); // Use object sorter
    },

    filterNonEmptyData(series) {
      return series.filter((item) => {
        console.log(item.name, item.data); // Debugging the `data` value
        return item.data && item.data.length > 0;
      });
    },

    getStateDataAccordingToRegionInHighChartFormat(data) {
      // add this function to a mixin later
      const formatToHighChart = (dataValues) => dataValues.map((item) => {
        const location = this.dlGetLocation(item.location);
        const fullName = location ? location.name : 'Unknown Location'; // Provide a default
        const abbreviatedName = this.getAbbreviatedStateName(fullName);
        return {
          name: abbreviatedName, // For category axis
          y: parseFloat(item.value),
          fullName, // For tooltip
        };
      });

      // already know the zonal levels/parent of all the value
      // index starts at one to skip region data for the series
      const chartSeries = [];
      for (let index = 1; index < this.colors.length; index += 1) {
        const group = data.filter(
          (item) => this.dlGetLocation(item.location)?.parent === this.colors[index].id, // Safe navigation
        );
        const formattedData = formatToHighChart(group);
        // Use the correct sorting function for objects
        const sortedData = formattedData.sort(sortHighchartsDataInObjectFormat);
        const series = this.dlGetLocation(this.colors[index].id);
        if (series) {
          // Check if series (zone) exists
          chartSeries.push({
            color: this.colors[index].color,
            name: series.name, // Zone name
            data: sortedData, // Array of {name: 'ABR', y: ..., fullName: ...} objectss
          });
        }
      }
      // console.log(chartSeries, 'chartseries')
      return chartSeries;
    },

    getAbbreviatedStateName(stateName) {
      const stateAbbreviations = {
        Abia: 'ABI',
        Adamawa: 'ADA',
        'Akwa Ibom': 'AKW',
        Anambra: 'ANB',
        Bauchi: 'BAU',
        Bayelsa: 'BAY',
        Benue: 'BEN',
        Borno: 'BOR',
        'Cross River': 'CRS',
        Delta: 'DEL',
        Ebonyi: 'EBO',
        Edo: 'EDO',
        Ekiti: 'EKI',
        Enugu: 'ENU',
        FCT: 'FCT',
        Gombe: 'GOM',
        Imo: 'IMO',
        Jigawa: 'JIG',
        Kaduna: 'KAD',
        Kano: 'KAN',
        Katsina: 'KAT',
        Kebbi: 'KEB',
        Kogi: 'KOG',
        Kwara: 'KWA',
        Lagos: 'LAG',
        Nasarawa: 'NAS',
        Niger: 'NIG',
        Ogun: 'OGU',
        Ondo: 'OND',
        Osun: 'OSU',
        Oyo: 'OYO',
        Plateau: 'PLA',
        Rivers: 'RIV',
        Sokoto: 'SOK',
        Taraba: 'TAR',
        Yobe: 'YOB',
        Zamfara: 'ZAM',
      };
      return stateAbbreviations[stateName] || stateName;
    },
  },
  watch: {
    controlPanelProps: {
      async handler(val) {
        this.chart = {};
        this.loader = true;
        const zonalResponse = await ApiServices.getZonalData({
          indicator: val.indicator.id,
          datasource: val.datasource.id,
          period: val.year,
        });
        const data = zonalResponse.data.results;

        // const data = await this.dlQuery({
        //   indicator: val.indicator.id,
        //   datasource: val.datasource.id,
        //   period: val.year,
        // });

        if (data && data.length > 0) {
          // Check data is not null/undefined
          if (val.location.id !== 1) {
            // State/LGA level view
            const filteredLGADataForState = data.filter(
              (item) => this.dlGetLocation(item.location)?.parent === val.location.id, // Safe navigation
            );

            const formattedData = filteredLGADataForState.map((item) => {
              const location = this.dlGetLocation(item.location);
              const fullName = location ? location.name : 'Unknown LGA'; // Default for LGA
              return {
                name: fullName, // Using full name for LGA axis label for clarity
                y: parseFloat(item.value),
                fullName, // Full name for tooltip
              };
            });

            const chartSeries = [];
            // Use the correct sorting function for objects
            const sortedData = formattedData.sort(sortHighchartsDataInObjectFormat);

            const stateObject = this.dlGetLocation(val.location.id);
            const stateData = data.find((item) => item.location === val.location.id);
            const zoneColorObj = this.colors.find((item2) => item2.id === stateObject?.parent); // Safe navigation

            // Prepend state-level data point if available
            if (stateObject && stateData && zoneColorObj) {
              const stateFullName = stateObject.name;
              const stateAbbreviatedName = this.getAbbreviatedStateName(stateFullName);
              sortedData.unshift({
                name: stateAbbreviatedName, // Abbreviated name for axis consistency with national view
                y: parseFloat(stateData.value),
                fullName: stateFullName, // Full name for tooltip
                color: zoneColorObj.color, // Apply color directly to the point
              });

              chartSeries.push({
                color: zoneColorObj.color, // Series color remains the zone color
                name: stateFullName, // Series name is the state name
                data: sortedData,
              });
            } else if (stateObject) {
              // Handle case where state data or zone color might be missing but we still want to show LGAs
              chartSeries.push({
                color: '#cccccc', // Example default color
                name: stateObject.name,
                data: sortedData, // Still show sorted LGAs
              });
            } else {
              // Handle case where stateObject itself is missing
              console.warn('Could not find state object for ID:', val.location.id);
              // Optionally push an empty series or handle as error
            }

            this.formatToHighChart(chartSeries);
          } else {
            // National/Zonal level view
            const chartSeries = this.getStateDataAccordingToRegionInHighChartFormat(data); // Returns objects {name: 'ABR', y: ..., fullName: ...}
            const zonalSeries = this.getZonalDataInHighChartFormat(data); // Returns objects {name: 'Zone', y: ..., fullName: ..., color: ...}

            const national = data.find((item) => item.location === 1);
            if (national) {
              // Check if national data exists
              zonalSeries.unshift({
                name: 'Nigeria', // For axis/default tooltip
                y: parseFloat(national.value),
                fullName: 'Nigeria', // Explicit fullName
                color: Highcharts.color('#000000').get(),
              });
            }

            const zonalZee = {
              // This series groups the National + Zonal columns
              color: Highcharts.color('#000000').get(), // Default/base color for this series group
              name: 'Nigeria', // More descriptive series name
              data: zonalSeries, // Data points are {name: 'Zone/Nigeria', y: ..., fullName: ..., color: ...}
            };

            const newChart = [];
            chartSeries.forEach((item) => {
              // item is { color: zoneColor, name: zoneName, data: [{name: 'ABR', y: ..., fullName: ...}, ...] }
              const zonalP = zonalZee?.data.find((element) => element.color === item.color); // Find corresponding zone data point by color
              if (zonalP !== undefined) {
                // Prepend the zone data point to the state data array
                item.data.unshift({
                  name: zonalP.name, // Zone name for axis category
                  y: zonalP.y,
                  fullName: zonalP.fullName, // Zone name for tooltip
                  color: zonalP.color, // Use the zone's specific color for this point
                });
                newChart.push(item);
              } else {
                // If zone data point not found (e.g., color mismatch), still add the state series
                console.warn('Could not find matching zone data for series:', item.name);
                newChart.push(item);
              }
            });

            // Add the national/zonal series itself as the first series
            newChart.unshift(zonalZee);

            const filteredSeries = this.filterNonEmptyData(newChart);
            this.formatToHighChart(filteredSeries);
          }
        } else {
          console.warn('No data received from dlQuery for:', val);
          this.chart = {}; // Clear chart if no data
        }
        this.loader = false;
      },
      deep: true,
      immediate: true,
    },
  },

  mounted() {
    this.title = ` Distribution of ${this.indicatorLabel} across the zones in the country. Source: ${this.datasourceLabel} ${this.yearLabel}`;
  },
};
</script>

<style scoped>
.barchart {
  height: 49.5vh;
}
</style>
