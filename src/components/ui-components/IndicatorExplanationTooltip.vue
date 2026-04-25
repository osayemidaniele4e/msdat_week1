<template>
  <span
    class="indicator-tooltip-wrapper d-inline-block align-middle ml-1"
    @mousedown.stop
    @click.stop
  >
    <b-icon-info-circle-fill
      class="indicator-info-icon"
      role="button"
      tabindex="0"
      :aria-label="'Open details for indicator ' + indicatorId"
      @mousedown.stop.prevent="openExplanation"
      @click.stop.prevent="openExplanation"
      @keydown.enter.prevent="openExplanation"
      @keydown.space.prevent="openExplanation"
      @touchstart.stop.prevent="openExplanation"
    />
  </span>
</template>

<script>
export default {
  name: 'IndicatorExplanationTooltip',
  props: {
    indicatorId: {
      type: [String, Number],
      required: true,
    },
  },
  methods: {
    openExplanation() {
      // Defer one tick so multiselect/dropdown can finish before the dialog opens.
      this.$nextTick(() => {
        this.$root.$emit('open-indicator-explanation', this.indicatorId);
      });
    },
  },
};
</script>

<style scoped>
.indicator-tooltip-wrapper {
  display: inline-flex;
  align-items: center;
}

.indicator-info-icon {
  font-size: 15.5px;
  color: #348481 !important;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 5px;
}

.indicator-info-icon:hover,
.indicator-info-icon:focus {
  opacity: 0.8;
  outline: none;
}
</style>
