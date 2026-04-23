<!-- Auther: Ghufran Ahmed -->
<template>
  <b-container class="text-justify px-5 pb-5">
    <h4 class="welcome">Welcome {{username}},</h4>
    <form @submit.prevent="submitForm">
      <b-row>
        <b-col cols="12" lg="6" class="forms">
          <div class="field-detail" :class="{ invalid: !dName.isValid }">
            <p>Give your {{ isMapMode ? 'map visualization' : 'dashboard' }} a name</p>
            <b-form-input
              type="text"
              id="d-Name"
              v-model.trim="dName.val"
              @blur="clearValidity('dName')"
              placeholder="Hint: It should be easy to understand"
            ></b-form-input>
            <p v-if="!dName.isValid">This must not be empty.</p>
          </div>
          <div class="field-detail" :class="{ invalid: !description.isValid }">
            <p>Description of your {{ isMapMode ? 'map visualization' : 'dashboard' }}</p>
            <b-form-input
              type="text"
              id="description"
              v-model.trim="description.val"
              @blur="clearValidity('description')"
              placeholder="Hint: Use easy to understand terms"
            ></b-form-input>
            <p v-if="!description.isValid">This must not be empty.</p>
          </div>
          <br>
          <div class="field-detail" v-if="isPublicDashboard" >
            <p>Reason for making your {{ isMapMode ? 'map visualization' : 'dashboard' }} public</p>
            <b-form-input
              type="text"
              id="reason"
              v-model="publicReason"
              @blur="clearValidity('publicReason')"
              placeholder="Hint: What us the major purpose of making your dashboard public"
            ></b-form-input>
            <!-- <p v-if="!publicReason.isValid">This must not be empty.</p> -->
          </div>
          <br>
          <div class="field-detail" v-if="isPublicDashboard" >
            <p>{{ isMapMode ? 'Map Visualization' : 'Dashboard' }} Category</p>
            <b-form-select
            class="form-control"
             v-model="category" :options="categoryOptions"></b-form-select>
             <!-- <p v-if="!category.isValid">This must not be empty.</p> -->
          </div>
          <br>
          <span>
  <input type="checkbox" v-model="isPublicDashboard"> <!-- Add v-model -->
  Create a public {{ isMapMode ? 'map visualization' : 'dashboard' }}
</span>
        </b-col>
        <b-col class="image-file mb-5">
          <b-row class="text-left text-lg-center">
            <b-col cols="auto">
              <div>
                <input
                  type="file"
                  id="file-input"
                  accept="image/*"
                  hidden
                  @change="previewThumbnail"
                />
                <label class="file-input-label" for="file-input">
                  <customDashboardSvg></customDashboardSvg>
                </label>
              </div>
              <div
                class="image-preview"
                v-if="this.selectedImage.val.length > 0"
                style="background: white"
              >
                <img :src="selectedImage.val" class="image-preview__img" />
              </div>
            </b-col>
            <b-col cols="12" lg="5">
              <p class="text-left my-4 my-md-5">
                Logo size should be 200px by 200px. <br />
                Not bigger than 5 MB. <br />
                Logo should be representative of your {{ isMapMode ? 'map visualization' : 'dashboard' }} content.
              </p>
            </b-col>
          </b-row>
          <div :class="{ invalid: !selectedImage.isValid }">
            <p v-if="!selectedImage.isValid">Image field must not be empty.</p>
          </div>
        </b-col>
      </b-row>
      <p><b>Select {{ isMapMode ? 'map visualization' : 'dashboard' }} data</b></p>
      <p style="margin-top: -10px !important">
        Go through our database and select the data that is relevant to your
        {{ isMapMode ? 'map visualization' : 'dashboard' }}.<br />
        Select your indicators, your preferred data source, the years and the
        coverage area (National or subnational).
      </p>
      <!-- <b-row id="bottom-row" class="w-100"> -->
        <!-- <b-col cols="auto mb-5"> -->
          <b-button id="individual" type="submit" class="w-100 button"
            >PROCEED TO SELECT DATA</b-button
          >
        <!-- </b-col> -->
        <!-- <b-col cols="auto" xl="6" md="4" sm="12">
          <p class="help-text">
            I know the exact data I want,<br />
            I will choose just the ones I need
          </p>
        </b-col> -->
        <!-- <b-col cols="auto" class="mt-5 mt-lg-5 mt-xl-0">
          <b-button id="available" disabled>SELECT all available DATA</b-button>
          <p class="help-text">
            Skip the data table, I want all the available data
          </p>
        </b-col> -->
        <!-- <b-col cols="auto mb-5" style="margin-left: -93px !important">
          <b-button id="available" @click="selectAllData($event)"
            >SELECT all available DATA</b-button
          >
        </b-col>
        <b-col>
          <p class="help-text">
            Skip the data table,<br />
            I want all the available data
          </p>
        </b-col> -->
        <!-- <p class="help-text">
            Skip the data table,<br />
            I want all the available data
          </p>
        </b-col> -->
      <!-- </b-row> -->
    </form>
  </b-container>
</template>

<script>
import { mapGetters } from 'vuex';
import customDashboardSvg from '../svg/customDashboardSvgs.vue';

export default {
  name: 'dasboard-details',
  components: {
    customDashboardSvg,
  },
  data() {
    return {
      selectedImage: {
        val: this.$store.getters.editMode
          ? this.$store.getters.dashboardDetails.image : '',
        isValid: true,
      },
      dName: {
        val: this.$store.getters.editMode
          ? this.$store.getters.dashboardDetails.name : '',
        isValid: true,
      },
      publicReason: '',
      description: {
        val: this.$store.getters.editMode
          ? this.$store.getters.dashboardDetails.description : '',
        isValid: true,
      },
      formIsValid: true,
      user: {},
      category: 'health_outcomes',
      username: '',
      endEdit: true,
      isPublicDashboard: '',
      categoryOptions: [
        { value: 'population', text: 'Population' },
        { value: 'health_outcomes', text: 'Health Outcomes' },
        { value: 'health_input', text: 'Health Input' },
        { value: 'health_outputs', text: 'Health Output' },
        { value: 'other', text: 'Other' },
      ],
    };
  },
  mounted() {
    this.user = this.getUser;
    this.username = this.user.username;
    this.$store.commit('updateStep', 1);

    // this.initializeToLocal();

    // store.replaceState({})
    // this.$forceUpdate();
    // this.$router.go();
    // window.location.reload(true);
    // location.reload(1);
  },
  beforeDestroy() {
    if (this.endEdit) this.$store.commit('endEdit');
  },
  watch: {
    async isPublicDashboard(newVal) {
      console.log('cehking');
      // Call the Vuex action with the new value (true or false)
      this.$store.dispatch('setIsPublicDashboard', newVal);
      if (newVal === true) {
        console.log('new val', newVal);
        this.$store.dispatch('setVisibility', 'public');
      }
      if (newVal === false) {
        console.log('new val', newVal);

        this.$store.dispatch('setVisibility', 'private');
      }
      // consologing the visibilty
      console.log('visibilty', this.$store.getters.getVisibility);
    },
  },
  computed: {
    ...mapGetters('AUTH_STORE', ['getUser']),
    ...mapGetters(['getVisibility', 'dashboardMode']),
    isMapMode() {
      return this.dashboardMode === 'map';
    },

  },
  methods: {
    // INITIALIZE CURRENT DASHBOARD TO LOCAL
    initializeToLocal() {
    // set initial value of currentDashboard to localStorage (with only id & userId parameters)
      let currentCustomDashboard;
      const customDashboardsList = JSON.parse(localStorage.getItem('customDashboardsList') || JSON.stringify({}));
      // get list for current user
      const list = customDashboardsList[this.getUser.username || this.getUser.id];
      if (!this.$store.getters.editMode) {
        localStorage.removeItem('vuex');
        this.$store.dispatch('resetState');

        // incrementally generate id from current saved list, defaults to 1
        currentCustomDashboard = {
          id: (list && list.length) ? (list[0].id + 1) : 1,
          userId: this.getUser.id,
        };
      } else {
      // retrieve id of existing dashboard, exit edit mode if not found
        const id = list?.find((dashboard) => ((dashboard.config.dashboardDetails.name === this.dName.val)
        && (dashboard.config.dashboardDetails.description === this.description.val))).id;
        if (!id) {
          this.$store.commit('endEdit');
          this.$store.dispatch('resetState');
        }
        currentCustomDashboard = {
        // eslint-disable-next-line no-nested-ternary, no-unneeded-ternary
          id: id ? id : (list && list.length) ? (list[list.length - 1].id + 1) : 1,
          userId: this.getUser.id,
        };
      }
      console.log(currentCustomDashboard);
      localStorage.setItem('currentCustomDashboard', JSON.stringify(currentCustomDashboard));
    },

    // Preview of image uploaded
    previewThumbnail: function getPreview(event) {
      const input = event.target;
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedImage.val = e.target.result;
          this.selectedImage.isValid = true;
          // console.log('image', this.selectedImage.val);
        };
        reader.readAsDataURL(input.files[0]);
      }
    },
    clearValidity(input) {
      this[input].isValid = true;
    },
    // After uploading of image below function will be excuted
    onUpload() {
      const fd = new FormData();
      fd.append('Image', this.selectedImage.val, this.selectedImage.name);
      // console.log(this.selectedImage.val);
    },

    // Check all the fields are filled correctly
    validateForm() {
      this.formIsValid = true;
      if (this.dName.val === '') {
        this.dName.isValid = false;
        this.formIsValid = false;
      }
      if (this.description.val === '') {
        this.description.isValid = false;
        this.formIsValid = false;
      }

      if (this.isPublicDashboard) {
        if (this.publicReason === '') {
          this.publicReason.isValid = false;
          this.formIsValid = false;
        }
        if (this.category === '') {
          this.category.isValid = false;
          this.formIsValid = false;
        }
      }

      // if (this.selectedImage.val === '') {
      //   this.selectedImage.isValid = false;
      //   this.formIsValid = false;
      //   this.selectedImage.isValid = false;
      //   this.formIsValid = true;
      // }
    },

    // Below function will be excuted when Select indivisual Button is clickekd
    submitForm() {
      this.validateForm();

      if (!this.formIsValid) {
        return;
      }

      // // do not submit if dashboard name already exists in saved list
      // const customDashboardsList = JSON.parse(localStorage.getItem('customDashboardsList') || JSON.stringify({}));
      // const list = customDashboardsList[this.getUser.username] || [];
      // const currentCustomDashboard = JSON.parse(localStorage.getItem('currentCustomDashboard'));
      // let existing;
      // if (this.$store.getters.editMode) {
      //   existing = list.find((dashboard) => (dashboard.id !== currentCustomDashboard.id)
      //     && (dashboard.config.dashboardDetails.name === this.dName.val));
      // } else {
      //   existing = list.find((dashboard) => dashboard.config.dashboardDetails.name === this.dName.val);

      //   // clear dataArray (for next page)
      //   const dataArray = [];
      //   this.$store.dispatch('clearAllData', dataArray);
      // }
      // if (existing) {
      //   this.$swal('The dashboard name you inputed already exists, kindly edit.');
      //   return;
      // }

      const dataArray = [];
      this.$store.dispatch('clearAllData', dataArray);
      let formData = {};

      if (this.isPublicDashboard) {
        formData = {
          dashboardName: this.dName,
          description: this.description,
          reason: this.publicReason,
          image: this.selectedImage.val,
          category: this.category,
        };

        this.$store.dispatch('dashboardConfiguration', {
          name: this.dName.val,
          description: this.description.val,
          image: this.selectedImage.val,
          reason: this.publicReason,
          category: this.category,
        });
      } else {
        formData = {
          dashboardName: this.dName,
          description: this.description,
          reason: this.publicReason,
          image: this.selectedImage.val,
          category: this.category,
        };

        this.$store.dispatch('dashboardConfiguration', {
          name: this.dName.val,
          description: this.description.val,
          image: this.selectedImage.val,
          reason: this.publicReason,
          category: this.category,
        });
      }

      //
      this.$store.dispatch('allSelection', {
        allselected: false,
      });
      // this.$store.state.CUSTOM_DASHBOARD_STORE.masterData = [];
      // this.$store.state.CUSTOM_DASHBOARD_STORE.SurveyArray = [];
      this.endEdit = false;

      this.$emit('save-data', formData);
      this.$router.push('preference-table');
    },
    // Below function will be excuted when Selection of all data is selected
    selectAllData() {
      this.validateForm();
      if (this.formIsValid) {
        this.$store.dispatch('dashboardConfiguration', {
          name: this.dName.val,
          description: this.description.val,
          image: this.selectedImage.val,
          reason: this.publicReason,
          category: this.category,
        });
        this.$store.dispatch('allSelection', {
          allselected: true,
        });
        this.$router.push('preference-table');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
p {
  color: #202020;
  font-family: 'Work Sans', sans-serif;
}
.welcome {
  font-weight: bold;
  color: #3f8994;
  margin-bottom: 10px;
  font-size: 30px;
  font-family: 'Work Sans', sans-serif;
}
.form-control {
  background-color: #eaeaea;
  height: 56.250000014px;
  border: none;
  border-radius: 0px;
  font-style: italic;
}
.forms {
  margin-bottom: 40.50000001px;
  p {
    margin-bottom: 0px;
    font-size: 20px;
  }
}
.field-detail:first-child {
  margin-bottom: 29.250000007px;
}
.btn {
  background-color: #3f8994;
  color: #ffffff;
  height: 48.000000012px;
  max-width: 241.50000006px;
  text-transform: uppercase;
  border: none;
  border-radius: 7.500000002px;
  font-weight: bold;
  padding: 0px 30px 0px 30px;
  white-space: nowrap;
}
#available {
  max-width: 267.750000067px;
  background-color: #eaeaea;
  color: #000000;
}
.help-text {
  color: #696767;
  display: inline;
  margin-right: 5px;
}
.invalid p {
  color: red;
}

.invalid input,
.invalid textarea {
  border: 1px solid red;
}
.file-input-label {
  :hover {
    cursor: pointer;
  }
}
#bottom-row {
  margin-top: 56.250000014px;
}
.button{
  max-width: 100% !important;
}
.image-preview {
  height: 300px;
  left: -4px;
  margin: 0 auto;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
}
.image-preview__img {
  border: 2px solid gray;
  height: 300px;
  object-fit: cover;
  object-position: center;
  width: 100%;
}
</style>
