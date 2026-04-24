<template>
  <div class="">
    <!-- <pre>{{ groupLabelStates }}</pre> -->
    <multiselect
      :id="formattedID"
      v-model="selected"
      :options="options"
      :custom-label="renderOptionLabel"
      searchable
      close-on-select
      :allow-empty="allowEmpty"
      :placeholder="placeholder"
      v-bind="effectiveMultiSelectProps"
      selectLabel=""
      data-visted="notVisited"
      deselectLabel=""
      autocomplete="off"
      class="custom-placeholder"
      @open="handleOpen"
      @close="handleClose"
      @search-change="handleSearchChange"
    >
      <span class="text-capitalize" slot="noOptions">{{ NoDataLabel }}</span>

      <template slot="singleLabel" slot-scope="props">
        <span v-tooltip="getOptionLabel(props.option)">
          {{ getOptionLabel(props.option) }}
        </span>
      </template>

      <template slot="option" slot-scope="props">
        <template v-if="isGroupedMode">
          <template v-if="props.option.$groupLabel">
            <span class="overflow-textg" :data-parent="props.option.$groupLabel">
              {{ props.option.$groupLabel }}
              <span
                v-if="isCollapsibleActive"
                class="newGrouplabel"
                :class="{ 'open-caret': groupLabelStates[props.option.$groupLabel] }"
                @click.stop="toggleGroupLabel(props.option.$groupLabel)"
              >
                {{
                  groupLabelStates[props.option.$groupLabel]
                    ? 'Click to collapse Γû▓'
                    : 'Click to expand Γû╝'
                }}
              </span>
            </span>
          </template>
          <template v-if="props.option.item">
            <div
              v-if="!props.option.$groupLabel"
              class="overflow-text"
              :data-child="modifyDataSourceChildLabel(props.option.item)"
            >
              {{ props.option.item }}
            </div>
          </template>
          <template v-else-if="props.option.full_name">
            <div
              v-if="!props.option.$groupLabel"
              class="overflow-text d-flex justify-content-between align-items-center w-100"
              :data-child="props.option.program_area"
            >
              <span
                class="text-truncate pr-2"
                style="flex: 1; min-width: 0"
                v-tooltip="props.option.full_name"
                >{{ props.option.full_name }}</span
              >
              <IndicatorExplanationTooltip
                v-if="props.option.id"
                :indicatorId="props.option.id"
                class="flex-shrink-0"
                @mousedown.native.stop
                @click.native.stop
              />
            </div>
          </template>
        </template>
        <template v-else>
          <div class="overflow-text">
            {{ getOptionLabel(props.option)
            }}<sup v-if="isProjectedYear(props.option)" class="projected-label">projected</sup>
          </div>
        </template>
      </template>
    </multiselect>
  </div>
</template>
<script>
import { mapMutations } from 'vuex';
import IndicatorExplanationTooltip from '@/components/ui-components/IndicatorExplanationTooltip.vue';

export default {
  components: { IndicatorExplanationTooltip },
  data() {
    return {
      allowEmpty: true,
      dummyVariable: false,
      loading: false,
      section: '',
      indicatorId: 7,
      datasourceId: 6,
      groupLabelStates: {},
      groupLabels: {},
      isCollapsibleActive: false,
      isSearchActive: false,
    };
  },
  computed: {
    groupValuesKey() {
      return this.multiSelectProps?.['group-values'];
    },
    groupLabelKey() {
      return this.multiSelectProps?.['group-label'];
    },
    isGroupedMode() {
      if (!this.groupValuesKey || !this.groupLabelKey || !Array.isArray(this.options)) {
        return false;
      }
      return this.options.some(
        (option) =>
          option &&
          typeof option === 'object' &&
          Object.prototype.hasOwnProperty.call(option, this.groupLabelKey) &&
          Array.isArray(option[this.groupValuesKey])
      );
    },
    effectiveMultiSelectProps() {
      if (this.isGroupedMode) {
        return this.multiSelectProps;
      }
      const props = { ...this.multiSelectProps };
      delete props['group-values'];
      delete props['group-label'];
      return props;
    },
    selected: {
      get() {
        return this.value;
      },
      set(val) {
        if (
          val &&
          typeof val === 'object' &&
          val.id !== undefined &&
          val.program_area !== undefined
        ) {
          this.selectedOption = val;
          // this.indicatorId = val.id;
          // this.saveIndicatorToStorage(val.id);
          const item = {
            payload: val,
            entity: 'indicator',
          };
          const indicatorId = val.id;
          const indicatorFirstRelated = val.first_related;
          const indicatorSecondRelated = val.second_related;
          localStorage.setItem('indicatorID', indicatorId);
          localStorage.setItem('indicatorFirstRelated', indicatorFirstRelated);
          localStorage.setItem('indicatorSecondRelated', indicatorSecondRelated);
          this.SET_SELECTED_CONFIG(item);
        } else if (
          val &&
          typeof val === 'object' &&
          val.id !== undefined &&
          val.methodology !== undefined
        ) {
          // this.saveDataSourceToStorage(val.id);
          const item = {
            payload: val,
            entity: 'dataSource',
          };
          this.SET_SELECTED_CONFIG(item);
          const item2 = {
            value: val,
            key: 'datasource',
          };
          this.SET_ZONAL_DATASOURCE(item2);
        } else if (
          val &&
          typeof val !== 'object' &&
          val.id === undefined &&
          val.created_at === undefined
        ) {
          const item = {
            payload: val,
            entity: 'period',
          };

          this.SET_SELECTED_CONFIG(item);
          // this.addQueryParamToUrl();
        } else if (val && val.parent !== undefined) {
          localStorage.setItem('locationId', val.id);
          // this.SET_LOCATION()
        }
        this.$emit('input', val);
      },
    },
    formattedID() {
      if (this.isGroupedMode) {
        if (this.groupLabelKey === 'datasource') {
          return 'groupedSources';
        }

        return this.id;
      }
      return null;
    },
  },
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    id: {
      type: String,
      default: '',
    },
    value: {},
    multiSelectProps: {
      type: Object,
      default: () => ({}),
    },
    NoDataLabel: {
      type: String,
      default: () => 'List is empty',
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  watch: {
    options: {
      async handler(newValue) {
        // this.addQueryParamToUrl();

        this.loading = true;
        if (newValue?.length > 0) {
          if (this.multiSelectProps['preselect-first']) {
            if (this.isGroupedMode) {
              this.selected = this.value == null ? newValue[0][this.groupValuesKey][0] : this.value;
            } else if (newValue.length > 0) {
              const { name } = this.$route.params;
              if (name === 'Demographics') {
                const newArr = this.options.filter(
                  (year) => parseInt(year, 10) < new Date().getFullYear() + 1
                );

                this.selected = this.value == null ? newArr[0] : this.value;
              } else {
                this.selected = this.value == null ? this.options[0] : this.value;
              }
              this.UPDATE_ALL_YEARS(this.options);
              // this was commented out because it updates all the selected year across all section in the multi-source comparison section

              // this.UPDATE_MULTI_YEARS(this.options);
            } else {
              const { name } = this.$route.params;
              if (name === 'Demographics') {
                const date = new Date();
                const year = date.getFullYear() - 1;
                const newArr = newValue.filter(
                  (item) => parseInt(item, 10) < new Date().getFullYear() + 1
                );

                this.selected = this.value == null ? newArr[0] || year.toString() : this.value;
                this.UPDATE_ALL_YEARS(newValue || year.toString());
              } else {
                const date = new Date();
                const year = date.getFullYear() - 1;
                this.selected = this.value == null ? newValue[0] || year.toString() : this.value;
                this.UPDATE_ALL_YEARS(newValue || year.toString());
              }
            }
          }

          /**
           * @description check if the update is for datasource
           * if it is, check if the list is an array,
           * if it is an array check if the previously selected DS is included in the list, if yes select it if not select the first DS from the list.
           * if its not an array, make the object the default selected
           */

          // console.log(newValue, '@newValue');
          // console.log(this.multiSelectProps, '@newValue 1');

          if (this.multiSelectProps?.label === 'datasource') {
            if (Array.isArray(newValue) && newValue?.length > 0) {
              this.UPDATE_ALL_DATASOURCES(newValue);
              const defaultSelected = newValue.find((item) => item?.id === this.selected?.id);
              if (defaultSelected?.id !== undefined) {
                this.selected = {};
                this.selected = defaultSelected;
                return;
              }
              this.selected = {};
              console.log('@@@@@MMMM@@@@ 3', newValue);

              this.selected = await newValue[0];
              this.loading = false;
              return;
            }
            this.selected = {};
            this.loading = false;
            return;
          }
          if (this.multiSelectProps?.key === 'location') {
            if (Array.isArray(newValue) && newValue?.length > 0) {
              const defaultSelected = newValue.find((item) => item?.id === this.selected?.id);
              if (defaultSelected?.id !== undefined) {
                this.selected = {};
                this.selected = defaultSelected;
                return;
              }
              this.selected = {};
              this.selected = await newValue[0];
            }
            // this.selected = {};
            // this.selected = await newValue[0];
          }
          if (Array.isArray(newValue) && newValue?.length > 0 && newValue[0].level !== undefined) {
            const defaultSelected = newValue.find((item) => item?.id === this.selected?.id);
            if (defaultSelected?.id !== undefined) {
              this.selected = {};
              this.selected = defaultSelected;
              return;
            }
            this.selected = {};
            this.selected = await newValue[0];
          }
        }
        this.loading = false;
      },
      deep: true,
      immediate: false,
    },
    selected(newValue) {
      if (newValue && newValue.parent !== undefined) {
        this.setSelectedState(newValue);
      }
    },
  },
  methods: {
    toggleGroupLabel(groupLabel) {
      if (this.isCollapsibleActive) {
        this.$set(this.groupLabelStates, groupLabel, !this.groupLabelStates[groupLabel]);
      }
    },
    // this function is called when the multiselect is opened thereby it checks if collapsible is active and calls the initialCSS function
    handleOpen() {
      this.isCollapsibleActive = true;
      this.resetState();
      this.$nextTick(() => {
        this.initialCSS(this.formattedID);
      });
    },

    // this function is called when the search input is activated thereby it makes the program areas open automaatically when search is active
    handleSearchChange() {
      this.isCollapsibleActive = false;
      this.openAllGroupLabels();

      // Ensure all items with data-child attribute and role="option" are visible
      this.$nextTick(() => {
        const iterable = this.$el.querySelectorAll('[role="option"]');
        iterable.forEach((item) => {
          if (item.querySelector('[data-child]')) {
            // eslint-disable-next-line no-param-reassign
            item.style.display = 'block';
          }
        });
      });
      this.isSearchActive = true;
    },
    resetState() {
      this.isCollapsibleActive = true;
      this.isSearchActive = false;
      this.groupLabelStates = {};
      this.groupLabels = {};
      this.$nextTick(() => {
        const iterable = this.$el.querySelectorAll('[role="option"]');
        iterable.forEach((item) => {
          if (item.querySelector('[data-child]')) {
            // eslint-disable-next-line
            item.style.display = 'none';
          }
        });
      });
    },
    handleClose() {
      this.resetState();
      this.isSearchActive = false;
    },

    openAllGroupLabels() {
      if (this.isGroupedMode) {
        this.groupLabelStates = {};
        this.options
          .filter((option) => option.$groupLabel)
          .forEach((option) => {
            this.$set(this.groupLabelStates, option.$groupLabel, true);
          });
      }
    },
    ...mapMutations('MSDAT_STORE', [
      'SET_SELECTED_CONFIG',
      'UPDATE_ALL_DATASOURCES',
      'UPDATE_ALL_YEARS',
      'UPDATE_MULTI_YEARS',
      'setSelectedState',
      'SET_LOCATION',
      'SET_ZONAL_DATASOURCE',
    ]),
    modifyDataSourceChildLabel(tag) {
      const tempArray = tag.split(' ');
      tempArray.pop();
      for (let i = 0; i < tempArray.length; i++) {
        tempArray[i] = tempArray[i][0].toUpperCase() + tempArray[i].substr(1);
      }
      return tempArray.join(' ');
    },
    formatYear(option) {
      const year = parseInt(option, 10);
      const currentYear = new Date().getFullYear();
      return year > currentYear ? `${option}` : option;
    },
    isProjectedYear(option) {
      // Only show projected label on Demographics dashboard year dropdown
      const { name } = this.$route.params;
      if (name !== 'Demographics') {
        return false;
      }
      // Only apply to year dropdown (placeholder is 'Select year')
      if (this.placeholder !== 'Select year') {
        return false;
      }
      // Check if option is a year string/number greater than current year
      if (typeof option === 'string' || typeof option === 'number') {
        const year = parseInt(option, 10);
        const currentYear = new Date().getFullYear();
        return !Number.isNaN(year) && year > currentYear;
      }
      return false;
    },
    getOptionLabel(option) {
      if (typeof option === 'string') {
        return this.formatYear(option);
      }
      if (option == null) {
        return '';
      }
      if (typeof option !== 'object') {
        return String(option);
      }
      if (option.item) {
        return option.item;
      }
      if (option.datasource) {
        return option.datasource;
      }
      if (option.full_name) {
        return option.full_name;
      }
      if (option.short_name) {
        return option.short_name;
      }
      if (option.name) {
        return option.name;
      }
      if (option.value_type) {
        return option.value_type;
      }
      return '';
    },
    renderOptionLabel(option) {
      return this.getOptionLabel(option);
    },

    /**
     * This method is called when a program area title
     * is clicked, handles the show and hide of its
     * child nodes and also the dropdown caret rotation
     */
    async pickProgramArea(event) {
      if (!this.isCollapsibleActive) return;

      this.loading = true;
      event.preventDefault();
      event.stopPropagation();
      if (event.type === 'click') {
        const parent = event.target?.children[0]?.children[0]?.dataset?.parent;
        const all = Array.from(event.target?.parentNode?.children);
        all.forEach(async (element) => {
          const child = await element?.children[0]?.children[0]?.dataset?.child;
          const tempParent = await element?.children[0]?.children[0]?.dataset?.parent;
          if (parent === child) {
            if (element.style.display === 'none') {
              // eslint-disable-next-line no-param-reassign
              element.style.display = 'block';
              this.$set(this.groupLabelStates, parent, true);
              // eslint-disable-next-line no-unused-expressions
              element?.children[0]?.children[0]?.classList.toggle('open-caret');
            } else {
              // eslint-disable-next-line no-param-reassign
              element.style.display = 'none';
              this.$set(this.groupLabelStates, parent, false);
            }
          }
          if (parent === tempParent) {
            // eslint-disable-next-line no-unused-expressions
            element?.children[0]?.children[0]?.children[0]?.classList.toggle('open-caret');
          }
          if (parent && !this.groupLabels[parent]) {
            this.$set(this.groupLabels, parent, true);
          }
        });
      }
      this.loading = false;
    },
    /**
     *  This methods acts only on multiselects having
     *  grouped options like the indicator multiselects.
     *  It makes this distinction based on the prop value
     *  @var multiselectProps, its "group-value" property.
     *
     */
    initialCSS(multiselectID) {
      this.loading = true;
      if (this.isGroupedMode) {
        const specificPart = document.querySelector(`input#${multiselectID}`);
        if (this.options?.length !== 0 && specificPart) {
          const iterable = specificPart.parentNode.nextElementSibling.children[0]?.children;
          if (iterable) {
            Array.from(iterable).forEach((element) => {
              if (element.children[0]?.children[0]?.dataset.child) {
                if (!this.isSearchActive) {
                  // eslint-disable-next-line
                  element.style.display = 'none';
                }
              } else {
                element.removeEventListener('click', this.pickProgramArea);
                element.addEventListener('click', this.pickProgramArea);
              }
            });
          }
          specificPart.parentElement.parentElement.setAttribute('data-visted', 'visited');
        }
      }
      this.loading = false;
    },
    // saveIndicatorToStorage(item) {
    //   localStorage.setItem('indicatorId', item);
    // },
    // saveDataSourceToStorage(item) {
    //   localStorage.setItem('datasourceId', item);
    // },
    // addQueryParamToUrl() {
    //   const paramName = 'indicatorId';
    //   const param2Name = 'datasourceId';

    //   const savedIndicatorId = localStorage.getItem('indicatorId');
    //   const savedDataSourceId = localStorage.getItem('datasourceId');

    //   // console.log(savedIndicatorId, 'savedIndicatorId');

    //   // Get the current URL and parse its query parameters
    //   const url = new URL(window.location.href);
    //   const searchParams = new URLSearchParams(url.search);

    //   // Add or update the query parameter
    //   searchParams.set(paramName, savedIndicatorId);

    //   // Add or update the second query parameter
    //   searchParams.set(param2Name, savedDataSourceId);

    //   // Modify the URL without navigating using replaceState
    //   window.history.replaceState(null, '', `${url.pathname}?${searchParams.toString()}`);

    //   // Now the URL has the new parameter, but you stay on the same page
    // },
  },
  mounted() {
    // console.log(this.options[0], 'Options');
  },
};
</script>
<style lang="scss">
.down-caret {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 5px 5px 0 5px;
  border-color: #58af5f transparent transparent transparent;
  top: 13px;
  right: 5% !important;
  position: absolute;
  transform: rotate(0deg);
  transition: all 0.25s ease-in;
  cursor: pointer;
}
.newGrouplabel {
  position: absolute;
  right: 5%;
  top: 13px;
  font-weight: 400;
  cursor: pointer;
  color: #a4fab7;
  transition: all 1.25s ease-in;
}

.open-caret {
  transform: rotate(0deg);
  transition: all 0.25s ease-out;
  cursor: pointer;
}
ul li.multiselect__element {
  transition: all 1.5s ease-in-out;
  cursor: pointer;
}
span.multiselect__single::-webkit-scrollbar {
  border-radius: 30px;
  height: 0.23rem;
  background: transparent;
  border: 1px solid gainsboro;
}
span.multiselect__single::-webkit-scrollbar-thumb {
  background-color: #b3b3b3;
}
.overflow-text {
  cursor: pointer;
  z-index: 999;
}
.overflow-textg {
  display: inline-block;
  max-width: 200px;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
}

.projected-label {
  color: #28a745;
  font-size: 1em;
  font-weight: bold;
  margin-left: 4px;
  vertical-align: super;
}

multiselect,
input::placeholder {
  font-size: 11.5px !important; /* Adjust the font size as needed */
}

.multiselect {
  .multiselect__select {
    z-index: 1;
  }
  .multiselect__content-wrapper {
    z-index: 2;
  }
}
</style>
