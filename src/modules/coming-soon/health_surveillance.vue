<template>
  <div>
    <the-header />
    <div class="container-fluid px-5 content">
      <div class="centered_content">
        <div class="row">
          <div class="col-xl-6 col-12 coming_soon_content order-md-1 order-sm-2">
            <b-button class="btn btn-outline-primary disabled">COMING SOON</b-button>
            <p class="mt-3 mb-4 tittle">Health Surveillance</p>

            <div class="mb-5 mr-3">
              <p class="text-left mb-3 msg">
                The MSDAT's health surveillance dashboard presents the analysis of selected
                indicators to monitor the burden of diseases over time (e.g., outbreaks), with
                intuitive visualizations and multi-level analysis. With this resource, users can
                conduct trend analysis and identify seasonal trends of outbreaks in the country.
              </p>

              <p class="text-left msg2">
                This resource is currently not available. If you would like to be informed about its
                development, please leave your contact information below.
              </p>
            </div>

            <form class="mb-4" v-on:submit.prevent="newInterest()">
              <b-row class="mt-4" no-gutters>
                <b-col cols="12" sm="7" class="">
                  <b-form-input
                    type="email"
                    name="email"
                    class="form-control ml-0 rounded-0"
                    placeholder="Your e-mail address"
                    v-model="email"
                    required
                  />
                </b-col>
                <b-col cols="12" sm="5" class="">
                  <b-button
                    type="submit"
                    class="btn btn-primary rounded-0 ml-0 pl-4"
                    :disabled="loading"
                    :class="{ submitting: loading }"
                  >
                    Keep me Updated!
                  </b-button>
                </b-col>
              </b-row>
            </form>

            <p class="link-text mt-4 mb-4 ml-1">
              <router-link to="/" style="color: #007d53"
                ><b-icon icon="chevron-left"></b-icon> Back to MSDAT</router-link
              >
            </p>
          </div>
          <div class="col-xl-6 col-12 bg-white order-md-2 order-sm-1" id="image">
            <div class="coming_soon_img">
              <img
                src="./asset/gis.png"
                class="img-fluid shadow-sm mb-3"
                width="80%"
                alt="Gis Mapping Image1"
              />
              <img
                src="./asset/gis2.png"
                class="img-fluid shadowm-sm mb-1"
                width="80%"
                alt="Gis Mapping Image2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <the-footer />
  </div>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import theHeader from '../msdat-dashboard/views/about/layout/theHeader.vue';
import theFooter from '../msdat-dashboard/views/about/layout/theFooter.vue';

export default {
  name: 'Health-Surveillance',
  components: {
    theHeader,
    theFooter,
  },
  data() {
    return {
      email: '',
      dashboard: 'Health Surveillance',
      loading: false,
    };
  },
  methods: {
    async newInterest() {
      this.loading = true;
      const url = `${process.env.VUE_APP_API_BASE_URL1}subdashboard/interest/`;
      const config = {
        headers: {
          Authorization: `Token ${process.env.VUE_APP_API_TOKEN}`,
        },
      };
      const now = moment().format('LLLL');
      const intrestForm = {
        email: this.email,
        dashboard: this.dashboard,
        created: now,
      };
      try {
        const resp = await axios.post(url, intrestForm, config);
        if (resp.data) {
          this.$swal({
            toast: true,
            position: 'bottom-right',
            showConfirmButton: false,
            timer: 5000,
            icon: 'success',
            title: 'Success',
          });
        }
      } catch (error) {
        this.$swal({
          toast: true,
          position: 'top-right',
          showConfirmButton: false,
          timer: 5000,
          icon: 'success',
          title: `${error.message}`,
        });
      } finally {
        this.email = '';
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.msg {
  font-weight: normal;
  font-size: 1rem;
  color: #000000;
  font-family: 'Muli', sans-serif;
}
.msg2 {
  font-weight: normal;
  font-family: 'Muli', sans-serif;
  font-size: 0.85rem;
  color: #505050;
}
button.btn-outline-primary {
  border: 2px solid #ff8f0f !important;
  color: #ff8f0f !important;
  font-weight: bold;
}
.tittle {
  color: #232323 !important;
  font-weight: bold;
  background-color: white !important;
  opacity: 1;
  font-size: 43px;
  line-height: 55px;
  font-family: 'Muli', sans-serif;
}

button.btn-primary {
  color: #fff;
  font-weight: bold;
  border: 2px solid #ff8f0f;
  background-color: #ff8f0f;
  opacity: 1;
  font-size: 0.95rem;
  font-family: 'Muli', sans-serif;
  text-transform: none;
  height: 2.4rem;
  margin-top: 0;
}
div.content {
  min-height: 84.5vh;
  width: 100%;
  div.centered_content {
    display: flex;
    align-items: center;
    min-height: inherit;
  }
  div.coming_soon_content {
    margin-top: 3rem;
  }
  div.coming_soon_img {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
}

button {
  position: relative;

  &.submitting::after {
    content: '';
    position: absolute;
    width: 1rem;
    height: 1rem;
    top: calc(50% - 0.5rem);
    left: 0.5rem;
    border-radius: 2em;
    border-color: transparent transparent #eeeeee #eeeeee;
    border-style: solid;
    border-width: 0.15em;
    animation: spinner-rotation 0.75s infinite;
    animation-timing-function: cubic-bezier(0.68, -0.55, 0.27, 1.55);
  }
}

@keyframes spinner-rotation {
  to {
    transform: rotate(360deg);
  }
}
</style>
