<!-- eslint-disable camelcase -->
<template>
  <div class="social-share-modal work-sans">
    <section class="share-hero">
      <div class="hero-copy">
        <span class="hero-kicker">Share dashboard</span>
        <h2>Share this dashboard quickly and cleanly.</h2>
        <p>
          Email it, copy a link, or open a social channel.
        </p>
      </div>

      <div class="hero-metrics">
        <div class="metric-card">
          <span class="metric-label">Current page</span>
          <strong>Dashboard view</strong>
          <small>Prepared for quick sharing</small>
        </div>
        <div class="metric-card subtle">
          <span class="metric-label">Specific link</span>
          <strong>{{ shareLink ? 'Ready' : 'Loading' }}</strong>
          <small>Includes the active dashboard context</small>
        </div>
      </div>
    </section>

    <section class="share-grid">
      <article class="share-card">
        <div class="card-header">
          <div class="card-icon card-icon--email">
            <b-icon icon="envelope-fill" />
          </div>
          <div>
            <h3>Email a teammate</h3>
            <p>Launch a prefilled email with the dashboard summary and direct link.</p>
          </div>
        </div>

        <label class="field-label" for="share-email">Recipient email</label>
        <div class="input-shell">
          <input
            id="share-email"
            v-model.trim="email"
            type="email"
            class="field-input"
            placeholder="name@organization.org"
            @keyup.enter="shareViaEmail"
          />
        </div>

        <button type="button" class="action-btn action-btn--primary" @click="shareViaEmail">
          Send invite
          <b-icon icon="arrow-up-right" class="action-icon" />
        </button>
      </article>

      <article class="share-card">
        <div class="card-header">
          <div class="card-icon card-icon--link">
            <b-icon icon="link-45deg" />
          </div>
          <div>
            <h3>Copy dashboard links</h3>
            <p>Use the general page URL or the shareable link tied to the current section.</p>
          </div>
        </div>

        <div class="link-stack">
          <div>
            <label class="field-label" for="share-general-link">Current page link</label>
            <div class="inline-action">
              <div class="input-shell">
                <input
                  id="share-general-link"
                  ref="linkInput"
                  v-model="shareURL"
                  type="text"
                  class="field-input"
                  readonly
                />
              </div>
              <button type="button" class="action-btn action-btn--secondary" @click="copy">
                {{ copy_text }}
              </button>
            </div>
          </div>

          <div>
            <label class="field-label" for="share-specific-link">Section-specific link</label>
            <div class="inline-action">
              <div class="input-shell">
                <input
                  id="share-specific-link"
                  ref="sharedInput"
                  v-model="shareLink"
                  type="text"
                  class="field-input"
                  readonly
                />
              </div>
              <button
                type="button"
                class="action-btn action-btn--secondary"
                @click="copy_shared_text"
              >
                {{ copy_shared }}
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section class="social-panel">
        <div class="social-panel__header">
          <div>
            <span class="hero-kicker hero-kicker--muted">Continue on social</span>
            <h3>Open a channel and keep sharing</h3>
          </div>
        <p>Pick a platform.</p>
      </div>

      <div class="social-grid">
        <ShareNetwork
          network="facebook"
          :url="shareURL"
          :title="shareText"
          :description="shareDesc"
          :quote="shareDesc"
          :hashtags="hashtags"
          class="social-card social-card--facebook"
        >
          <span class="social-card__icon">
            <b-icon icon="facebook" />
          </span>
          <span class="social-card__copy">
            <strong>Facebook</strong>
            <small>Share with a broader community</small>
          </span>
        </ShareNetwork>

        <ShareNetwork
          network="twitter"
          :url="shareURL"
          :title="shareText"
          :description="shareDesc"
          :quote="shareDesc"
          :hashtags="hashtags"
          :twitterUser="twitterUser"
          class="social-card social-card--x"
        >
          <span class="social-card__icon social-card__icon--svg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
              <path
                d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
              />
            </svg>
          </span>
          <span class="social-card__copy">
            <strong>X</strong>
            <small>Post a public snapshot</small>
          </span>
        </ShareNetwork>

        <ShareNetwork
          network="linkedin"
          :url="shareURL"
          :title="shareText"
          :description="shareDesc"
          :quote="shareDesc"
          class="social-card social-card--linkedin"
        >
          <span class="social-card__icon">
            <b-icon icon="linkedin" />
          </span>
          <span class="social-card__copy">
            <strong>LinkedIn</strong>
            <small>Share professionally</small>
          </span>
        </ShareNetwork>

        <ShareNetwork
          network="whatsapp"
          :url="shareURL"
          :title="shareText"
          :description="shareDesc"
          :quote="shareDesc"
          :hashtags="hashtags"
          class="social-card social-card--whatsapp"
        >
          <span class="social-card__icon">
            <b-icon icon="whatsapp" />
          </span>
          <span class="social-card__copy">
            <strong>WhatsApp</strong>
            <small>Drop it straight into team chats</small>
          </span>
        </ShareNetwork>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      shareURL: window.location.href,
      shareDesc:
        'Take a look at this health indicator on the Multi-Source Data and Triangulation (MSDAT) platform',
      copy_text: 'Copy link',
      shareText: 'MSDAT Platform',
      email: '',
      twitterUser: '@eHealth4every1',
      hashtags:
        'HealthTech,HealthData,DataAnalytics,HealthDataAnalytics,BigData,DataSources,Data,DataScientist,DataAnalyst,HealthIndicators',
      shareLink: '',
      copy_shared: 'Copy link',
    };
  },
  computed: {
    ...mapGetters('MSDAT_STORE', ['getSelectedConfig']),
  },
  mounted() {
    const { name } = this.$route.params;

    if (name === 'Advanced_Analytics') {
      const advancedUrl = localStorage.getItem('advanced_url');
      this.shareLink = advancedUrl || this.shareURL;
    } else if (name === undefined) {
      this.shareLink = `${window.location.origin}${window.location.pathname}`;
    } else {
      const params = new URLSearchParams(window.location.search);
      params.set('section', this.$store.state.MSDAT_STORE.selectedSection);
      this.shareLink = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, '', this.shareLink);
    }
  },
  methods: {
    async writeToClipboard(refName, stateKey) {
      const value = this[stateKey === 'copy_text' ? 'shareURL' : 'shareLink'];

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(value);
        } else if (this.$refs[refName]) {
          this.$refs[refName].select();
          document.execCommand('copy');
        }

        this[stateKey] = 'Copied';
        window.setTimeout(() => {
          this[stateKey] = 'Copy link';
        }, 1800);
      } catch (error) {
        if (this.$refs[refName]) {
          this.$refs[refName].select();
        }
      }
    },

    copy() {
      this.writeToClipboard('linkInput', 'copy_text');
    },

    copy_shared_text() {
      this.writeToClipboard('sharedInput', 'copy_shared');
    },

    shareViaEmail() {
      if (!this.email) {
        return;
      }

      const subject = encodeURIComponent(this.shareText);
      const body = encodeURIComponent(`${this.shareDesc} : ${this.shareLink || this.shareURL}`);
      window.location = `mailto:${this.email}?subject=${subject}&body=${body}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.social-share-modal {
  --surface: #f7fbf8;
  --surface-strong: #ffffff;
  --border-soft: rgba(18, 72, 57, 0.1);
  --text-strong: #153b32;
  --text-muted: #647873;
  --brand: #0f7b64;
  --brand-deep: #105345;
  --brand-soft: rgba(15, 123, 100, 0.1);
  display: grid;
  gap: 14px;
  color: var(--text-strong);
}

.share-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.9fr);
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 20px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 28%),
    linear-gradient(135deg, #0f7b64, #105345 62%, #0b4036);
  color: #f4fbf8;
}

.hero-copy h2 {
  margin: 8px 0 8px;
  font-size: clamp(1.35rem, 2.2vw, 1.95rem);
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.hero-copy p {
  max-width: 420px;
  margin: 0;
  color: rgba(244, 251, 248, 0.82);
  font-size: 0.88rem;
  line-height: 1.5;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.hero-kicker--muted {
  border-color: rgba(15, 123, 100, 0.14);
  background: rgba(15, 123, 100, 0.08);
  color: var(--brand);
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(6px);
}

.metric-card.subtle {
  background: rgba(255, 255, 255, 0.06);
}

.metric-label {
  color: rgba(244, 251, 248, 0.68);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.metric-card strong {
  font-size: 0.98rem;
  font-weight: 800;
}

.metric-card small {
  color: rgba(244, 251, 248, 0.78);
  font-size: 0.78rem;
  line-height: 1.35;
}

.share-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.share-card,
.social-panel {
  padding: 18px;
  border: 1px solid var(--border-soft);
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 249, 247, 0.96)),
    var(--surface-strong);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 18px 40px rgba(15, 57, 47, 0.06);
}

.card-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.card-header h3,
.social-panel__header h3 {
  margin: 0;
  color: var(--text-strong);
  font-size: 1rem;
  font-weight: 800;
}

.card-header p,
.social-panel__header p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 0.84rem;
  line-height: 1.45;
}

.card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  font-size: 1rem;
}

.card-icon--email {
  background: rgba(15, 123, 100, 0.12);
  color: var(--brand);
}

.card-icon--link {
  background: rgba(21, 92, 176, 0.1);
  color: #155cb0;
}

.field-label {
  display: inline-block;
  margin-bottom: 6px;
  color: #36524b;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.input-shell {
  display: flex;
  align-items: center;
  min-height: 46px;
  padding: 0 12px;
  border: 1px solid rgba(20, 60, 50, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.94);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-shell:focus-within {
  border-color: rgba(15, 123, 100, 0.24);
  box-shadow: 0 0 0 4px rgba(15, 123, 100, 0.08);
}

.field-input {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--text-strong);
  font-size: 0.89rem;
  font-weight: 600;
  line-height: 1.4;
  outline: none;
}

.field-input::placeholder {
  color: #8aa099;
}

.link-stack {
  display: grid;
  gap: 12px;
}

.inline-action {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 15px;
  border-radius: 12px;
  border: none;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.action-btn:hover,
.social-card:hover {
  transform: translateY(-1px);
}

.action-btn--primary {
  margin-top: 12px;
  background: linear-gradient(135deg, var(--brand), var(--brand-deep));
  color: #ffffff;
  box-shadow: 0 18px 30px rgba(15, 123, 100, 0.18);
}

.action-btn--secondary {
  min-width: 104px;
  background: #eef7f3;
  color: #0c5f48;
  border: 1px solid rgba(0, 125, 83, 0.12);
}

.action-icon {
  font-size: 0.95rem;
}

.social-panel {
  display: grid;
  gap: 14px;
}

.social-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.social-panel__header p {
  max-width: 180px;
  margin: 0;
}

.social-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.social-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(20, 60, 50, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.94);
  color: inherit;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.social-card:hover {
  border-color: rgba(15, 123, 100, 0.22);
  box-shadow: 0 18px 30px rgba(15, 57, 47, 0.08);
  text-decoration: none;
}

.social-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  font-size: 1rem;
  flex: 0 0 auto;
}

.social-card__icon--svg svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.social-card__copy {
  display: grid;
  gap: 2px;
}

.social-card__copy strong {
  color: #173a33;
  font-size: 0.88rem;
  font-weight: 800;
}

.social-card__copy small {
  color: #6a7f79;
  font-size: 0.74rem;
  font-weight: 600;
  line-height: 1.35;
}

.social-card--facebook .social-card__icon {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}

.social-card--x .social-card__icon {
  background: rgba(17, 24, 39, 0.08);
  color: #111827;
}

.social-card--linkedin .social-card__icon {
  background: rgba(8, 145, 178, 0.12);
  color: #0e7490;
}

.social-card--whatsapp .social-card__icon {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}

@media (max-width: 991px) {
  .share-hero,
  .share-grid {
    grid-template-columns: 1fr;
  }

  .hero-metrics,
  .social-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .social-panel__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .social-panel__header p {
    max-width: none;
  }
}

@media (max-width: 640px) {
  .social-share-modal {
    gap: 14px;
  }

  .share-hero,
  .share-card,
  .social-panel {
    padding: 16px;
    border-radius: 18px;
  }

  .inline-action {
    grid-template-columns: 1fr;
  }

  .hero-metrics,
  .social-grid {
    grid-template-columns: 1fr;
  }

  .action-btn--secondary,
  .action-btn--primary {
    width: 100%;
  }
}
</style>
