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
          <img src="@/assets/img/icons/ic_info.svg" alt="" />
          <span>About Dashboard</span>
        </router-link>
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
          <img src="@/assets/img/icons/ic_play.svg" alt="" />
          <span>Play Tour Guide</span>
        </router-link>
      </li>
      <div class="divider"></div>
      <li>
        <a @click.prevent="socialModal = !socialModal" href="#">
          <img src="@/assets/img/icons/ic_share.svg" alt="" />
          <span>Share</span>
        </a>
      </li>
      <li>
        <a href="#" @click.prevent="$emit('print')">
          <img src="@/assets/img/icons/ic_print.svg" alt="" />
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
          <img src="@/assets/img/icons/ic_zoom.svg" alt="" />
          <span>View Fullscreen</span>
        </a>
      </li>
      <div class="divider"></div>
      <li>
        <a href="https://mapping.fmohconnect.gov.ng/inventory/submit-dataset" target="_blank">
          <img src="@/assets/img/icons/ic_upload.svg" alt="" />
          <span>Submit New Dataset</span>
        </a>
      </li>
      <li>
        <router-link to="/data-partnership">
          <img src="@/assets/img/icons/ic_help.svg" alt="" />
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
      <li>
        <a href="javascript:Userback.open();">
          <img src="@/assets/img/icons/ic_feedback.svg" alt="" />
          <span>Feedback</span>
        </a>
      </li>
      <li @click="togglemodal">
        <a href="#">
          <img src="@/assets/img/icons/ic_contact.svg" alt="" />
          <span>Contact Us</span>
        </a>
      </li>
      <li>
        <router-link to="/faq">
          <img src="@/assets/img/icons/ic_help.svg" alt="" />
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
          <img src="@/assets/img/icons/ic_email.svg" alt="" />
          <span>Subscribe to our newsletter</span>
        </a>
      </li>
    </ul>
    <base-modal :showModal="socialModal" :size="'xl'">
      <template #title><h6 class="mb-0 font-weight-bold work-sans">Share Dashboard</h6> </template>
      <Socials />
    </base-modal>
    <NewsLetter />
  </div>
</template>

<script>
import NewsLetter from '@/modules/msdat-dashboard/modules/newsletter/index.vue';
import Socials from '@/modules/msdat-dashboard/components/social_media/SocialMediaModal.vue';
import contact from '../../../../../components/contact/contact.vue';

export default {
  components: { contact, Socials, NewsLetter },
  data() {
    return {
      modal: false,
      submit: false,
      socialModal: false,
      showClearDataModal: false,
    };
  },
  methods: {
    togglemodal() {
      this.modal = !this.modal;
    },

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
</style>
