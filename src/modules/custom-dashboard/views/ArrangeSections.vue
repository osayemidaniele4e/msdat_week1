<!-- eslint-disable vue/no-parsing-error -->
<!-- Auther: Ghufran Ahmed -->

<template>
  <b-container>
    <b-row>
      <h2
        style="color: #202020; font-family: Work Sans; font-size: 25px; margin-top: -24px"
        class="ml-3"
      >
        Select your sections and arrange your widgets
      </h2>
      <br />
      <b-col md="8" sm="12">
        <draggable v-model="values" @update="handleListUpdate">
          <transition-group>
            <div v-for="(value, index) in values" :key="index" :id="index">
              <div class="">
                <input
                  type="checkbox"
                  :name="`dashboard${index}`"
                  :id="`dashboard${index}`"
                  v-model="value.selected"
                  @click="selectedComponent($event, value.fieldName)"
                />
                <label :for="`dashboard${index}`" class="fields">{{ value.fieldName }}</label>
              </div>
              <p style="width: 100%; font-family: Work Sans; font-size: 14px">
                This section shows an overview of your dashboard. This is a brief description...
              </p>
              <img :src="value.fieldImage" class="layout" />
            </div>
          </transition-group>
        </draggable>
      </b-col>
      <b-col md="12" lg="12" sm="12">
        <div class="d-flex mb-5">
          <button class="create_dashboard_btn" @click="approveData">
            {{ $store.getters.editMode ? 'Update' : 'Create' }} dashboard
          </button>

          <b-popover
            ref="popover"
            target="popover-button-event"
            triggers="hover"
            title="Choose visibility"
          >
            <span @click="createPrivateDashboard()" class="choose-visibility-option">
              <b-icon icon="person-fill" style="color: #7952b3"></b-icon>
              Private dashboard</span
            >
            <br />
            <span class="choose-visibility-option" v-b-modal.modal-public-dashboard>
              <b-icon icon="globe" style="color: #7952b3"></b-icon>
              Public dashboard</span
            >
          </b-popover>

          <b-modal id="modal-in-review" title="BootstrapVue" size="lg" hide-footer hide-header>
            <div class="in-review">
              <b-icon icon="exclamation-circle" style="color: #7952b3"></b-icon>
              <br />
              <h2>Your dashboard is currently in review</h2>
              <span>You will be notified when your dashboard is published</span>
              <br />
              <span>you will be directed to your dashboard in 5 seconds</span>
              <!-- <button>Continue</button> -->
            </div>
          </b-modal>

          <b-modal
            id="modal-public-dashboard"
            title="BootstrapVue"
            size="lg"
            hide-footer
            hide-header
          >
            <div class="modal-form-div">
              <span class="modalHeader1">Create a Public Dashboard</span>
              <br /><br />
              <b-form @submit="onSubmit" @reset="onReset">
                <b-row>
                  <b-col>
                    <b-form-group id="input-group-2" label="Your Name:" label-for="input-2">
                      <b-form-input
                        id="input-2"
                        v-model="public_creator.name"
                        placeholder="Full name"
                        class="input"
                        required
                      ></b-form-input> </b-form-group
                  ></b-col>

                  <b-col>
                    <b-form-group
                      id="input-group-1"
                      label="Email address:"
                      label-for="input-1"
                      required
                    >
                      <b-form-input
                        id="input-1"
                        v-model="public_creator.email"
                        type="email"
                        placeholder="Enter email"
                        class="input"
                        required
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>

                <b-form-group id="input-group-2" label="Reason:" label-for="input-2">
                  <b-form-input
                    id="input-2"
                    v-model="public_creator.Reason"
                    placeholder="Reason"
                    class="input"
                    required
                  ></b-form-input>
                </b-form-group>

                <b-form-group id="input-group-2" label="Dashboard name:" label-for="input-2">
                  <b-form-input
                    id="input-2"
                    v-model="public_creator.name_of_dashboard"
                    placeholder="Dashboard name"
                    class="input"
                    required
                  ></b-form-input>
                </b-form-group>
                <br />
                <b-button type="submit" variant="primary" class="create_dashboard_btn"
                  >Create Dashboard</b-button
                >
                <!-- <b-button type="reset" variant="danger">Reset</b-button> -->
              </b-form>
            </div>
          </b-modal>

          <b-modal id="modal-visibility" title="BootstrapVue" size="lg" hide-footer>
            <b-button v-b-toggle.collapse-private variant="primary"
              >Create a private dashboard</b-button
            >
            <b-collapse id="collapse-private" class="mt-2">
              <button @click="createPrivateDashboard()">Private dashboard</button>
            </b-collapse>

            <b-button v-b-toggle.collapse-public variant="primary" hide-header
              >Create a public dashboard</b-button
            >
            <b-collapse id="collapse-public" class="mt-2">
              <b-card>
                <b-form-input
                  v-model="public_creator.name"
                  placeholder="Full name"
                  class="input"
                ></b-form-input>
                <br />
                <b-form-input
                  v-model="public_creator.email"
                  placeholder="Email address"
                ></b-form-input>
                <br />
                <br />
                <b-form-input v-model="public_creator.Reason" placeholder="Reason"></b-form-input>
                <br />
                <b-form-input
                  v-model="public_creator.name_of_dashboard"
                  placeholder="Name of Dashboard"
                ></b-form-input>
                <br />
                <button @click="createPublicDashboard()">Public dashboard</button>
              </b-card>
            </b-collapse>
          </b-modal>
        </div>
      </b-col>
      <br />
    </b-row>
  </b-container>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import draggable from 'vuedraggable';
import apiServices from '@/modules/data-layer/services/ApiServices';
import resizeConfig from '../utils/resizeConfig';

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    draggable,
  },
  data() {
    return {
      orderModified: false,
      values: [
        {
          fieldName: 'Indicator Overview',
          // selected: this.$store.state.MSDAT_STORE.indicatorComparision,
          selected: this.$store.getters.arrangedSections.find(
            (sec) => sec.name === 'Indicator Overview',
          ).isShow,
          fieldImage: '/img/dashboardPreviewImages/Dashboard.PNG',
        },
        {
          fieldName: 'Zonal analysis',
          // selected: this.$store.state.MSDAT_STORE.zonalAna,
          selected: this.$store.getters.arrangedSections.find(
            (sec) => sec.name === 'Zonal analysis',
          ).isShow,
          fieldImage: '/img/dashboardPreviewImages/ZonalAnalysis.PNG',
        },
        {
          fieldName: 'Indicator Comparison',
          // selected: this.$store.state.MSDAT_STORE.zonalAnalysis,
          selected: this.$store.getters.arrangedSections.find(
            (sec) => sec.name === 'Indicator Comparison',
          ).isShow,
          fieldImage: '/img/dashboardPreviewImages/IndicatorComparision-byPeriod.PNG',
        },
        {
          fieldName: 'Dataset Comparison',
          // selected: this.$store.state.MSDAT_STORE.datasetComperision,
          selected: this.$store.getters.arrangedSections.find(
            (sec) => sec.name === 'Dataset Comparison',
          ).isShow,
          fieldImage: '/img/dashboardPreviewImages/DataSetComparison.PNG',
        },
        {
          fieldName: 'Multi-source Comparison',
          // selected: this.$store.state.MSDAT_STORE.multisourceComparison,
          selected: this.$store.getters.arrangedSections.find(
            (sec) => sec.name === 'Multi-source Comparison',
          ).isShow,
          fieldImage: '/img/dashboardPreviewImages/MultiSourceComparison.PNG',
        },
      ],
      url: '',
      public_creator: {
        name: '',
        email: '',
        // organization: '',
        Reason: '',
        name_of_dashboard: '',
        dashboard_details: null,
        embedded_url: null,
        embedded_url_title: null,
        embedded_iframe: null,
        embedded_iframe_title: null,
        embedded_dashboard_description: null,
        is_private: false,
      },
      form: {
        email: '',
        name: '',
        food: null,
        checked: [],
      },
      foods: [{ text: 'Select One', value: null }, 'Carrots', 'Beans', 'Tomatoes', 'Corn'],
      show: true,
    };
  },
  mounted() {
    this.$store.commit('updateStep', 5);
    const programArea = this.$store.getters.getprogramArea;
    const dataSource = this.$store.getters.getDataSource;
    const urlTitle = this.$store.getters.getNewEmbedUrlTitle;
    const url = this.$store.getters.getUrl;
    const iframeTitle = this.$store.getters.getNewEmbedIframeTitle;
    const iframe = this.$store.getters.getIframeEmbed;
    const description = this.$store.getters.getNewEmbedDashboardDescription;

    if (programArea != null && dataSource != null) {
      const tempConfig = {
        dashboardDetails: this.$store.getters.dashboardDetails,
        composedData: programArea,
        surveyArray: dataSource,
        url,
        iframe,
        urlTitle,
        iframeTitle,
        description,
      };
      const stringifyConfig = JSON.stringify(tempConfig);
      localStorage.setItem('storedConfig', stringifyConfig);
    }
  },
  computed: {
    ...mapGetters('AUTH_STORE', ['getUser']),
    // ...mapGetters('CUSTOM_DASHBOARD_STORE', ['dashboardDetails', 'getVisibility']),
    dashboardDetails() {
      return this.$store.getters.dashboardDetails;
    },
    getVisibility() {
      return this.$store.getters.getVisibility;
    },
    getUrl() {
      return this.$store.getters.getEmbedUrl;
    },
    getEmbedIframe() {
      return this.$store.getters.getEmbedIframe;
    },
  },
  methods: {
    ...mapActions('AUTH_STORE', ['SAVE_USER_DASHBOARD']),
    async onSubmit(event) {
      await event.preventDefault();
      await this.createPublicDashboard();
    },
    onReset(event) {
      event.preventDefault();
      // Reset our form values
      this.public_creator.name = '';
      this.public_creator.email = '';
      // this.public_creator.organization = '';
      this.public_creator.Reason = '';
      this.public_creator.name_of_dashboard = '';
    },
    changeVisibility(status) {
      if (status === 'private') {
        this.$store.dispatch('setVisibility', 'private');
      }

      if (status === 'public') {
        this.$store.dispatch('setVisibility', 'public');
      }
    },

    areAllSelectedFalse(data) {
      return data.every((item) => item.selected === false);
    },

    removeNullFields(obj) {
      return Object.fromEntries(
        // eslint-disable-next-line no-unused-vars
        Object.entries(obj).filter(([_, value]) => value != null && value !== ''),
      );
    },

    async createPublicDashboard() {
      // send the request to create a public dashboard
      this.public_creator.dashboard_details = await this.$store.getters.dashboardDetails;
      await this.$store.dispatch('setDashboardRequest', this.public_creator);
      // hide the 'modal-public-dashboard'
      await this.$bvModal.hide('modal-public-dashboard');
      // show the 'modal-in-review'
      await this.$bvModal.show('modal-in-review');

      // Wait for 10 seconds using setTimeout
      setTimeout(() => {
        // After waiting for 10 seconds, call the approveData() function
        this.approveData();
      }, 5000); // 10000 milliseconds = 10 seconds
    },
    handleListUpdate() {
      this.orderModified = true;
    },
    reorderStoreConfig() {
      const mapping = {};
      this.values.forEach((item, index) => {
        mapping[item.fieldName] = index;
      });
      const storeArray = this.$store.getters.arrangedSections;
      storeArray.sort((a, b) => mapping[a.name] - mapping[b.name]);
      return storeArray;
    },
    async createPrivateDashboard() {
      // send the request to create a public daashboard

      // change the visibility
      await this.changeVisibility('private');
      // create the dashboard using the approveData() function
      await this.approveData();
    },

    // Below function is excuted when approve data button is clicked

    async approveData() {
      if (this.areAllSelectedFalse(this.values)) {
        await this.$swal.fire({
          title: 'No Section Selected',
          text: 'Warning: You need to select at least a section',
        });
        return;
      }

      const storedConfig = localStorage.getItem('storedConfig');
      const parsedConfig = JSON.parse(storedConfig);
      if (!this.dashboardDetails.name) {
        // eslint-disable-next-line no-alert
        this.$swal('Dashboard name not provided');
        return;
      }
      let arrangedSections = this.$store.getters.arrangedSections;
      if (this.orderModified) {
        arrangedSections = this.reorderStoreConfig();
      }
      const config = resizeConfig({
        dashboardDetails: this.$store.getters.dashboardDetails,
        composedData: this.$store.getters.getprogramArea || parsedConfig.composedData,
        surveyArray: this.$store.getters.getDataSource || parsedConfig.surveyArray,
        sectionsArray: arrangedSections,
      });
      // if the dashboard is public, run these functions
      if (this.getVisibility === 'public') {
        const id = `${Date.now()}${this.getUser.id}`;
        this.public_creator.id = id;
        this.public_creator.name = this.getUser.username;
        this.public_creator.email = this.getUser.email;
        this.public_creator.description = this.dashboardDetails.description;
        this.public_creator.Reason = this.dashboardDetails.reason;
        this.public_creator.category = this.dashboardDetails.category;
        this.public_creator.config = JSON.stringify(config);
        this.public_creator.created = new Date();
        this.public_creator.name_of_dashboard = this.dashboardDetails.name;
        this.public_creator.link = `${window.location.origin}/custom/public/`;
        this.public_creator.embedded_url = parsedConfig.url;
        this.public_creator.embedded_url_title = parsedConfig.urlTitle;
        this.public_creator.embedded_iframe = parsedConfig.iframe;
        this.public_creator.embedded_iframe_title = parsedConfig.iframeTitle;
        this.public_creator.embedded_dashboard_description = parsedConfig.description;

        if (this.areAllSelectedFalse(this.values)) {
          await this.$swal.fire({
            title: 'No Section Selected',
            text: 'Warning: You need to select at least a section',
          });
        } else {
          const cleanedData = this.removeNullFields(this.public_creator);
          console.log('cleanedData', cleanedData);
          // const res = await this.$store.dispatch('setDashboardRequest', this.public_creator);

          console.log(cleanedData);
          try {
            const res = await apiServices.saveCustomDashboard(cleanedData);

            if (res) {
              this.$store.dispatch('customDashboard', true);
              this.$router.push('/account#/savedDashboards');
            }
          } catch (error) {
            this.$swal.fire({
              title: 'Error',
              text: `${error.response.data.message}`,
              icon: 'error',
            });
          }
        }
      } else {
        // Save Private Dashboard
        const data = {
          name: this.getUser.username,
          email: this.getUser.email,
          category: this.dashboardDetails.category,
          reason: this.dashboardDetails.reason,
          description: this.dashboardDetails.description,
          name_of_dashboard: this.dashboardDetails.name,
          organization: 'string',
          config: JSON.stringify(config),
          link: `${window.location.origin}/custom/public/`,
          embedded_url: parsedConfig.url,
          embedded_url_title: parsedConfig.urlTitle,
          embedded_iframe: parsedConfig.iframe,
          embedded_iframe_title: parsedConfig.iframeTitle,
          is_confirmed: false,
          is_private: this.$store.getters.getVisibility === 'private',
          embedded_dashboard_description: parsedConfig.description,
        };

        try {
          const cleanedData = this.removeNullFields(data);

          this.SAVE_USER_DASHBOARD(cleanedData);

          this.$store.dispatch('customDashboard', true);
          this.$router.push('/account#/savedDashboards');
        } catch (error) {
          this.$swal.fire({
            title: 'Error',
            text: `${error.response.data.message}`,
            icon: 'error',
          });
        }
      }
    },

    // PRESELECTION OF Dashboard widgets
    selectedComponent(e, fieldName) {
      const payload = {
        checked: e.target.checked,
        checkedField: fieldName,
      };
      this.$store.dispatch('dynamicSection', payload);
      if (fieldName === 'Indicator Overview') {
        this.$store.state.MSDAT_STORE.indicatorComparision = e.target.checked;
      }
      if (fieldName === 'Zonal Analysis') {
        this.$store.state.MSDAT_STORE.zonalAnalysis = e.target.checked;
      }
      if (fieldName === 'Indicator Comparison') {
        this.$store.state.MSDAT_STORE.indicatorComparsionByPeriod = e.target.checked;
      }

      if (fieldName === 'Multi-source Comparison') {
        this.$store.state.MSDAT_STORE.multisourceComparison = e.target.checked;
      }
      if (fieldName === 'Dataset Comparison') {
        this.$store.state.MSDAT_STORE.datasetComperision = e.target.checked;
      }
    },
    isSelected(value) {
      return value.selected;
    },
  },
};
</script>

<style scoped>
@media (min-width: 740px) {
  .dragable-list {
    display: inline-block;
    position: fixed;
  }
}

@media screen and (max-width: 520px) {
  .dragable-list {
    position: relative;
  }
  .fields {
    width: 80% !important;
  }
}

.layout {
  top: 522px;
  left: 140px;
  width: 100%;
  height: 269px;
  margin-bottom: 24px;
}
.fields {
  background: #f5f5f5;
  width: 40%;
  height: 25px;
  padding-left: 5px;
  margin-left: 10px;
  font-family: 'Work Sans';
  font-size: 16px;
}
.nextBtn {
  background-color: #3f8994;
  color: #ffffff;
  max-width: 253.500000063px;
  text-transform: uppercase;
  border-color: #3f8994;
  font-size: 15.00000375px;
}
.editBtn {
  background-color: #eaeaea;
  color: #000000;
  max-width: 253.500000063px;
  text-transform: uppercase;
  border-color: #eaeaea;
  font-size: 15.00000375px;
}

.modalHeader1 {
  font: var(--unnamed-font-style-normal) normal bold 35px/47px var(--unnamed-font-family-dm-sans);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--unnamed-color-202020);
  text-align: left;
  font: normal normal bold 35px/47px DM Sans;
  letter-spacing: 0px;
  color: #202020;
  opacity: 1;
}

.modal-form-div {
  padding: 20px;
}

.input {
  /* UI Properties */
  background: #eaeaea 0% 0% no-repeat padding-box;
  opacity: 1;
  border: none;
  padding: 20px;
}

.create_dashboard_btn {
  background: #3f8994 0% 0% no-repeat padding-box;
  box-shadow: 0px 3px 6px #00000029;
  border-radius: 10px;
  opacity: 1;
  width: 188px;
  height: 43px;
  font-size: 15px;
  color: #ffffff;
  border: none;
}

.in-review {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.choose-visibility-option {
  cursor: pointer;
}

.choose-visibility-option:hover {
  opacity: 0.7;
}

.embed input,
textarea {
  width: 100%;
  padding: 8px;
  margin: 5px 0;
}
label {
  margin-bottom: -20px;
}
</style>
