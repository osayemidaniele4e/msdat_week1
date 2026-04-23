<template>
  <section class="login-page">
    <div class="login-shell">
      <div class="login-backdrop"></div>

      <div class="login-grid">
        <aside class="login-showcase">
          <p class="showcase-kicker">MSDAT Nigeria</p>
          <h1>Welcome back</h1>
          <p class="showcase-copy">
            Sign in to continue exploring trusted public health data, dashboards, and coordinated
            insights across teams and decision points.
          </p>

          <div class="showcase-panel">
            <div class="showcase-stat">
              <span class="stat-value">Connected</span>
              <span class="stat-label"
                >Access one streamlined space for dashboards and analysis</span
              >
            </div>

            <ul class="showcase-highlights">
              <li>Designed for health program teams and data partners</li>
              <li>Clearer visibility across federal, state, and local indicators</li>
              <li>Secure access with a calmer, more focused workflow</li>
            </ul>
          </div>
        </aside>

        <div class="login-card">
          <div class="card-head">
            <p class="card-kicker">Sign in</p>
            <h2>Log in to your account</h2>
            <p class="card-copy">
              Use your MSDAT credentials to access your workspace and continue where you left off.
            </p>
          </div>

          <div v-if="isLoading" class="loader">
            <the-loader />
          </div>

          <b-form class="login-form" @submit.prevent="submitForm">
            <div v-if="!formIsValid" class="form-alert" role="alert">
              {{ msg }}
            </div>

            <b-form-group label="Username" label-for="username">
              <b-form-input
                id="username"
                v-model="userName"
                placeholder="Enter your username"
                autocomplete="username"
              />
            </b-form-group>

            <b-form-group label="Password" label-for="password" class="password-group">
              <b-form-input
                id="password"
                v-model="password"
                :type="passwordVisible ? 'text' : 'password'"
                placeholder="Enter your password"
                autocomplete="current-password"
              />

              <button
                type="button"
                class="password-toggle"
                :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
                @click="passwordVisible = !passwordVisible"
              >
                <b-icon :icon="passwordVisible ? 'eye-slash' : 'eye'"></b-icon>
              </button>
            </b-form-group>

            <div class="form-meta">
              <span class="trust-note">Secure access for approved MSDAT users</span>
              <a href="" class="forgot-link" @click.prevent>Forgot password?</a>
            </div>

            <b-button type="submit" class="login-button" :disabled="isLoading"> Log in </b-button>
          </b-form>

          <div class="auth-switch">
            <span>Don&apos;t have an account?</span>
            <b-button
              type="button"
              class="register-button"
              @click="$router.push('/custom/register')"
            >
              Create an account
            </b-button>
          </div>

          <p class="footer-note">
            Built for Nigeria&apos;s health data ecosystem by eHealth4everyone.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import VueCookies from 'vue-cookies';
import { mapActions } from 'vuex';
import TheLoader from '../../custom-dashboard/components/Loading/TheLoader.vue';

export default {
  components: { TheLoader },
  data() {
    return {
      userName: '',
      password: '',
      passwordVisible: false,
      formIsValid: true,
      isLoading: false,
      msg: 'Please enter Username and Password.',
      linkedlnUrl: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
        process.env.VUE_APP_API_LINKEDIN_ID
      }&redirect_uri=${encodeURIComponent(
        `${window.location.origin}/custom`
      )}&state=CUSTOM&scope=openid%20profile%20email`,
    };
  },
  mounted() {
    VueCookies.remove('msdat-user-details');
  },
  methods: {
    ...mapActions('AUTH_STORE', ['LOGIN_USER', 'AUTHENTICATE', 'AUTHENTICATE_LINKEDIN']),
    async submitForm() {
      this.isLoading = true;
      this.formIsValid = true;
      try {
        if (this.userName === '' || this.password.length === 0) {
          this.msg = 'Please enter Username and Password.';
          this.formIsValid = false;
          this.isLoading = false;
        } else {
          const formData = {
            username: this.userName,
            password: this.password,
          };
          await this.LOGIN_USER(formData)
            .then((res) => {
              if (res.status === 200) {
                this.$swal(`Hi ${formData.username} 👋, \n\nWelcome to your Dashboard`);
                this.$router.push({ path: '/my-dashboard/details' });
              } else {
                this.msg = 'Something went wrong, confirm username and password.';
                this.$swal('something went wrong, confirm username and password');
              }
            })
            .catch(() => {
              this.msg = 'Confirm username and password.';
              this.$swal('confirm username and password');
            });
          this.isLoading = false;
        }
      } catch (err) {
        this.isLoading = false;
        this.formIsValid = false;
        this.msg = 'User not found, confirm username and password.';
        this.$swal('user not found, confirm username and password');
      }
    },

    async handleClickSignIn() {
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
            this.$router.push({ path: '/my-dashboard/details' });
          })
          .catch(() => {
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
      }
      return 0;
    },
  },
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: radial-gradient(circle at top left, rgba(40, 129, 142, 0.18), transparent 28%),
    radial-gradient(circle at bottom right, rgba(191, 224, 218, 0.7), transparent 32%),
    linear-gradient(145deg, #eef6f3 0%, #f7f2e8 52%, #f2f7f8 100%);
}

.login-shell {
  position: relative;
  max-width: 1180px;
  margin: 0 auto;
}

.login-backdrop {
  position: absolute;
  inset: 36px auto auto 18px;
  width: 230px;
  height: 230px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(13, 92, 110, 0.16) 0%, rgba(13, 92, 110, 0) 72%);
  pointer-events: none;
}

.login-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(300px, 0.95fr) minmax(320px, 0.9fr);
  overflow: hidden;
  border: 1px solid rgba(7, 52, 61, 0.08);
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 28px 70px rgba(13, 48, 56, 0.12);
  backdrop-filter: blur(16px);
}

.login-showcase {
  position: relative;
  padding: 56px 44px;
  color: #eff9f7;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0)),
    linear-gradient(160deg, #073740 0%, #0d5c6e 52%, #1c7a78 100%);
}

.login-showcase::after {
  position: absolute;
  left: -70px;
  bottom: -110px;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  content: '';
}

.showcase-kicker,
.card-kicker {
  margin-bottom: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.showcase-kicker {
  color: rgba(236, 246, 244, 0.76);
}

.login-showcase h1 {
  max-width: 11ch;
  margin-bottom: 20px;
  font-size: clamp(2.25rem, 4vw, 3.8rem);
  font-weight: 700;
  line-height: 0.96;
}

.showcase-copy,
.card-copy {
  margin-bottom: 0;
  font-size: 1rem;
  line-height: 1.75;
}

.showcase-copy {
  max-width: 46ch;
  color: rgba(239, 249, 247, 0.82);
}

.showcase-panel {
  margin-top: 42px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

.showcase-stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 24px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  max-width: 28ch;
  color: rgba(239, 249, 247, 0.78);
  line-height: 1.6;
}

.showcase-highlights {
  display: grid;
  gap: 14px;
  padding-left: 0;
  margin: 0;
  list-style: none;
}

.showcase-highlights li {
  position: relative;
  padding-left: 28px;
  color: rgba(239, 249, 247, 0.92);
  line-height: 1.5;
}

.showcase-highlights li::before {
  position: absolute;
  left: 0;
  top: 0.38rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #d2f4e6;
  box-shadow: 0 0 0 6px rgba(210, 244, 230, 0.15);
  content: '';
}

.login-card {
  position: relative;
  padding: 56px 44px;
}

.card-head {
  max-width: 42ch;
  margin-bottom: 30px;
}

.card-kicker {
  color: #0d5c6e;
}

.card-head h2 {
  margin-bottom: 12px;
  font-size: clamp(1.9rem, 3vw, 2.7rem);
  font-weight: 700;
  color: #112f35;
}

.card-copy {
  color: #5d7276;
}

.loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.64);
  backdrop-filter: blur(6px);
  z-index: 2;
}

.login-form ::v-deep .form-group {
  margin-bottom: 18px;
}

.login-form ::v-deep label {
  margin-bottom: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #18363d;
}

.login-form ::v-deep .form-control {
  height: 56px;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(17, 47, 53, 0.12);
  border-radius: 16px;
  background: rgba(246, 250, 249, 0.96);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  font-size: 0.98rem;
  color: #16343a;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.login-form ::v-deep .form-control:focus {
  border-color: rgba(13, 92, 110, 0.55);
  background: #ffffff;
  box-shadow: 0 0 0 0.2rem rgba(13, 92, 110, 0.12);
}

.form-alert {
  margin-bottom: 20px;
  padding: 14px 16px;
  border: 1px solid rgba(190, 74, 74, 0.18);
  border-radius: 14px;
  background: rgba(190, 74, 74, 0.08);
  color: #8b2f2f;
  font-size: 0.92rem;
  line-height: 1.5;
}

.password-group {
  position: relative;
}

.password-toggle {
  position: absolute;
  top: 41px;
  right: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #507176;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.password-toggle:hover {
  background: rgba(13, 92, 110, 0.08);
  color: #0d5c6e;
}

.form-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 6px 0 24px;
}

.trust-note {
  color: #63777b;
  font-size: 0.92rem;
}

.forgot-link {
  color: #0d5c6e;
  font-weight: 600;
  text-decoration: none;
}

.forgot-link:hover {
  color: #094754;
  text-decoration: underline;
}

.login-button,
.register-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 54px;
  padding: 0.95rem 1.5rem;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.login-button {
  width: 100%;
  border: 0;
  background: linear-gradient(135deg, #0d5c6e 0%, #1a7b79 100%);
  box-shadow: 0 16px 32px rgba(13, 92, 110, 0.24);
  color: #ffffff;
}

.login-button:hover,
.login-button:focus {
  transform: translateY(-1px);
  box-shadow: 0 20px 36px rgba(13, 92, 110, 0.28);
}

.login-button:disabled {
  opacity: 0.75;
  transform: none;
}

.auth-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 24px;
  color: #63777b;
  text-align: center;
}

.register-button {
  min-width: 190px;
  border: 1px solid rgba(13, 92, 110, 0.14);
  background: #f5f9f9;
  box-shadow: 0 10px 24px rgba(17, 47, 53, 0.08);
  color: #0d5c6e;
}

.register-button:hover,
.register-button:focus {
  transform: translateY(-1px);
  background: #ffffff;
  color: #094754;
}

.footer-note {
  margin: 28px 0 0;
  color: #7a8a8e;
  font-size: 0.9rem;
  text-align: center;
}

@media (max-width: 991px) {
  .login-page {
    padding: 20px 14px;
  }

  .login-grid {
    grid-template-columns: 1fr;
  }

  .login-showcase,
  .login-card {
    padding: 32px 24px;
  }

  .login-showcase h1 {
    max-width: none;
  }
}

@media (max-width: 575px) {
  .form-meta,
  .auth-switch {
    flex-direction: column;
    align-items: flex-start;
  }

  .auth-switch {
    align-items: center;
  }

  .showcase-panel {
    padding: 22px 20px;
  }

  .register-button {
    width: 100%;
  }
}
</style>
