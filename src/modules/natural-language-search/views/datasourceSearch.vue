<template>
  <div class="cover">
    <Header @clicked="handleChange" :barchart="barchart" :dataSourceName='dataSourceName' :indicatorName = 'indicatorName' :year='year'/>
    <div class=" container pt-5 d-flex align-items-center justidy-content-center" style="max-height: 100vh; overflow: auto">
      <div class="w-75 m-auto">
        <Barchart
          v-if="!isLoading && barchart"
          :optionsArray="dataArray"
          :details="[dataSourceName, indicatorName, year]"
        />
        <StateTable
        v-if="!isLoading && !barchart"
        :optionsArray="dataArray"
        :details="[dataSourceName, indicatorName, year]"
        />
      </div>
       <div class="loader" v-if="isLoading">
        <Theloader />
      </div>
    </div>
  </div>
</template>

<script>
import Header from '../components/Header.vue';
import Barchart from '../components/Barchart.vue';
import StateTable from '../components/stateTable.vue';
import Services from '../Service';
import Theloader from '../components/theLoader.vue';

export default {
  name: 'datasource-search-view',
  components: {
    Barchart,
    Theloader,
    Header,
    StateTable,
  },
  data() {
    return {
      barchart: true,
      dataArray: [],
      isLoading: false,
      dataSourceName: '',
      indicatorName: '',
      year: '',
    };
  },
  methods: {
    handleChange(value) {
      // console.log(value);
      this.barchart = value;
    },
  },
  async mounted() {
    const indicatorId = this.$route.params.indicator;
    const datasourceId = this.$route.params.datasource;
    const period = this.$route.params.period;
    this.year = period;
    this.isLoading = true;
    const newArray = [];
    try {
      // STEP 1 : Get the indicator name by id

      const indicatorFullName = await Services.getIndicatorById(indicatorId);
      this.indicatorName = indicatorFullName.full_name;
      const resData = await Services.getDataByQuery(
        indicatorId,
        datasourceId,
        period,
      );

      // STEP 2: Get the datasource name by id

      const dataSourcFullName = await Services.getDataSourceById(datasourceId);
      this.dataSourceName = dataSourcFullName.datasource;

      // STEP 3: Get location and value data by querying using datasource, indicator, and period.
      await Promise.all(
        resData.map(async (ef) => {
          const locationData = await Services.getLocationById(ef.location);
          if (locationData?.level === 3 || locationData?.level === 1) {
            newArray.push([locationData.name, Number(ef.value)]);
            this.dataArray = await newArray;
          }
        }),
      );
      this.isLoading = false;
    } catch (err) {
      console.log(err);
    } finally {
      this.isLoading = false;
    }
  },
};
</script>

<style>
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
.cover {
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
