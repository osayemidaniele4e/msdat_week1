<template>
  <section class="embed-section-page">
    <div class="embed-shell">
      <div class="embed-backdrop"></div>

      <div class="embed-hero">
        <div class="hero-copy">
          <p class="hero-kicker">Custom dashboard builder</p>
          <h1>{{ details.name }}</h1>
          <p class="hero-description">
            {{ details.description }}
          </p>
        </div>

        <div class="hero-panel">
          <span class="panel-label">Step 4</span>
          <strong>External content</strong>
          <p>Add a linked page or iframe block to enrich your dashboard experience.</p>
        </div>
      </div>

      <div class="embed-layout">
        <aside class="embed-sidebar">
          <div class="sidebar-card">
            <p class="sidebar-kicker">Embed options</p>
            <h2>Choose how this section should open</h2>
            <p class="sidebar-copy">
              Use a direct link for a lightweight handoff, or paste an iframe when the external
              content should live inside the dashboard itself.
            </p>

            <div class="tab-list" role="tablist" aria-label="Embed format">
              <button
                type="button"
                class="tab-button"
                :class="{ 'tab-button-active': activeTab === 'embedUrl' }"
                role="tab"
                :aria-selected="activeTab === 'embedUrl'"
                @click="toggleTab('embedUrl')"
              >
                <span class="tab-title">External link</span>
                <span class="tab-copy">Open another page from your dashboard</span>
              </button>

              <button
                type="button"
                class="tab-button"
                :class="{ 'tab-button-active': activeTab === 'embedIframe' }"
                role="tab"
                :aria-selected="activeTab === 'embedIframe'"
                @click="toggleTab('embedIframe')"
              >
                <span class="tab-title">Iframe embed</span>
                <span class="tab-copy">Display an external experience inline</span>
              </button>
            </div>
          </div>
        </aside>

        <div class="embed-card">
          <div class="card-header">
            <div>
              <p class="card-kicker">Configuration</p>
              <h2>{{ activeTab === 'embedUrl' ? 'Embed external link' : 'Embed iframe content' }}</h2>
            </div>
            <span class="mode-pill">
              {{ activeTab === 'embedUrl' ? 'Link mode' : 'Iframe mode' }}
            </span>
          </div>

          <div class="embed-form">
            <div v-if="activeTab === 'embedUrl'" class="form-stack">
              <div class="field-group">
                <label for="url-title">Embed external page title</label>
                <input
                  id="url-title"
                  v-model="urlTitle"
                  type="text"
                  placeholder="Enter a title for this linked section"
                  :class="{ 'is-invalid': showUrlTitleError }"
                />
                <p v-if="showUrlTitleError" class="field-error">
                  Add a title when a link is provided.
                </p>
              </div>

              <div class="field-group">
                <label for="url-link">Link to the embedded page</label>
                <input
                  id="url-link"
                  v-model="url"
                  type="text"
                  placeholder="https://example.com"
                  :class="{ 'is-invalid': showUrlError }"
                />
                <p v-if="showUrlError" class="field-error">
                  Enter a valid URL beginning with `http://` or `https://`.
                </p>
              </div>
            </div>

            <div v-else class="form-stack">
              <div class="field-group">
                <label for="iframe-title">External page iframe title</label>
                <input
                  id="iframe-title"
                  v-model="iframeTitle"
                  type="text"
                  placeholder="Enter a title for this embedded section"
                  :class="{ 'is-invalid': showIframeTitleError }"
                />
                <p v-if="showIframeTitleError" class="field-error">
                  Add a title when iframe code is provided.
                </p>
              </div>

              <div class="field-group">
                <label for="iframe-code">Paste external page iframe code</label>
                <textarea
                  id="iframe-code"
                  :rows="6"
                  v-model="embedded_iframe"
                  placeholder='<iframe src="https://example.com"></iframe>'
                  :class="{ 'is-invalid': showIframeCodeError }"
                ></textarea>
                <p v-if="showIframeCodeError" class="field-error">
                  Paste a valid iframe snippet with a `src` value.
                </p>
              </div>
            </div>

            <div class="field-group field-group-wide">
              <label for="embed-description">Dashboard description</label>
              <textarea
                id="embed-description"
                :rows="5"
                v-model="description"
                placeholder="Describe what this embedded section adds to your dashboard"
                :class="{ 'is-invalid': showDescriptionError }"
              ></textarea>
              <p v-if="showDescriptionError" class="field-error">
                Add at least 10 characters if you want to include a description.
              </p>
            </div>
          </div>

          <div class="action-row">
            <b-button class="editBtn" @click="backToPrefrence">
              Back to Data Table
            </b-button>

            <b-button @click="saveEmbed" class="nextBtn" :disabled="!canProceed">
              Next Page
            </b-button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      embedded_url: null,
      embedded_iframe: null,
      url: '',
      urlTitle: '',
      iframeTitle: '',
      activeTab: 'embedUrl',
      description: '',
    };
  },
  computed: {
    details() {
      return this.$store.getters.dashboardDetails;
    },
    safeUrlTitle() {
      return (this.urlTitle || '').trim();
    },
    safeUrl() {
      return (this.url || '').trim();
    },
    safeIframeTitle() {
      return (this.iframeTitle || '').trim();
    },
    safeIframeCode() {
      return (this.embedded_iframe || '').trim();
    },
    safeDescription() {
      return (this.description || '').trim();
    },
    isUrlSectionEmpty() {
      return !this.safeUrlTitle && !this.safeUrl;
    },
    isIframeSectionEmpty() {
      return !this.safeIframeTitle && !this.safeIframeCode;
    },
    hasStartedUrlSection() {
      return !!this.safeUrlTitle || !!this.safeUrl;
    },
    hasStartedIframeSection() {
      return !!this.safeIframeTitle || !!this.safeIframeCode;
    },
    isDescriptionEmpty() {
      return !this.safeDescription;
    },
    isUrlValid() {
      if (!this.safeUrl) {
        return false;
      }

      try {
        const parsed = new URL(this.safeUrl);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch (error) {
        return false;
      }
    },
    isIframeValid() {
      if (!this.safeIframeCode) {
        return false;
      }

      return /<iframe[\s\S]*src=["'][^"']+["'][\s\S]*>/i.test(this.safeIframeCode);
    },
    isDescriptionValid() {
      return this.safeDescription.length >= 10;
    },
    showUrlTitleError() {
      return !!this.safeUrl && !this.safeUrlTitle;
    },
    showUrlError() {
      if (!this.safeUrl && !this.safeUrlTitle) {
        return false;
      }

      return !this.isUrlValid;
    },
    showIframeTitleError() {
      return !!this.safeIframeCode && !this.safeIframeTitle;
    },
    showIframeCodeError() {
      if (!this.safeIframeCode && !this.safeIframeTitle) {
        return false;
      }

      return !this.isIframeValid;
    },
    showDescriptionError() {
      return (this.hasStartedUrlSection || this.hasStartedIframeSection || !this.isDescriptionEmpty)
        && !this.isDescriptionValid;
    },
    isUrlSectionValid() {
      return this.isUrlSectionEmpty || (!!this.safeUrlTitle && this.isUrlValid);
    },
    isIframeSectionValid() {
      return this.isIframeSectionEmpty || (!!this.safeIframeTitle && this.isIframeValid);
    },
    isDescriptionRequired() {
      return this.hasStartedUrlSection || this.hasStartedIframeSection;
    },
    isDescriptionAllowed() {
      if (this.isDescriptionRequired) {
        return this.isDescriptionValid;
      }

      return this.isDescriptionEmpty || this.isDescriptionValid;
    },
    canProceed() {
      return this.isUrlSectionValid && this.isIframeSectionValid && this.isDescriptionAllowed;
    },
  },

  mounted() {
    this.$store.commit('updateStep', 4);
    this.activeTab = localStorage.getItem('activeTab') || 'embedUrl';
    this.url = this.$store.getters.getUrl || '';
    this.embedded_iframe = this.$store.getters.getIframeEmbed || '';
    this.urlTitle = this.$store.getters.getNewEmbedUrlTitle || '';
    this.iframeTitle = this.$store.getters.getNewEmbedIframeTitle || '';
    this.description = this.$store.getters.getNewEmbedDashboardDescription || '';
  },

  methods: {
    toggleTab(tab) {
      this.activeTab = tab;
    },
    saveEmbed() {
      if (!this.canProceed) {
        return;
      }

      this.$store.dispatch('setEmbedUrl', this.modifyTableauUrl(this.url));
      this.$store.dispatch('setNewEmbedUrlTitleAction', this.urlTitle);
      this.$store.dispatch('setNewEmbedIframeTitleAction', this.iframeTitle);
      this.$store.dispatch('setEmbedDashboardDescriptionAction', this.description);
      localStorage.setItem('activeTab', this.activeTab);

      this.$store.dispatch('setEmbedIframe', this.embedded_iframe);
      this.$router.push('sections');
    },

    backToPrefrence() {
      this.$router.push('data-table');
    },
    modifyTableauUrl(url) {
      let result;
      if (url.includes('public.tableau.com')) {
        result = `${url}:showVizHome=no&embed=true`;
      } else if (url.includes('public.tableau.com') && url.includes('showVizHome=no&embed=true')) {
        result = url;
      } else {
        result = url;
      }
      return result;
    },
  },
};
</script>

<style scoped>
.embed-section-page {
  min-height: 100%;
  padding: 28px 0 56px;
  background:
    radial-gradient(circle at top left, rgba(53, 134, 146, 0.12), transparent 26%),
    radial-gradient(circle at bottom right, rgba(205, 226, 214, 0.52), transparent 32%),
    linear-gradient(145deg, #f4f8f8 0%, #fbf7f0 56%, #f4faf9 100%);
}

.embed-shell {
  position: relative;
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}

.embed-backdrop {
  position: absolute;
  top: 18px;
  right: 16px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(63, 137, 148, 0.18) 0%, rgba(63, 137, 148, 0) 72%);
  pointer-events: none;
}

.embed-hero {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
  padding: 36px;
  border: 1px solid rgba(10, 53, 61, 0.08);
  border-radius: 28px;
  background:
    linear-gradient(120deg, rgba(11, 57, 66, 0.96), rgba(38, 118, 122, 0.9)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0));
  box-shadow: 0 24px 56px rgba(17, 47, 53, 0.12);
  color: #eff8f8;
  overflow: hidden;
}

.embed-hero::after {
  position: absolute;
  right: -42px;
  bottom: -58px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  content: '';
}

.hero-copy,
.hero-panel {
  position: relative;
  z-index: 1;
}

.hero-copy {
  max-width: 700px;
}

.hero-kicker,
.sidebar-kicker,
.card-kicker {
  margin-bottom: 12px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.hero-kicker {
  color: rgba(239, 248, 248, 0.72);
}

.embed-hero h1 {
  margin-bottom: 14px;
  font-size: clamp(2rem, 3vw, 2.9rem);
  font-weight: 700;
  line-height: 1.05;
}

.hero-description,
.sidebar-copy,
.hero-panel p {
  margin-bottom: 0;
  line-height: 1.7;
}

.hero-description {
  max-width: 58ch;
  color: rgba(239, 248, 248, 0.86);
}

.hero-panel {
  min-width: 240px;
  max-width: 280px;
  padding: 22px 22px 20px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}

.panel-label,
.mode-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.panel-label {
  margin-bottom: 12px;
  padding: 6px 10px;
  background: rgba(210, 244, 230, 0.16);
  color: #d9f5e9;
}

.hero-panel strong {
  display: block;
  margin-bottom: 8px;
  font-size: 1.08rem;
}

.hero-panel p {
  color: rgba(239, 248, 248, 0.78);
}

.embed-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(260px, 0.34fr) minmax(0, 0.66fr);
  gap: 24px;
}

.sidebar-card,
.embed-card {
  border: 1px solid rgba(10, 53, 61, 0.08);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 24px 60px rgba(17, 47, 53, 0.08);
  backdrop-filter: blur(14px);
}

.sidebar-card {
  padding: 30px 24px;
}

.sidebar-kicker,
.card-kicker {
  color: #2d7280;
}

.sidebar-card h2,
.card-header h2 {
  margin-bottom: 12px;
  font-size: clamp(1.4rem, 2.2vw, 2rem);
  font-weight: 700;
  line-height: 1.15;
  color: #16343a;
}

.sidebar-copy {
  color: #607479;
}

.tab-list {
  display: grid;
  gap: 14px;
  margin-top: 24px;
}

.tab-button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  width: 100%;
  padding: 18px 18px 16px;
  border: 1px solid rgba(13, 92, 110, 0.1);
  border-radius: 18px;
  background: #f6faf9;
  color: #15343a;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease,
    background-color 0.2s ease;
}

.tab-button:hover {
  transform: translateY(-1px);
  border-color: rgba(13, 92, 110, 0.18);
  box-shadow: 0 14px 28px rgba(17, 47, 53, 0.08);
}

.tab-button-active {
  border-color: rgba(13, 92, 110, 0.35);
  background: linear-gradient(135deg, rgba(13, 92, 110, 0.08), rgba(26, 123, 121, 0.03));
  box-shadow: 0 18px 32px rgba(13, 92, 110, 0.12);
}

.tab-title {
  font-weight: 700;
  font-size: 1rem;
}

.tab-copy {
  color: #6c7e82;
  line-height: 1.5;
}

.embed-card {
  padding: 30px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 26px;
}

.mode-pill {
  padding: 8px 12px;
  background: rgba(13, 92, 110, 0.08);
  color: #0d5c6e;
}

.embed-form {
  display: grid;
  gap: 24px;
}

.form-stack {
  display: grid;
  gap: 20px;
}

.field-group {
  display: grid;
  gap: 10px;
}

.field-group label {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #17353c;
}

.field-group input,
.field-group textarea {
  width: 100%;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(17, 47, 53, 0.12);
  border-radius: 16px;
  background: rgba(246, 250, 249, 0.96);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  color: #16343a;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.field-group input {
  min-height: 56px;
}

.field-group textarea {
  resize: vertical;
  min-height: 132px;
}

.field-group input:focus,
.field-group textarea:focus {
  outline: none;
  border-color: rgba(13, 92, 110, 0.5);
  background: #ffffff;
  box-shadow: 0 0 0 0.2rem rgba(13, 92, 110, 0.12);
}

.field-group input.is-invalid,
.field-group textarea.is-invalid {
  border-color: rgba(190, 74, 74, 0.58);
  box-shadow: 0 0 0 0.2rem rgba(190, 74, 74, 0.08);
}

.field-error {
  margin: -2px 0 0;
  color: #9b3b3b;
  font-size: 0.84rem;
  line-height: 1.45;
}

.field-group-wide {
  padding-top: 8px;
  border-top: 1px solid rgba(17, 47, 53, 0.08);
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  margin-top: 28px;
}

.nextBtn,
.editBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0.9rem 1.4rem;
  border-radius: 16px;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.nextBtn {
  border: 0;
  background: linear-gradient(135deg, #0d5c6e 0%, #1a7b79 100%);
  box-shadow: 0 16px 32px rgba(13, 92, 110, 0.2);
  color: #ffffff;
}

.nextBtn:hover,
.nextBtn:focus {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(13, 92, 110, 0.26);
}

.nextBtn:disabled {
  opacity: 0.65;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

.editBtn {
  border: 1px solid rgba(13, 92, 110, 0.14);
  background: #f5f9f9;
  box-shadow: 0 10px 22px rgba(17, 47, 53, 0.08);
  color: #103740;
}

.editBtn:hover,
.editBtn:focus {
  transform: translateY(-1px);
  background: #ffffff;
}

@media (max-width: 991px) {
  .embed-layout {
    grid-template-columns: 1fr;
  }

  .embed-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-panel {
    max-width: none;
  }
}

@media (max-width: 767px) {
  .embed-shell {
    width: min(100% - 20px, 1180px);
  }

  .embed-hero,
  .sidebar-card,
  .embed-card {
    padding: 24px 20px;
  }

  .card-header,
  .action-row {
    flex-direction: column;
    align-items: stretch;
  }

  .nextBtn,
  .editBtn {
    width: 100%;
  }
}
</style>
