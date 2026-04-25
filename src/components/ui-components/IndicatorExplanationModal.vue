<template>
  <!-- Element UI dialog: append-to-body + explicit z-index avoids multiselect /
       app stacking issues that often break b-modal on production builds. -->
  <el-dialog
    :visible.sync="dialogVisible"
    :append-to-body="true"
    :modal-append-to-body="true"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :lock-scroll="true"
    :show-close="false"
    :destroy-on-close="false"
    :z-index="zIndex"
    custom-class="indicator-explanation-dlg"
    width="min(90vw, 700px)"
    top="4vh"
    @close="handleDialogClose"
  >
    <div slot="title" class="d-flex justify-content-between align-items-center" style="padding-right: 0">
      <h5
        class="mb-0 text-uppercase"
        style="font-size: 15px; letter-spacing: 0.2px; font-weight: 700; color: #1a1a1a"
      >
        {{ titleText }}
      </h5>
      <b-icon-x
        class="cursor-pointer"
        style="width: 25px; height: 25px; color: #333"
        role="button"
        tabindex="0"
        @click="closeModal"
        @keydown.enter.prevent="closeModal"
      />
    </div>

    <div v-if="loading" class="text-center py-5">
      <b-spinner style="color: #348481" label="Loading..." />
    </div>
    <div v-else-if="metadata" class="meta-modal bg-white">
      <div class="p-0 pt-1">
        <div class="text1">Description</div>
        <div class="text2">{{ metadata.definition }}</div>

        <div class="text1">Calculation Formula</div>
        <div class="text2">{{ metadata.formula }}</div>

        <div class="text1">Data Source</div>
        <div class="text2">{{ metadata.source }}</div>

        <div class="mt-4">
          <b-button
            style="background-color: #d81b60; border-color: #d81b60; color: white"
            size="m"
            @click="closeModal"
          >CLOSE</b-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import mixin from '@/modules/data-layer/mixin';

export default {
  name: 'IndicatorExplanationModal',
  mixins: [mixin],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      metadata: null,
      /** Stack above app overlays (e.g. multiselect, fixed panels). */
      zIndex: 100000,
    };
  },
  computed: {
    titleText() {
      if (this.metadata && this.metadata.name) {
        return this.metadata.name;
      }
      if (this.loading) {
        return 'Loading…';
      }
      return 'Indicator';
    },
  },
  mounted() {
    this.$root.$on('open-indicator-explanation', this.loadMetadata);
  },
  beforeDestroy() {
    this.$root.$off('open-indicator-explanation', this.loadMetadata);
  },
  methods: {
    closeModal() {
      this.dialogVisible = false;
    },
    handleDialogClose() {
      this.resetState();
    },
    resetState() {
      this.metadata = null;
      this.loading = false;
    },
    async loadMetadata(indicatorId) {
      if (indicatorId === undefined || indicatorId === null || indicatorId === '') {
        return;
      }
      this.metadata = null;
      this.loading = true;
      this.dialogVisible = true;
      await this.$nextTick();

      try {
        const indicatorObj = this.dlGetIndicator(indicatorId);
        const dsList = await this.getDataSourcesFromIndicator(indicatorId);

        let definition = 'No definition available for this indicator.';
        let formula = 'Formula not explicitly defined.';
        let sourceNames = 'Unavailable';

        if (dsList && dsList.length > 0) {
          sourceNames = dsList.map((ds) => ds.datasource).join(', ');

          const specificItems = this.dlGetDataSourceSpecificIndicator({
            indicator: indicatorId,
            datasource: dsList[0].id,
          });

          if (specificItems && specificItems.length > 0) {
            const specific = specificItems[0];
            definition = specific.indicator_definition || definition;

            const num = specific.measurement_numerator;
            const den = specific.measurement_denominator;

            const isValid = (val) => val
              && val.trim
              && val.trim().toLowerCase() !== 'n/a'
              && val.trim().toLowerCase() !== 'not applicable';

            let formedFormula = '';
            if (isValid(num)) formedFormula += `Numerator: ${num.trim()}\n`;
            if (isValid(den)) formedFormula += `Denominator: ${den.trim()}`;

            formula = formedFormula.trim() || 'Formula not explicitly defined.';
          }
        }

        this.metadata = {
          name: indicatorObj ? indicatorObj.full_name : 'Indicator Definition',
          definition,
          formula,
          source: sourceNames,
        };
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load indicator metadata', err);
        this.metadata = {
          name: 'Indicator Explanation Details',
          definition: 'Data is currently resolving...',
          formula: 'N/A',
          source: 'N/A',
        };
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.text1 {
  font-weight: 700;
  border-bottom: 1.5px solid #2b5d5b;
  color: black;
  margin-top: 15px;
  margin-bottom: 5px;
  font-size: 14px;
  padding-bottom: 4px;
}

.text2 {
  font-size: 13.5px;
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s;
}

.cursor-pointer:hover {
  color: #d81b60;
  transform: scale(1.1);
}
</style>

<!-- Global: Element dialog is portaled; ensure high stacking in all themes -->
<style lang="scss">
.el-dialog.indicator-explanation-dlg {
  z-index: 100000 !important;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}

.el-dialog.indicator-explanation-dlg .el-dialog__body {
  max-height: calc(90vh - 100px);
  overflow-y: auto;
  padding-top: 0;
  padding-left: 20px;
  padding-right: 20px;
}
</style>
