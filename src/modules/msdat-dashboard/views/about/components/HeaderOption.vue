<template>
  <div id="header-option" class="work-sans">
    <base-modal
      :showModal="modal"
      :size="'md'"
      v-on:hidden="modal = false"
      v-on:submitContact="alert('working')"
    >
      <strong slot="title"> Contact Us</strong>
      <div slot="footer-btn">
        <button class="btn work-sans send" @click="submitContactForm">SEND</button>
      </div>
      <contact :submitForm="submit"> </contact>
    </base-modal>
    <ul class="list-unstyled">
      <li>
        <router-link to="/about">
          <img src="@/assets/caution.png" alt="" />
          <span>About Dashboard</span>
        </router-link>
      </li>
      <li v-if="isAllowedEmail">
        <router-link to="/admin">
          <img src="@/assets/caution.png" alt="" />
          <span>Admin Dashboard</span>
        </router-link>
      </li>

      <li>
        <b-button class="external-dashboards-btn mb-2 d-flex" block @click="showPluginModal">
          <img
            src="@/assets/plugin.png"
            alt=""
            class="align-self-center"
            style="height: 16px; margin-left: 0.2rem"
          />
          <span class="ml-2" style="font-size: small">View Plugins</span>
        </b-button>
      </li>
      <li>
        <!-- <router-link to="/external-dashboards">
          <img src="@/assets/img/icons/ic_info.svg" alt="" />
          <span>External Dashboards</span>
        </router-link> -->
        <!-- <b-card no-body class="external-dropdown px-2">
      <b-card-header header-tag="header" class="external-dropdown p-1" role="tab">
        <li v-b-toggle.accordion-1>
          <img src="@/assets/img/icons/ic_info.svg" style="height: 15px; margin-left: 0.2rem;"  alt="" />
          <span class="ml-2" style="font-size: small;">External Dashboards</span>
      </li> -->
        <!-- <b-button class="external-dashboards-btn mb-2" block >
        </b-button> -->
        <!-- </b-card-header>
      <b-collapse id="accordion-1" accordion="my-accordion" role="tabpanel">
        <div class="my-2 mx-3">
          <router-link to="/external-ndr1">
            National Data Repository Dashboard 1
          </router-link>
        </div>
        <div class="mx-3">
          <router-link to="/external-ndr2">
            National Data Repository Dashboard 2
          </router-link>
        </div>
      </b-collapse>
    </b-card> -->
      </li>
      <li @click="$emit('tour')">
        <router-link to="/">
          <img src="@/assets/play.png" alt="" />
          <span>Play Tour Guide</span>
        </router-link>
      </li>
      <div class="divider"></div>
      <li>
        <a @click.prevent="socialModal = !socialModal" href="#">
          <img src="@/assets/share.png" alt="" />
          <span>Share</span>
        </a>
      </li>
      <li>
        <a href="#" @click.prevent="$emit('print')">
          <img src="@/assets/print.png" alt="" />
          <span>Print</span>
        </a>
      </li>
      <!-- <li>
        <router-link to="/">
          <img src="@/assets/img/icons/ic_download.svg" alt="" />
          <span>Download Data</span>
        </router-link>
      </li> -->
      <li>
        <!-- Don't forget to add the # so it does reload the page -->
        <a href="#" @click.prevent="toggleFullScreen()">
          <img src="@/assets/full.png" alt="" />
          <span>View Fullscreen</span>
        </a>
      </li>
      <div class="divider"></div>
      <li>
        <a href="https://mapping.fmohconnect.gov.ng/inventory/submit-dataset" target="_blank">
          <img src="@/assets/submit.png" alt="" />
          <span>Submit New Dataset</span>
        </a>
      </li>
      <li>
        <router-link to="/data-partnership">
          <img src="@/assets/request.png" alt="" />
          <span>Request Data Partnership</span>
        </router-link>
      </li>
      <!-- <li>
        <router-link to="/">
          <img src="@/assets/img/icons/ic_recommendation.svg" alt="" />
          <span>Suggest Indicator/Data Source</span>
        </router-link>
      </li> -->
      <div class="divider"></div>
      <li class="d-none">
        <router-link to="/update_log">
          <img src="@/assets/img/icons/ic_update.svg" alt="" />
          <span>See Updates</span>
        </router-link>
      </li>
      <li @click.prevent="activateUserHelp">
        <a href="#">
          <img src="@/assets/feedback.png" alt="" />
          <span>Feedback</span>
        </a>
      </li>
      <li @click="togglemodal">
        <a href="#">
          <img src="@/assets/contact.png" alt="" />
          <span>Contact Us</span>
        </a>
      </li>
      <li>
        <router-link to="/faq">
          <img src="@/assets/faq.png" alt="" />
          <span>Help and FAQs</span>
        </router-link>
      </li>
      <!-- <li>
        <router-link to="/data-entry">
          <img src="@/assets/img/icons/ic_upload.svg" alt="" />
          <span>Data Entry</span>
        </router-link>
      </li> -->
      <li>
        <a href="#" @click.prevent="showModal" ref="btnShow">
          <img src="@/assets/subscribe.png" alt="" />
          <span>Subscribe to our newsletter</span>
        </a>
      </li>
    </ul>
    <base-modal :showModal="socialModal" :size="'xl'">
      <template #title><h6 class="mb-0 font-weight-bold work-sans">Share Dashboard</h6> </template>
      <Socials />
    </base-modal>
    <NewsLetter />
    <!-- plugin modal -->
    <b-modal id="plugin-modal" title="MSDAT Apps Plugins" dialog-class="plugin-modal-size"">
      <div class="plugin-modal-body">
        <div v-if="(getPluginsImported || []).length === 0" class="text-center text-muted py-4">
          No plugins found
        </div>

        <div
          v-for="plugin in (getPluginsImported || [])"
          :key="plugin"
          class="plugin-card d-flex justify-content-between align-items-center"
        >
          <div class="plugin-info d-flex align-items-center">
            <img :src="getPluginLogo(plugin)" :alt="plugin + ' logo'" class="plugin-logo mr-2" />
            <h6 class="mb-0 mr-2 plugin-name">{{ formatPluginName(plugin) }} Plugin</h6>
          </div>
          <div class="plugin-toggle">
            <b-form-checkbox
              switch
              :checked="getDynamicProperty(plugin) === 'true'"
              @change="onPluginToggle(plugin, $event)"
            >
              <span class="sr-only">Toggle {{ plugin }}</span>
            </b-form-checkbox>
          </div>
        </div>
      </div>
      <template #modal-footer>
        <div class="w-100 text-right">
          <b-button class="close-plugin-btn px-4" @click="$bvModal.hide('plugin-modal')">Close</b-button>
        </div>
      </template>
    </b-modal>
    <ClearDBCacheModal
      style="z-index: 1500"
      v-if="showClearDataModal"
      :showModal="showClearDataModal"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import NewsLetter from '@/modules/msdat-dashboard/modules/newsletters/index.vue';
import Socials from '@/modules/msdat-dashboard/components/social_media/SocialMediaModal.vue';
import contact from '../../../../../components/contact/contact.vue';
import ClearDBCacheModal from './ClearDBCache.vue';

export default {
  components: {
    contact,
    Socials,
    NewsLetter,
    ClearDBCacheModal,
  },
  data() {
    const dataObj = {
      modal: false,
      submit: false,
      socialModal: false,
      showClearDataModal: false,
  // pluginSearch removed
    };

    // Fetch the list of available plugins from the store
    const pluginsImported = this.$store.getters.getPluginsImported;
    console.log('plugin imports in created', this.$store.getters.getPluginsImported);
    // let pluginsImported = this.getPluginsImported;
    // const pluginsImported = this.$store.state.pluginsImported || [];

    // Dynamically generate data properties based on the available plugins
    pluginsImported.forEach((plugin) => {
      const capitalizedPlugin = plugin.charAt(0).toUpperCase() + plugin.slice(1);
      this.$set(dataObj, `is${capitalizedPlugin}Active`, localStorage.getItem(plugin));

      console.log(`is${capitalizedPlugin}Active`);
    });

    return dataObj;
  },

  computed: {
    ...mapGetters('AUTH_STORE', ['getUser', 'isAuthenticated']),
    isAllowedEmail() {
      // Check if user has specified email or admin role
      return (
      this.getUser?.email?.endsWith('@e4email.net')
      || this.getUser?.role?.value === 'admin'
      ) || false;
      // console log get user
    },

    ...mapGetters(['getPluginsImported']),
    getDynamicProperty() {
      return (propertyName) => this[`is${this.capitalizeFirstLetter(propertyName)}Active`];
    },
  // filteredPlugins removed (search functionality disabled)
  },

  mounted() {
    // cosole log user details
    // console.log('deets', this.getUser);
  },

  async created() {
    // Fetch the list of available plugins from the store
    // const pluginsImported = this.$store.state.pluginsImported || [];
    const pluginsImported = await this.getPluginsImported;
    // const pluginsImported = ['contextPlugin', 'indicatorPlugin'];

    console.log('plugins imported', this.getPluginsImported);

    // Dynamically generate data properties and methods based on the available plugins
    pluginsImported.forEach((plugin) => {
      const capitalizedPlugin = plugin.charAt(0).toUpperCase() + plugin.slice(1);
      this.$set(this, `is${capitalizedPlugin}Active`, localStorage.getItem(plugin));

      console.log(`is${capitalizedPlugin}Active`);
    });
  },
  methods: {
    activateUserHelp(event) {
      event.preventDefault();
      if (window.isUserHelpReady === true) {
        window.openUserHelpButton();
      }
      // Close the header options
      this.$emit('closeoptions');
    },
    onPluginToggle(plugin, checked) {
      this.pluginActive(plugin, checked ? 'true' : 'false');
    },
    isPluginActive(pluginName) {
      // Assuming you have a method to check if the plugin is active
      return this[`is${this.capitalizeFirstLetter(pluginName)}Active`] === true;
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    togglemodal() {
      this.modal = !this.modal;
    },
    showPluginModal() {
      this.$bvModal.show('plugin-modal');
    },
    getPluginLogo(plugin) {
      // Attempt to map plugin names to existing asset icons.
      // Fallback to generic plugin icon.
      try {
        // simple heuristic: look for an asset matching plugin name
        const cleaned = plugin.replace(/Plugin$/i, '').toLowerCase();
        const possible = require(`@/assets/${cleaned}.png`);
        if (possible) return possible;
      } catch (e) {
        // ignore resolution errors
      }
      return require('@/assets/plugin.png');
    },
    formatPluginName(name) {
      // Convert camelCase or snake_case to spaced Title Case for display
      if (!name) return '';
      const spaced = name
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .replace(/plugin$/i, '')
        .trim();
      return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    },
    // Dynamically generated methods for plugin activation
    pluginActive(plugin, data) {
  // Persist new desired state
  localStorage.setItem(plugin, data);

  // Update this component's reactive flag: is{Plugin}Active -> 'true' | 'false'
  const capitalized = plugin.charAt(0).toUpperCase() + plugin.slice(1);
  this.$set(this, `is${capitalized}Active`, data);

  // Notify the app to (de)activate plugin runtime without a full reload
  this.$root.$emit('plugins:changed', { plugin, value: data === 'true' });
    },
    //

    submitContactForm() {
      this.submit = !this.submit;
    },

    toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    },
    PrintPage() {
      window.print();
    },
    // NewsLetter Modal
    showModal() {
      this.$root.$emit('bv::show::modal', 'modal-newsLetter', '#btnShow');
    },

    async clearDB() {
      this.showClearDataModal = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.external-dashboards-btn,
.external-dropdown {
  border: none !important;
  background-color: transparent;
  box-shadow: none;
  color: black;
}
.external-dashboards-btn:hover {
  color: black;
}

.send {
  position: relative;
  color: white;
  background-color: #007d53;
  border-radius: 0.25rem;
  font-size: 1rem;
  font-weight: 400;
  font-family: 'work-sans', sans-serif;
  border: none;
  cursor: pointer;
  padding: 9px 20px;
  margin: 10px;
  outline: none;
}
.sendButton {
  position: relative;
  text-align: right;
}

::-webkit-scrollbar {
  width: 2px;
}
::-webkit-scrollbar-thumb {
  background-color: #cccccc;
}

#header-option {
  height: 90vh;
  top: 3rem;
  position: absolute;
  // right: -11px;
  right: 0.5rem;
  overflow: auto;
  transition: display 0.5s;
  z-index: 5;
  transition: all 0.5s ease-in-out;
  width: 15rem;

  ul {
    border: 1px solid #dbdbdb;
    background-color: #ffffff;
    margin: 0;

    li {
      margin: 3% 0;
      a {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 5px 15px;
        text-decoration: none;
        color: #000000;
        transition: all 0.5s;

        &:hover {
          background-color: #fbfbfb;
          color: #007d53;
        }

        // icons
        & > :first-child {
          margin-right: 8px;
          width: 15px;
          height: 15px;

          // options
          & ~ * {
            font-size: 14px;
          }
        }
      }

      // divider
      & ~ div.divider {
        border-top: 1px solid #ededed;
        margin: 2% 0;
      }
    }
  }
}

// MEDIA QUERY

/* EXTRA EXTRA SMALL */
@media (max-width: 576px) {
  #header-option {
    height: 78vh;

    ul {
      li {
        a {
          // icons
          & > :first-child {
            width: 14px;
            height: 14px;

            // options
            & ~ * {
              font-size: 13px;
            }
          }
        }

        // divider
        & ~ div.divider {
          margin: 1.5% 0;
        }
      }
    }
  }
}

/* SMALL */
@media (min-width: 576px) and (max-width: 768px) {
  #header-option {
    height: 80vh;
    right: 0;

    ul {
      li {
        a {
          // icons
          & > :first-child {
            margin-right: 8px;
            width: 14px;
            height: 14px;

            // options
            & ~ * {
              font-size: 13px;
            }
          }
        }

        // divider
        & ~ div.divider {
          margin: 2% 0;
        }
      }
    }
  }
}

/* MEDIUM */
@media (min-width: 768px) and (max-width: 992px) {
  #header-option {
    height: 80vh;

    &.open {
      right: -10px;
    }

    ul {
      li {
        a {
          // icons
          & > :first-child {
            margin-right: 8px;
            width: 14px;
            height: 14px;

            // options
            & ~ * {
              font-size: 14px;
            }
          }
        }

        // divider
        & ~ div.divider {
          border-top: 1px solid #ededed;
          margin: 2% 0;
        }
      }
    }
  }
}

/* LARGE */
@media (min-width: 992px) and (max-width: 1200px) {
}

.btn-2 {
  color: white;
  font-weight: 500;
  font-size: 14px;
  margin: 10px;
  width: 200px;
}

/* Plugin modal custom styles */
.plugin-modal-body {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 4px; /* account for scrollbar */
}

.plugin-modal-size {
  max-width: 400px !important;
}

.plugin-card {
  background: #f9fafb;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  margin-bottom: 0.85rem;
  transition: box-shadow 0.2s ease, transform 0.15s ease;
  font-family: 'work-sans', sans-serif;
}

.plugin-card:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.plugin-logo {
  width: 34px;
  height: 34px;
  object-fit: contain;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.plugin-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.close-plugin-btn {
  background-color: #007d53;
  border: none;
  border-radius: 24px;
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.3px;
  box-shadow: 0 2px 4px rgba(0, 125, 83, 0.3);
}
.close-plugin-btn:hover, .close-plugin-btn:focus {
  background-color: #009f69;
  color: #fff;
}

.plugin-toggle .custom-control-label::before, 
.plugin-toggle .custom-control-label::after {
  cursor: pointer;
}
</style>
