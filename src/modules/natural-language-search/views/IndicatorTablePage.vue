<template>
  <div class="container-fluid" style="max-height: 100vh; overflow: auto">
    <div
      class="
        container
        d-flex
        align-items-center
        justify-content-between
        flex-column
        p-5
      "
    >
      <h4 class="mb-3">MSDAT Intelligent Indicator Search</h4>
      <form class="input-group w-75 shadow" @submit.prevent="handleSearch">
        <input
          v-model="search"
          type="text"
          class="form-control border-0"
          placeholder="Search an indicator ..."
        />

        <button
          class="btn input-group-append"
          type="submit"
          :disabled="isLoading"
        >
          <b-icon icon="search" aria-hidden="true"></b-icon>
        </button>
      </form>
    </div>
    <div
        class="
          bg-light
          p-5
          d-flex
          w-50
          m-auto
          align-items-center
          justify-content-center
          h-100
        "
        v-if="isClicked && dataArray.length == 0 && !isLoading"
      >
        <h6 class="text-align-center">No data to display !!!</h6>
      </div>
    <div v-if="isClicked && dataArray.length > 0 && !isLoading">
      <IndicatorTable  :dataArray="dataArray" />
    </div>
     <div class="loader" v-if="isLoading">
      <Theloader />
    </div>
  </div>
</template>

<script>
import { uniqBy } from 'lodash';
import IndicatorTable from '../components/indicatorTable.vue';
import Services from '../Service';
import Theloader from '../components/theLoader.vue';

export default {
  name: 'IndicatorSearch',
  components: {
    IndicatorTable,
    Theloader,
  },
  data() {
    return {
      isClicked: false,
      search: '',
      isLoading: false,
      indicators: [],
      dataArray: [],
      options: [],
    };
  },
  methods: {
    // eslint-disable-next-line consistent-return
    async handleSearch() {
      this.isClicked = true;
      let datasourceArr = [];
      const newArray = [];
      const newSourceArray = [];
      // this.isLoading = true;
      if (this.search.length > 3) {
        try {
          this.isLoading = true;
          // step 1: Get the ai indicator
          this.indicators = await Services.getIndicators({
            search: this.search,
          });
          // step 2: get the datasources and their values using the id in the data object
          Promise.all(
            await this.indicators.map(async (el) => {
            // console.log(el, 'el');
              datasourceArr = await Promise.all(
                await el.datasources.map(async (ds) => {
                  const data = await Services.getDataSourceById(ds);
                  return data;
                }),
              );
              await newArray.push({
                indicatorId: await el.id,
                indicator: await el.full_name,
                datasourceArr: await datasourceArr,
              });
              Promise.all(
                await newArray.map(async (newarr) => {
                  const sources = await Promise.all(
                    await newarr?.datasourceArr.map(async (dataArr) => {
                      const data = await Services.getDataByIndicators(
                        await dataArr.id,
                        await newarr.indicatorId,
                      );
                      const dataValues = await data;
                      const locationArray = await Promise.all(
                        await dataValues?.data?.results.map(async (locationArr) => {
                          const locations = await Services.getLocationById(
                            locationArr.location,
                          );
                          // console.log(locations, 'loc');
                          return [await locations.name, await parseFloat(locationArr.value)];
                        }),
                      );
                      const stateArray = await locationArray;
                      this.options = await stateArray;
                      return {
                        dataValues: await dataValues.data.results,
                        datasourceName: await dataArr.datasource,
                      };
                    }),
                  );
                  await newSourceArray.push({
                    indicatorId: await newarr.indicatorId,
                    indicator: await newarr.indicator,
                    datasourceArr: await sources,
                  });
                  // this.dataArray = uniq(newSourceArray);
                  // eslint-disable-next-line no-sequences
                  const dataArray = await uniqBy(newSourceArray, 'indicatorId');
                  this.dataArray = await dataArray;
                }),
              );
            }),
          );
          this.isLoading = true;
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
