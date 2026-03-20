<!-- Auther: Ghufran Ahmed v1-->
<!-- Auther: Oluwakolade O v2 with search-->
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
      <b class="selection-header" style="font-size: 13px; font-family: Work Sans"> INDICATOR(S) </b>
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
          placeholder="Search indicators..."
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
          @click="selectAllIndicators"
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
          :class="{ selected: allIndicatorsSelected }"
        >
          {{ allIndicatorsSelected ? 'Deselect All' : 'Select All' }}
        </button>
      </div>
      <div class="selection-wrapper d-flex gap-3">
        <button
          v-for="option in options"
          :key="option.value"
          class="btn btn-selection mr-1"
          :class="{ active: selected === option.value }"
          @click="selected = option.value"
        >
          {{ option.label }}
        </button>
      </div>

      <Card class="scroll">
        <TheLoader v-if="loading" />
        <div v-else>
          <div v-for="(items, idx) in filteredHeading" :key="idx" style="margin-top: 0px">
            <div
              class="program-areas my-2"
              style="background: #f3f3f3; font-size: 13px"
              v-if="items.children.length > 0"
            >
              <input
                type="checkbox"
                :id="items.parent.value"
                @click="
                  toggleAll($event, items.children, items.parent.value, items.parent.selected)
                "
                class="checkbox no-pointer-events"
                :checked="isAllSelected(items.parent)"
              />
              <label
                :for="items.parent.value"
                style="
                  cursor: pointer;
                  font-weight: normal;
                  font-size: 13px;
                  font-family: Work Sans;
                  color: #202020;
                  margin-left: -4px;
                "
              >
                {{ items.parent.value }}
              </label>
            </div>
            <div
              v-for="(item, index) in items.children"
              :key="index"
              class="indicators"
              style="margin-bottom: 3px; font-size: 13px"
            >
              <input
                type="checkbox"
                name="child"
                :id="item.short_name"
                :value="item.short_name"
                :checked="isSelected(item)"
                @click="
                  selectIndicator(
                    $event,
                    items.parent.value,
                    item.id,
                    item.short_name,
                    item.selected
                  )
                "
                class="checkbox no-pointer-events"
              />
              <label
                :for="item.short_name"
                style="
                  cursor: pointer;
                  padding-left: 5px;
                  font-size: 12px;
                  margin-left: -4px;
                  font-family: Work Sans;
                "
              >
                {{ item.short_name }}
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
import apiServices from '@/modules/data-layer/services/ApiServices';

export default {
  props: {
    selectedIndicators: {
      type: Array,
      default: () => [],
    },
    selectedProgramArea: {
      type: String,
      default: null,
    },
  },
  components: {
    Card,
    TheLoader,
  },
  data() {
    return {
      selectedIndicator: [],
      indicators: [],
      item: '',
      // eslint-disable-next-line
      _indicatorId_: null,
      selectedCount: 0,
      indicatorSelected: false,
      AllSelected: false,
      searchTerm: '',
      allIndicatorsSelected: false,
      isContentVisible: true, // New data property for collapse/expand
      allDatasources: [],
      selected: 'manual',
      options: [
        { label: 'Manual Selection', value: 'manual' },
        { label: 'AI Selection', value: 'ai' },
      ],
    };
  },
  computed: {
    loading() {
      return this.$store.getters.Indicatorloading;
    },
    heading() {
      return this.$store.getters.getprogramArea;
    },
    filteredHeading() {
      if (!this.searchTerm.trim()) {
        return this.heading;
      }

      const searchLower = this.searchTerm.toLowerCase();

      return this.heading.map((section) => ({
        parent: { ...section.parent },
        children: section.children.filter((item) =>
          item.short_name.toLowerCase().includes(searchLower)
        ),
      }));
    },
  },
  created() {
    this.loadIndicators();
  },
  methods: {
    // New method for toggling content visibility
    toggleContent() {
      this.isContentVisible = !this.isContentVisible;
    },
    isAllSelected(item) {
      return item.selected;
    },
    selectAllIndicators() {
      this.allIndicatorsSelected = !this.allIndicatorsSelected;
      this.filteredHeading.forEach((section) => {
        this.toggleAll(
          { target: { checked: this.allIndicatorsSelected } },
          section.children,
          section.parent.value
        );
      });
    },
    toggleAll(e, childsArray, parentName) {
      this.AllSelected = e.target.checked;
      if (this.AllSelected === true) {
        this.showList = true;
      } else {
        this.showList = false;
      }
      childsArray.forEach((element) => {
        const child = {
          value: element.short_name,
          id: element.id,
          checked: e.target.checked,
        };
        this.$store.dispatch('loadYears', child);
        this.$store.dispatch('loadCoverageLevels', child);
      });
      this.$store.dispatch('forAllSelectedIndicator', {
        checked: this.AllSelected,
        name: parentName,
        showList: this.showList,
      });
    },
    isSelected(item) {
      return item.selected;
    },
    loadIndicators() {
      this.$store.dispatch('loadIndicators');
    },

    async selectIndicator(e, parentValue, childId, childName) {
      this.indicatorSelected = e.target.checked;
      this.showList = e.target.checked;
      this.$store.dispatch('forSelectedIndicator', {
        checked: this.indicatorSelected,
        id: childId,
        showList: this.showList,
      });

      const indicatorDatasources = await apiServices.getIndicatorDataSources(childId);
      const sources = indicatorDatasources.data.datasources;

      if (e.target.checked) {
        const newItems = sources.map((s) => ({ ...s, child_id: childId }));

        const unique = new Map();
        [...this.allDatasources, ...newItems].forEach((item) => {
          unique.set(item.id, item); // uniqueness only by id
        });

        this.allDatasources = [...unique.values()];
      } else {
        const sourceIds = sources.map((s) => s.id);
        this.allDatasources = this.allDatasources.filter((item) => !sourceIds.includes(item.id));
      }

      const grouped = Object.values(
        this.allDatasources.reduce((acc, item) => {
          if (!acc[item.classification]) {
            acc[item.classification] = { parent: item.classification, children: [] };
          }
          acc[item.classification].children.push(item);
          return acc;
        }, {})
      );

      this.$store.commit('setAllSources', grouped);

      this.$store.dispatch('loadCoverageLevels', {
        id: childId,
        child: childName,
        parent: parentValue,
        checked: e.target.checked,
      });
      this.$store.dispatch('loadYears', {
        id: childId,
        child: childName,
        parent: parentValue,
        checked: e.target.checked,
      });
    },
  },
  watch: {
    selectedIndicators: {
      deep: true,
      handler(newIndicators) {
        this.heading.forEach((section) => {
          section.children.forEach((child) => {
            if (newIndicators.includes(child.short_name)) {
              // Replicate selectIndicator functionality
              this.$store.dispatch('forSelectedIndicator', {
                checked: true,
                id: child.id,
                showList: true,
              });

              this.$store.dispatch('loadCoverageLevels', {
                id: child.id,
                child: child.short_name,
                parent: section.parent.value,
                checked: true,
              });

              this.$store.dispatch('loadYears', {
                id: child.id,
                child: child.short_name,
                parent: section.parent.value,
                checked: true,
              });
              // eslint-disable-next-line
              child.selected = true;
            }
          });
        });
      },
    },
    selectedProgramArea: {
      handler(newProgramArea) {
        if (newProgramArea) {
          // Find the section corresponding to the selected program area
          const matchingSection = this.heading.find(
            (section) => section.parent.value === newProgramArea
          );

          if (matchingSection) {
            // Update the parent's selected state
            matchingSection.parent.selected = true;
          }
        }
      },
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
.transform {
  font-size: 14px;
}
.scroll {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
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
.header-container {
  background-color: #f1f2f7;
  margin: 0px -20px -10px -10px;
}

.header-container:hover {
  background-color: #f1f2f7;
}

.selection-wrapper {
  background: #f5f7fa;
  padding: 4px;
  border-radius: 20px;
  display: inline-flex;
}

.btn-selection {
  border-radius: 10px;
  padding: 6px 16px;
  border: none;
  font-weight: 500;
  background: transparent;
  color: #6c757d;
  transition: all 0.3s ease;
}

.btn-selection:hover {
  background: #e9ecef;
  color: #000;
}

.btn-selection.active {
  background: #3f8994;
  color: #fff;
  box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3);
}
</style>
