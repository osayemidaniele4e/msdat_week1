<template>
  <div class="whats-new-overlay">
    <div class="whats-new-modal">
      <button type="button" class="close-btn" @click="closeComponent" aria-label="Close what's new">
        <span>×</span>
      </button>

      <section class="hero-section">
        <div class="eyebrow">Product updates</div>
        <div class="hero-copy">
          <h1>What&apos;s New</h1>
          <p>
            Fresh improvements across your workspace, curated to help you spot new datasets,
            dashboards, and platform features at a glance.
          </p>
        </div>
        <div class="hero-metrics">
          <div class="metric-card">
            <span class="metric-label">New entries</span>
            <strong>{{ totalUpdates }}</strong>
          </div>
          <div class="metric-card subtle">
            <span class="metric-label">Categories</span>
            <strong>{{ sections.length }}</strong>
          </div>
        </div>
      </section>

      <section class="updates-grid">
        <article
          v-for="section in sections"
          :key="section.key"
          class="update-section"
          :class="section.theme"
        >
          <div class="section-header">
            <div class="section-icon">
              <img :src="section.icon" :alt="section.label" />
            </div>
            <div class="section-title-wrap">
              <div class="section-label-row">
                <h2>{{ section.label }}</h2>
                <span class="pill">{{ section.items.length }} update{{ section.items.length === 1 ? '' : 's' }}</span>
              </div>
              <p>{{ section.description }}</p>
            </div>
          </div>

          <ul v-if="section.items.length" class="update-list">
            <li v-for="item in section.items.slice(0, 3)" :key="item.id" class="update-item">
              <div class="item-marker"></div>
              <div class="item-content">
                <h3>{{ item.content }}</h3>
                <div v-if="section.key === 'Dashboard'" class="item-action-row">
                  <button
                    type="button"
                    class="link-btn"
                    @click="navigateToDashboard(item.title)"
                  >
                    View
                  </button>
                </div>
              </div>
            </li>
          </ul>

          <div v-else class="empty-state">
            <span>No new {{ section.label.toLowerCase() }} updates yet.</span>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import ApiServices from '@/modules/data-layer/services/ApiServices';
import datasetIcon from '../../../assets/new-dataset.png';
import dashboardIcon from '../../../assets/dashboard.png';
import featureIcon from '../../../assets/feature.png';

export default {
  data() {
    return {
      whatsNew: {},
      sectionMeta: {
        Dataset: {
          icon: datasetIcon,
          description: 'New data sources and content ready for exploration.',
          theme: 'dataset-theme',
        },
        Dashboard: {
          icon: dashboardIcon,
          description: 'Recently published views and decision-ready dashboards.',
          theme: 'dashboard-theme',
        },
        Feature: {
          icon: featureIcon,
          description: 'Platform improvements designed to make work smoother.',
          theme: 'feature-theme',
        },
      },
      sectionOrder: ['Dataset', 'Dashboard', 'Feature'],
      autoCloseTimer: null,
    };
  },
  computed: {
    sections() {
      return this.sectionOrder.map((key) => ({
        key,
        label: key,
        items: this.whatsNew[key] || [],
        ...this.sectionMeta[key],
      }));
    },
    totalUpdates() {
      return this.sections.reduce((total, section) => total + section.items.length, 0);
    },
  },
  methods: {
    ...mapMutations('MSDAT_STORE', ['closeShowWhatsNew']),

    closeComponent() {
      localStorage.setItem('firstTimeExecution', 'true');
      this.closeShowWhatsNew();
    },
    async getWhatsNew() {
      const { data } = await ApiServices.getWhatsNew();
      this.whatsNew = this.groupByCategory(data.results || []);
    },
    groupByCategory(data) {
      return data.reduce((acc, item) => {
        acc[item.category_name] = acc[item.category_name] || [];
        acc[item.category_name].push(item);
        return acc;
      }, {});
    },
    navigateToDashboard(str) {
      if (str === null || str === undefined || str === 'null') {
        return;
      }
      const origin = window.location.origin;
      const fullUrl = `${origin}/${str}`;
      window.open(fullUrl, '_blank');
    },
  },
  mounted() {
    this.getWhatsNew();
    this.autoCloseTimer = setTimeout(() => {
      this.closeComponent();
    }, 90000);
  },
  beforeUnmount() {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
  },
};
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');

.whats-new-overlay {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100%;
  padding: 32px 20px;
  background:
    radial-gradient(circle at top left, rgba(43, 124, 109, 0.22), transparent 34%),
    radial-gradient(circle at bottom right, rgba(203, 164, 92, 0.16), transparent 28%),
    rgba(6, 15, 13, 0.3);
  backdrop-filter: blur(6px);
}

.whats-new-modal {
  position: relative;
  width: min(980px, 100%);
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 28px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(245, 249, 247, 0.94)),
    #ffffff;
  box-shadow: 0 30px 80px rgba(4, 25, 21, 0.22);
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 2;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(18, 59, 49, 0.14);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #173a33;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;

  span {
    display: inline-block;
    font-size: 1.8rem;
    line-height: 1;
    transform: translateY(-1px);
  }

  &:hover {
    transform: translateY(-1px);
    background: #ffffff;
    box-shadow: 0 16px 32px rgba(23, 58, 51, 0.14);
  }
}

.hero-section {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(220px, 0.9fr);
  gap: 24px;
  padding: 18px;
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(14, 74, 62, 0.96), rgba(35, 124, 109, 0.9)),
    #0f4d42;
  color: #f8fcfb;
}

.eyebrow {
  grid-column: 1 / -1;
  width: fit-content;
  padding: 7px 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font: 700 0.72rem/1 'Manrope', sans-serif;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 0 0 10px;
  font: 700 clamp(2rem, 4vw, 3.2rem) / 1.02 'Playfair Display', serif;
  letter-spacing: -0.03em;
}

.hero-copy p {
  max-width: 560px;
  margin: 0;
  font: 500 0.98rem/1.7 'Manrope', sans-serif;
  color: rgba(248, 252, 251, 0.84);
}

.hero-metrics {
  display: grid;
  gap: 14px;
  align-content: end;
}

.metric-card {
  padding: 16px 18px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);

  strong {
    display: block;
    margin-top: 8px;
    font: 800 2rem/1 'Manrope', sans-serif;
  }
}

.metric-card.subtle {
  background: rgba(255, 255, 255, 0.06);
}

.metric-label {
  font: 600 0.82rem/1.4 'Manrope', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(248, 252, 251, 0.74);
}

.updates-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 22px;
}

.update-section {
  padding: 18px;
  border: 1px solid rgba(18, 59, 49, 0.08);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(246, 249, 247, 0.9));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.dataset-theme {
  background: linear-gradient(180deg, rgba(241, 250, 246, 0.96), rgba(255, 255, 255, 0.95));
}

.dashboard-theme {
  background: linear-gradient(180deg, rgba(242, 247, 255, 0.96), rgba(255, 255, 255, 0.95));
}

.feature-theme {
  background: linear-gradient(180deg, rgba(255, 248, 239, 0.98), rgba(255, 255, 255, 0.95));
}

.section-header {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 14px 24px rgba(24, 63, 54, 0.08);

  img {
    width: 28px;
    height: 28px;
    object-fit: contain;
  }
}

.section-title-wrap {
  min-width: 0;

  h2 {
    margin: 0;
    color: #173a33;
    font: 800 1.05rem/1.2 'Manrope', sans-serif;
  }

  p {
    margin: 8px 0 0;
    color: #5d6f69;
    font: 500 0.89rem/1.6 'Manrope', sans-serif;
  }
}

.section-label-row {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.pill {
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(23, 58, 51, 0.08);
  color: #205349;
  font: 700 0.7rem/1 'Manrope', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.update-list {
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}

.update-item {
  display: flex;
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid rgba(28, 77, 66, 0.08);
}

.item-marker {
  width: 10px;
  height: 10px;
  margin-top: 7px;
  flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #0c8d6f, #67c3ae);
  box-shadow: 0 0 0 6px rgba(12, 141, 111, 0.08);
}

.item-content {
  min-width: 0;

  h3 {
    margin: 0;
    color: #1b2b28;
    font: 700 0.95rem/1.55 'Manrope', sans-serif;
  }
}

.item-action-row {
  display: flex;
  justify-content: flex-start;
  margin-top: 12px;
}

.link-btn {
  min-width: 96px;
  border: 1px solid rgba(12, 109, 88, 0.14);
  padding: 10px 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0f7b64, #125a4a);
  color: #f5fbf8;
  font: 800 0.82rem/1.1 'Manrope', sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(15, 123, 100, 0.22);
    filter: brightness(1.02);
  }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 145px;
  margin-top: 16px;
  padding: 18px;
  border: 1px dashed rgba(23, 58, 51, 0.16);
  border-radius: 18px;
  color: #60706b;
  text-align: center;
  font: 600 0.92rem/1.6 'Manrope', sans-serif;
}

@media (max-width: 991px) {
  .whats-new-overlay {
    padding: 20px 14px;
  }

  .whats-new-modal {
    padding: 20px;
    border-radius: 24px;
  }

  .hero-section {
    grid-template-columns: 1fr;
  }

  .hero-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .updates-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .whats-new-overlay {
    padding: 12px;
  }

  .whats-new-modal {
    max-height: calc(100vh - 24px);
    padding: 16px;
    border-radius: 22px;
  }

  .close-btn {
    top: 12px;
    right: 12px;
    width: 40px;
    height: 40px;
  }

  .hero-section {
    padding: 16px;
    gap: 20px;
  }

  .hero-copy p {
    font-size: 0.92rem;
  }

  .hero-metrics {
    grid-template-columns: 1fr;
  }

  .update-section {
    padding: 16px;
    border-radius: 20px;
  }

  .section-header,
  .section-label-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-action-row {
    align-items: stretch;
  }

  .link-btn {
    width: auto;
  }
}
</style>
