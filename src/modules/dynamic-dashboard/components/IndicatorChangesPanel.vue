<template>
  <div class="indicator-changes-panel" v-if="localIndicators.length > 0">
    <div class="panel-header">
      <h3 class="panel-title">
        Recent Indicator Changes
        <span class="location-badge"> - {{ activeLocationName }}</span>
      </h3>
    </div>

    <div class="panel-content">
      <div v-if="loading" class="loading-state">
        <div class="skeleton-card" v-for="i in 5" :key="`skel-${i}`"></div>
      </div>

      <div v-else-if="changes.length === 0" class="empty-state">
        <p>No significant recent changes detected for indicators on this dashboard.</p>
      </div>

      <div v-else class="cards-wrapper">
        <button
          class="scroll-btn scroll-left"
          @click="scroll('left')"
          v-show="canScrollLeft"
        >
          <i class="el-icon-arrow-left"></i>
        </button>

        <div class="cards-container" ref="cardsContainer" @scroll="checkScroll">
          <div
            class="change-card"
            v-for="change in changes"
            :key="change.indicatorId"
          >
            <div class="card-title" :title="change.indicatorName">{{ change.indicatorName }}</div>

            <div class="change-metrics">
              <div
                class="percentage"
                :class="{ 'text-success': change.direction === 'increase', 'text-danger': change.direction === 'decrease' }"
              >
                {{ change.direction === 'increase' ? '+' : '' }}{{ change.change }}%
                <i :class="change.direction === 'increase' ? 'el-icon-top' : 'el-icon-bottom'"></i>
              </div>
            </div>

            <div class="value-comparison">
              <span class="value">{{ change.previousValue }}</span>
              <span class="period" :title="change.previousPeriod">&nbsp;({{ change.previousPeriod }})</span>
              <i class="el-icon-right mx-1"></i>
              <span class="value">{{ change.currentValue }}</span>
              <span class="period" :title="change.currentPeriod">&nbsp;({{ change.currentPeriod }})</span>
            </div>

            <div class="card-footer">
              <router-link :to="getDashboardRouteForIndicator(change)" class="view-analysis">
                View Analysis <i class="el-icon-right"></i>
              </router-link>
            </div>
          </div>
        </div>

        <button
          class="scroll-btn scroll-right"
          @click="scroll('right')"
          v-show="canScrollRight"
        >
          <i class="el-icon-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import apiServices from '@/modules/data-layer/services/ApiServices';
import * as DefaultData from '@/modules/msdat-dashboard/views/dashboard/defaultData';
import ChangeDetectionService from '@/services/ChangeDetectionService';
import dashboardConfig from '@/modules/dynamic-dashboard/config/dashboard_config';

export default {
  name: 'IndicatorChangesPanel',
  props: {
    indicators: {
      type: Array,
      default: () => [],
    },
    dashboardName: {
      type: String,
      required: true,
    },
    dashboardId: {
      type: [String, Number],
      default: null,
    },
    activeIndicatorId: {
      type: [String, Number],
      default: null,
    },
    activeLocationName: {
      type: String,
      default: 'National',
    },
    activeLocationId: {
      type: [String, Number],
      default: 1,
    },
  },
  data() {
    return {
      loading: true,
      changes: [],
      canScrollLeft: false,
      canScrollRight: true,
      localIndicators: [],
    };
  },
  watch: {
    indicators: {
      immediate: true,
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.localIndicators = [...newVal];
          this.fetchChanges();
        }
      },
    },
    dashboardName() {
      if (this.localIndicators.length > 0) {
        this.fetchChanges();
      }
    },
    activeIndicatorId() {
      // Refresh to prioritize the newly selected indicator
      this.fetchChanges();
    },
    activeLocationId() {
      // Refresh strictly when user filters by a dynamic location level
      this.fetchChanges();
    },
  },
  methods: {
    async fetchChanges() {
      this.loading = true;
      try {
        const indicatorMap = {};

        // 1. UNIVERSAL SOURCE: Dashboard-specific indicators API (working for guests/all envs)
        if (this.dashboardId) {
          try {
            const res = await apiServices.getDashboardIndicators(this.dashboardId);
            const dashboardIndicators = res?.data?.indicators || [];
            dashboardIndicators.forEach((ind) => {
              if (ind && ind.id) {
                indicatorMap[ind.id] = ind.full_name || ind.indicator_name || ind.name || ind.short_name;
              }
            });
          } catch (e) {
            console.warn('Fallback: Failed to fetch dashboard indicators metadata', e);
          }
        }

        // 2. PROJECT SOURCE: defaultData.js (Hardcoded fallback for core indicators)
        Object.values(DefaultData).forEach((section) => {
          const indicatorsList = section?.content?.indicators || section?.indicators;
          if (Array.isArray(indicatorsList)) {
            indicatorsList.forEach((ind) => {
              if (ind && ind.id && !indicatorMap[ind.id]) {
                indicatorMap[ind.id] = ind.full_name || ind.indicator_name || ind.short_name || ind.name;
              }
            });
          }
        });

        // 3. STORE SOURCE: DL indicators (if populated)
        const dlIndicators = this.$store.state.DL?.indicators || [];
        dlIndicators.forEach((ind) => {
          if (ind && ind.id && !indicatorMap[ind.id]) {
            indicatorMap[ind.id] = ind.full_name || ind.indicator_name || ind.name || ind.short_name;
          }
        });

        // PREPARE INDICATOR LIST FOR ANALYSIS
        // Ensure the active indicator is always evaluated by putting it at the start
        const analysisList = [...this.localIndicators];
        if (this.activeIndicatorId && !analysisList.includes(Number(this.activeIndicatorId))) {
          analysisList.unshift(Number(this.activeIndicatorId));
        } else if (this.activeIndicatorId) {
          // If already in list, move to front to ensure it's in the first sample slice
          const idx = analysisList.indexOf(Number(this.activeIndicatorId));
          if (idx > -1) {
            analysisList.splice(idx, 1);
            analysisList.unshift(Number(this.activeIndicatorId));
          }
        }

        // Fetch top changes for the indicators on this dashboard mapping to specific location
        this.changes = await ChangeDetectionService.getIndicatorChanges(
          analysisList,
          this.dashboardName,
          indicatorMap,
          this.activeLocationId,
        );
      } catch (error) {
        console.error('Failed to load indicator changes', error);
      } finally {
        this.loading = false;
        this.$nextTick(() => {
          this.checkScroll();
        });
      }
    },
    scroll(direction) {
      const container = this.$refs.cardsContainer;
      if (!container) return;

      const scrollAmount = 300; // rough width of one card + gap
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    },
    checkScroll() {
      const container = this.$refs.cardsContainer;
      if (!container) return;

      this.canScrollLeft = container.scrollLeft > 0;
      this.canScrollRight
        = Math.ceil(container.scrollLeft + container.clientWidth) < container.scrollWidth;
    },
    /**
     * Resolves the correct dashboard route for a given indicator.
     * Searches dashboard_config.js to find which dashboard hosts this indicator.
     * @param {Number} indicatorId
     * @returns {String} Route path
     */
    getDashboardRouteForIndicator(indicator) {
      if (!indicator) return `/dashboard/${this.dashboardName}`;

      const indicatorId = typeof indicator === 'object' ? indicator.indicatorId : indicator;
      const datasourceId = typeof indicator === 'object' ? indicator.datasourceId : null;

      let idParam = `?indicator=${indicatorId}`;
      if (datasourceId) {
        idParam += `&datasource=${datasourceId}`;
      }

      // 1. Try current dashboard first (performance optimization)
      const current = dashboardConfig.find(
        (d) => d.name === this.dashboardName && d.indicators.includes(Number(indicatorId)),
      );
      if (current) return `/dashboard/${current.name}${idParam}`;

      // 2. Fallback: Search all dashboards in config
      const found = dashboardConfig.find((d) => d.indicators && d.indicators.includes(Number(indicatorId)));
      if (found) return `/dashboard/${found.name}${idParam}`;

      // 3. Ultimate fallback: stay on current dashboard
      return `/dashboard/${this.dashboardName}${idParam}`;
    },
  },
  mounted() {
    window.addEventListener('resize', this.checkScroll);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkScroll);
  },
};
</script>

<style lang="scss" scoped>
@import "@/scss/abstracts/_variables.scss";

.indicator-changes-panel {
  background-color: white;
  padding: 0.5rem 1rem;
  margin: 0.5rem 15px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);

  .panel-header {
    margin-bottom: 0.25rem;

    .panel-title {
      font-family: 'Work Sans', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: #333;
      margin: 0;
      display: inline-block;

      .location-badge {
        font-size: 0.95rem;
        color: #666;
        font-weight: 500;
      }
    }
  }

  .panel-content {
    position: relative;

    .loading-state, .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 90px;
      gap: 1rem;

      .skeleton-card {
        width: 220px;
        height: 90px;
        background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 8px;
      }
    }

    .empty-state {
      background-color: white;
      border-radius: 8px;
      border: 1px solid $secondary;

      p {
        color: #666;
        font-size: 1.1rem;
        margin: 0;
      }
    }

    .cards-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      .scroll-btn {
        position: absolute;
        z-index: 10;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: white;
        border: 1px solid $secondary;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        color: $primary;
        transition: all 0.2s;

        &:hover {
          background-color: $baseCard;
          transform: scale(1.05);
        }

        &.scroll-left { left: -20px; }
        &.scroll-right { right: -20px; }
      }

      .cards-container {
        display: flex;
        overflow-x: auto;
        gap: 1.5rem;
        padding: 0.5rem 0;
        scroll-behavior: smooth;
        scrollbar-width: thin;

        &::-webkit-scrollbar {
          height: 6px;
        }
        &::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        &::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 4px;
        }
        &::-webkit-scrollbar-thumb:hover {
          background: #aaa;
        }

        .change-card {
          flex: 0 0 auto;
          width: 220px;
          background-color: white;
          border-radius: 6px;
          border: 1px solid rgba(0,0,0,0.1);
          padding: 0.5rem 0.75rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          transition: transform 0.2s, box-shadow 0.2s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 3px 8px rgba(0,0,0,0.08);
            border-color: $baseCardHeader;
          }

          .card-title {
            font-size: 0.85rem;
            font-weight: 600;
            color: #444;
            margin-bottom: 0.25rem;
            height: 2.3em;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            line-height: 1.15;
          }

          .change-metrics {
            margin-bottom: 0.15rem;

            .percentage {
              font-size: 1.15rem;
              font-weight: 700;
              display: flex;
              align-items: center;
              gap: 0.25rem;

              &.text-success { color: $success; }
              &.text-danger { color: $danger; }

              i { font-size: 1rem; }
            }
          }

          .value-comparison {
            font-size: 0.7rem;
            color: #666;
            margin-bottom: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            flex-wrap: wrap;

            .period {
              font-size: 0.65rem;
              background-color: #f0f0f0;
              padding: 0.1rem 0.25rem;
              border-radius: 3px;
            }
            .value {
              font-weight: 600;
              color: #444;
            }
          }

          .card-footer {
            margin-top: auto;
            border-top: 1px solid rgba(0,0,0,0.05);
            padding-top: 0.25rem;

            .view-analysis {
              color: $baseCardHeader;
              font-weight: 600;
              text-decoration: none;
              font-size: 0.8rem;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              transition: color 0.2s;

              &:hover {
                color: $primary;
                i { transform: translateX(3px); }
              }

              i {
                transition: transform 0.2s;
              }
            }
          }
        }
      }
    }
  }
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
