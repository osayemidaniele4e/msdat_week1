<template>
  <b-col class="p-lg-5 p-3">
    <b-col class="profile-info" >
      <h4>Profile Info</h4>
      <b-row class="p-3">
        <!-- Profile Info Form Fields -->
        <b-col cols="6">
          <b-form-group id="input-group-1" label="First Name" label-for="fname">
            <b-form-input id="fname" v-model="user.first_name" type="text" disabled></b-form-input>
          </b-form-group>
        </b-col>
        <b-col cols="6">
          <b-form-group id="input-group-2" label="Last Name" label-for="lname">
            <b-form-input id="lname" v-model="user.last_name" type="text" disabled></b-form-input>
          </b-form-group>
        </b-col>
        <b-col cols="6">
          <b-form-group id="input-group-3" label="Username" label-for="username">
            <b-form-input id="username" v-model="user.username" type="text" disabled></b-form-input>
          </b-form-group>
        </b-col>
        <b-col cols="6">
          <b-form-group id="input-group-4" label="Email Address" label-for="email">
            <b-form-input id="email" v-model="user.email" type="email" disabled></b-form-input>
          </b-form-group>
        </b-col>
        <b-col cols="6">
          <b-form-group id="input-group-5" label="Organisation" label-for="organization">
            <b-form-input id="organization" v-model="user.organization" type="text" disabled></b-form-input>
          </b-form-group>
        </b-col>
        <b-col cols="6">
          <b-form-group id="input-group-6" label="Role" label-for="role">
            <b-form-input id="role" v-model="user.role" type="text" disabled></b-form-input>
          </b-form-group>
        </b-col>
      </b-row>
    </b-col>
    <b-col class="password-update">
      <h4>Password Update</h4>
      <b-form class="form-container" @submit.prevent="changePassword">
        <div class="form-row">
          <b-form-group id="input-group-7" class="form-group">
            <div class="input-label">
              <label for="new-password">New Password</label>
              <b-icon :icon="passwordToggleIcon.newPassword" @click="togglePasswordVisibility('newPassword')" style="cursor: pointer;"></b-icon>
            </div>
            <b-form-input id="new-password" :type="passwordFieldType.newPassword" v-model="newPassword" class="form-input" required></b-form-input>
            <b-progress :max="100" class="progress mt-2" :value="passwordStrength">
              <b-progress-bar :value="passwordStrength" class="progress-bar"></b-progress-bar>
            </b-progress>
            <span :class="passwordStrengthClass">{{ passwordStrengthText }}</span>

            <!-- Password Requirements -->
            <div v-if="newPassword" class="password-requirements mt-2">
              <div
                v-for="(requirement, index) in passwordRequirements"
                :key="index"
                class="requirement-item"
                :class="{ 'requirement-met': requirement.met, 'requirement-unmet': !requirement.met }"
              >
                <b-icon :icon="requirement.met ? 'check-circle-fill' : 'x-circle-fill'"></b-icon>
                <span>{{ requirement.text }}</span>
              </div>
            </div>
          </b-form-group>
          <b-form-group id="input-group-8" class="form-group">
            <div class="input-label">
              <label for="confirm-password">Confirm Password</label>
              <b-icon :icon="passwordToggleIcon.confirmPassword" @click="togglePasswordVisibility('confirmPassword')" style="cursor: pointer;"></b-icon>
            </div>
            <b-form-input id="confirm-password" :type="passwordFieldType.confirmPassword" v-model="confirmPassword" class="form-input" required></b-form-input>
            <span class="strength-text" v-if="passwordsMatch">MATCH</span>
            <span class="text-danger" v-else>DOES NOT MATCH</span>
          </b-form-group>
        </div>
        <b-button type="submit" variant="primary" class="btn">CHANGE PASSWORD</b-button>
      </b-form>
    </b-col>
    <b-col class="custom-dashboard">
     <h4>Custom Dashboard</h4>
     <p>Select which of your custom dashboards you want to make public or private.</p>
     <b-row class="item-box p-3">
       <div v-for="(item, index) in data" :key="index" class="item">
         <h4>{{ item.title }}</h4>
         <p>{{ item.description }}</p>
         <div class="input-label">
         <label class="radio-label">
           <input type="radio" :name="'visibility-' + index" v-model="item.visibility" value="public" /> Public
         </label>
         <label class="radio-label">
           <input type="radio" :name="'visibility-' + index" v-model="item.visibility" value="private" /> Private
         </label>
         </div>
       </div>
     </b-row>
    </b-col>
    <b-col class="plugin-toggle">
    <h4>Plug-ins</h4>
    <p>Toggle on and off to determine which plug-ins you want to enable or disable.</p>
    <b-row class="item-box p-3">
      <div v-for="(plugin, index) in plugins" :key="index" class="plugin-item">
        <div>
          <h3>{{ plugin.title }}</h3>
          <p>{{ plugin.description }}</p>
        </div>
        <b-form-checkbox
          v-model="plugin.enabled"
          @change="togglePlugin(plugin)"
          switch
          size="lg"
          :name="'plugin-' + index"
        >
        </b-form-checkbox>
      </div>
    </b-row>
  </b-col>
  <b-col class="notifications">
    <h4>Notifications</h4>
    <p>Toggle on and off to determine what forms of notification you get in your email.</p>
    <b-row class="item-box p-3">
      <div v-for="(notification, index) in notifications" :key="index" class="notification-item">
        <div>
         <h3>{{ notification.title }}</h3>
          <p>{{ notification.description }}</p>
        </div>
        <b-form-checkbox
          v-model="notification.enabled"
          switch
          size="lg"
          :name="'notification-' + index"
        >
        </b-form-checkbox>
      </div>
    </b-row>
  </b-col>
  <!-- <b-col class="saved-states">
    <h4>Saved States</h4>

    <div class="state-section">
      <h5>Default State</h5>
      <b-card class="state-card">
        <div class="state-content">
          <div>
            <h6>{{ defaultState.title }}</h6>
            <p class="text-muted">Last Modified: {{ defaultState.modified }}</p>
          </div>
          <b-button  style="font-size: 16px;" variant="link" class="text-success p-0 mr-2 edit-link">Edit State</b-button>
        </div>
      </b-card>
    </div>
    <div class="state-section">
      <h5>Saved States</h5>
      <div v-for="(state, index) in savedStates" :key="index">
        <b-card class="state-card">
          <div class="state-content">
            <div >
              <h6>{{ state.title }}</h6>
              <p class="text-muted">Last Modified: {{ state.modified }}</p>
            </div>
            <div class="state-actions">
              <b-button style="font-size: 16px;" variant="link" class="text-success p-0 mr-2 edit-link">Set as Default</b-button>
              <b-button  style="font-size: 16px;" variant="link" class="text-success p-0 mr-2 default-link">Edit State</b-button>
            </div>
          </div>
        </b-card>
      </div>
    </div>
    <a href="#" class="create-link">
      <b-icon icon="plus-circle"></b-icon> Create New State
    </a>
  </b-col> -->
    <!-- Appearance Settings Component -->
    <appearance-settings></appearance-settings>

    <b-col class="deactivate-account">
      <h4>Deactivate Account</h4>
      <p>Your account will be permanently deleted and you will no longer have access to all your data.</p>
      <a class="btn-dang" @click="deactivateAccount">Deactivate Account</a>
      </b-col>
  </b-col>
 </template>

<script>
import { mapGetters, mapActions } from 'vuex';
import axios from 'axios';
import data from './custom_dashboard_data';
import AppearanceSettings from './Appearance.vue';

export default {
  name: 'usersettings',
  components: {
    AppearanceSettings,
  },
  data() {
    return {
      user: {},
      newPassword: '',
      confirmPassword: '',
      passwordFieldType: {
        newPassword: 'password',
        confirmPassword: 'password',
      },
      passwordToggleIcon: {
        newPassword: 'eye-fill',
        confirmPassword: 'eye-fill',
      },
      plugins: [
        {
          title: 'Context Plugin',
          description: 'Enable or disable context-based features',
          key: 'contextPlugin',
          enabled: localStorage.getItem('contextPlugin') === 'true',
        },
        {
          title: 'Indicator Plugin',
          description: 'Enable or disable indicator-related features',
          key: 'indicatorPlugin',
          enabled: localStorage.getItem('indicatorPlugin') === 'true',
        },
        {
          title: 'Screenshot Manager',
          description: 'Enable screenshot capture and management features',
          key: 'screenshotManager',
          enabled: localStorage.getItem('screenshotManager') === 'true',
        },
        {
          title: 'Accessibility Plugin',
          description: 'Enable accessibility features like high contrast mode, font size adjustment, and screen reader support',
          key: 'accessibilityPlugin',
          enabled: localStorage.getItem('accessibilityPlugin') === 'true',
        },
      ],
      data, // Importing data from custom_dashboard_data.js

      notifications: [
        { title: 'Updates', description: 'Receive notifications on updates made to the MSDAT Platform.', enabled: true },
        { title: 'Dashboard View', description: 'Receive notifications when a user views your public custom dashboard(s).', enabled: true },
        { title: 'Indicators', description: 'Receive notifications when a new indicator is available on the platform.', enabled: false },
        { title: 'Data Sources', description: 'Receive notifications when a new data source is available on the platform.', enabled: true },
        { title: 'Plug-Ins', description: 'Receive notifications when a new plug-in is available on the platform.', enabled: false },
      ],
      defaultState: {
        title: 'Ministry of Finance - Monthly Review (Public Health)',
        modified: '30th June, 2023',
      },
      savedStates: [
        { title: 'Ministry of Finance - Weekly Review (Public Health)', modified: '30th June, 2023' },
        { title: 'Ministry of Finance - Daily Review (Public Health)', modified: '30th June, 2023' },
      ],
    };
  },
  computed: {
    ...mapGetters('AUTH_STORE', ['isAuthenticated', 'getUser', 'getDashboards']),
    passwordStrength() {
      let strength = 0;
      if (this.newPassword.length >= 8) strength += 20;
      if (/[A-Z]/.test(this.newPassword)) strength += 20;
      if (/[a-z]/.test(this.newPassword)) strength += 20;
      if (/[0-9]/.test(this.newPassword)) strength += 20;
      if (/[^A-Za-z0-9]/.test(this.newPassword)) strength += 20;
      return strength;
    },
    passwordStrengthText() {
      const strength = this.passwordStrength;
      if (strength < 40) {
        return 'WEAK';
      } if (strength <= 60) {
        return 'MEDIUM';
      }
      return 'STRONG';
    },
    passwordStrengthClass() {
      const strength = this.passwordStrength;
      if (strength < 40) {
        return 'text-danger';
      } if (strength <= 60) {
        return 'text-warning';
      }
      return 'text-success';
    },
    passwordRequirements() {
      return [
        {
          text: 'At least 8 characters',
          met: this.newPassword.length >= 8,
        },
        {
          text: 'One uppercase letter (A-Z)',
          met: /[A-Z]/.test(this.newPassword),
        },
        {
          text: 'One lowercase letter (a-z)',
          met: /[a-z]/.test(this.newPassword),
        },
        {
          text: 'One number (0-9)',
          met: /[0-9]/.test(this.newPassword),
        },
        {
          text: 'One special character (!@#$%^&*)',
          met: /[^A-Za-z0-9]/.test(this.newPassword),
        },
      ];
    },
    isPasswordValid() {
      return this.passwordRequirements.every((req) => req.met);
    },
    passwordsMatch() {
      return this.newPassword === this.confirmPassword;
    },
  },
  methods: {
    ...mapActions('AUTH_STORE', ['SAVE_DASHBOARDS']),
    async getProfile() {
      const baseUrl = process.env.VUE_APP_API_BASE_URL;
      const url = `${baseUrl}users/${this.getUser.id}/`;
      console.log('getUser:', this.getUser);
      try {
        const response = await axios.get(url);
        this.user = { ...this.user, ...response.data };
        this.$store.commit('setUser', this.user);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    },

    togglePlugin(plugin) {
      // Persist state
      const pluginState = plugin.enabled ? 'true' : 'false';
      localStorage.setItem(plugin.key, pluginState);

      // Notify root to (de)activate plugin at runtime without reload
      this.$root.$emit('plugins:changed', { plugin: plugin.key, value: plugin.enabled });
    },
    async changePassword() {
      if (!this.passwordsMatch) {
        this.$swal('Error', 'Passwords do not match', 'error');
        return;
      }

      if (!this.isPasswordValid) {
        this.$swal({
          title: 'Invalid Password',
          html: `
            <div style="text-align: left;">
              <p>Password must meet all the following requirements:</p>
              <ul style="list-style: none; padding-left: 0;">
                ${this.passwordRequirements.map((req) => `<li style="color: ${req.met ? '#28a745' : '#dc3545'}; margin: 5px 0;">
                    <span aria-hidden="true">${req.met ? '✔' : '✖'}</span>
                    ${req.text}
                  </li>`).join('')}
              </ul>
            </div>
          `,
          icon: 'warning',
          confirmButtonText: 'OK',
        });
        return;
      }

      const baseUrl = 'https://msdat2api.e4eweb.space/api/';
      const url = `${baseUrl}users/update_password/`;
      const payload = { new_password: this.newPassword };

      try {
        const token = this.getUser.tokens.access_token;
        // console.log('Token:', token);

        if (!token) {
          this.$swal('Session expired', 'Please log in again', 'error');
          this.$store.dispatch('AUTH_STORE/logout'); // Optional: Log out user if token is missing
          this.$router.go();
          return;
        }

        // console.log('Payload:', payload);

        const response = await axios.put(url, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Response:', response);

        this.$swal('Password updated successfully!', '', 'success');
        this.newPassword = '';
        this.confirmPassword = '';
      } catch (error) {
        console.error('Error updating password:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || 'An error occurred';

        if (error.response?.data?.code === 'token_not_valid') {
          this.$swal('Session expired', 'Please log in again', 'error');
          this.$store.dispatch('logout'); // Optional: Handle token expiration
        } else {
          this.$swal('Failed to update password', errorMessage, 'error');
        }
      }
    },

    togglePasswordVisibility(field) {
      if (this.passwordFieldType[field] === 'password') {
        this.passwordFieldType[field] = 'text';
        this.passwordToggleIcon[field] = 'eye-slash-fill';
      } else {
        this.passwordFieldType[field] = 'password';
        this.passwordToggleIcon[field] = 'eye-fill';
      }
    },

    async deactivateAccount() {
      const result = await this.$swal({
        title: 'Are you sure?',
        text: 'Do you really want to deactivate your account? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, deactivate it!',
        cancelButtonText: 'No, keep my account',
      });

      if (result.isConfirmed) {
        const baseUrl = 'https://msdat2api.e4eweb.space/api/';
        const url = `${baseUrl}users/${this.getUser.id}/`;

        try {
          const token = this.getUser.tokens.access_token;

          if (!token) {
            this.$swal('Session expired', 'Please log in again', 'error');
            this.$store.dispatch('AUTH_STORE/logout');
            this.$router.go(); // Optional: Log out user if token is missing
            return;
          }

          await axios.delete(url, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          this.$swal('Account deactivated successfully!', '', 'success');
          this.$store.dispatch('AUTH_STORE/logout'); // Log out the user after deactivation
          this.$router.go();
        } catch (error) {
          console.error('Error deactivating account:', error.response?.data || error.message);
          const errorMessage = error.response?.data?.message || 'An error occurred';

          if (error.response?.data?.code === 'token_not_valid') {
            this.$swal('Session expired', 'Please log in again', 'error');
            this.$store.dispatch('AUTH_STORE/logout');
            this.$router.go();
          } else {
            this.$swal('Failed to deactivate account', errorMessage, 'error');
          }
        }
      }
    },
  },
  async mounted() {
    if (this.isAuthenticated) {
      await this.getProfile();
    } else {
      this.$swal('Kindly login to view your profile.');
    }
  },
};
</script>

 <style scoped>
 .profile-info{
  margin-bottom:80px;
 }

 .item-box {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap:2rem;
}
.custom-dashboard{
  margin-bottom:60px;
}

.custom-dashboard p{
  font-size: 16px;
}

.item {
  width: calc(50% - 20px);
  padding: 5px;
  border: 0.1px solid #c5c5c5;
  border-radius: 8px;
  box-sizing: border-box;
  margin-bottom: 20px;
}
.input-label{
  display: flex;
  gap: 10px;
  align-items: center;
}
.radio-label {
  display: flex;
  align-items: center;
}
/* custom radio button */
.radio-label input[type="radio"] {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #007D53;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  position: relative;
  margin-right: 5px;
}

.radio-label input[type="radio"]:checked::before {
  content: '';
  display: block;
  width: 10px;
  height: 10px;
  background-color: #007D53;
  ;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
}
.plugin-toggle {
  width: 100%;
  margin-bottom: 60px;
}

.plugin-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: calc(50% - 20px);
  padding: 10px;
  box-sizing: border-box;
  margin-bottom: 20px;
}

.plugin-toggle p{
  font-size:16px;
}

h3{
  font-size:20px;
  font-weight:500;
}
b-form-checkbox {
  margin-top: 10px;
}

.notifications {
  width: 100%;
  margin-bottom: 100px;
}
.notifications p{
  font-size:16px;
}

.notification-item {
  width: calc(50% - 20px);
  padding: 10px;
  box-sizing: border-box;
  margin-bottom: 20px;
  display: flex;
  gap:7px;
  align-items: center;
  justify-content: space-between;
}

.notification-item h3, .notification-item p {
  margin: 0;
}

.notification-item h3 {
  font-size: 1.1rem;
  font-weight: 500;
}

.notification-item p {
  font-size: 0.9rem;
  color: #6c757d; /* Bootstrap's text-muted color */
}

b-form-checkbox {
  margin-left: 10px;
}

.saved-states {
  width: 100%;
  margin-bottom:100px;
}

.state-section {
  margin-bottom: 20px;
}

.state-section p, h5{
  font-size: 16px;
}

.state-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 10px;
}

.state-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.state-content h6 {
  font-size: 18px;
  margin: 0;
}

.text-muted {
  font-size: 0.85rem;
  color: #6c757d;
}

.edit-link, .default-link {
  color: #007D53;
  text-decoration:underline;
}

.create-link {
  color: #007D53;
  text-decoration: none;
  display: flex;
  align-items: center;
  margin-top: 20px;
}

.create-link b-icon {
  margin-right: 5px;
  margin-left:10px;
}

.deactivate-account {
  width: 100%;
  margin-bottom: 100px;
}

.deactivate-account p {
  font-size: 16px;
}

.deactivate-account .btn-dang {
  color: #ff0000;
  font-size: 20px;
  cursor: pointer;
}

.deactivate-account .btn-dang:hover {
  text-decoration: underline;
}

 .password-update {
  margin-top: 1rem;
  padding: 0.5rem;
  margin-bottom:60px;
 }

 .password-update h4 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
 }

 .password-update .form-container {
  padding: 2rem;
 }

 .password-update .form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
 }

 .password-update .form-group {
  flex: 1;
  margin-bottom: 1.5rem;
  position: relative;
 }

 .password-update .form-input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid #ced4da;
 }

 .password-update .progress {
  margin-top: 0.5rem;
  height: 5px;
 }

 .password-update .progress-bar {
  background-color: #02AD00;
 }

 .password-update .form-text {
  margin-top: 0.5rem;
  color: #28a745;
  font-weight: bold;
 }

 .password-update .btn {
  width: 30%;
  padding: 0.75rem;
  font-size: 1rem;
 }

 .password-update .input-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
 }

 .password-update .strength-text, .text-danger {
  color: #02AD00;
  font-size: 12px;
 }
 .text-warning, .text-success {
  font-size: 12px;
 }
 .password-update .b-icon {
  position: absolute;
  right: 10px;
  top: 38px;
  cursor: pointer;
 }

 /* Password Requirements Styles */
 .password-requirements {
  margin-top: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
 }

 .requirement-item {
  display: flex;
  align-items: center;
  margin: 4px 0;
  font-size: 12px;
 }

 .requirement-item .b-icon {
  margin-right: 8px;
  font-size: 12px;
 }

 .requirement-met {
  color: #28a745;
 }

 .requirement-unmet {
  color: #dc3545;
 }

 @media (max-width: 768px) {
  .password-update .btn {
  width: 100%;
  }
 }
 </style>
