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

     <transition name="fun-fact-slide">
      <div v-if="showFunFact" class="fun-fact">
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
  </div>

</template>

<script>
import Vue from 'vue';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import feedback from './views/feedback.vue';
import ShowDataSourcesList from './modules/dynamic_dashboard/components/ShowDataSourcesList.vue';
import WhatsNew from './modules/dynamic_dashboard/components/WhatsNew.vue';
import ShareSection from './modules/dynamic_dashboard/components/ShareSection.vue';// import ChatBot from './modules/msdat-dashboard/components/ChatBot.vue';
import ApiServices from './modules/data-layer/services/ApiServices';
import accessibilityPlugin from './modules/plugins/accessibilityPlugin';
import contextPlugin from './modules/plugins/contextPlugin';
import customReportBuilder from './modules/plugins/customReportBuilder';
import indicatorPlugin from './modules/plugins/indicatorPlugin';
import reviewPlugin from './modules/plugins/reviewPlugin';
import screenshotManager from './modules/plugins/screenshotManager';
import testonePlugin from './modules/plugins/testonePlugin';
import testPlugin from './modules/plugins/testPlugin';

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
    };
  },
  computed: {
    ...mapGetters('appearance', ['viewMode', 'fontSize', 'theme']),
    ...mapGetters('MSDAT_STORE', ['getConfigObject']),
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

    this.pluginsImported.push('testonePlugin');
    if (!localStorage.getItem('testonePlugin')) {
      localStorage.setItem('testonePlugin', 'false');
    }

    if (localStorage.getItem('testonePlugin') === 'true') {
      Vue.use(testonePlugin);
    }

    this.pluginsImported.push('testPlugin');
    if (!localStorage.getItem('testPlugin')) {
      localStorage.setItem('testPlugin', 'false');
    }

    if (localStorage.getItem('testPlugin') === 'true') {
      Vue.use(testPlugin);
    }

    await this.SET_PLUGINS_IMPORTED(this.pluginsImported);
    document.body.className = this.viewMode;
    document.documentElement.style.fontSize = this.fontSize;
    document.documentElement.setAttribute('data-theme', this.theme);
  },
  methods: {
    ...mapActions(['SET_PLUGINS_IMPORTED']),
    ...mapMutations('MSDAT_STORE', ['toggleShowWhatsNew']),

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
        testonePlugin,
        testPlugin,
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
  --primary-color: #EA4700;
  --secondary-color: #EE6C33;
  --background-color: #FBDACC;
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

[data-theme='dark'] input[type="text"],
[data-theme='dark'] input[type="email"],
[data-theme='dark'] input[type="password"],
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
