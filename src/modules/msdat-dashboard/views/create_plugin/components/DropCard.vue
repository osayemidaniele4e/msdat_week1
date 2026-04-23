<template>
  <section class="d-none d-lg-inline-block">
    <div @click="showExpandedDropdown = false" class="backdrop"></div>
    <div class="container-fluid card dropdown-expanded work-sans">
      <div class="row p-3">
        <div class="col mb-3">
          <b-list-group>
            <h5 class="text-underline">Health Outcomes</h5>
            <router-link to="/dashboard/Health_Outcomes_and_Service_Coverage" target="_blank">
              <b-list-group-item>Health Outcomes and Service Coverage</b-list-group-item>
            </router-link>
            <router-link to="/dashboard/Quarterly_Performance_Assessment_Dashboard" target="_blank">
              <b-list-group-item>Quarterly Performance Assessment</b-list-group-item>
            </router-link>
          </b-list-group>
        </div>
        <div class="col mb-3">
          <b-list-group>
            <h5 class="text-underline">Health Input</h5>
            <router-link to="/dashboard/Health_Facility" target="_blank"
              ><b-list-group-item>Health Facility</b-list-group-item></router-link
            >
            <router-link to="/dashboard/Health_Financing" target="_blank"
              ><b-list-group-item>Health Financing</b-list-group-item></router-link
            >
            <router-link to="/dashboard/Health_Workforce" target="_blank"
              ><b-list-group-item>Health Workforce</b-list-group-item></router-link
            >
            <router-link to="/state-health-facility" target="_blank"
              ><b-list-group-item>Health Facilities Finder</b-list-group-item></router-link
            >
          </b-list-group>
        </div>
        <div class="col mb-3">
          <b-list-group>
            <h5 class="text-underline">Health Outputs</h5>
            <router-link to="/dashboard/Health_Service_Access" target="_blank">
              <b-list-group-item>Health Service Access</b-list-group-item>
            </router-link>
            <a href="https://msdat.fmohconnect.gov.ng/health_service_uptake/" target="_blank">
              <b-list-group-item> Health Service Uptake (NHMIS)</b-list-group-item>
            </a>
            <a href="https://monthly-nhmis-analysis.fmohconnect.gov.ng/" target="_blank">
              <b-list-group-item>Monthly NHMIS Insights</b-list-group-item></a
            >
            <router-link to="/dashboard/Disease_Surveillance" target="_blank"
              ><b-list-group-item>Disease Surveillance</b-list-group-item></router-link
            >
          </b-list-group>
        </div>
        <div class="col mb-3">
          <b-list-group>
            <h5 class="text-underline">Advanced Analytics</h5>
            <router-link
              v-for="(section, index) in advancedSections"
              :key="section.label"
              :to="`/dashboard/Advanced_Analytics?index=${index}`"
              target="_blank"
            >
              <b-list-group-item> {{ section.label }}</b-list-group-item></router-link
            >
          </b-list-group>
        </div>
        <div class="col mb-3">
          <b-list-group>
            <h5 class="text-underline">Population</h5>
            <router-link to="/dashboard/Demographics" target="_blank"
              ><b-list-group-item>Demographics</b-list-group-item></router-link
            >
            <router-link to="/dashboard/GIS_Mapping_Dashboard" target="_blank"
              ><b-list-group-item>GIS Mapping</b-list-group-item></router-link
            >
          </b-list-group>
        </div>
        <div class="col mb-3">
          <b-list-group>
            <h5 class="text-underline">Thematic Dashboard</h5>
            <router-link to="/external-ndr1" target="_blank"
              ><b-list-group-item
                >HIV/AIDs National Repository Dashboard 1</b-list-group-item
              ></router-link
            >

            <router-link to="/external-ndr2" target="_blank"
              ><b-list-group-item
                >HIV/AIDs National Repository Dashboard 2</b-list-group-item
              ></router-link
            >
            <router-link to="/external-ncdc" target="_blank"
              ><b-list-group-item>Disease Surveillance (NCDC)</b-list-group-item></router-link
            >
          </b-list-group>
        </div>
        <div class="col mb-3">
          <b-list-group>
            <h5 class="text-underline">Other Dashboards</h5>
            <router-link to="/custom" target="_blank"
              ><b-list-group-item> Create Your Dashboard</b-list-group-item></router-link
            >
            <router-link to="/health-profiles" target="_blank"
              ><b-list-group-item>Health Profiles</b-list-group-item></router-link
            >
            <a href="https://ngf.fmohconnect.gov.ng/" target="_blank"
              ><b-list-group-item>Governors' Dashboard</b-list-group-item></a
            >
            <router-link to="/ministers-dashboard" target="_blank"
              ><b-list-group-item>SWAP Ministerial Dashboard</b-list-group-item></router-link
            >
            <router-link to="/advanced-triangulation-dashboard" target="_blank"
              ><b-list-group-item>Triangulation Dashboard</b-list-group-item></router-link
            >
          </b-list-group>
        </div>
        <div class="col mb-3" v-if="isAuthenticated">
          <b-list-group>
            <h5 class="text-underline">Custom Dashboards</h5>
            <div v-for="dashboard in userDashboards" :key="dashboard.id">
              <router-link :to="'/custom/private/' + dashboard.id" target="_blank"
                ><b-list-group-item> {{ dashboard.title }}</b-list-group-item></router-link
              >
            </div>
          </b-list-group>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import {
  // eslint-disable-next-line no-unused-vars
  mapActions,
  mapGetters,
  mapMutations,
} from 'vuex';

import { advancedSections } from '../../analytics/sections';

export default {
  data() {
    return {
      loading: true,
      userDashboards: [],
      // publicDashboards: [],
      advancedSections,
    };
  },

  computed: {
    ...mapGetters('AUTH_STORE', ['isAuthenticated', 'getUser', 'getDashboards']),
    publicDashboards() {
      return this.$store.state.CUSTOM_DASHBOARD_STORE.allPublicDashboards;
    },
  },

  methods: {
    ...mapActions('AUTH_STORE', ['SAVE_DASHBOARDS']),
    ...mapMutations('AUTH_STORE', ['UPDATE_USER_DASHBOARDS']),

    filterArray(obj, arr) {
      const userId = obj.id;
      const filteredArr = arr.filter((item) => item.user === userId);
      return filteredArr;
    },

    refreshUserData() {
      this.loading = true;

      // Update user dashboards
      this.userDashboards = this.filterArray(this.getUser, this.getDashboards);

      // Perform any other necessary actions for newly authenticated users

      this.loading = false;
    },
    getUserDashboards() {
      this.$store.dispatch('getDashboards');
    },
  },

  async mounted() {
    this.loading = true;

    // prevent excess request in dev mode
    const { origin } = window.location;
    if (!origin.includes('//localhost') && !origin.includes('//192')) {
      const { data } = await this.SAVE_DASHBOARDS();
      this.userDashboards = data.results.filter((item) => item.is_private === false);
    }
    this.loading = false;
  },

  watch: {
    isAuthenticated(newValue, oldValue) {
      if (newValue && !oldValue) {
        // User is newly authenticated
        this.refreshUserData();
      }
      // this.getUserDashboards();
    },
    getDashboards(newValue) {
      this.userDashboards = this.filterArray(this.getUser, newValue);
    },
  },
};
</script>

<style lang="scss">
@import '@/scss/abstracts/_variables.scss';
div {
  &.dropdown-expanded {
    position: absolute;
    width: 94vw;
    z-index: 5;
    // left: -0.5vw;
    right: 1.5%;
    top: 5rem;
    color: black;
    // max-height: 70vh;
    overflow-y: auto;
    a {
      color: inherit;
    }
  }
  div.list-group {
    h5.text-underline {
      font-size: 0.9rem !important;
    }
  }
  .list-group-item {
    font-family: 'Work Sans';
    padding: 0.5rem;
    border: 0;
    font-size: 0.85rem;
  }
  .list-group a:hover {
    text-decoration: none !important;
    color: $primary;
    font-weight: 600;
  }
  .sub-nav {
    margin-top: 1rem;
    font-weight: 700;
    font-size: 1.1rem;
    font-family: 'Work Sans';
  }
}
h5.text-underline {
  border-bottom: 2px solid $primary;
  padding: 0 0 0.6rem 0.4rem;
  margin: 0.6rem 2% 0.2rem;
  font-size: 0.9rem !important;
  font-family: 'Work Sans';
  font-weight: 700;
}

.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: gray;
  opacity: 0.5;
  z-index: 5;
}
</style>
