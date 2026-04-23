<!-- Auther: Ghufran Ahmed -->

<template>
  <div class="indicator-card">
    <!-- Collapsible Header -->
    <div
      @click="toggleContent"
      class="header-container"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        padding: 10px;
      "
    >
      <b class="selection-header" style="font-size: 13px; font-family: Work Sans">
        DATA SOURCE(S)
      </b>
      <span
        class="transform"
        :style="{
          transform: isContentVisible ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s',
        }"
      >
        ▼
      </span>
    </div>

    <!-- Collapsible Content -->
    <div v-show="isContentVisible" style="transition: all 0.3s ease">
      <!-- Search Input and Select All Button Container -->
      <div class="search-container" style="margin: 20px 0; display: flex; gap: 8px">
        <input
          type="text"
          v-model="searchTerm"
          placeholder="Search data sources..."
          style="
            flex: 1;
            padding: 6px 8px;
            font-size: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: Work Sans;
          "
        />
        <button
          @click="selectAllSources"
          style="
            padding: 0;
            font-size: 12px;
            font-family: Work Sans, sans-serif;
            background: none;
            border: none;
            cursor: pointer;
            color: #4aa0a1;
            text-decoration: none;
            white-space: nowrap;
          "
          :class="{ selected: allSourcesSelected }"
        >
          {{ allSourcesSelected ? 'Deselect All' : 'Select All' }}
        </button>
      </div>

      <Card class="scroll">
        <TheLoader v-if="loading == true" />
        <div v-else>
          <div v-for="(items, idx) in filteredSources" :key="idx" style="margin-top: 0px">
            <div
              class="program-areas"
              style="background: #f3f3f3; font-size: 13px"
              v-if="items.children.length > 0"
            >
              <span
                style="
                  font-weight: normal;
                  font-family: Work Sans;
                  letter-spacing: 0px;
                  color: #202020;
                  padding-left: 13px;
                  padding-top: 5px;
                  font-size: 13px;
                "
              >
                {{ items.parent }}
              </span>
            </div>
            <div
              v-for="(item, index) in items.children"
              :key="index"
              class="indicators col-4"
              style="
                display: inline-block;
                justify-content: space-around;
                font-size: 13px;
                margin: 0px;
              "
            >
              <input
                type="checkbox"
                name=""
                :id="item.datasource"
                :value="item.datasource"
                :checked="isSelected(item)"
                @click="
                  selectSource($event, items.parent.value, item.id, item.datasource, item.selected)
                "
                class="checkbox no-pointer-events"
              />
              <label
                :for="item.datasource"
                style="
                  cursor: pointer;
                  font-size: 10px;
                  padding-left: 5px;
                  font-family: Work Sans;
                  margin-left: -8px;
                "
              >
                {{ item.datasource }}
              </label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import Card from '../../Card.vue';
// eslint-disable-next-line import/extensions
import TheLoader from '../../Loading/TheLoader2';

export default {
  components: {
    Card,
    TheLoader,
  },
  data() {
    return {
      searchTerm: '',
      allSourcesSelected: false,
      DataSourceSelected: false,
      showList: false,
      isContentVisible: true, // New data property for collapse/expand
    };
  },
  computed: {
    loading() {
      return this.$store.getters.Datasourceloading;
    },
    sources() {
      return this.$store.getters.getAllSources;
    },
    filteredSources() {
      if (!this.searchTerm.trim()) {
        return this.sources;
      }

      const searchLower = this.searchTerm.toLowerCase();

      return this.sources.map((section) => ({
        parent: section.parent,
        children: section.children.filter((item) => item.datasource.toLowerCase().includes(searchLower)),
      }));
    },
  },
  created() {
    this.loadDataSource();
  },
  methods: {
    // New method for toggling content visibility
    toggleContent() {
      this.isContentVisible = !this.isContentVisible;
    },
    loadDataSource() {
      this.$store.dispatch('loadDataSource');
    },
    selectAllSources() {
      this.allSourcesSelected = !this.allSourcesSelected;

      this.filteredSources.forEach((section) => {
        section.children.forEach((item) => {
          this.selectSource(
            { target: { checked: this.allSourcesSelected } },
            section.parent,
            item.id,
            item.datasource,
          );
        });
      });
    },
    selectSource(e, parentValue, childId, childName) {
      this.DataSourceSelected = e.target.checked;
      this.showList = e.target.checked;
      this.$store.dispatch('forSelectedDataSource', {
        checked: this.DataSourceSelected,
        id: childId,
        name: childName,
      });
    },
    isSelected(item) {
      return item.selected;
    },
  },
};
</script>

<style scoped>
.indicator-card {
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0px 20px 8px 8px;
  font-family: Work Sans;
}

.checkbox {
  height: 10px;
  margin: 4px;
}

.search-container {
  position: relative;
}

.scroll {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
.transform {
  font-size: 14px;
}
button {
  transition: all 0.2s ease;
}

button:hover {
  background: #e6e6e6;
}

button.selected {
  background: #e0e0e0;
}

/* New styles for collapsible header */
.header-container {
  background-color: #f1f2f7;
  margin: 0px -20px -10px -10px;
}

.header-container:hover {
  background-color: #f1f2f7;
}
</style>
