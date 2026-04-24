<template>
  <span class="data-anomaly-flag" :class="{ 'anomaly-inline': inline }" v-if="hasAnomalies">
    <span class="anomaly-icon-wrapper" :id="`anomaly-tooltip-${uniqueId}`">
      <b-icon-exclamation-triangle-fill :class="inline ? 'anomaly-icon-sm' : 'anomaly-icon'" />
    </span>
    <b-tooltip
      :target="`anomaly-tooltip-${uniqueId}`"
      triggers="hover"
      placement="top"
      custom-class="anomaly-tooltip"
    >
      <div class="anomaly-tooltip-content">

        <ul class="anomaly-list">
          <li v-for="(flag, index) in flags" :key="index">
            {{ flag.message }}
          </li>
        </ul>
      </div>
    </b-tooltip>
  </span>
</template>

<script>
export default {
  name: 'DataAnomalyFlag',
  props: {
    flags: {
      type: Array,
      required: true,
      default: () => [],
    },
    uniqueId: {
      type: [String, Number],
      required: true,
    },
    inline: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    hasAnomalies() {
      return this.flags && this.flags.length > 0;
    },
  },
};
</script>

<style scoped>
.anomaly-icon {
  color: #ffc107;
  cursor: help;
  font-size: 1.2rem;
}

.anomaly-icon-sm {
  color: #ffc107;
  cursor: help;
  font-size: 0.85rem;
}

.anomaly-inline {
  display: inline;
  margin-left: 3px;
  vertical-align: middle;
}

.anomaly-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.anomaly-header {
  font-weight: bold;
  margin-bottom: 2px;
  color: #333;
}

.anomaly-list {
  padding-left: 15px;
  margin-bottom: 0;
  text-align: left;
  color: #333;
}

.anomaly-tooltip {
  max-width: 250px;
}

.anomaly-tooltip ::v-deep .tooltip-inner {
  background-color: #e3f3f3;
  color: #333;
  padding: 4px 8px;
  border: 1px solid #c0dada;
}

.anomaly-tooltip ::v-deep .arrow::before {
  border-top-color: #e3f3f3;
}

.anomaly-tooltip-content {
  padding: 2px 0;
}
</style>
