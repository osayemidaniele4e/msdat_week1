<template>
  <div class="share-overlay">
    <div class="share-modal">
      <button type="button" class="close-btn" @click="$emit('close')" aria-label="Close share panel">
        <span>×</span>
      </button>

      <section class="share-hero">
        <div class="share-kicker">Share dashboard</div>
        <h2>Share insights with a more polished workflow</h2>
        <p>
          Send the current dashboard to your team, copy a ready-to-share link, or launch a
          preferred sharing channel in one click.
        </p>
        <div class="hero-badges">
          <span class="hero-badge">Fast share</span>
          <span class="hero-badge subtle">Secure workflow</span>
        </div>
      </section>

      <section class="share-grid">
        <article class="share-card">
          <div class="card-heading">
            <div class="card-icon mint">✉</div>
            <div>
              <h3>Email delivery</h3>
              <p>Send a dashboard invite directly to a teammate.</p>
            </div>
          </div>
          <label class="field-label" for="share-email">Recipient email</label>
          <div class="input-shell">
            <input
              id="share-email"
              v-model.trim="email"
              type="email"
              placeholder="name@organization.org"
              class="input"
              @keyup.enter="sendEmail"
            />
          </div>
          <button type="button" class="action-btn primary" @click="sendEmail">Send invite</button>
        </article>

        <article class="share-card">
          <div class="card-heading">
            <div class="card-icon sky">↗</div>
            <div>
              <h3>Direct link</h3>
              <p>Copy a reusable dashboard URL for reports, chats, and briefs.</p>
            </div>
          </div>
          <label class="field-label" for="share-link">Shareable link</label>
          <div class="input-shell link-shell">
            <input id="share-link" :value="shareLink" readonly class="input" />
          </div>
          <button type="button" class="action-btn secondary" @click="copyLink">
            {{ copied ? 'Copied' : 'Copy link' }}
          </button>
        </article>
      </section>

      <section class="channel-section">
        <div class="channel-header">
          <div>
            <h3>Share via</h3>
            <p>Open a channel and continue sharing from there.</p>
          </div>
        </div>

        <div class="channel-grid">
          <button
            v-for="platform in platforms"
            :key="platform.name"
            type="button"
            class="channel-card"
            @click="openPlatform(platform)"
          >
            <span class="channel-icon" :class="platform.theme">{{ platform.short }}</span>
            <span class="channel-copy">
              <strong>{{ platform.name }}</strong>
              <small>{{ platform.description }}</small>
            </span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      copied: false,
      shareLink: '',
      platforms: [
        {
          name: 'Embed',
          short: '</>',
          theme: 'theme-embed',
          description: 'Use in websites or portals',
          action: 'embed',
        },
        {
          name: 'WhatsApp',
          short: 'WA',
          theme: 'theme-whatsapp',
          description: 'Share in team conversations',
          action: 'https://wa.me/?text=',
        },
        {
          name: 'X',
          short: 'X',
          theme: 'theme-x',
          description: 'Post to a public audience',
          action: 'https://twitter.com/intent/tweet?url=',
        },
        {
          name: 'Facebook',
          short: 'f',
          theme: 'theme-facebook',
          description: 'Share to your network',
          action: 'https://www.facebook.com/sharer/sharer.php?u=',
        },
        {
          name: 'LinkedIn',
          short: 'in',
          theme: 'theme-linkedin',
          description: 'Share professionally',
          action: 'https://www.linkedin.com/sharing/share-offsite/?url=',
        },
      ],
    };
  },
  mounted() {
    this.shareLink = window.location.href;
  },
  methods: {
    sendEmail() {
      if (!this.email) {
        return;
      }

      const subject = encodeURIComponent('MSDAT dashboard share');
      const body = encodeURIComponent(`Take a look at this dashboard: ${this.shareLink}`);
      window.location.href = `mailto:${this.email}?subject=${subject}&body=${body}`;
      this.email = '';
    },
    async copyLink() {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(this.shareLink);
        } else {
          const tempInput = document.createElement('input');
          tempInput.value = this.shareLink;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }

        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 1800);
      } catch (error) {
        // no-op fallback: keep the UI responsive even if clipboard is blocked
      }
    },
    openPlatform(platform) {
      if (platform.action === 'embed') {
        this.copyLink();
        return;
      }

      window.open(`${platform.action}${encodeURIComponent(this.shareLink)}`, '_blank');
    },
  },
};
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');

.share-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(0, 125, 83, 0.18), transparent 34%),
    radial-gradient(circle at bottom right, rgba(0, 94, 184, 0.12), transparent 30%),
    rgba(7, 16, 14, 0.28);
  backdrop-filter: blur(8px);
}

.share-modal {
  position: relative;
  width: min(920px, 100%);
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 28px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.97), rgba(246, 250, 248, 0.95)),
    #ffffff;
  box-shadow: 0 32px 80px rgba(8, 27, 22, 0.16);
  font-family: 'Manrope', sans-serif;
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(16, 54, 45, 0.12);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #173a33;
  cursor: pointer;

  span {
    font-size: 1.8rem;
    line-height: 1;
  }
}

.share-hero {
  padding: 22px;
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(16, 83, 69, 0.98), rgba(36, 124, 109, 0.92)),
    #105345;
  color: #f7fbfa;

  h2 {
    margin: 10px 0 12px;
    font: 700 clamp(1.9rem, 3.8vw, 3rem) / 1.05 'Playfair Display', serif;
    letter-spacing: -0.03em;
  }

  p {
    max-width: 620px;
    margin: 0;
    color: rgba(247, 251, 250, 0.84);
    font: 500 0.98rem/1.7 'Manrope', sans-serif;
  }
}

.share-kicker {
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
  gap: 10px;
  flex-wrap: wrap;
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
  margin-top: 20px;
}

.share-card,
.channel-section {
  padding: 20px;
  border: 1px solid rgba(20, 60, 50, 0.08);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(244, 249, 247, 0.92));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.card-heading {
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
  font: 800 1.05rem/1 'Manrope', sans-serif;
}

.mint {
  background: rgba(0, 125, 83, 0.12);
  color: #0f7b64;
}

.sky {
  background: rgba(0, 94, 184, 0.1);
  color: #155cb0;
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

.link-shell {
  margin-bottom: 14px;
}

.input {
  width: 100%;
  border: none;
  background: transparent;
  color: #173a33;
  font: 600 0.95rem/1.4 'Manrope', sans-serif;
  outline: none;
}

.input::placeholder {
  color: #8aa099;
}

.action-btn {
  min-height: 46px;
  padding: 0 18px;
  border-radius: 14px;
  border: none;
  font: 800 0.82rem/1 'Manrope', sans-serif;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.action-btn:hover,
.channel-card:hover,
.close-btn:hover {
  transform: translateY(-1px);
}

.primary {
  background: linear-gradient(135deg, #0f7b64, #125a4a);
  color: #ffffff;
  box-shadow: 0 16px 28px rgba(15, 123, 100, 0.18);
}

.secondary {
  background: #eef7f3;
  color: #0c5f48;
  border: 1px solid rgba(0, 125, 83, 0.12);
}

.channel-section {
  margin-top: 18px;
}

.channel-header h3 {
  margin: 0;
  color: #173a33;
  font: 800 1.05rem/1.2 'Manrope', sans-serif;
}

.channel-header p {
  margin: 8px 0 0;
  color: #657974;
  font: 500 0.9rem/1.6 'Manrope', sans-serif;
}

.channel-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.channel-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid rgba(20, 60, 50, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.channel-card:hover {
  border-color: rgba(15, 123, 100, 0.24);
  box-shadow: 0 16px 28px rgba(15, 123, 100, 0.1);
}

.channel-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  padding: 0 10px;
  border-radius: 14px;
  font: 800 0.95rem/1 'Manrope', sans-serif;
}

.theme-embed {
  background: rgba(43, 108, 176, 0.1);
  color: #24589f;
}

.theme-whatsapp {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}

.theme-x {
  background: rgba(17, 24, 39, 0.1);
  color: #111827;
}

.theme-facebook {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}

.theme-linkedin {
  background: rgba(8, 145, 178, 0.12);
  color: #0e7490;
}

.channel-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    color: #1a302b;
    font: 800 0.9rem/1.2 'Manrope', sans-serif;
  }

  small {
    color: #6a7f79;
    font: 600 0.76rem/1.5 'Manrope', sans-serif;
  }
}

@media (max-width: 900px) {
  .share-grid {
    grid-template-columns: 1fr;
  }

  .channel-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

  .close-btn {
    top: 12px;
    right: 12px;
    width: 40px;
    height: 40px;
  }

  .share-hero,
  .share-card,
  .channel-section {
    padding: 16px;
    border-radius: 20px;
  }

  .channel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
