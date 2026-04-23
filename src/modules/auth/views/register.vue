<template>
  <section class="register-page">
    <div class="register-shell">
      <div class="register-backdrop"></div>

      <div class="register-grid">
        <aside class="register-showcase">
          <p class="showcase-kicker">MSDAT Nigeria</p>
          <h1>Create your analytics workspace</h1>
          <p class="showcase-copy">
            Join a modern public health intelligence platform built for teams who need trusted
            data, sharper visibility, and a cleaner workflow from day one.
          </p>

          <div class="showcase-panel">
            <div class="showcase-metric">
              <span class="metric-value">Faster</span>
              <span class="metric-label">Onboarding for analysts, policy teams, and partners</span>
            </div>

            <ul class="showcase-highlights">
              <li>Curated access to multi-source health insights</li>
              <li>Designed for national, state, and partner collaboration</li>
              <li>Secure account setup with a guided first experience</li>
            </ul>
          </div>
        </aside>

        <ValidationObserver ref="observer" v-slot="{ handleSubmit }" tag="div" class="register-card">
          <div class="card-head">
            <p class="card-kicker">Create account</p>
            <h2>Register your account</h2>
            <p class="card-copy">
              Set up your profile to access MSDAT dashboards and coordinated health data tools.
            </p>
          </div>

          <b-form class="register-form" @submit.stop.prevent="handleSubmit(register)">
            <b-row>
              <b-col cols="12" lg="6" class="field-col">
                <ValidationProvider
                  v-slot="validationContext"
                  name="Name"
                  :rules="{ required: true, min: 3 }"
                >
                  <b-form-group id="name-group" label="Full name" label-for="name">
                    <b-form-input
                      id="name"
                      v-model="form.name"
                      placeholder="Enter your full name"
                      :state="getValidationState(validationContext)"
                    />
                    <b-form-invalid-feedback>
                      {{ validationContext.errors[0] }}
                    </b-form-invalid-feedback>
                  </b-form-group>
                </ValidationProvider>
              </b-col>

              <b-col cols="12" lg="6" class="field-col">
                <ValidationProvider
                  v-slot="validationContext"
                  name="User name"
                  :rules="{ required: true, min: 3 }"
                >
                  <b-form-group id="user-name-group" label="Username" label-for="username">
                    <b-form-input
                      id="username"
                      v-model="form.username"
                      placeholder="Choose a username"
                      :state="getValidationState(validationContext)"
                    />
                    <b-form-invalid-feedback>
                      {{ validationContext.errors[0] }}
                    </b-form-invalid-feedback>
                  </b-form-group>
                </ValidationProvider>
              </b-col>
            </b-row>

            <b-row>
              <b-col cols="12" lg="6" class="field-col">
                <ValidationProvider
                  v-slot="validationContext"
                  name="profession"
                  :rules="{ required: true, min: 3 }"
                >
                  <b-form-group id="profession-group" label="Profession" label-for="profession">
                    <b-form-input
                      id="profession"
                      v-model="form.profession"
                      placeholder="Your role or profession"
                      :state="getValidationState(validationContext)"
                    />
                    <b-form-invalid-feedback>
                      {{ validationContext.errors[0] }}
                    </b-form-invalid-feedback>
                  </b-form-group>
                </ValidationProvider>
              </b-col>

              <b-col cols="12" lg="6" class="field-col">
                <ValidationProvider
                  v-slot="validationContext"
                  name="Organisation"
                  :rules="{ required: true }"
                >
                  <b-form-group
                    id="organisation-group"
                    label="Organisation"
                    label-for="organisation"
                  >
                    <b-form-input
                      id="organisation"
                      v-model="form.organisation"
                      type="text"
                      placeholder="Where you work"
                      :state="getValidationState(validationContext)"
                    />
                    <b-form-invalid-feedback>
                      {{ validationContext.errors[0] }}
                    </b-form-invalid-feedback>
                  </b-form-group>
                </ValidationProvider>
              </b-col>
            </b-row>

            <b-row>
              <b-col cols="12" lg="6" class="field-col">
                <ValidationProvider
                  v-slot="validationContext"
                  name="Email"
                  :rules="{ required: true, email: true }"
                >
                  <b-form-group id="email-group" label="Work email" label-for="email">
                    <b-form-input
                      id="email"
                      v-model="form.email"
                      type="email"
                      placeholder="mail@example.com"
                      :state="getValidationState(validationContext)"
                    />
                    <b-form-invalid-feedback>
                      {{ validationContext.errors[0] }}
                    </b-form-invalid-feedback>
                  </b-form-group>
                </ValidationProvider>
              </b-col>

              <b-col cols="12" lg="6" class="field-col">
                <ValidationProvider
                  v-slot="validationContext"
                  name="Password"
                  :rules="{ required: true }"
                  vid="password"
                >
                  <b-form-group
                    id="password-group"
                    label="Password"
                    label-for="password"
                    class="password-group"
                  >
                    <b-form-input
                      id="password"
                      v-model="form.password"
                      :type="passwordVisible ? 'text' : 'password'"
                      placeholder="Create a secure password"
                      :state="getValidationState(validationContext)"
                    />
                    <button
                      type="button"
                      class="password-toggle"
                      @click="passwordVisible = !passwordVisible"
                      :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
                    >
                      <b-icon :icon="passwordVisible ? 'eye-slash' : 'eye'"></b-icon>
                    </button>
                    <b-form-invalid-feedback>
                      {{ validationContext.errors[0] }}
                    </b-form-invalid-feedback>
                  </b-form-group>
                </ValidationProvider>
              </b-col>
            </b-row>

            <div class="register-actions">
              <ValidationProvider
                v-slot="validationContext"
                name="terms and conditions"
                :rules="{ is: 'true' }"
                class="terms-wrap"
              >
                <b-form-group class="terms-group">
                  <b-form-checkbox
                    v-model="form.terms"
                    value="true"
                    unchecked-value="false"
                    :state="getValidationState(validationContext)"
                  >
                    I accept the Terms and Conditions
                  </b-form-checkbox>
                  <b-form-invalid-feedback>
                    {{ validationContext.errors[0] }}
                  </b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>

              <b-button class="create-button" type="submit">
                Create an account
              </b-button>
            </div>

            <div class="auth-switch">
              <span>Already have an account?</span>
              <b-button class="login-button" type="button" @click="$router.push('/custom/login')">
                Log in
              </b-button>
            </div>
          </b-form>
        </ValidationObserver>
      </div>
    </div>
  </section>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      form: {
        name: '',
        organisation: '',
        email: '',
        username: '',
        password: '',
        password2: '',
        profession: '',
        terms: false,
      },
      passwordVisible: false,
    };
  },
  methods: {
    ...mapActions('AUTH_STORE', ['CREATE_USER']),

    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    resetForm() {
      this.form = {
        name: '',
        organisation: '',
        email: '',
        username: '',
        password: '',
        password2: '',
        terms: false,
        profession: '',
      };

      this.$nextTick(() => {
        this.$refs.observer.reset();
      });
    },
    async register() {
      const data = {
        username: this.form.username,
        email: this.form.email,
        first_name: this.form.name,
        last_name: 'this.form.name',
        profession: this.form.profession,
        organization: this.form.organisation,
        password: this.form.password,
      };
      try {
        await this.CREATE_USER(data);
        this.$swal('Congratulations, Successfully Registered, Please Login');
        this.$router.push('/custom/login');
      } catch (err) {
        const { username, email, password } = err;
        const errorMsg = (username ? `Username: ${username[0]}` : '')
          || (email ? `, Email: ${email[0]}` : '')
          || (password ? `, Password: ${password[0]}` : '');
        this.$swal(errorMsg);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  padding: 40px 20px;
  background:
    radial-gradient(circle at top left, rgba(40, 129, 142, 0.2), transparent 28%),
    radial-gradient(circle at bottom right, rgba(191, 224, 218, 0.75), transparent 32%),
    linear-gradient(145deg, #eef6f3 0%, #f7f2e8 52%, #f2f7f8 100%);
}

.register-shell {
  position: relative;
  max-width: 1280px;
  margin: 0 auto;
}

.register-backdrop {
  position: absolute;
  inset: 32px 24px auto auto;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(13, 92, 110, 0.18) 0%, rgba(13, 92, 110, 0) 72%);
  pointer-events: none;
}

.register-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(320px, 1.1fr);
  overflow: hidden;
  border: 1px solid rgba(7, 52, 61, 0.08);
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 28px 70px rgba(13, 48, 56, 0.12);
  backdrop-filter: blur(16px);
}

.register-showcase {
  position: relative;
  padding: 56px 44px;
  color: #eff9f7;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0)),
    linear-gradient(160deg, #073740 0%, #0d5c6e 52%, #1c7a78 100%);
}

.register-showcase::after {
  position: absolute;
  right: -80px;
  bottom: -120px;
  width: 260px;
  height: 260px;
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

.register-showcase h1 {
  max-width: 10ch;
  margin-bottom: 20px;
  font-size: clamp(2.35rem, 4vw, 4rem);
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
  max-width: 44ch;
  color: rgba(239, 249, 247, 0.82);
}

.showcase-panel {
  margin-top: 40px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

.showcase-metric {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 24px;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.metric-label {
  max-width: 26ch;
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

.register-card {
  padding: 56px 44px;
}

.card-head {
  max-width: 44ch;
  margin-bottom: 28px;
}

.card-kicker {
  color: #0d5c6e;
}

.card-head h2 {
  margin-bottom: 12px;
  font-size: clamp(1.95rem, 3vw, 2.8rem);
  font-weight: 700;
  color: #112f35;
}

.card-copy {
  color: #5d7276;
}

.register-form {
  color: #17353c;
}

.field-col {
  margin-bottom: 10px;
}

.register-form ::v-deep .form-group {
  margin-bottom: 18px;
}

.register-form ::v-deep label {
  margin-bottom: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #18363d;
}

.register-form ::v-deep .form-control {
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

.register-form ::v-deep .form-control:focus {
  border-color: rgba(13, 92, 110, 0.55);
  background: #ffffff;
  box-shadow: 0 0 0 0.2rem rgba(13, 92, 110, 0.12);
}

.register-form ::v-deep .form-control.is-invalid,
.register-form ::v-deep .was-validated .form-control:invalid {
  border-color: rgba(190, 74, 74, 0.6);
}

.register-form ::v-deep .invalid-feedback {
  margin-top: 8px;
  font-size: 0.82rem;
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

.register-actions {
  margin-top: 10px;
}

.terms-wrap {
  display: block;
}

.terms-group {
  margin-bottom: 20px;
}

.register-form ::v-deep .custom-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.register-form ::v-deep .custom-control-label {
  padding-top: 1px;
  color: #53696e;
  line-height: 1.6;
}

.register-form ::v-deep .custom-control-label::before,
.register-form ::v-deep .custom-control-label::after {
  top: 0.17rem;
  width: 1.05rem;
  height: 1.05rem;
  border-radius: 0.35rem;
}

.create-button,
.login-button {
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

.create-button {
  width: 100%;
  border: 0;
  background: linear-gradient(135deg, #0d5c6e 0%, #1a7b79 100%);
  box-shadow: 0 16px 32px rgba(13, 92, 110, 0.24);
  color: #ffffff;
}

.create-button:hover,
.create-button:focus {
  transform: translateY(-1px);
  box-shadow: 0 20px 36px rgba(13, 92, 110, 0.28);
}

.auth-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 22px;
  color: #63777b;
  text-align: center;
}

.login-button {
  min-width: 128px;
  border: 1px solid rgba(13, 92, 110, 0.14);
  background: #f5f9f9;
  box-shadow: 0 10px 24px rgba(17, 47, 53, 0.08);
  color: #0d5c6e;
}

.login-button:hover,
.login-button:focus {
  transform: translateY(-1px);
  background: #ffffff;
  color: #094754;
}

@media (max-width: 991px) {
  .register-page {
    padding: 20px 14px;
  }

  .register-grid {
    grid-template-columns: 1fr;
  }

  .register-showcase,
  .register-card {
    padding: 32px 24px;
  }

  .register-showcase h1 {
    max-width: none;
  }
}

@media (max-width: 575px) {
  .auth-switch {
    flex-direction: column;
  }

  .showcase-panel {
    padding: 22px 20px;
  }
}
</style>
