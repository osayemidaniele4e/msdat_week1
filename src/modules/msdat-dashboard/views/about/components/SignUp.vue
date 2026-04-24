<template>
  <section class="signup-shell">
    <div class="signup-card">
      <div class="signup-showcase">
        <div class="showcase-chip">Authentication Portal</div>
        <h3>Multi - Souces Data Analytics and Triangulation Platform</h3>
        <p>Create your account to unlock more features and health intelligence tools.</p>

        <div class="showcase-metrics">
          <div class="metric-card">
            <strong>Unified access</strong>
            <span>Move from sign-up to insight discovery in one secure workspace.</span>
          </div>
          <div class="metric-card">
            <strong>Built for teams</strong>
            <span>Support administrators, analysts, and programme decision makers.</span>
          </div>
        </div>

        <div class="showcase-footer">
          <div class="signal-dot"></div>
          <span>Trusted sign-up for role-based access and collaboration</span>
        </div>
      </div>

      <div class="signup-panel">
        <div class="signup-hero">
          <span class="eyebrow">Create account</span>
          <h4>Join the platform</h4>
          <p>Set up your profile to start exploring dashboards and triangulated evidence.</p>
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
          <span>or sign up with your details</span>
        </div>

        <div v-if="errorMessage" class="form-alert" role="alert">
          {{ errorMessage }}
        </div>

        <form class="signup-form" @submit.prevent="signUp">
          <div class="form-grid form-grid-two">
            <div class="form-field">
              <label for="signup-first-name">First name</label>
              <input
                id="signup-first-name"
                v-model.trim="first_name"
                type="text"
                class="form-control"
                placeholder="Enter first name"
                :disabled="isLoading"
              />
            </div>

            <div class="form-field">
              <label for="signup-last-name">Last name</label>
              <input
                id="signup-last-name"
                v-model.trim="last_name"
                type="text"
                class="form-control"
                placeholder="Enter last name"
                :disabled="isLoading"
              />
            </div>
          </div>

          <div class="form-grid form-grid-two">
            <div class="form-field">
              <label for="signup-username">Username</label>
              <input
                id="signup-username"
                v-model.trim="username"
                type="text"
                class="form-control"
                placeholder="Choose a username"
                autocomplete="username"
                :disabled="isLoading"
              />
            </div>

            <div class="form-field">
              <label for="signup-email">Email address</label>
              <input
                id="signup-email"
                v-model.trim="email"
                type="email"
                class="form-control"
                placeholder="Enter your email"
                autocomplete="email"
                :disabled="isLoading"
              />
            </div>
          </div>

          <div class="form-grid form-grid-two">
            <div class="form-field">
              <label for="signup-organization">Organisation</label>
              <input
                id="signup-organization"
                v-model.trim="organisation"
                type="text"
                class="form-control"
                placeholder="Enter organisation"
                :disabled="isLoading"
              />
            </div>

            <div class="form-field">
              <label for="signup-role">Role</label>
              <input
                id="signup-role"
                v-model.trim="role"
                type="text"
                class="form-control"
                placeholder="Enter your role"
                :disabled="isLoading"
              />
            </div>
          </div>

          <div class="form-grid form-grid-two">
            <div class="form-field">
              <label for="signup-password">Password</label>
              <div class="password-wrap">
                <input
                  id="signup-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  placeholder="Create a password"
                  autocomplete="new-password"
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

            <div class="form-field">
              <label for="signup-confirm-password">Confirm password</label>
              <div class="password-wrap">
                <input
                  id="signup-confirm-password"
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="form-control"
                  placeholder="Confirm password"
                  autocomplete="new-password"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  class="password-toggle"
                  :disabled="isLoading"
                  :aria-label="
                    showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                  "
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <b-icon :icon="showConfirmPassword ? 'eye-slash' : 'eye'"></b-icon>
                </button>
              </div>
            </div>
          </div>

          <label class="terms-row">
            <input v-model="terms" type="checkbox" :disabled="isLoading" />
            <span>I accept the terms and conditions for account access.</span>
          </label>

          <button type="submit" class="submit-btnn" :disabled="isLoading">
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm mr-2"
              role="status"
              aria-hidden="true"
            ></span>
            {{ isLoading ? 'Creating account...' : 'Create an account' }}
          </button>

          <p class="login-copy">
            Already have an account?
            <button type="button" class="login-link" @click="$emit('open-login')">Log in</button>
          </p>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      first_name: '',
      last_name: '',
      username: '',
      organisation: '',
      role: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
      isLoading: false,
      activeProvider: '',
      errorMessage: '',
      showPassword: false,
      showConfirmPassword: false,
      linkedlnUrl: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
        process.env.VUE_APP_API_LINKEDIN_ID
      }&redirect_uri=${encodeURIComponent(window.location.origin)}&scope=openid%20profile%20email`,
    };
  },
  methods: {
    ...mapActions('AUTH_STORE', ['CREATE_USER', 'AUTHENTICATE', 'AUTHENTICATE_LINKEDIN']),

    normalizeApiErrors(err) {
      if (!err || typeof err !== 'object') {
        return 'Something went wrong. Please try again.';
      }

      const fields = ['username', 'email', 'password', 'first_name', 'last_name'];
      const message = fields
        .filter((field) => Array.isArray(err[field]) && err[field].length)
        .map((field) => `${field.replace('_', ' ')}: ${err[field][0]}`)
        .join(' | ');

      return message || 'Something went wrong. Please review your details.';
    },

    async signUp() {
      if (
        !this.first_name
        || !this.last_name
        || !this.username
        || !this.email
        || !this.organisation
        || !this.role
        || !this.password
        || !this.confirmPassword
      ) {
        this.errorMessage = 'Complete all fields to create your account.';
        return;
      }

      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match.';
        return;
      }

      if (!this.terms) {
        this.errorMessage = 'Accept the terms and conditions to continue.';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      try {
        await this.CREATE_USER({
          username: this.username,
          email: this.email,
          first_name: this.first_name,
          last_name: this.last_name,
          organization: this.organisation,
          password: this.password,
          profession: this.role,
        });

        this.$swal('Congratulations, Successfully Registered, Please Login');
        this.$emit('open-login');
      } catch (err) {
        const responseErrors = err?.response?.data || err;
        this.errorMessage = this.normalizeApiErrors(responseErrors);
        this.$swal(this.errorMessage);
      } finally {
        this.isLoading = false;
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
          .catch(() => {
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
          .catch(() => {
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
};
</script>

<style scoped>
.signup-shell {
  position: relative;
  padding: 14px;
}

.signup-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(220px, 0.72fr) minmax(0, 1.28fr);
  overflow: hidden;
  border: 1px solid rgba(190, 208, 215, 0.75);
  border-radius: 30px;
  background: radial-gradient(circle at top left, rgba(216, 237, 232, 0.98), transparent 40%),
    linear-gradient(135deg, rgba(13, 49, 56, 0.08), rgba(255, 255, 255, 0.96) 46%), #ffffff;
  box-shadow: 0 28px 70px rgba(11, 45, 51, 0.14);
}

.signup-card::before {
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

.signup-card::after {
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

.signup-showcase {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
  padding: 2rem 1.7rem;
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

.signup-showcase h3 {
  margin: 1.1rem 0 0.9rem;
  max-width: 11ch;
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1.04;
}

.signup-showcase p {
  margin: 0;
  max-width: 36ch;
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

.signup-panel {
  position: relative;
  z-index: 1;
  padding: 2.2rem 2.3rem;
}

.signup-hero {
  margin-bottom: 1.5rem;
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

.signup-hero h4 {
  margin-bottom: 0.65rem;
  color: #143b38;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.08;
}

.signup-hero p {
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
  margin: 1.45rem 0 1.3rem;
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

.signup-form {
  display: grid;
  gap: 16px;
}

.form-grid {
  display: grid;
  gap: 16px;
}

.form-grid-two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-field {
  display: grid;
  gap: 8px;
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

.terms-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  color: #607a76;
  font-size: 0.9rem;
  line-height: 1.6;
}

.terms-row input {
  margin-top: 0.25rem;
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

.login-copy {
  margin: 0;
  color: #607a76;
  font-size: 0.92rem;
  text-align: center;
}

.login-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: #1d7a76;
  font-weight: 700;
  text-decoration: none;
}

.login-link:hover,
.login-link:focus {
  text-decoration: underline;
}

@media (max-width: 991px) {
  .signup-card {
    grid-template-columns: 1fr;
  }

  .signup-showcase {
    padding-bottom: 1.5rem;
  }

  .signup-showcase h3 {
    max-width: 16ch;
    font-size: 2rem;
  }
}

@media (max-width: 767px) {
  .signup-shell {
    padding: 8px;
  }

  .signup-panel,
  .signup-showcase {
    padding: 1.4rem;
  }

  .social-grid,
  .form-grid-two {
    grid-template-columns: 1fr;
  }

  .signup-hero h4 {
    font-size: 1.7rem;
  }
}
</style>
