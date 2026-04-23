<!-- eslint-disable no-alert -->
<template>
  <section class="login-shell">
    <div class="login-card">
      <div class="login-showcase">
        <div class="showcase-chip">Authentication Portal</div>
        <h3>Multi - Souces Data Analytics and Triangulation Platform.</h3>
        <p>Sign in to access more features.</p>

        <div class="showcase-metrics">
          <div class="metric-card">
            <strong>Live dashboards</strong>
            <span>Monitor health trends across curated modules.</span>
          </div>
        </div>

        <div class="showcase-footer">
          <div class="signal-dot"></div>
          <span>Encrypted sign-in with trusted identity providers</span>
        </div>
      </div>

      <div class="login-panel">
        <div class="login-hero">
          <span class="eyebrow">Welcome back</span>
          <h4>Log in to continue</h4>
        </div>

        <div class="social-block">
          <p class="social-label">Continue with</p>

          <div class="social-grid">
            <button
              type="button"
              class="soc-btn"
              :disabled="isLoading || activeProvider === 'google'"
              @click="handleClickSignIn"
            >
              <b-icon-google class="mr-2"></b-icon-google>
              {{ activeProvider === 'google' ? 'Connecting...' : 'Google' }}
            </button>

            <a
              :href="linkedlnUrl"
              class="soc-btn d-inline-flex align-items-center justify-content-center"
              :class="{ disabled: isLoading }"
              @click="handleLinkedInClick"
            >
              <b-icon-linkedin class="mr-2"></b-icon-linkedin>
              LinkedIn
            </a>

            <button type="button" class="soc-btn soc-btn-muted" disabled>
              <b-icon-facebook class="mr-2"></b-icon-facebook>
              Facebook
            </button>
          </div>
        </div>

        <div class="divider">
          <span>or use your username</span>
        </div>

        <div v-if="errorMessage" class="form-alert" role="alert">
          {{ errorMessage }}
        </div>

        <form class="login-form" @submit.prevent="login">
          <div class="form-field">
            <label for="login-username">Username</label>
            <input
              id="login-username"
              v-model.trim="username"
              type="text"
              class="form-control"
              placeholder="Enter your username"
              autocomplete="username"
              :disabled="isLoading"
            />
          </div>

          <div class="form-field">
            <div class="label-row">
              <label for="login-password">Password</label>
              <a href="#" class="forgot-abs" @click.prevent>Forgot password?</a>
            </div>

            <div class="password-wrap">
              <input
                id="login-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                placeholder="Enter your password"
                autocomplete="current-password"
                :disabled="isLoading"
              />
              <button
                type="button"
                class="password-toggle"
                :disabled="isLoading"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <b-icon :icon="showPassword ? 'eye-slash' : 'eye'"></b-icon>
              </button>
            </div>
          </div>

          <!-- <div class="form-meta">
            <span class="trust-copy">Secure access for MSDAT users</span>
            <span class="meta-dot"></span>
            <span class="trust-copy">Protected session and activity validation</span>
          </div> -->

          <button type="submit" class="submit-btnn" :disabled="isLoading">
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm mr-2"
              role="status"
              aria-hidden="true"
            ></span>
            {{ isLoading ? 'Logging in...' : 'Log in ' }}
          </button>

          <p class="register-copy">
            Don&apos;t have an account?
            <button type="button" class="register-link" @click="$emit('open-register')">
              Register
            </button>
          </p>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';
import VueAxios from 'vue-axios';
import axios from 'axios';

Vue.use(VueAxios, axios);

export default {
  props: {
    version: {
      type: String,
      default: 'v2.10',
    },
    logoutLabel: {
      type: String,
      default: 'Log out ',
    },
    loginLabel: {
      type: String,
      default: 'Facebook',
    },
    loginOptions: {
      type: Object,
      default() {
        return {
          scope: 'email',
        };
      },
    },
  },
  data() {
    return {
      username: '',
      password: '',
      clientId: process.env.VUE_APP_FACEBOOK_APP_ID,
      isWorking: false,
      isConnected: false,
      isLoading: false,
      activeProvider: '',
      errorMessage: '',
      showPassword: false,
      linkedlnUrl: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
        process.env.VUE_APP_API_LINKEDIN_ID
      }&redirect_uri=${encodeURIComponent(window.location.origin)}&scope=openid%20profile%20email`,
    };
  },

  computed: {
    ...mapGetters('AUTH_STORE', ['isAuthenticated']),
    getButtonText() {
      switch (this.isConnected) {
        case true:
          return this.logoutLabel;
        case false:
          return this.loginLabel;
        default:
          return 'this is default';
      }
    },
  },
  methods: {
    ...mapActions('AUTH_STORE', ['LOGIN_USER', 'AUTHENTICATE', 'AUTHENTICATE_LINKEDIN']),

    async login() {
      if (!this.username || !this.password) {
        this.errorMessage = 'Enter your username and password to continue.';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      try {
        const formData = {
          username: this.username,
          password: this.password,
        };
        const res = await this.LOGIN_USER(formData);

        if (res && res.status === 200) {
          this.$emit('login-success');
          this.$swal({
            toast: true,
            position: 'bottom',
            showConfirmButton: false,
            timer: 5000,
            icon: 'success',
            title: 'Success',
            text: 'Login successful',
          });
        } else {
          this.errorMessage = 'Confirm username and password.';
          this.$swal({
            toast: true,
            position: 'bottom',
            showConfirmButton: false,
            timer: 5000,
            icon: 'error',
            title: 'Something went wrong',
            text: 'Confirm username and password',
          });
        }
      } catch (err) {
        this.errorMessage = 'User not found. Confirm username and password.';
        this.$swal('user not found, confirm username and password');
        console.log(err?.message);
      } finally {
        this.isLoading = false;
      }

      if (window.innerWidth < 700 && this.isAuthenticated) {
        this.$router.push('/account');
      }
    },

    handleLinkedInClick(event) {
      if (this.isLoading) {
        event.preventDefault();
      }
    },

    // eslint-disable-next-line consistent-return
    async handleClickSignIn() {
      this.activeProvider = 'google';
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const googleUser = await this.$gAuth.signIn();
        if (!googleUser) {
          return null;
        }

        const data = {
          auth_token: googleUser.getAuthResponse().access_token,
          provider: 'google',
        };

        await this.AUTHENTICATE(data)
          .then((res) => {
            if (res.status === 200 || res.status === 201) {
              this.$emit('login-success');
              this.$swal({
                toast: true,
                position: 'bottom',
                showConfirmButton: false,
                timer: 5000,
                icon: 'success',
                title: 'Success',
                text: 'Login successful',
              });
            }
          })
          .catch((err) => {
            console.log('res', err);
            this.errorMessage = 'Something went wrong signing you in with Google.';
            this.$swal({
              toast: true,
              position: 'bottom',
              showConfirmButton: false,
              timer: 5000,
              icon: 'error',
              title: 'Something went wrong',
              text: 'Something went wrong signing you in with google',
            });
          });
      } catch (error) {
        console.error(error);
        return null;
      } finally {
        this.activeProvider = '';
        this.isLoading = false;
      }
      return 0;
    },
    async linkedlnSignin(data) {
      this.activeProvider = 'linkedin';
      this.isLoading = true;
      this.errorMessage = '';

      try {
        await this.AUTHENTICATE_LINKEDIN(data)
          .then((res) => {
            if (res.status === 200 || res.status === 201) {
              this.$emit('login-success');
              this.$swal({
                toast: true,
                position: 'bottom',
                showConfirmButton: false,
                timer: 5000,
                icon: 'success',
                title: 'Success',
                text: 'Login successful',
              });
            }
          })
          .catch((err) => {
            console.log('res', err);
            this.errorMessage = 'Something went wrong signing you in with LinkedIn.';
            this.$swal({
              toast: true,
              position: 'bottom',
              showConfirmButton: false,
              timer: 5000,
              icon: 'error',
              title: 'Something went wrong',
              text: 'Something went wrong signing you in with linkedln',
            });
          });
      } catch (error) {
        console.error(error);
        return null;
      } finally {
        this.activeProvider = '';
        this.isLoading = false;
      }
      return 0;
    },
  },
  async mounted() {
    this.isWorking = true;

    const { code, state } = this.$route.query;
    if (code && !this.isAuthenticated) {
      const uri = `${window.location.origin}${state === 'CUSTOM' ? '/custom' : ''}`;
      const data = { code, redirect_uri: uri };
      await this.linkedlnSignin(data);
    }

    this.isWorking = false;
  },
};
</script>

<style scoped>
.login-shell {
  position: relative;
  padding: 14px;
}

.login-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(260px, 0.95fr) minmax(0, 1.05fr);
  overflow: hidden;
  border: 1px solid rgba(190, 208, 215, 0.75);
  border-radius: 30px;
  background: radial-gradient(circle at top left, rgba(216, 237, 232, 0.98), transparent 40%),
    linear-gradient(135deg, rgba(13, 49, 56, 0.08), rgba(255, 255, 255, 0.96) 46%), #ffffff;
  box-shadow: 0 28px 70px rgba(11, 45, 51, 0.14);
}

.login-card::before {
  position: absolute;
  top: -72px;
  left: -58px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: rgba(74, 146, 135, 0.12);
  content: '';
  filter: blur(8px);
}

.login-card::after {
  position: absolute;
  right: -60px;
  bottom: -80px;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: rgba(8, 83, 94, 0.08);
  content: '';
  filter: blur(10px);
}

.login-showcase {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
  padding: 2.2rem;
  background: linear-gradient(155deg, rgba(9, 48, 54, 0.94), rgba(17, 87, 90, 0.88)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0));
  color: #f4fbf9;
}

.showcase-chip {
  display: inline-flex;
  align-self: flex-start;
  padding: 0.48rem 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.login-showcase h3 {
  margin: 1.1rem 0 0.9rem;
  max-width: 10ch;
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.02;
}

.login-showcase p {
  margin: 0;
  max-width: 34ch;
  color: rgba(244, 251, 249, 0.78);
  font-size: 0.98rem;
  line-height: 1.8;
}

.showcase-metrics {
  display: grid;
  gap: 14px;
  margin-top: 2rem;
}

.metric-card {
  padding: 1rem 1.05rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}

.metric-card strong {
  display: block;
  margin-bottom: 0.38rem;
  font-size: 0.95rem;
  font-weight: 700;
}

.metric-card span {
  display: block;
  color: rgba(244, 251, 249, 0.72);
  font-size: 0.9rem;
  line-height: 1.65;
}

.showcase-footer {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 1.8rem;
  color: rgba(244, 251, 249, 0.74);
  font-size: 0.9rem;
}

.signal-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #8bf3d4;
  box-shadow: 0 0 0 6px rgba(139, 243, 212, 0.12);
}

.login-panel {
  position: relative;
  z-index: 1;
  padding: 2.2rem 2rem;
}

.login-hero {
  margin-bottom: 1.6rem;
}

.eyebrow {
  display: inline-flex;
  margin-bottom: 0.9rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid rgba(52, 132, 129, 0.16);
  border-radius: 999px;
  background: rgba(52, 132, 129, 0.09);
  color: #2e726f;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.login-hero h4 {
  margin-bottom: 0.65rem;
  color: #143b38;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.08;
}

.login-hero p {
  margin: 0;
  max-width: 44ch;
  color: #607a76;
  line-height: 1.75;
}

.social-block {
  margin-bottom: 1.2rem;
}

.social-label {
  margin-bottom: 0.85rem;
  color: #173a33;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.social-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.soc-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(123, 154, 160, 0.28);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff, #f8fcfb);
  color: #234c4d;
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.soc-btn:hover,
.soc-btn:focus {
  transform: translateY(-1px);
  border-color: rgba(52, 132, 129, 0.28);
  box-shadow: 0 16px 28px rgba(17, 47, 53, 0.08);
  color: #1d6b68;
}

.soc-btn-muted {
  color: #7d8f92;
}

.soc-btn.disabled,
.soc-btn:disabled {
  opacity: 0.65;
  pointer-events: none;
}

.divider {
  position: relative;
  margin: 1.5rem 0 1.3rem;
  text-align: center;
}

.divider::before {
  position: absolute;
  inset: 50% 0 auto;
  border-top: 1px solid rgba(23, 58, 51, 0.1);
  content: '';
}

.divider span {
  position: relative;
  z-index: 1;
  display: inline-block;
  padding: 0 14px;
  background: #ffffff;
  color: #708684;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.form-alert {
  margin-bottom: 16px;
  padding: 13px 14px;
  border: 1px solid rgba(176, 60, 60, 0.12);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(176, 60, 60, 0.08), rgba(176, 60, 60, 0.03));
  color: #9b3b3b;
  font-size: 0.9rem;
}

.login-form {
  display: grid;
  gap: 18px;
}

.form-field {
  display: grid;
  gap: 8px;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.form-field label {
  margin: 0;
  color: #173a33;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.password-wrap {
  position: relative;
}

.form-control {
  min-height: 56px;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(23, 58, 51, 0.11);
  border-radius: 18px;
  background: linear-gradient(180deg, #fbfdfc, #f4f9f8);
  color: #173a33;
}

.form-control:focus {
  border-color: rgba(52, 132, 129, 0.42);
  box-shadow: 0 0 0 0.2rem rgba(52, 132, 129, 0.1);
  background: #ffffff;
}

.form-control::placeholder {
  color: #839690;
  font-size: 0.96rem;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: rgba(52, 132, 129, 0.08);
  color: #4d6f69;
}

.form-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: -2px;
}

.trust-copy {
  color: #708684;
  font-size: 0.84rem;
}

.meta-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(52, 132, 129, 0.4);
}

.forgot-abs {
  color: #2d7a77;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
}

.submit-btnn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 56px;
  border: 0;
  border-radius: 18px;
  background: linear-gradient(135deg, #0f5c61 0%, #2e8b86 48%, #50a89a 100%);
  box-shadow: 0 22px 40px rgba(29, 95, 96, 0.24);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.submit-btnn:hover,
.submit-btnn:focus {
  transform: translateY(-1px);
  box-shadow: 0 24px 46px rgba(29, 95, 96, 0.28);
}

.submit-btnn:disabled {
  opacity: 0.72;
  transform: none;
}

.register-copy {
  margin: 0;
  color: #607a76;
  font-size: 0.92rem;
  text-align: center;
}

.register-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: #1d7a76;
  font-weight: 700;
  text-decoration: none;
}

.register-link:hover,
.register-link:focus {
  text-decoration: underline;
}

@media (max-width: 991px) {
  .login-card {
    grid-template-columns: 1fr;
  }

  .login-showcase {
    padding-bottom: 1.5rem;
  }

  .login-showcase h3 {
    max-width: 14ch;
    font-size: 2rem;
  }
}

@media (max-width: 767px) {
  .login-shell {
    padding: 8px;
  }

  .login-panel,
  .login-showcase {
    padding: 1.4rem;
  }

  .social-grid {
    grid-template-columns: 1fr;
  }

  .form-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .label-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .login-hero h4 {
    font-size: 1.7rem;
  }
}
</style>
