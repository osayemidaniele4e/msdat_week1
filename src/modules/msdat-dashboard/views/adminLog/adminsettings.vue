<template>
 <b-col>
  <b-col  class="p-lg-5 p-3">
    <b-col class="admin-info" >
      <h4>Admin Info</h4>
      <b-row class="p-3">
        <!-- Admin Info Form Fields -->
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
  <!-- Security section -->
  <b-col class="security-section mt-4">
       <h4>Security</h4>
       <b-form  @submit.prevent="saveSecuritySettings">
         <b-form-group class="sec-box" label="Two-Factor Authentication">
           <p>Select which two-factors authentication options are available to your users.</p>
           <b-row  >
             <b-col cols="3">
               <b-form-checkbox v-model="securitySettings.sms" value="SMS/Phone Number">
                 SMS/Phone Number
               </b-form-checkbox>
             </b-col>
             <b-col cols="3">
               <b-form-checkbox v-model="securitySettings.email" value="Email">
                 Email
               </b-form-checkbox>
             </b-col>
             <b-col cols="3">
               <b-form-checkbox v-model="securitySettings.googleAuthenticator" value="Google Authenticator">
                 Google Authenticator
               </b-form-checkbox>
             </b-col>
             <b-col cols="3">
               <b-form-checkbox v-model="securitySettings.microsoftAuthenticator" value="Microsoft Authenticator">
                 Microsoft Authenticator
               </b-form-checkbox>
             </b-col>
           </b-row>
         </b-form-group>
       </b-form>
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
    <!-- Appearance Settings Component -->
    <appearance-settings></appearance-settings>
    </b-col>
 <div class="mt-3 btn-double">
  <div class="inner-box">
    <b-button type="reset" class="btn-res">CANCEL</b-button>
    <b-button type="submit" class="btn-green" @click="showSaveAlert">SAVE</b-button>
    </div>
        </div>
 </b-col>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import axios from 'axios';
import AppearanceSettings from '../userLog/Appearance.vue';

export default {
  name: 'adminsettings',
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
          title: 'Review Plugin',
          description: 'Enable or disable review-related features',
          key: 'reviewPlugin',
          enabled: localStorage.getItem('reviewPlugin') === 'true',
        },
        {
          title: 'Screenshot Manager',
          description: 'Enable or disable screenshot-related features',
          key: 'screenshotManager',
          enabled: localStorage.getItem('screenshotManager') === 'true',
        },
      ],
      notifications: [
        { title: 'Updates', description: 'Receive notifications on updates made to the MSDAT Platform.', enabled: true },
        { title: 'New User', description: 'Receive notifications when a user views your public custom dashboard(s).', enabled: true },
        { title: 'Custom Dashboard', description: 'Receive notifications when a custom dashboard is made public.', enabled: false },
        { title: 'Admin Activities', description: 'Receive notifications to monitor login activities of users with admin access.', enabled: true },
        { title: 'Plug-Ins', description: 'Receive notifications when a new plug-in is available on the platform.', enabled: false },
      ],
      securitySettings: {
        sms: false,
        email: false,
        googleAuthenticator: false,
        microsoftAuthenticator: false,
      },
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
    async logoutAndRedirect(message = 'Please log in again') {
      this.$swal('Session expired', message, 'error');
      await this.$store.dispatch('AUTH_STORE/logout');
      this.$router.push('/');
    },
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
          await this.logoutAndRedirect();
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
          await this.logoutAndRedirect();
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
    async saveSecuritySettings() {
      const url = `http://172.93.52.240:3001/api/users/${this.getUser.id}/security-settings`;
      await axios.post(url, this.securitySettings)
        .then((response) => {
          console.log(response.data);
        }).catch((error) => console.log(error));
    },
    showSaveAlert() {
      this.$swal('Settings saved successfully!', '', 'success');
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
.admin-info{
 margin-bottom:50px;
}

.item-box {
 width: 100%;
 display: flex;
 flex-wrap: wrap;
 gap:2rem;
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
.security-section {
  margin-top: 1rem;
  padding: 0.5rem;
  margin-bottom:60px;
}

.security-section h4 {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.security-section p {
  font-size: 16px;
}

.security-section .form-container {
  padding: 2rem;
}

security-section .form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}
.sec-box{
 padding: 10px;
}
.security-section .form-group {
  flex: 1;
  margin-bottom: 1.5rem;
}

.security-section .btn-block {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
}

.btn-double{
  background-color: #F2FAFA;
 display: flex;
 z-index: 999;
 position: fixed;
 width: 100%;
 bottom: 0;
 justify-content: center;
 align-items: center;
 gap: 1rem;
 padding:10px 0;
 margin-bottom: 35px;
 margin-left: -30px;

}

.inner-box{
 display: flex;
 gap: 2rem;
 margin-left: -250px;
}

.btn-res{
 background-color: #FFFFFF;
 color: #007D53;
 border: 1px solid #D4D4D4;
 width: 170px;
 padding: 11px 0px;
 font-size: 18px;
}

.btn-res:hover{
 color: #007D53;
}

.btn-green{
 background-color: #007D53;
 color: #fff;
 border-color: #007D53;
 width: 170px ;
 padding: 11px 0px;
 font-size: 18px;
}

.text-muted {
 font-size: 0.85rem;
 color: #6c757d;
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

 .inner-box{
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-left: -120px;
 }
}
</style>
```
