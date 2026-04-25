<template>
  <!-- Same as HeaderOption plugin modal: b-modal with id + $bvModal.show('…') (see showPluginModal). -->
  <b-modal
    id="indicator-explanation-modal-global"
    ref="indicatorModal"
    size="lg"
    hide-header
    hide-footer
    centered
    body-class="p-0"
    :lazy="false"
    :no-enforce-focus="true"
    modal-class="indicator-explain-bv-modal"
    @hidden="onModalHidden"
  >
    <div v-if="loading" class="text-center py-5">
      <b-spinner style="color: #348481" label="Loading..." />
    </div>
    <div v-else-if="metadata" class="meta-modal bg-white">
      <div
        class="d-flex justify-content-between align-items-center"
        style="background-color: #f1f1f1; padding: 15px 24px; border-bottom: 1px solid #ddd"
      >
        <h5
          class="mb-0 text-uppercase"
          style="font-size: 15px; letter-spacing: 0.2px; font-weight: 700"
        >{{ metadata.name }}</h5>
        <b-icon-x
          class="cursor-pointer"
          style="width: 25px; height: 25px; color: #333"
          role="button"
          aria-label="Close"
          @click="closeModal"
        />
      </div>

      <div class="p-4 pt-2">
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
  </b-modal>
</template>

<script>
import { eventBus } from '@/main';
import mixin from '@/modules/data-layer/mixin';

const OPEN_EVENT = 'open-indicator-explanation';
const MODAL_ID = 'indicator-explanation-modal-global';

function reportFailure(vm, where, err) {
  const detail = (err && err.message) || String(err) || 'unknown';
  // eslint-disable-next-line no-console
  console.error(`[IndicatorExplanationModal] ${where}:`, detail, err || '');
  if (typeof vm.$swal === 'function') {
    vm.$swal(
      'Could not open indicator details',
      `${where}\n\nIf this persists, open the browser console (F12) and look for [IndicatorExplanationModal].`,
      'error',
    );
  }
}

export default {
  name: 'IndicatorExplanationModal',
  mixins: [mixin],
  data() {
    return {
      loading: false,
      metadata: null,
    };
  },
  mounted() {
    eventBus.$on(OPEN_EVENT, this.onOpenRequest);
    this.$root.$on(OPEN_EVENT, this.onOpenRequest);
  },
  beforeDestroy() {
    eventBus.$off(OPEN_EVENT, this.onOpenRequest);
    this.$root.$off(OPEN_EVENT, this.onOpenRequest);
  },
  methods: {
    onOpenRequest(id) {
      this.loadMetadata(id);
    },
    /**
     * Like HeaderOption.showPluginModal: this.$bvModal.show('plugin-modal')
     * Fallback: _base-modal style this.$refs['main-modal'].show()
     */
    showByBootstrapVue() {
      this.$nextTick(() => {
        if (this.$bvModal && typeof this.$bvModal.show === 'function') {
          try {
            this.$bvModal.show(MODAL_ID);
            // eslint-disable-next-line no-console
            console.info('[IndicatorExplanationModal] $bvModal.show', MODAL_ID);
            return;
          } catch (e) {
            reportFailure(this, '$bvModal.show() threw', e);
          }
        }
        if (this.$refs.indicatorModal && typeof this.$refs.indicatorModal.show === 'function') {
          try {
            this.$refs.indicatorModal.show();
            // eslint-disable-next-line no-console
            console.info('[IndicatorExplanationModal] ref.show()');
            return;
          } catch (e) {
            reportFailure(this, 'ref.indicatorModal.show() threw', e);
            return;
          }
        }
        reportFailure(
          this,
          'Bootstrap-Vue modal API missing ($bvModal and ref)',
          new Error('no modal show'),
        );
      });
    },
    closeModal() {
      try {
        this.$bvModal.hide(MODAL_ID);
      } catch (e) {
        if (this.$refs.indicatorModal && this.$refs.indicatorModal.hide) {
          this.$refs.indicatorModal.hide();
        } else {
          reportFailure(this, 'closeModal', e);
        }
      }
    },
    onModalHidden() {
      this.resetState();
    },
    resetState() {
      this.metadata = null;
      this.loading = false;
    },
    strTrim(val) {
      if (val == null) return '';
      return String(val).trim();
    },
    isDefValue(val) {
      const s = this.strTrim(val);
      if (!s) return false;
      const low = s.toLowerCase();
      return low !== 'n/a' && low !== 'not applicable';
    },
    async loadMetadata(rawId) {
      if (rawId === null || rawId === undefined) {
        reportFailure(this, 'loadMetadata: missing indicator id', new Error('no id'));
        return;
      }
      if (typeof rawId === 'string' && rawId === '') {
        return;
      }
      const indicatorId = rawId;

      this.metadata = null;
      this.loading = true;
      this.showByBootstrapVue();

      try {
        const indicatorObj = typeof this.dlGetIndicator === 'function'
          ? this.dlGetIndicator(indicatorId)
          : null;
        const dsList = typeof this.getDataSourcesFromIndicator === 'function'
          ? await this.getDataSourcesFromIndicator(indicatorId)
          : [];

        let definition = 'No definition available for this indicator.';
        let formula = 'Formula not explicitly defined.';
        let sourceNames = 'Unavailable';

        if (dsList && dsList.length > 0) {
          sourceNames = dsList.map((ds) => ds.datasource).join(', ');

          const specificItems = typeof this.dlGetDataSourceSpecificIndicator === 'function'
            ? this.dlGetDataSourceSpecificIndicator({
              indicator: indicatorId,
              datasource: dsList[0].id,
            })
            : [];

          if (specificItems && specificItems.length > 0) {
            const specific = specificItems[0];
            definition = specific.indicator_definition || definition;

            const num = specific.measurement_numerator;
            const den = specific.measurement_denominator;

            let formedFormula = '';
            if (this.isDefValue(num)) formedFormula += `Numerator: ${this.strTrim(num)}\n`;
            if (this.isDefValue(den)) formedFormula += `Denominator: ${this.strTrim(den)}`;

            formula = formedFormula.trim() || 'Formula not explicitly defined.';
          }
        }

        this.metadata = {
          name: (indicatorObj && indicatorObj.full_name) ? indicatorObj.full_name : 'Indicator Definition',
          definition,
          formula,
          source: sourceNames,
        };
      } catch (err) {
        reportFailure(this, 'loadMetadata: data / API error', err);
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

<style lang="scss">
.modal.indicator-explain-bv-modal {
  z-index: 100000 !important;
}
</style>
