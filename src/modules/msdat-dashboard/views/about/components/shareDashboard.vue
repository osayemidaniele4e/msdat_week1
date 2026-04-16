<template>
  <div class="share-dashboard">
    <section class="share-hero">
      <div class="hero-kicker">Dashboard sharing</div>
      <h2>Share this dashboard with a more polished handoff</h2>
      <p>
        Send a quick email, copy a public link, or share the current focused view with a cleaner,
        more deliberate workflow.
      </p>
      <div class="hero-badges">
        <span class="hero-badge">Public link</span>
        <span class="hero-badge subtle">Specific view</span>
      </div>
    </section>

    <section class="share-grid">
      <article class="share-card">
        <div class="card-header">
          <div class="card-icon mint">✉</div>
          <div>
            <h3>Send by email</h3>
            <p>Open your mail client with the dashboard details prefilled.</p>
          </div>
        </div>

        <label class="field-label" for="dashboard-share-email">Recipient email</label>
        <div class="input-shell">
          <input
            id="dashboard-share-email"
            v-model.trim="email"
            type="email"
            class="share-input"
            placeholder="name@organization.org"
            @keyup.enter="shareViaEmail"
          />
        </div>
        <button type="button" class="action-btn primary" @click="shareViaEmail">
          Send invite
          <b-icon icon="caret-right-fill" class="btn-icon" />
        </button>
      </article>

      <article class="share-card">
        <div class="card-header">
          <div class="card-icon sky">↗</div>
          <div>
            <h3>Share link</h3>
            <p>Copy the public dashboard URL for easy sharing anywhere.</p>
          </div>
        </div>

        <label class="field-label" for="dashboard-share-link">Public dashboard URL</label>
        <div class="input-shell">
          <input
            id="dashboard-share-link"
            ref="shareLinkInput"
            :value="shareURL"
            type="text"
            class="share-input"
            readonly
          />
        </div>
        <button type="button" class="action-btn secondary" @click="copyToClipboard('shareLinkInput')">
          {{ copyText }}
          <b-icon icon="bookmarks" class="btn-icon" />
        </button>
      </article>
    </section>

    <section class="specific-card">
      <div class="card-header">
        <div class="card-icon gold">◎</div>
        <div>
          <h3>Share specific view</h3>
          <p>Copy the exact dashboard state currently open in your browser.</p>
        </div>
      </div>

      <div class="specific-layout">
        <div>
          <label class="field-label" for="dashboard-specific-link">Current dashboard state</label>
          <div class="input-shell">
            <input
              id="dashboard-specific-link"
              ref="specificLinkInput"
              :value="specificShareURL"
              type="text"
              class="share-input"
              readonly
            />
          </div>
        </div>

        <button
          type="button"
          class="action-btn tertiary"
          @click="copyToClipboard('specificLinkInput', true)"
        >
          {{ specificCopyText }}
          <b-icon icon="bookmarks" class="btn-icon" />
        </button>
      </div>
    </section>

    <section class="social-card">
      <div class="social-header">
        <div>
          <h3>Share on social media</h3>
          <p>Choose a platform and continue sharing with the dashboard summary attached.</p>
        </div>
      </div>

      <div class="social-grid">
        <ShareNetwork
          v-for="network in socialNetworks"
          :key="network.name"
          :network="network.name"
          :url="shareURL"
          :title="shareText"
          :description="shareDesc"
          :quote="shareDesc"
          :hashtags="hashtags"
          :twitter-user="network.twitterUser"
          class="social-link"
        >
          <div class="social-tile">
            <span class="social-icon" :style="{ color: network.color }">
              <b-icon
                v-if="!network.customIcon"
                :icon="network.icon"
                font-scale="1.2"
              />
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                aria-hidden="true"
              >
                <path
                  d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span class="social-copy">
              <strong>{{ network.label }}</strong>
              <small>{{ network.helper }}</small>
            </span>
          </div>
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
      shareURL: '',
      specificShareURL: '',
      shareDesc: '',
      copyText: 'Copy link',
      specificCopyText: 'Copy view',
      shareText: 'MSDAT Platform',
      email: '',
      hashtags:
        'HealthTech,HealthData,DataAnalytics,HealthDataAnalytics,BigData,DataSources,Data,DataScientist,DataAnalyst,HealthIndicators',
      socialNetworks: [
        {
          name: 'facebook',
          label: 'Facebook',
          helper: 'Share to your network',
          color: '#3b5998',
          icon: 'facebook',
        },
        {
          name: 'twitter',
          label: 'X',
          helper: 'Post to a public audience',
          color: '#111827',
          icon: 'twitter',
          customIcon: true,
          twitterUser: '@eHealth4every1',
        },
        {
          name: 'linkedin',
          label: 'LinkedIn',
          helper: 'Share professionally',
          color: '#0077b5',
          icon: 'linkedin',
        },
        {
          name: 'whatsapp',
          label: 'WhatsApp',
          helper: 'Send in team chats',
          color: '#25d366',
          icon: 'whatsapp',
        },
      ],
    };
  },
  computed: {
    ...mapGetters('MSDAT_STORE', ['getSelectedConfig']),
  },
  mounted() {
    const id = this.$route.params.id;
    this.shareURL = `${window.location.origin}/custom/public/${id}`;
    this.specificShareURL = window.location.href;
    this.shareDesc = `Take a look at '${this.getIndicatorName()}' on the Multi-Source Data and Triangulation (MSDAT) platform`;
  },
  methods: {
    getIndicatorName() {
      return this.getSelectedConfig?.indicator?.['full_name'] || 'this dashboard';
    },
    copyToClipboard(refName, isSpecific = false) {
      const target = this.$refs[refName];
      if (!target) {
        return;
      }

      target.select();
      document.execCommand('copy');

      if (isSpecific) {
        this.specificCopyText = 'Copied';
        setTimeout(() => {
          this.specificCopyText = 'Copy view';
        }, 2000);
        return;
      }

      this.copyText = 'Copied';
      setTimeout(() => {
        this.copyText = 'Copy link';
      }, 2000);
    },
    shareViaEmail() {
      if (!this.email) {
        return;
      }

      const mailtoLink = `mailto:${this.email}?subject=${encodeURIComponent(this.shareText)}&body=${encodeURIComponent(this.shareDesc)} : ${encodeURIComponent(this.shareURL)}`;
      window.location.href = mailtoLink;
    },
  },
};
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');

.share-dashboard {
  display: flex;
  flex-direction: column;
  gap: 18px;
  font-family: 'Manrope', sans-serif;
}

.share-hero,
.share-card,
.specific-card,
.social-card {
  border: 1px solid rgba(20, 60, 50, 0.08);
  border-radius: 24px;
  overflow: hidden;
}

.share-hero {
  padding: 24px;
  background:
    linear-gradient(135deg, rgba(16, 83, 69, 0.98), rgba(36, 124, 109, 0.92)),
    #105345;
  color: #f7fbfa;

  h2 {
    margin: 10px 0 12px;
    font: 700 clamp(1.8rem, 3.5vw, 2.8rem) / 1.05 'Playfair Display', serif;
    letter-spacing: -0.03em;
  }

  p {
    max-width: 620px;
    margin: 0;
    color: rgba(247, 251, 250, 0.84);
    font: 500 0.96rem/1.7 'Manrope', sans-serif;
  }
}

.hero-kicker {
  display: inline-flex;
  padding: 7px 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font: 700 0.72rem/1 'Manrope', sans-serif;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.hero-badge {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font: 700 0.76rem/1 'Manrope', sans-serif;
}

.hero-badge.subtle {
  background: rgba(255, 255, 255, 0.08);
}

.share-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.share-card,
.specific-card,
.social-card {
  padding: 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 249, 247, 0.94));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.card-header,
.social-header {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 18px;

  h3 {
    margin: 0;
    color: #173a33;
    font: 800 1.02rem/1.2 'Manrope', sans-serif;
  }

  p {
    margin: 7px 0 0;
    color: #647873;
    font: 500 0.9rem/1.6 'Manrope', sans-serif;
  }
}

.card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  font: 800 1.02rem/1 'Manrope', sans-serif;
  flex-shrink: 0;
}

.mint {
  background: rgba(0, 125, 83, 0.12);
  color: #0f7b64;
}

.sky {
  background: rgba(0, 94, 184, 0.1);
  color: #155cb0;
}

.gold {
  background: rgba(191, 144, 0, 0.14);
  color: #9b7000;
}

.field-label {
  display: inline-block;
  margin-bottom: 8px;
  color: #36524b;
  font: 700 0.8rem/1 'Manrope', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.input-shell {
  display: flex;
  align-items: center;
  min-height: 54px;
  padding: 0 14px;
  border: 1px solid rgba(20, 60, 50, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
}

.share-input {
  width: 100%;
  border: none;
  background: transparent;
  color: #173a33;
  font: 600 0.95rem/1.4 'Manrope', sans-serif;
  outline: none;
}

.share-input::placeholder {
  color: #8aa099;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  margin-top: 14px;
  padding: 0 18px;
  border: none;
  border-radius: 14px;
  font: 800 0.82rem/1 'Manrope', sans-serif;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.action-btn:hover,
.social-tile:hover {
  transform: translateY(-1px);
}

.primary {
  background: linear-gradient(135deg, #0f7b64, #125a4a);
  color: #ffffff;
  box-shadow: 0 16px 28px rgba(15, 123, 100, 0.18);
}

.secondary,
.tertiary {
  background: #eef7f3;
  color: #0c5f48;
  border: 1px solid rgba(0, 125, 83, 0.12);
}

.specific-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: end;
}

.social-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.social-link {
  text-decoration: none;
}

.social-tile {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 76px;
  padding: 16px;
  border: 1px solid rgba(20, 60, 50, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.social-tile:hover {
  border-color: rgba(15, 123, 100, 0.24);
  box-shadow: 0 16px 28px rgba(15, 123, 100, 0.1);
}

.social-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(20, 60, 50, 0.06);

  svg {
    width: 20px;
    height: 20px;
  }
}

.social-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    color: #1a302b;
    font: 800 0.92rem/1.2 'Manrope', sans-serif;
  }

  small {
    color: #6a7f79;
    font: 600 0.76rem/1.5 'Manrope', sans-serif;
  }
}

.btn-icon {
  font-size: 0.9rem;
}

@media (max-width: 900px) {
  .share-grid,
  .social-grid,
  .specific-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .share-hero,
  .share-card,
  .specific-card,
  .social-card {
    padding: 16px;
    border-radius: 20px;
  }
}
</style>
