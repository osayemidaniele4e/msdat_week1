<template>
  <div class="container-fluid" style="max-height: 100vh; overflow: auto">
    <div class="container d-flex align-items-center justify-content-center flex-column p-5">
      <h4 class="mb-3">MSDAT Intelligent Indicator Search</h4>
      <form class="input-group w-75 shadow" @submit.prevent="handleSearch">
        <input
          v-model="search"
          type="text"
          class="form-control border-0"
          placeholder="Search an indicator ..."
        />
        <button class="btn input-group-append" type="submit" :disabled="isLoading">
          <b-icon icon="search" aria-hidden="true"></b-icon>
        </button>
      </form>
    </div>
     <div class="loader" v-if="isLoading">
      <Theloader />
    </div>
    <div class="w-75 m-auto">
      <Barchart v-if="!isLoading" :optionsArray="dataArray" :details="[dataSourceName, indicatorName, year]" />
    </div>
  </div>
</template>

<script>
import { uniq } from 'lodash';
import Barchart from '../components/Barchart.vue';
import Services from '../Service';
import Theloader from '../components/theLoader.vue';

export default {
  name: 'IndicatorSearch',
  components: {
    Barchart,
    Theloader,
  },
  data() {
    return {
      search: 'mother',
      dataArray: [],
      isLoading: false,
      dataSourceName: '',
      indicatorName: '',
      year: '',
    };
  },
  methods: {
    async handleSearch() {
      this.isLoading = true;
      const newArray = [];
      if (this.search.length > 3) {
        try {
          // step 1: Get the ai indicator
          this.indicators = await Services.getIndicators({
            search: this.search,
          });

          const indicatorYears = await Services.getYearsByIndicatorId(this.indicators[0].id);

          const datasourceArr = await Promise.all(
            this.indicators[0].datasources.map(async (el) => {
              const responseData = await Services.getDataSourceById(el);
              return responseData;
            }),
          );

          // step 3: get the latest years
          const years = indicatorYears.map((el) => el.year);
          const uniqYears = uniq(years?.map((el) => el.split('-')[0]));
          const checkUniqYears = uniqYears.map((el) => (el?.split(' ')?.length > 1 ? el?.split(' ')[1] : el?.split(' ')[0]));

          // sort the checkUniqYears
          const sortedYears = checkUniqYears.sort((a, b) => a - b);
          const latestYear = sortedYears.slice(-1);

          this.indicatorName = this.indicators[0].full_name; // Set the indicator variable
          this.dataSourceName = datasourceArr[0].datasource; // Sett the datasource variable
          this.year = latestYear[0]; // Set the year variable

          // STEP 4: using the datasource array get the values for the indicators by year and datasource
          // await Promise.all(datasourceArr[0].map(async (el) => {
          const resData = await Services.getDataByQuery(
            this.indicators[0].id,
            datasourceArr[0].id,
            latestYear[0],
          );
          await Promise.all(
            resData.map(async (ef) => {
              const locationData = await Services.getLocationById(ef.location);
              console.log(locationData, 'locationData');
              if (locationData?.level === 3 || locationData?.level === 1) {
                newArray.push([locationData.name, Number(ef.value)]);
                this.dataArray = await newArray;
              }
            }),
          );
          this.isLoading = false;
          // }));
        } catch (err) {
          console.log(err);
        } finally {
          this.isLoading = false;
        }
      }
    },
  },
};
</script>

<style scoped>
.loader {
  display: flex;
  justify-content: center;
  position: absolute;
  width: 100%;
  z-index: 999999;
  align-items: center;
  background: rgba(76, 175, 80, 0.3);
  /* height: 67% !important; */
  /* transform: translate(-50%, -50%); */
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
}
.container-fluid {
  height: 100vh;
  color: green;
  background-color: #cee4e9;
  flex-direction: column;
}
.form-control {
  width: 93%;
}
.b-icon {
  color: #cee4e9;
  font-size: 20px;
  font-weight: 700;
}
.btn {
  background-color: green;
  align-items: center;
  justify-content: center;
  width: 7%;
}
</style>
