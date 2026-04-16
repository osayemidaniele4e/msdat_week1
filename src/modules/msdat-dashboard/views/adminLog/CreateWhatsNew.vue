<template>
  <div class="create-whats-new-overlay">
    <div class="create-whats-new-modal">
      <button type="button" class="close-btn" aria-label="Close create update" @click="closeComponent">
        <span>×</span>
      </button>

      <section class="hero-section">
        <div class="hero-copy">
          <span class="eyebrow">Admin updates</span>
          <h1>Create What&apos;s New entry</h1>
          <p>
            Publish a polished product update for datasets, dashboards, or platform features.
          </p>
        </div>

        <div class="hero-summary">
          <div class="summary-card">
            <span>Selected type</span>
            <strong>{{ type || 'Not chosen' }}</strong>
          </div>
          <div class="summary-card subtle">
            <span>Ready to publish</span>
            <strong>{{ isFormComplete ? 'Yes' : 'Pending' }}</strong>
          </div>
        </div>
      </section>

      <section class="form-shell">
        <div class="form-grid">
          <label class="form-field field-wide">
            <span class="field-label">Name</span>
            <input
              v-model="title"
              type="text"
              placeholder="Enter update title"
              :class="['field-control', { error: errors.title }]"
              @input="validateField('title', title)"
            />
            <small v-if="errors.title" class="field-error">{{ errors.title }}</small>
          </label>

          <label class="form-field">
            <span class="field-label">Type</span>
            <select
              v-model="type"
              :class="['field-control', 'field-select', { error: errors.category }]"
              @change="validateField('category', type)"
            >
              <option value="" disabled>Select an option</option>
              <option value="Dataset">Dataset</option>
              <option value="Dashboard">Dashboard</option>
              <option value="Feature">Feature</option>
            </select>
            <small v-if="errors.category" class="field-error">{{ errors.category }}</small>
          </label>

          <label v-if="type === 'Dashboard'" class="form-field">
            <span class="field-label">Dashboard name</span>
            <input
              v-model="dashboardName"
              type="text"
              placeholder="Enter dashboard route or dashboard name"
              :class="['field-control', { error: errors.dashboard_name }]"
              @input="validateField('dashboard_name', dashboardName)"
            />
            <small v-if="errors.dashboard_name" class="field-error">{{ errors.dashboard_name }}</small>
          </label>

          <div class="form-field preview-card">
            <span class="field-label">Publishing note</span>
            <p>
              For dashboard updates, the dashboard name is used for opening the published page,
              while the name field remains the visible update heading.
            </p>
          </div>

          <label class="form-field field-wide">
            <span class="field-label">Description</span>
            <textarea
              v-model="description"
              rows="5"
              placeholder="Describe what changed and why it matters."
              :class="['field-control', 'field-textarea', { error: errors.content }]"
              @input="validateField('content', description)"
            ></textarea>
            <small v-if="errors.content" class="field-error">{{ errors.content }}</small>
          </label>
        </div>

        <div class="action-row">
          <button type="button" class="secondary-btn" @click="clearForm">
            Clear form
          </button>
          <button type="button" class="primary-btn" :disabled="submitting" @click="submit">
            {{ submitting ? 'Publishing update...' : 'Submit update' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import ApiServices from '@/modules/data-layer/services/ApiServices';

export default {
  data() {
    return {
      title: '',
      type: '',
      dashboardName: '',
      description: '',
      submitting: false,
      errors: {
        title: null,
        content: null,
        category: null,
        dashboard_name: null,
      },
    };
  },
  computed: {
    isFormComplete() {
      return Boolean(
        this.title.trim()
          && this.type
          && (this.type !== 'Dashboard' || this.dashboardName.trim())
          && this.description.trim(),
      );
    },
  },
  methods: {
    closeComponent() {
      this.$emit('closeModal');
    },
    clearForm() {
      this.title = '';
      this.type = '';
      this.dashboardName = '';
      this.description = '';
      this.errors = {
        title: null,
        content: null,
        category: null,
        dashboard_name: null,
      };
    },
    validateField(field, value) {
      if (typeof value === 'string' && value.trim() === '') {
        this.$set(this.errors, field, 'This field is required');
      } else if (value === null || value === undefined || value === '') {
        this.$set(this.errors, field, 'This field is required');
      } else {
        this.$set(this.errors, field, null);
      }
    },
    validateObject(obj) {
      Object.entries(obj).forEach(([key, value]) => {
        this.validateField(key, value);
      });

      return !Object.values(this.errors).some((error) => error);
    },
    async submit() {
      const categoryMap = {
        Dashboard: 2,
        Dataset: 1,
        Feature: 3,
      };

      const data = {
        title: this.title,
        content: this.description,
        category: categoryMap[this.type],
      };

      if (this.type === 'Dashboard') {
        data.dashboard_name = this.dashboardName;
      }

      const isValid = this.validateObject({
        title: this.title,
        content: this.description,
        category: this.type,
        dashboard_name: this.type === 'Dashboard' ? this.dashboardName : 'not-required',
      });
      if (!isValid) {
        return;
      }

      this.submitting = true;

      try {
        await ApiServices.saveWhatsNew(data);
        this.$emit('closeModal');
      } catch (error) {
        console.error('Error submitting data:', error);
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');

.create-whats-new-overlay {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100%;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(43, 124, 109, 0.18), transparent 34%),
    radial-gradient(circle at bottom right, rgba(203, 164, 92, 0.14), transparent 30%),
    rgba(7, 17, 15, 0.34);
  backdrop-filter: blur(8px);
}

.create-whats-new-modal {
  position: relative;
  width: min(760px, 100%);
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 28px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.97), rgba(245, 249, 247, 0.95)),
    #ffffff;
  box-shadow: 0 30px 80px rgba(4, 25, 21, 0.22);
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 2;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(18, 59, 49, 0.12);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.94);
  color: #173a33;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  span {
    display: inline-block;
    font-size: 1.7rem;
    line-height: 1;
    transform: translateY(-1px);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 16px 32px rgba(23, 58, 51, 0.14);
  }
}

.hero-section {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(220px, 0.9fr);
  gap: 18px;
  padding: 18px;
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(12, 62, 53, 0.98), rgba(24, 111, 95, 0.94)),
    #0f4d42;
  color: #f8fcfb;
}

.eyebrow {
  display: inline-flex;
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
  margin: 12px 0 10px;
  font: 700 clamp(1.9rem, 3vw, 2.7rem) / 1.04 'Playfair Display', serif;
  letter-spacing: -0.03em;
}

.hero-copy p {
  margin: 0;
  max-width: 520px;
  color: rgba(248, 252, 251, 0.84);
  font: 500 0.95rem/1.65 'Manrope', sans-serif;
}

.hero-summary {
  display: grid;
  gap: 12px;
  align-content: end;
}

.summary-card {
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
  backdrop-filter: blur(12px);

  span {
    display: block;
    color: rgba(248, 252, 251, 0.72);
    font: 600 0.78rem/1.4 'Manrope', sans-serif;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  strong {
    display: block;
    margin-top: 6px;
    font: 800 1.2rem/1.2 'Manrope', sans-serif;
  }
}

.summary-card.subtle {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
}

.form-shell {
  margin-top: 18px;
  padding: 20px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 248, 0.94));
  border: 1px solid rgba(18, 59, 49, 0.08);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.form-field {
  display: grid;
  gap: 8px;
}

.field-wide {
  grid-column: 1 / -1;
}

.field-label {
  color: #20463f;
  font: 700 0.8rem/1.3 'Manrope', sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.field-control {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid rgba(134, 151, 145, 0.26);
  border-radius: 16px;
  background: #ffffff;
  color: #173a33;
  font: 600 0.96rem/1.4 'Manrope', sans-serif;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &:focus {
    border-color: rgba(43, 124, 109, 0.44);
    box-shadow: 0 0 0 4px rgba(43, 124, 109, 0.08);
  }
}

.field-control.error {
  border-color: rgba(220, 38, 38, 0.48);
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.06);
}

.field-select {
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, #46635c 50%),
    linear-gradient(135deg, #46635c 50%, transparent 50%);
  background-position:
    calc(100% - 18px) calc(50% - 3px),
    calc(100% - 12px) calc(50% - 3px);
  background-size: 6px 6px, 6px 6px;
  background-repeat: no-repeat;
}

.field-textarea {
  min-height: 138px;
  resize: vertical;
}

.field-error {
  color: #c2410c;
  font: 600 0.78rem/1.4 'Manrope', sans-serif;
}

.preview-card {
  padding: 14px 16px;
  border: 1px solid rgba(18, 59, 49, 0.08);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(244, 248, 247, 0.96), rgba(255, 255, 255, 0.96));

  p {
    margin: 0;
    color: #5d6f69;
    font: 500 0.9rem/1.6 'Manrope', sans-serif;
  }
}

.action-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.secondary-btn,
.primary-btn {
  border: 0;
  border-radius: 14px;
  padding: 12px 18px;
  font: 800 0.85rem/1.1 'Manrope', sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.secondary-btn {
  background: #eef4f2;
  color: #20463f;
  border: 1px solid rgba(18, 59, 49, 0.08);
}

.primary-btn {
  background: linear-gradient(135deg, #0f7b64, #125a4a);
  color: #f5fbf8;
  box-shadow: 0 14px 28px rgba(15, 123, 100, 0.18);
}

.secondary-btn:hover,
.primary-btn:hover {
  transform: translateY(-1px);
}

.primary-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

@media (max-width: 767px) {
  .create-whats-new-overlay {
    padding: 14px;
  }

  .create-whats-new-modal {
    padding: 18px;
    border-radius: 24px;
  }

  .hero-section,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-shell {
    padding: 16px;
  }

  .action-row {
    flex-direction: column-reverse;
    align-items: stretch;
  }
}
</style>
