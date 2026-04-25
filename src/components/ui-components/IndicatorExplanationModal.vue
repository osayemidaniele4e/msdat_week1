<template>
  <!-- Plain fixed overlay (no Teleport: Vue2 has no <teleport>).
       Sibling to router-view in App.vue so `position:fixed` is viewport-relative. -->
  <div>
    <transition name="ie-modal-fade">
      <div
        v-if="dialogVisible"
        class="indicator-explain-overlay"
        @click.self="closeModal"
      >
        <div
          class="indicator-explain-panel"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          :aria-labelledby="'ind-exp-title-' + _uid"
          @click.stop
        >
          <div class="indicator-explain-header d-flex justify-content-between align-items-center">
            <h5
              :id="'ind-exp-title-' + _uid"
              class="mb-0 text-uppercase title-text"
            >
              {{ titleText }}
            </h5>
            <b-icon-x
              class="cursor-pointer close-ic"
              role="button"
              tabindex="0"
              aria-label="Close"
              @click="closeModal"
              @keydown.enter.prevent="closeModal"
            />
          </div>

          <div class="indicator-explain-body">
            <div v-if="loading" class="text-center py-5">
              <b-spinner style="color: #348481" label="Loading..." />
            </div>
            <div v-else-if="metadata" class="bg-white content-inner">
              <div class="text1">Description</div>
              <div class="text2">{{ metadata.definition }}</div>

              <div class="text1">Calculation Formula</div>
              <div class="text2">{{ metadata.formula }}</div>

              <div class="text1">Data Source</div>
              <div class="text2">{{ metadata.source }}</div>

              <div class="mt-4">
                <b-button
                  class="px-4"
                  style="background-color: #d81b60; border-color: #d81b60; color: white"
                  size="m"
                  @click="closeModal"
                >CLOSE</b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { eventBus } from '@/main';
import mixin from '@/modules/data-layer/mixin';

const OPEN_EVENT = 'open-indicator-explanation';

export default {
  name: 'IndicatorExplanationModal',
  mixins: [mixin],
  data() {
    return {
      dialogVisible: false,
      loading: false,
      metadata: null,
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
  watch: {
    dialogVisible(v) {
      if (v) {
        document.body.classList.add('indicator-explain-modal-open');
        document.addEventListener('keydown', this.onKeydown);
        this.$nextTick(() => {
          const el = this.$el && this.$el.querySelector
            ? this.$el.querySelector('.indicator-explain-panel')
            : null;
          if (el) el.focus();
        });
      } else {
        document.body.classList.remove('indicator-explain-modal-open');
        document.removeEventListener('keydown', this.onKeydown);
      }
    },
  },
  mounted() {
    eventBus.$on(OPEN_EVENT, this.onOpenRequest);
    // Reparent to <body> so `position:fixed` is always viewport-anchored (Vue 2 has no <Teleport>).
    this.$nextTick(() => {
      if (this.$el && this.$el.parentNode) {
        document.body.appendChild(this.$el);
      }
    });
  },
  beforeDestroy() {
    eventBus.$off(OPEN_EVENT, this.onOpenRequest);
    document.removeEventListener('keydown', this.onKeydown);
    document.body.classList.remove('indicator-explain-modal-open');
    if (this.$el && this.$el.parentNode === document.body) {
      document.body.removeChild(this.$el);
    }
  },
  methods: {
    onKeydown(e) {
      if (e.key === 'Escape' && this.dialogVisible) {
        e.preventDefault();
        this.closeModal();
      }
    },
    onOpenRequest(id) {
      this.loadMetadata(id);
    },
    closeModal() {
      this.dialogVisible = false;
      this.$nextTick(() => this.resetState());
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
        return;
      }
      if (typeof rawId === 'string' && rawId === '') {
        return;
      }
      const indicatorId = rawId;
      this.metadata = null;
      this.loading = true;
      this.dialogVisible = true;
      await this.$nextTick();

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
.title-text {
  font-size: 15px;
  letter-spacing: 0.2px;
  font-weight: 700;
  color: #1a1a1a;
  max-width: calc(100% - 2.5rem);
}

.close-ic {
  width: 25px;
  height: 25px;
  color: #333;
  flex-shrink: 0;
}

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
/* Unscoped: overlay must break out of any parent stacking; max z-index for typical UIs */
body.indicator-explain-modal-open {
  overflow: hidden !important;
  touch-action: none;
}

.ie-modal-fade-enter-active,
.ie-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.ie-modal-fade-enter,
.ie-modal-fade-leave-to {
  opacity: 0;
}

.indicator-explain-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2147482000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.5);
  -webkit-backdrop-filter: blur(1px);
  backdrop-filter: blur(1px);
  pointer-events: auto;
}

.indicator-explain-panel {
  position: relative;
  background: #fff;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.25);
  outline: none;
}

.indicator-explain-header {
  background-color: #f1f1f1;
  padding: 15px 20px 15px 24px;
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
}

.indicator-explain-body {
  padding: 0 20px 20px 20px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;
  min-height: 0;
}

.indicator-explain-panel .content-inner {
  padding-top: 0.5rem;
}
</style>
