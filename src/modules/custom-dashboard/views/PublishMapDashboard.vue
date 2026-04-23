<template>
  <b-container>
    <b-row class="mt-4">
      <b-col md="12" class="text-center">
        <h2 style="color: #202020; font-family: Work Sans; font-size: 25px;">
          Summary & Publish Map Visualization
        </h2>
        <p style="font-family: Work Sans; font-size: 16px; margin-top: 10px;">
          Your selections are complete. You can now publish your map visualization.
        </p>
      </b-col>
    </b-row>
    <b-row class="mt-4 justify-content-center">
      <b-col md="8" class="text-center">
        <div class="d-flex justify-content-center align-items-center flex-column mb-5">
          <button class="create_dashboard_btn mb-3" @click="approveData">
            {{ $store.getters.editMode ? 'Update' : 'Create' }} map visualization
          </button>

          <b-popover
            ref="popover"
            target="popover-button-event"
            triggers="hover"
            title="Choose visibility"
          >
            <span @click="createPrivateDashboard()" class="choose-visibility-option">
              <b-icon icon="person-fill" style="color: #7952b3"></b-icon>
              Private map visualization</span
            >
            <br />
            <span class="choose-visibility-option" v-b-modal.modal-public-dashboard>
              <b-icon icon="globe" style="color: #7952b3"></b-icon>
              Public map visualization</span
            >
          </b-popover>

          <b-modal id="modal-in-review" title="BootstrapVue" size="lg" hide-footer hide-header>
            <div class="in-review">
              <b-icon icon="exclamation-circle" style="color: #7952b3"></b-icon>
              <br />
              <h2>Your map visualization is currently in review</h2>
              <span>You will be notified when your map visualization is published</span>
              <br />
              <span>You will be directed to your map visualization in 5 seconds</span>
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
              <span class="modalHeader1">Create a Public Map Visualization</span>
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
                      ></b-form-input> </b-form-group>
                  </b-col>

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

                <b-form-group id="input-group-2" label="Map Visualization name:" label-for="input-2">
                  <b-form-input
                    id="input-2"
                    v-model="public_creator.name_of_dashboard"
                    placeholder="Map visualization name"
                    class="input"
                    required
                  ></b-form-input>
                </b-form-group>
                <br />
                <b-button type="submit" variant="primary" class="create_dashboard_btn"
                  >Create Map Visualization</b-button
                >
              </b-form>
            </div>
          </b-modal>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import apiServices from '@/modules/data-layer/services/ApiServices';

export default {
  name: 'PublishMapDashboard',
  data() {
    return {
      public_creator: {
        name: '',
        email: '',
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
      values: [
        {
          fieldName: 'Map Visualization',
          selected: true,
          isShow: true,
          name: 'Map Visualization',
          active: true,
        },
      ],
    };
  },
  mounted() {
    this.$store.commit('updateStep', 5);
    const programArea = this.$store.getters.getprogramArea;
    const dataSource = this.$store.getters.getDataSource;

    if (programArea != null && dataSource != null) {
      const tempConfig = {
        dashboardDetails: this.$store.getters.dashboardDetails,
        composedData: programArea,
        surveyArray: dataSource,
      };
      localStorage.setItem('storedConfig', JSON.stringify(tempConfig));
    }
  },
  computed: {
    ...mapGetters('AUTH_STORE', ['getUser']),
    dashboardDetails() {
      return this.$store.getters.dashboardDetails;
    },
    getVisibility() {
      return this.$store.getters.getVisibility;
    },
  },
  methods: {
    ...mapActions('AUTH_STORE', ['SAVE_USER_DASHBOARD']),
    async onSubmit(event) {
      event.preventDefault();
      await this.createPublicDashboard();
    },
    onReset(event) {
      event.preventDefault();
      this.public_creator.name = '';
      this.public_creator.email = '';
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
    removeNullFields(obj) {
      return Object.fromEntries(
        Object.entries(obj).filter(([, value]) => value != null && value !== ''),
      );
    },
    async createPublicDashboard() {
      this.public_creator.dashboard_details = await this.$store.getters.dashboardDetails;
      await this.$store.dispatch('setDashboardRequest', this.public_creator);
      await this.$bvModal.hide('modal-public-dashboard');
      await this.$bvModal.show('modal-in-review');

      setTimeout(() => {
        this.approveData();
      }, 5000);
    },
    async createPrivateDashboard() {
      await this.changeVisibility('private');
      await this.approveData();
    },
    async approveData() {
      const config = {
        dashboardDetails: this.$store.getters.dashboardDetails,
        composedData: this.$store.getters.getprogramArea,
        surveyArray: this.$store.getters.getDataSource,
        sectionsArray: this.values,
      };

      if (!this.dashboardDetails.name) {
        this.$swal('Map Visualization name not provided');
        return;
      }

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

        const cleanedData = this.removeNullFields(this.public_creator);
        try {
          const res = await apiServices.saveCustomDashboard(cleanedData);
          if (res) {
            this.$store.dispatch('customDashboard', true);
            this.$router.push('/account#/savedDashboards');
          }
        } catch (error) {
          this.$swal.fire({
            title: 'Error',
            text: `${error.response?.data?.message || 'Error publishing'}`,
            icon: 'error',
          });
        }
      } else {
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
          is_confirmed: false,
          is_private: this.$store.getters.getVisibility === 'private',
        };

        try {
          const cleanedData = this.removeNullFields(data);
          this.SAVE_USER_DASHBOARD(cleanedData);
          this.$store.dispatch('customDashboard', true);
          this.$router.push('/account#/savedDashboards');
        } catch (error) {
          this.$swal.fire({
            title: 'Error',
            text: `${error.response?.data?.message || 'Error publishing'}`,
            icon: 'error',
          });
        }
      }
    },
  },
};
</script>

<style scoped>
.modalHeader1 {
  font: normal normal bold 35px/47px DM Sans;
  letter-spacing: 0px;
  color: #202020;
  opacity: 1;
}
.modal-form-div {
  padding: 20px;
}
.input {
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
  width: 250px;
  height: 48px;
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
</style>
