<template>
  <div class="position-relative" id="app">
    <router-view />
    <feedback />
    <div v-if="showDataSourceListComponent" class="position-fixed datasource-list">
      <ShowDataSourcesList />
    </div>
    <div v-if="showWhatsNewComponent && whatsNewContent.length" class="position-fixed whats-new">
      <WhatsNew />
    </div>
    <div v-if="showShareSectionComponent" class="position-fixed whats-new">
      <ShareSection />
    </div>

    <div class="fun-fact-trigger" aria-label="Show fun fact" @click="toggleFunFact()">
      <svg class="bulb-svg" viewBox="0 0 512 512">
        <!-- keep your SVG exactly as is -->
        <!-- no inline width/height anymore -->

        <path style="fill: #e8edee" d="M185.379,370.759V476.69h141.241v-70.621v-35.31H185.379z" />
        <path
          style="fill: #cbd4d8"
          d="M269.241,512h-26.483c-7.945,0-15.89-3.531-21.186-10.593l-18.538-24.717h105.931l-18.538,24.717C285.131,508.469,277.186,512,269.241,512"
        />

        <!-- 💡 MAIN BULB (we'll target this) -->
        <path
          class="bulb-glow"
          style="fill: #f0ce49"
          d="M422.841,152.717C414.014,73.269,350.455,9.71,271.007,0.883C265.71,0.883,261.297,0,256,0
      c-5.297,0-9.71,0-15.007,0.883C161.545,9.71,97.986,74.152,89.159,152.717c-6.179,56.497,15.007,107.697,52.083,143.007
      c21.186,20.303,38.841,46.786,44.138,75.034h141.241c5.297-28.248,22.952-54.731,44.138-75.034
      C407.834,260.414,429.021,209.214,422.841,152.717"
        />

        <path
          style="fill: #ffffff"
          d="M326.621,158.897h-52.966l44.138-79.448h-52.966l-61.793,114.759h44.138l-44.138,114.759L326.621,158.897z"
        />
      </svg>
    </div>

    <transition name="fun-fact-slide">
      <div v-if="!isFunFactDisabled && showFunFact && nugget" class="fun-fact">
        <button
          class="fun-fact-disable text-danger"
          aria-label="Close fun fact"
          @click="disableFunFact"
        >
          <svg
            width="20px"
            height="20px"
            viewBox="0 -0.5 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="#FF2C2C"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path
                d="M11.75 9.874C11.75 10.2882 12.0858 10.624 12.5 10.624C12.9142 10.624 13.25 10.2882 13.25 9.874H11.75ZM13.25 4C13.25 3.58579 12.9142 3.25 12.5 3.25C12.0858 3.25 11.75 3.58579 11.75 4H13.25ZM9.81082 6.66156C10.1878 6.48991 10.3542 6.04515 10.1826 5.66818C10.0109 5.29121 9.56615 5.12478 9.18918 5.29644L9.81082 6.66156ZM5.5 12.16L4.7499 12.1561L4.75005 12.1687L5.5 12.16ZM12.5 19L12.5086 18.25C12.5029 18.25 12.4971 18.25 12.4914 18.25L12.5 19ZM19.5 12.16L20.2501 12.1687L20.25 12.1561L19.5 12.16ZM15.8108 5.29644C15.4338 5.12478 14.9891 5.29121 14.8174 5.66818C14.6458 6.04515 14.8122 6.48991 15.1892 6.66156L15.8108 5.29644ZM13.25 9.874V4H11.75V9.874H13.25ZM9.18918 5.29644C6.49843 6.52171 4.7655 9.19951 4.75001 12.1561L6.24999 12.1639C6.26242 9.79237 7.65246 7.6444 9.81082 6.66156L9.18918 5.29644ZM4.75005 12.1687C4.79935 16.4046 8.27278 19.7986 12.5086 19.75L12.4914 18.25C9.08384 18.2892 6.28961 15.5588 6.24995 12.1513L4.75005 12.1687ZM12.4914 19.75C16.7272 19.7986 20.2007 16.4046 20.2499 12.1687L18.7501 12.1513C18.7104 15.5588 15.9162 18.2892 12.5086 18.25L12.4914 19.75ZM20.25 12.1561C20.2345 9.19951 18.5016 6.52171 15.8108 5.29644L15.1892 6.66156C17.3475 7.6444 18.7376 9.79237 18.75 12.1639L20.25 12.1561Z"
                fill="#FF2C2C"
              ></path>
            </g>
          </svg>
        </button>
        <button class="fun-fact-close" aria-label="Close fun fact" @click="closeFunFact">×</button>
        <div class="fun-fact-icon">
          <!-- Light bulb SVG -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="bulb-icon"
          >
            <path
              d="M9 21h6v-1H9v1zm3-20C7.935 1 5 3.935 5 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-4.26c1.81-1.27 3-3.36 3-5.74 0-3.065-2.935-6-6-6z"
            />
          </svg>
        </div>

        <div class="fun-fact-content">
          <p class="fun-fact-label">Did you know?</p>
          <h1 class="fun-fact-text">{{ nugget }}</h1>
        </div>
      </div>
    </transition>

    <!-- Global Chatbot - Commented out -->
    <!-- <div class="global-chatbot-wrapper">
      <ChatBot ref="globalChatBot" />
      <button 
        class="global-chat-trigger" 
        @click="$refs.globalChatBot.toggleChat()" 
        title="Metadata Chatbot"
        aria-label="Open AI Chatbot"
      >
        <svg width="24" height="24" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 0C11.5304 0 12.0391 0.210714 12.4142 0.585786C12.7893 0.960859 13 1.46957 13 2C13 2.74 12.6 3.39 12 3.73V5H13C14.8565 5 16.637 5.7375 17.9497 7.05025C19.2625 8.36301 20 10.1435 20 12H21C21.2652 12 21.5196 12.1054 21.7071 12.2929C21.8946 12.4804 22 12.7348 22 13V16C22 16.2652 21.8946 16.5196 21.7071 16.7071C21.5196 16.8946 21.2652 17 21 17H20V18C20 18.5304 19.7893 19.0391 19.4142 19.4142C19.0391 19.7893 18.5304 20 18 20H4C3.46957 20 2.96086 19.7893 2.58579 19.4142C2.21071 19.0391 2 18.5304 2 18V17H1C0.734784 17 0.48043 16.8946 0.292893 16.7071C0.105357 16.5196 0 16.2652 0 16V13C0 12.7348 0.105357 12.4804 0.292893 12.2929C0.48043 12.1054 0.734784 12 1 12H2C2 10.1435 2.7375 8.36301 4.05025 7.05025C5.36301 5.7375 7.14348 5 9 5H10V3.73C9.4 3.39 9 2.74 9 2C9 1.46957 9.21071 0.960859 9.58579 0.585786C9.96086 0.210714 10.4696 0 11 0ZM6.5 11C5.83696 11 5.20107 11.2634 4.73223 11.7322C4.26339 12.2011 4 12.837 4 13.5C4 14.163 4.26339 14.7989 4.73223 15.2678C5.20107 15.7366 5.83696 16 6.5 16C7.16304 16 7.79893 15.7366 8.26777 15.2678C8.73661 14.7989 9 14.163 9 13.5C9 12.837 8.73661 12.2011 8.26777 11.7322C7.79893 11.2634 7.16304 11 6.5 11ZM15.5 11C14.837 11 14.2011 11.2634 13.7322 11.7322C13.2634 12.2011 13 12.837 13 13.5C13 14.163 13.2634 14.7989 13.7322 15.2678C14.2011 15.7366 14.837 16 15.5 16C16.163 16 16.7989 15.7366 17.2678 15.2678C17.7366 14.7989 18 14.163 18 13.5C18 12.837 17.7366 12.2011 17.2678 11.7322C16.7989 11.2634 16.163 11 15.5 11Z" fill="white"/>
        </svg>
      </button>
    </div> -->
    <transition name="fade-slide">
      <div v-if="showDisablePrompt" class="funfact-modal">
        <div class="icon">💡</div>

        <div class="content">
          <p class="title">Disable Fun Facts?</p>
          <p class="desc">You can turn it back on anytime by clicking the bulb icon.</p>

          <div class="actions">
            <button class="cancel" @click="toggleDisablePrompt">Cancel</button>
            <button class="confirm" @click="disableFunFact">Disable</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import feedback from './views/feedback.vue';
import ShowDataSourcesList from './modules/dynamic_dashboard/components/ShowDataSourcesList.vue';
import WhatsNew from './modules/dynamic_dashboard/components/WhatsNew.vue';
import ShareSection from './modules/dynamic_dashboard/components/ShareSection.vue'; // import ChatBot from './modules/msdat-dashboard/components/ChatBot.vue';
import ApiServices from './modules/data-layer/services/ApiServices';
import accessibilityPlugin from './modules/plugins/accessibilityPlugin';
import contextPlugin from './modules/plugins/contextPlugin';
import customReportBuilder from './modules/plugins/customReportBuilder';
import indicatorPlugin from './modules/plugins/indicatorPlugin';
import reviewPlugin from './modules/plugins/reviewPlugin';
import screenshotManager from './modules/plugins/screenshotManager';
import testPlugin from './modules/plugins/testPlugin';
import testonePlugin from './modules/plugins/testonePlugin';

export default {
  components: {
    feedback,
    ShowDataSourcesList,
    WhatsNew,
    ShareSection,
    // ChatBot,
  },
  data() {
    return {
      pluginsImported: [], // Explicitly specify the type as an array of strings
      showDataSourceListComponent: false, // Replace with your actual state variable
      showWhatsNewComponent: false,
      lastExecutionTime: null,
      whatsNewContent: [],
      showShareSectionComponent: false,
      showFunFact: false,
      showInterval: null,
      hideTimeout: null,
      nugget: null,
      showDisablePrompt: false,
    };
  },
  computed: {
    ...mapGetters('appearance', ['viewMode', 'fontSize', 'theme']),
    ...mapGetters('MSDAT_STORE', ['getConfigObject', 'getFunFact']),

    // get fun fact disabled state from localStorage
    isFunFactDisabled() {
      return localStorage.getItem('funFactDisabled') === 'true';
    },
  },
  watch: {
    '$store.state.MSDAT_STORE.showDataSourceList': {
      // eslint-disable-next-line no-unused-vars
      handler(newVal, oldVal) {
        this.showDataSourceListComponent = newVal;
      },
      deep: true, // If you want to watch nested changes
    },
    '$store.state.MSDAT_STORE.showWhatsNew': {
      // eslint-disable-next-line no-unused-vars
      handler(newVal, oldVal) {
        this.showWhatsNewComponent = newVal;
      },
      deep: true, // If you want to watch nested changes
    },
    '$store.state.MSDAT_STORE.showShareSection': {
      // eslint-disable-next-line no-unused-vars
      handler(newVal, oldVal) {
        this.showShareSectionComponent = newVal;
      },
      deep: true, // If you want to watch nested changes
    },
    viewMode(newMode) {
      document.body.className = newMode;
    },
    fontSize(newSize) {
      document.documentElement.style.fontSize = newSize;
    },
    theme(newTheme) {
      document.documentElement.setAttribute('data-theme', newTheme);
    },
    showDisablePrompt(newVal) {
      if (newVal === true) {
        setTimeout(() => {
          this.showDisablePrompt = false;
        }, 10000);
      }
    },
  },
  async mounted() {
    await this.getWhatsNew();

    this.firstTimeExecution();

    // Show immediately (optional)
    this.showFunFactTemporarily();

    // Repeat every 2 minutes
    this.showInterval = setInterval(() => {
      this.showFunFactTemporarily();
    }, 2 * 60 * 1000);

    // eslint-disable-next-line
    let plugins_imported = [];

    this.pluginsImported.push('accessibilityPlugin');
    if (!localStorage.getItem('accessibilityPlugin')) {
      localStorage.setItem('accessibilityPlugin', 'false');
    }

    if (localStorage.getItem('accessibilityPlugin') === 'true') {
      Vue.use(accessibilityPlugin);
    }

    this.pluginsImported.push('contextPlugin');
    if (!localStorage.getItem('contextPlugin')) {
      localStorage.setItem('contextPlugin', 'false');
    }

    if (localStorage.getItem('contextPlugin') === 'true') {
      Vue.use(contextPlugin);
    }

    this.pluginsImported.push('customReportBuilder');
    if (!localStorage.getItem('customReportBuilder')) {
      localStorage.setItem('customReportBuilder', 'false');
    }

    if (localStorage.getItem('customReportBuilder') === 'true') {
      Vue.use(customReportBuilder);
    }

    this.pluginsImported.push('indicatorPlugin');
    if (!localStorage.getItem('indicatorPlugin')) {
      localStorage.setItem('indicatorPlugin', 'false');
    }

    if (localStorage.getItem('indicatorPlugin') === 'true') {
      Vue.use(indicatorPlugin);
    }

    this.pluginsImported.push('reviewPlugin');
    if (!localStorage.getItem('reviewPlugin')) {
      localStorage.setItem('reviewPlugin', 'false');
    }

    if (localStorage.getItem('reviewPlugin') === 'true') {
      Vue.use(reviewPlugin);
    }

    this.pluginsImported.push('screenshotManager');
    if (!localStorage.getItem('screenshotManager')) {
      localStorage.setItem('screenshotManager', 'false');
    }

    if (localStorage.getItem('screenshotManager') === 'true') {
      Vue.use(screenshotManager);
    }

    this.pluginsImported.push('testPlugin');
    if (!localStorage.getItem('testPlugin')) {
      localStorage.setItem('testPlugin', 'false');
    }

    if (localStorage.getItem('testPlugin') === 'true') {
      Vue.use(testPlugin);
    }

    this.pluginsImported.push('testonePlugin');
    if (!localStorage.getItem('testonePlugin')) {
      localStorage.setItem('testonePlugin', 'false');
    }

    if (localStorage.getItem('testonePlugin') === 'true') {
      Vue.use(testonePlugin);
    }

    await this.SET_PLUGINS_IMPORTED(this.pluginsImported);
    document.body.className = this.viewMode;
    document.documentElement.style.fontSize = this.fontSize;
    document.documentElement.setAttribute('data-theme', this.theme);
  },
  methods: {
    ...mapGetters('MSDAT_STORE', ['getConfigObject', 'getFunFact']),
    ...mapActions(['SET_PLUGINS_IMPORTED']),
    ...mapMutations('MSDAT_STORE', ['toggleShowWhatsNew', 'SET_FUN_FACT']),

    async showFunFactTemporarily() {
      if (this.getConfigObject.id === undefined) {
        return;
      }
      try {
        const payload = {
          dashboard_id: this.getConfigObject.id,
        };

        const result = await ApiServices.getFunFact(payload);

        // ✅ Only show when webhook responds successfully
        if (!result) return;
        this.SET_FUN_FACT(result.content);

        this.nugget = result.content;

        this.showFunFact = true;

        // Clear previous timeout
        if (this.hideTimeout) {
          clearTimeout(this.hideTimeout);
        }

        // Hide after 1 minute
        this.hideTimeout = setTimeout(() => {
          this.showFunFact = false;
        }, 20 * 1000);
      } catch (error) {
        console.error('Fun fact webhook error:', error);
        this.showFunFact = false;
      }
    },

    toggleDisablePrompt() {
      this.showDisablePrompt = !this.showDisablePrompt;
    },

    toggleFunFact() {
      localStorage.setItem('funFactDisabled', 'false');
      this.nugget = this.getFunFact;
      this.showFunFact = true;
      // console.log(this.getFunFact(), 'this.getFunFact');
    },

    disableFunFact() {
      localStorage.setItem('funFactDisabled', 'true');
      this.showFunFact = false;
      this.toggleDisablePrompt();
    },

    closeFunFact() {
      this.showFunFact = false;

      // Clear timeout so it doesn't re-hide later
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
    },

    executeTask() {
      const now = new Date();
      this.lastExecutionTime = now.toLocaleTimeString();
      this.toggleShowWhatsNew();
    },

    async getWhatsNew() {
      const { data } = await ApiServices.getWhatsNew();
      this.whatsNewContent = data.results;
    },

    handleAppUnload() {
      localStorage.removeItem('firstTimeExecution');
    },

    startSixHourInterval() {
      const checkAndExecute = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        if (hours % 6 === 0 && minutes === 0) {
          this.executeTask();
        }
      };
      setInterval(checkAndExecute, 60 * 1000);
    },

    firstTimeExecution() {
      setTimeout(() => {
        const alreadyExecuted = localStorage.getItem('firstTimeExecution');
        if (alreadyExecuted === null) {
          localStorage.setItem('firstTimeExecution', 'true');
          this.toggleShowWhatsNew();
        }
      }, 60 * 1000);
    },

    // Live plugin toggling without reload
    onPluginsChanged({ plugin, value }) {
      const registry = {
        accessibilityPlugin,
        contextPlugin,
        customReportBuilder,
        indicatorPlugin,
        reviewPlugin,
        screenshotManager,
        testPlugin,
        testonePlugin,
      };

      const pkg = registry[plugin];
      if (!pkg) return;

      if (value) {
        try {
          Vue.use(pkg);
        } catch (e) {
          // already installed or plugin guarded; ignore
        }

        if (Vue.prototype.$pluginBus) {
          Vue.prototype.$pluginBus.$emit('plugin:toggle', { plugin, enabled: true });
          Vue.prototype.$pluginBus.$emit('plugin:enable', plugin);
          Vue.prototype.$pluginBus.$emit(`plugin:enable:${plugin}`);
        }
        this.$root.$emit('plugin:enable', plugin);
      } else {
        if (Vue.prototype.$pluginBus) {
          Vue.prototype.$pluginBus.$emit('plugin:toggle', { plugin, enabled: false });
          Vue.prototype.$pluginBus.$emit('plugin:disable', plugin);
          Vue.prototype.$pluginBus.$emit(`plugin:disable:${plugin}`);
        }
        this.$root.$emit('plugin:disable', plugin);
      }
    },
  },

  created() {
    // global plugin bus for cross-cutting enable/disable notifications
    if (!Vue.prototype.$pluginBus) {
      Vue.prototype.$pluginBus = new Vue();
    }
    // listen to plugin change events emitted from settings or header
    this.$root.$on('plugins:changed', this.onPluginsChanged);
  },
  destroyed() {
    this.$root.$off('plugins:changed', this.onPluginsChanged);
  },
  beforeDestroy() {
    // Cleanup timers
    if (this.showInterval) clearInterval(this.showInterval);
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
  },
};
</script>

<style lang="scss">
.custom-swal-image {
  margin: 0px !important; /* Adjust the margin as needed */
  float: left; /* Align the image to the left of the text */
}
.datasource-list {
  position: fixed;
  right: 10px;
  z-index: 999999;
  top: 10rem;
  height: 48rem;
}

.fun-fact {
  position: fixed;
  top: 500px;
  left: 400px;
  width: 50vw;
  display: flex;
  gap: 14px;
  align-items: flex-start;

  padding: 18px 20px;
  border-radius: 14px;

  background: linear-gradient(135deg, #fff7e6, #ffffff);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);

  border-left: 5px solid #f59e0b;
  z-index: 9999;
}

.fun-fact-trigger {
  position: fixed;
  top: 200px;
  left: -28px; /* 👈 hide part of it */
  z-index: 9999;

  cursor: pointer;
  background: none;
  border: none;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: transform 0.35s ease; /* 🔥 key */

  /* subtle float */
  animation: floaty 5s ease-in-out infinite;
}

/* 👉 slide OUT on hover */
.fun-fact-trigger:hover {
  // transform: translateX(28px);
  left: 1px; /* 👈 brings it fully into view */
  transition: transform 0.55s ease; /* 🔥 key */
}

.bulb-svg {
  width: 64px; /* 👈 perfect size */
  height: 64px;

  transition: all 0.3s ease;

  /* base glow */
  filter: drop-shadow(0 4px 8px rgba(245, 158, 11, 0.3))
    drop-shadow(0 0 16px rgba(245, 158, 11, 0.25));
}

/* 💡 glowing bulb part */
.bulb-glow {
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.6));
}

/* 🔥 pulse halo */
.fun-fact-trigger::before {
  content: '';
  position: absolute;
  width: 90px;
  height: 90px;
  border-radius: 50%;

  background: radial-gradient(circle, rgba(245, 158, 11, 0.25), transparent 70%);

  animation: pulse 2.5s infinite;
  z-index: -1;
}

/* ✨ hover effect */
.fun-fact-trigger:hover .bulb-svg {
  transform: scale(1.08) translateY(-3px);
  left: 20px;

  filter: drop-shadow(0 6px 12px rgba(245, 158, 11, 0.5))
    drop-shadow(0 0 24px rgba(245, 158, 11, 0.4));
}

/* 🔥 stronger glow on hover */
.fun-fact-trigger:hover .bulb-glow {
  filter: drop-shadow(0 0 18px rgba(245, 158, 11, 0.9));
}

/* 💡 flicker (feels real) */
.fun-fact-trigger:hover .bulb-glow {
  animation: flicker 0.6s ease-in-out;
}

/* animations */
@keyframes floaty {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  70% {
    transform: scale(1.4);
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

@keyframes flicker {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* subtle float */
@keyframes floaty {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.fun-fact-disable {
  position: absolute;
  top: 10px;
  right: 28px;
  background: transparent;
  border: none;
  font-size: 18px;
  line-height: 1;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
}

// hre
.funfact-modal {
  position: fixed;
  bottom: 100px;
  right: 24px;
  z-index: 9999;

  display: flex;
  gap: 12px;
  align-items: flex-start;

  width: 320px;
  padding: 16px;

  border-radius: 12px;

  /* match your card */
  background: linear-gradient(135deg, #fff7e6, #ffffff);
  border-left: 4px solid #f59e0b;

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.funfact-modal .icon {
  font-size: 22px;
  color: #f59e0b;
}

.funfact-modal .title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.funfact-modal .desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
}

.funfact-modal .actions {
  display: flex;
  gap: 8px;
}

.funfact-modal button {
  border: none;
  cursor: pointer;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 6px;
}

.funfact-modal .cancel {
  background: #eee;
  color: #333;
}

.funfact-modal .confirm {
  background: #f59e0b;
  color: white;
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

button:focus:not(:focus-visible) {
  outline: none;
}

/* Close (X) */
.fun-fact-close {
  position: absolute;
  top: 10px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 18px;
  line-height: 1;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
}

.fun-fact-close:hover {
  color: #374151;
}

.fun-fact-icon {
  flex-shrink: 0;
  background: #f59e0b;
  color: #fff;
  width: 42px;
  height: 42px;
  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.bulb-icon {
  width: 22px;
  height: 22px;
}

.fun-fact-content {
  display: flex;
  flex-direction: column;
}

.fun-fact-label {
  font-size: 12px;
  font-weight: 600;
  color: #92400e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.fun-fact-text {
  font-size: 15px;
  line-height: 1.5;
  color: #1f2937;
  font-weight: 500;
  margin: 0;
}

.fun-fact-slide-enter-active,
.fun-fact-slide-leave-active {
  transition: all 0.35s ease;
}

.fun-fact-slide-enter {
  opacity: 0;
  transform: translateX(40px);
}

.fun-fact-slide-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.fun-fact-slide-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

.whats-new {
  position: fixed;
  right: 0;
  left: 0;
  z-index: 999999;
  top: 1px;
  height: 100vh;
}

/* Global Chatbot Styles */
.global-chatbot-wrapper {
  position: fixed;
  bottom: 100px;
  right: 24px;
  z-index: 99999;
}

.global-chat-trigger {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 125, 83, 0.75) 0%, rgba(0, 168, 107, 0.75) 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(0, 125, 83, 0.35);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.global-chat-trigger:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(0, 125, 83, 0.45);
  background: linear-gradient(135deg, rgba(0, 125, 83, 0.9) 0%, rgba(0, 168, 107, 0.9) 100%);
}

.global-chat-trigger:active {
  transform: scale(0.98);
}

.global-chat-trigger svg {
  width: 28px;
  height: 28px;
}

.light {
  background-color: #ffffff;
  color: #000000;
}

.dark {
  background-color: #000000;
  color: #ffffff;
}

/* Define styles for different font sizes */
html {
  font-size: 16px; /* default */
}

html.small {
  font-size: 14px;
}

html.medium {
  font-size: 20px;
}

html.large {
  font-size: 24px;
}

/* Define styles for different themes */
[data-theme='default'] {
  --primary-color: #28a745;
  --secondary-color: #20c997;
  --background-color: #e9ecef;
}

[data-theme='calm'] {
  --primary-color: #007bff;
  --secondary-color: #17a2b8;
  --background-color: #e3f2fd;
}

[data-theme='neutral'] {
  --primary-color: #ea4700;
  --secondary-color: #ee6c33;
  --background-color: #fbdacc;
}

/* Dark Mode Styles */
[data-theme='dark'] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --bg-tertiary: #3a3a3a;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --text-muted: #888888;
  --border-color: #444444;
  --border-light: #555555;
  --hover-bg: #404040;
  --active-bg: #505050;
  --input-bg: #333333;
  --input-border: #666666;
  --button-primary: #007bff;
  --button-secondary: #6c757d;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --info-color: #17a2b8;
}

/* Global Dark Mode Overrides */
[data-theme='dark'] body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

[data-theme='dark'] .card {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme='dark'] .card-header {
  background-color: var(--bg-tertiary);
  border-bottom-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme='dark'] .card-body {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

[data-theme='dark'] .btn {
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme='dark'] .btn:hover {
  background-color: var(--hover-bg);
  border-color: var(--border-light);
}

[data-theme='dark'] .btn-primary {
  background-color: var(--button-primary);
  border-color: var(--button-primary);
}

[data-theme='dark'] .btn-secondary {
  background-color: var(--button-secondary);
  border-color: var(--button-secondary);
}

[data-theme='dark'] .form-control {
  background-color: var(--input-bg);
  border-color: var(--input-border);
  color: var(--text-primary);
}

[data-theme='dark'] .form-control:focus {
  background-color: var(--input-bg);
  border-color: var(--button-primary);
  color: var(--text-primary);
}

[data-theme='dark'] .form-control::placeholder {
  color: var(--text-muted);
}

[data-theme='dark'] input[type='text'],
[data-theme='dark'] input[type='email'],
[data-theme='dark'] input[type='password'],
[data-theme='dark'] textarea,
[data-theme='dark'] select {
  background-color: var(--input-bg);
  border-color: var(--input-border);
  color: var(--text-primary);
}

[data-theme='dark'] .table {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

[data-theme='dark'] .table thead th {
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme='dark'] .table tbody tr {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme='dark'] .table tbody tr:hover {
  background-color: var(--hover-bg);
}

[data-theme='dark'] .table tbody td {
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme='dark'] .modal-content {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

[data-theme='dark'] .modal-header {
  background-color: var(--bg-tertiary);
  border-bottom-color: var(--border-color);
}

[data-theme='dark'] .modal-body {
  background-color: var(--bg-secondary);
}

[data-theme='dark'] .modal-footer {
  background-color: var(--bg-tertiary);
  border-top-color: var(--border-color);
}

[data-theme='dark'] .dropdown-menu {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme='dark'] .dropdown-item {
  color: var(--text-primary);
}

[data-theme='dark'] .dropdown-item:hover {
  background-color: var(--hover-bg);
  color: var(--text-primary);
}

[data-theme='dark'] .nav-tabs .nav-link {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-secondary);
}

[data-theme='dark'] .nav-tabs .nav-link.active {
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme='dark'] .alert {
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme='dark'] .badge {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Plugin Cards Dark Mode */
[data-theme='dark'] .plugin-item {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme='dark'] .plugin-item:hover {
  background-color: var(--hover-bg);
}

[data-theme='dark'] .plugin-item .card-title,
[data-theme='dark'] .plugin-item .card-text {
  color: var(--text-primary);
}

/* Notification Items Dark Mode */
[data-theme='dark'] .notification-item {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme='dark'] .notification-item:hover {
  background-color: var(--hover-bg);
}

/* Control Panel Dark Mode */
[data-theme='dark'] #control-panel {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

[data-theme='dark'] #control-panel .label-text {
  color: var(--text-primary);
}

[data-theme='dark'] #control-panel .check-label {
  color: var(--text-primary);
}

[data-theme='dark'] #control-panel button {
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme='dark'] #control-panel button:hover {
  background-color: var(--hover-bg);
}

[data-theme='dark'] #control-panel .dropdown-toggle {
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme='dark'] #control-panel .dropdown-menu {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme='dark'] #control-panel .dropdown-item {
  color: var(--text-primary);
}

[data-theme='dark'] #control-panel .dropdown-item:hover {
  background-color: var(--hover-bg);
}

[data-theme='dark'] #control-panel .voice-control-button {
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

/* Admin Dashboard Dark Mode */
[data-theme='dark'] .admin-info label {
  color: var(--text-primary);
}

[data-theme='dark'] .admin-info input:disabled {
  background-color: var(--input-bg);
  border-color: var(--input-border);
  color: var(--text-secondary);
}

[data-theme='dark'] .admin-info button {
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme='dark'] .admin-info button:hover {
  background-color: var(--hover-bg);
}

[data-theme='dark'] .admin-info .text-muted {
  color: var(--text-muted);
}

/* Security Section Dark Mode */
[data-theme='dark'] .security-section .form-check-label {
  color: var(--text-primary);
}

[data-theme='dark'] .security-section .form-check-input {
  background-color: var(--input-bg);
  border-color: var(--input-border);
}

/* Header Dark Mode */
[data-theme='dark'] header {
  background-color: var(--bg-secondary) !important;
  border-bottom-color: var(--border-color) !important;
}

[data-theme='dark'] header .navbar-brand,
[data-theme='dark'] header .nav-link {
  color: var(--text-primary) !important;
}

[data-theme='dark'] header .navbar-toggler {
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
}

/* Sidebar Dark Mode */
[data-theme='dark'] .sidebar {
  background-color: var(--bg-secondary);
  border-right-color: var(--border-color);
}

[data-theme='dark'] .sidebar .nav-link {
  color: var(--text-primary);
}

[data-theme='dark'] .sidebar .nav-link:hover {
  background-color: var(--hover-bg);
  color: var(--text-primary);
}

[data-theme='dark'] .sidebar .nav-link.active {
  background-color: var(--active-bg);
  color: var(--text-primary);
}

/* Footer Dark Mode */
[data-theme='dark'] footer {
  background-color: var(--bg-secondary);
  border-top-color: var(--border-color);
  color: var(--text-primary);
}

/* BootstrapVue Component Overrides */
[data-theme='dark'] .b-sidebar {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

[data-theme='dark'] .b-sidebar .b-sidebar-header {
  background-color: var(--bg-tertiary);
  border-bottom-color: var(--border-color);
}

[data-theme='dark'] .b-sidebar .b-sidebar-body {
  background-color: var(--bg-secondary);
}

[data-theme='dark'] .b-toast {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme='dark'] .b-toast .toast-header {
  background-color: var(--bg-tertiary);
  border-bottom-color: var(--border-color);
}

[data-theme='dark'] .b-modal .modal-content {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

[data-theme='dark'] .b-dropdown .dropdown-menu {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme='dark'] .b-dropdown .dropdown-item {
  color: var(--text-primary);
}

[data-theme='dark'] .b-dropdown .dropdown-item:hover {
  background-color: var(--hover-bg);
}

/* Chart Containers Dark Mode */
[data-theme='dark'] .chart-container {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme='dark'] .chart-container .highcharts-background {
  fill: var(--bg-secondary);
}

[data-theme='dark'] .chart-container .highcharts-title,
[data-theme='dark'] .chart-container .highcharts-subtitle {
  fill: var(--text-primary);
}

[data-theme='dark'] .chart-container .highcharts-axis-labels text {
  fill: var(--text-primary);
}

[data-theme='dark'] .chart-container .highcharts-tooltip {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Loading States Dark Mode */
[data-theme='dark'] .loading-overlay {
  background-color: rgba(26, 26, 26, 0.8);
}

[data-theme='dark'] .spinner-border {
  border-color: var(--button-primary);
  border-right-color: transparent;
}

/* Error States Dark Mode */
[data-theme='dark'] .error-message {
  background-color: var(--bg-tertiary);
  border-color: var(--danger-color);
  color: var(--text-primary);
}

/* Success States Dark Mode */
[data-theme='dark'] .success-message {
  background-color: var(--bg-tertiary);
  border-color: var(--success-color);
  color: var(--text-primary);
}

/* Warning States Dark Mode */
[data-theme='dark'] .warning-message {
  background-color: var(--bg-tertiary);
  border-color: var(--warning-color);
  color: var(--text-primary);
}

/* Info States Dark Mode */
[data-theme='dark'] .info-message {
  background-color: var(--bg-tertiary);
  border-color: var(--info-color);
  color: var(--text-primary);
}

/* Focus States Dark Mode */
[data-theme='dark'] *:focus {
  outline-color: var(--button-primary);
}

/* Selection States Dark Mode */
[data-theme='dark'] ::selection {
  background-color: var(--button-primary);
  color: var(--text-primary);
}

/* Scrollbar Dark Mode */
[data-theme='dark'] ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

[data-theme='dark'] ::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

[data-theme='dark'] ::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

[data-theme='dark'] ::-webkit-scrollbar-thumb:hover {
  background: var(--border-light);
}

/* Print Styles - Ensure dark mode doesn't affect printing */
@media print {
  [data-theme='dark'] * {
    color: black !important;
    background: white !important;
  }
}
</style>
