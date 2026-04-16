<template>
  <div class="share-overlay">
    <div class="share-modal">
      <button type="button" class="close-btn" aria-label="Close share panel" @click="closeComponent">
        <span>×</span>
      </button>

      <section class="share-hero">
        <div class="hero-copy">
          <span class="hero-kicker">Share section</span>
          <h2>Share this view with a more refined, faster workflow.</h2>
          <p>Email a teammate, copy the active section link, or continue in a social channel.</p>
        </div>

        <div class="hero-metrics">
          <div class="metric-card">
            <span class="metric-label">Current state</span>
            <strong>Ready to share</strong>
            <small>Built from the active dashboard context</small>
          </div>
          <div class="metric-card subtle">
            <span class="metric-label">Specific link</span>
            <strong>{{ shareLink ? 'Prepared' : 'Loading' }}</strong>
            <small>Includes year and section selections where available</small>
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
              <p>Open a prefilled email with the current dashboard share link.</p>
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
              <h3>Copy share link</h3>
              <p>Use the generated section link in messages, briefs, or reports.</p>
            </div>
          </div>

          <label class="field-label" for="share-link">Section-specific link</label>
          <div class="inline-action">
            <div class="input-shell">
              <input
                id="share-link"
                ref="sharedInput"
                v-model="shareLink"
                type="text"
                class="field-input"
                readonly
              />
            </div>
            <button type="button" class="action-btn action-btn--secondary" @click="copy_shared_text">
              {{ copy_shared }}
            </button>
          </div>
        </article>
      </section>

      <section class="social-panel">
        <div class="social-panel__header">
          <div>
            <span class="hero-kicker hero-kicker--muted">Continue on social</span>
            <h3>Open a channel and keep sharing</h3>
          </div>
          <p>Choose the platform that best fits your audience.</p>
        </div>

        <div class="social-grid">
          <button
            v-for="platform in socialPlatforms"
            :key="platform.key"
            type="button"
            class="social-card"
            :class="platform.cardClass"
            @click="share(platform.key)"
          >
            <span class="social-card__icon" :class="platform.iconClass">
              <b-icon v-if="platform.icon" :icon="platform.icon" />
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                aria-hidden="true"
              >
                <path
                  d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
                />
              </svg>
            </span>
            <span class="social-card__copy">
              <strong>{{ platform.label }}</strong>
              <small>{{ platform.description }}</small>
            </span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  data() {
    return {
      shareURL: window.location.href,
      shareDesc:
        'Take a look at this health indicator on the Multi-Source Data and Triangulation (MSDAT) platform',
      shareText: 'MSDAT Platform',
      email: '',
      shareLink: '',
      copy_shared: 'Copy link',
      socialPlatforms: [
        {
          key: 'whatsapp',
          label: 'WhatsApp',
          description: 'Drop it into team chats',
          icon: 'whatsapp',
          iconClass: 'social-card__icon--whatsapp',
          cardClass: 'social-card--whatsapp',
        },
        {
          key: 'x',
          label: 'X',
          description: 'Post a public snapshot',
          icon: '',
          iconClass: 'social-card__icon--x',
          cardClass: 'social-card--x',
        },
        {
          key: 'facebook',
          label: 'Facebook',
          description: 'Share with a wider network',
          icon: 'facebook',
          iconClass: 'social-card__icon--facebook',
          cardClass: 'social-card--facebook',
        },
        {
          key: 'linkedin',
          label: 'LinkedIn',
          description: 'Share professionally',
          icon: 'linkedin',
          iconClass: 'social-card__icon--linkedin',
          cardClass: 'social-card--linkedin',
        },
      ],
    };
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
      params.set('year', this.$store.state.MSDAT_STORE.selectedConfigurations.period);
      params.set('section', this.$store.state.MSDAT_STORE.selectedSection);
      this.shareLink = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, '', this.shareLink);
    }
  },
  methods: {
    ...mapMutations('MSDAT_STORE', ['closeShowShareSection']),

    closeComponent() {
      this.closeShowShareSection();
    },

    async copy_shared_text() {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(this.shareLink);
        } else if (this.$refs.sharedInput) {
          this.$refs.sharedInput.select();
          document.execCommand('copy');
        }

        this.copy_shared = 'Copied';
        window.setTimeout(() => {
          this.copy_shared = 'Copy link';
        }, 1800);
      } catch (error) {
        if (this.$refs.sharedInput) {
          this.$refs.sharedInput.select();
        }
      }
    },

    shareViaEmail() {
      if (!this.email) {
        // eslint-disable-next-line no-alert
        alert('Please enter a valid email address');
        return;
      }

      const subject = encodeURIComponent(this.shareText);
      const body = encodeURIComponent(`${this.shareDesc}: ${this.shareLink || this.shareURL}`);
      const recipient = encodeURIComponent(this.email);
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    },

    share(platform) {
      const encodedLink = encodeURIComponent(this.shareLink);
      let url = '';

      switch (platform) {
        case 'whatsapp':
          url = `https://wa.me/?text=${encodedLink}`;
          break;
        case 'x':
          url = `https://twitter.com/intent/tweet?url=${encodedLink}`;
          break;
        case 'facebook':
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
          break;
        case 'linkedin':
          url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`;
          break;
        default:
          // eslint-disable-next-line no-alert
          alert(`Unsupported platform: ${platform}`);
          return;
      }

      window.open(url, '_blank');
    },
  },
};
</script>

<style lang="scss" scoped>
.share-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(15, 123, 100, 0.2), transparent 34%),
    radial-gradient(circle at bottom right, rgba(21, 92, 176, 0.14), transparent 28%),
    rgba(6, 18, 15, 0.38);
  backdrop-filter: blur(8px);
}

.share-modal {
  position: relative;
  width: min(960px, 100%);
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 28px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(246, 250, 248, 0.96)),
    #ffffff;
  box-shadow: 0 32px 80px rgba(8, 27, 22, 0.18);
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid rgba(16, 54, 45, 0.12);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #173a33;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.close-btn:hover,
.action-btn:hover,
.social-card:hover {
  transform: translateY(-1px);
}

.close-btn span {
  display: block;
  font-size: 1.75rem;
  line-height: 1;
}

.close-btn:hover {
  background: #ffffff;
  box-shadow: 0 16px 32px rgba(23, 58, 51, 0.14);
}

.share-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.9fr);
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 22px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 28%),
    linear-gradient(135deg, #0f7b64, #105345 62%, #0b4036);
  color: #f4fbf8;
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
  color: #0f7b64;
}

.hero-copy h2 {
  margin: 8px 0;
  font-size: clamp(1.4rem, 2.4vw, 2rem);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.hero-copy p {
  max-width: 440px;
  margin: 0;
  color: rgba(244, 251, 248, 0.82);
  font-size: 0.9rem;
  line-height: 1.5;
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
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
  margin-top: 14px;
}

.share-card,
.social-panel {
  padding: 18px;
  border: 1px solid rgba(18, 72, 57, 0.1);
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 249, 247, 0.96)),
    #ffffff;
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
  color: #153b32;
  font-size: 1rem;
  font-weight: 800;
}

.card-header p,
.social-panel__header p {
  margin: 4px 0 0;
  color: #647873;
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
  color: #0f7b64;
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
  color: #153b32;
  font-size: 0.89rem;
  font-weight: 600;
  line-height: 1.4;
  outline: none;
}

.field-input::placeholder {
  color: #8aa099;
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

.action-btn--primary {
  margin-top: 12px;
  background: linear-gradient(135deg, #0f7b64, #105345);
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
  margin-top: 14px;
}

.social-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.social-panel__header p {
  max-width: 240px;
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
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.social-card:hover {
  border-color: rgba(15, 123, 100, 0.22);
  box-shadow: 0 18px 30px rgba(15, 57, 47, 0.08);
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

.social-card__icon svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.social-card__icon--whatsapp {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}

.social-card__icon--x {
  background: rgba(17, 24, 39, 0.08);
  color: #111827;
}

.social-card__icon--facebook {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}

.social-card__icon--linkedin {
  background: rgba(8, 145, 178, 0.12);
  color: #0e7490;
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
  .share-overlay {
    padding: 12px;
  }

  .share-modal {
    max-height: calc(100vh - 24px);
    padding: 18px;
    border-radius: 22px;
  }

  .share-hero,
  .share-card,
  .social-panel {
    padding: 16px;
    border-radius: 18px;
  }

  .hero-metrics,
  .social-grid,
  .inline-action {
    grid-template-columns: 1fr;
  }

  .action-btn--secondary,
  .action-btn--primary {
    width: 100%;
  }
}
</style>
