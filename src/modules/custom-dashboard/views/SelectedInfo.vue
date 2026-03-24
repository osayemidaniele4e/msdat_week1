<template>
  <div class="container py-1">
    <div v-if="showLoader" class="loader-container">
      <the-loader />
    </div>

    <div v-else class="row g-4 prefrences-wrapper">
      <!-- INDICATORS -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="filter-card">
          <div class="filter-header">
            <span>INDICATORS</span>
          </div>

          <div v-if="indicatorsLevels.length > 0" class="filter-panel">
            <div
              v-for="(ind, index) in indicatorsLevels.filter(
                (c) => c.parent.isChildSelected === true
              )"
              :key="index"
              class="filter-group"
            >
              <h4 class="group-title">{{ ind.parent.value }}</h4>

              <div class="indicator-list">
                <div
                  v-for="(child, i) in ind.children.filter((c) => c.selected === true)"
                  :key="i"
                  class="indicator-item"
                >
                  {{ child.short_name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DATA SOURCES -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="filter-card">
          <div class="filter-header mb-3">
            <span>DATA SOURCES</span>
          </div>

          <!-- <div class="indicator-list">
            <div v-for="(item, i) in dataSources" :key="i" class="indicator-item">
              {{ item.datasource }}
            </div>
          </div> -->
          <div v-if="filteredDataSources.length" class="filter-panel">
            <div v-for="(das, index) in filteredDataSources" :key="index" class="filter-group">
              <h4 class="group-title">{{ das.parent }}</h4>

              <div class="indicator-list">
                <div
                  v-for="(child, i) in das.children.filter((c) => c.selected)"
                  :key="i"
                  class="indicator-item"
                >
                  {{ child.datasource }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- LEVELS -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="filter-card">
          <div class="filter-header mb-3">
            <span>LEVELS</span>
          </div>

          <div class="indicator-list">
            <div v-for="(item, i) in selectedLevels" :key="i" class="indicator-item">
              {{ item }}
            </div>
          </div>
        </div>
      </div>

      <!-- YEARS -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="filter-card">
          <div class="filter-header mb-3">
            <span>YEARS</span>
          </div>

          <div class="year-grid">
            <span v-for="(year, i) in selectedYears" :key="i" class="year-pill">{{ year }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// eslint-disable-next-line import/extensions
import TheLoader from '../components/Loading/TheLoader2.vue';

export default {
  props: ['indicator', 'dataSource', 'level', 'years'],
  components: {
    TheLoader,
  },
  data() {
    return {
      indicatorGroups: [
        {
          groupName: 'Maternal Health',
          indicators: ['ANC 1 Coverage', 'Skilled Birth Attendance', 'Malaria Mortality Rate'],
        },
        {
          groupName: 'HIV & Treatment',
          indicators: ['ART Coverage'],
        },
        {
          groupName: 'Malaria',
          indicators: ['Malaria Mortality Rate'],
        },
      ],
      indicatorData: [],
    };
  },

  computed: {
    // Load the selected Levels
    indicatorsLevels() {
      return this.$store.getters.getprogramArea;
    },
    // Load the selected datasources
    dataSources() {
      return this.$store.getters.getDataSource;
    },
    showLoader() {
      console.log(this.$store.getters.showloader, '@@@ showLoader');

      return this.$store.getters.showloader;
    },
    selectedLevels() {
      return this.$store.getters.getSelectedLevels;
    },
    selectedYears() {
      return this.$store.getters.selectedYears;
    },
    filteredDataSources() {
      return this.dataSources
        .filter((group) => group.children.some((c) => c.selected))
        .map((group) => ({
          ...group,
          children: group.children.filter((c) => c.selected),
        }));
    },
  },
};
</script>
<style>
.filter-card {
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 20px;

  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  padding: 10px;

  transition: box-shadow 0.3s ease;
}

.filter-card:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.filter-header {
  background-color: #035c6e;
  color: #fff;
  padding: 10px;
  border-radius: 5px 5px 0 0;
  font-size: 14px;
  font-weight: bold;
}

.year-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.year-pill {
  background-color: #f8fafc;
  border-radius: 10px;
  padding: 5px 10px;
  text-align: center;
  font-size: 13px;
  border: 1px solid #e2e8f0;
}

.year-pill:hover {
  background-color: #e0f2fe;
  border-color: #38bdf8;
  color: #0369a1;
}

.filter-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: #ffffff;
  padding: 1rem;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  max-width: 420px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.group-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background-color: #3f8994;
  padding: 4px;
  border-radius: 4px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.indicator-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.indicator-item {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 0.45rem 0.9rem;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.indicator-item:hover {
  background: #e0f2fe;
  border-color: #38bdf8;
  color: #0369a1;
}

.indicator-item.active {
  background: #0ea5e9;
  border-color: #0ea5e9;
  color: white;
  box-shadow: 0 6px 18px rgba(14, 165, 233, 0.35);
}
</style>
