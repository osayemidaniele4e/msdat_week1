<template>
  <div>
    <div class="col p-3">
      <div class="col mb-3">
        <a class="sub-item" href="https://msdat.fmohconnect.gov.ng/"><b>Home</b></a>
        <router-link class="sub-item" to="/faq"><b>Help & FAQ</b></router-link>
        <a class="sub-item" href="https://msdat.old.fmohconnect.gov.ng/" target="_blank"
          ><b>Go back to MSDAT 1.5</b></a
        >
      </div>
      <div class="col mb-3">
        <b-list-group>
          <h5 class="text-underline main-item">Population</h5>
          <router-link to="/dashboard/Demographics" target="_blank" class="sub-item"
            >Demographics</router-link
          >
          <router-link to="/dashboard/GIS_Mapping_Dashboard" target="_blank" class="sub-item"
            >GIS Mapping</router-link
          >
        </b-list-group>
      </div>
      <div class="col mb-3">
        <b-list-group>
          <h5 class="text-underline main-item">Health Inputs</h5>
          <router-link to="/dashboard/Health_Facility" target="_blank" class="sub-item"
            >Health Facilities</router-link
          >
          <router-link to="/dashboard/Health_Financing" target="_blank" class="sub-item"
            >Health Financing</router-link
          >
          <router-link to="/dashboard/Health_Workforce" target="_blank" class="sub-item"
            >Health Workforce</router-link
          >
          <router-link to="/health-facilities-profile" target="_blank" class="sub-item"
            >Health Facilities Finder(GIS)- work in progress</router-link
          >
        </b-list-group>
      </div>
      <div class="col mb-3">
        <b-list-group>
          <h5 class="text-underline main-item">Health Outputs</h5>
          <router-link to="/dashboard/Health_Service_Access" target="_blank" class="sub-item"
            >Health Service Access</router-link
          >
          <a
            href="https://msdat.fmohconnect.gov.ng/covid19_health_service_uptake/index.html"
            target="_blank"
            class="sub-item"
          >
            Health Service Uptake (NHMIS-Monthly)
          </a>
          <router-link to="/health-service-uptake" target="_blank" class="sub-item">
            Health Service Uptake (NHMIS-Quarterly)
          </router-link>
          <a
            href="https://monthly-nhmis-analysis.fmohconnect.gov.ng/"
            target="_blank"
            class="sub-item"
          >
            Monthly NHMIS Insights
          </a>
        </b-list-group>
      </div>
      <div class="col mb-3">
        <b-list-group>
          <h5 class="text-underline main-item">Health Outcomes</h5>
          <router-link
            to="/dashboard/Health_Outcomes_and_Service_Coverage"
            target="_blank"
            class="sub-item"
            >Health Outcomes and Service Coverage</router-link
          >
          <router-link
            to="/dashboard/Quarterly_Performance_Assessment_Dashboard"
            target="_blank"
            class="sub-item"
            >Quarterly Performance Assessment</router-link
          >
          <router-link to="/dashboard/Disease_Surveillance" target="_blank" class="sub-item">
            Disease Surveillance
          </router-link>
        </b-list-group>
      </div>
      <div class="col mb-3">
        <b-list-group>
          <h5 class="text-underline main-item">Advanced Analytics</h5>
          <div
            v-for="(section, index) in advancedSections"
            :key="section.label"
            @click="openAdvancedAnalytics(index, section.label)"
            class="sub-item cursor-pointer"
          >
            {{ section.label }}
          </div>
          <router-link to="/advanced-triangulation-dashboard" target="_blank" class="sub-item">
            Advanced Triangulation
          </router-link>
        </b-list-group>
      </div>
      <div class="col mb-3">
        <b-list-group>
          <h5 class="text-underline main-item">Thematic Dashboard</h5>
          <router-link to="/external-ndr1" target="_blank" class="sub-item">
            HIV/AIDs National Repository Dashboard 1
          </router-link>
          <router-link to="/external-ndr2" target="_blank" class="sub-item">
            HIV/AIDs National Repository Dashboard 2
          </router-link>
          <router-link to="/external-ncdc" target="_blank" class="sub-item">
            Disease Surveillance (NCDC)
          </router-link>
          <router-link to="/cemonc-dashboard" target="_blank" class="sub-item">
            CEmONC Dashboard
          </router-link>
          <router-link to="/ndhs-tracker" target="_blank" class="sub-item">
            NDHS Tracker Dashboard
          </router-link>
        </b-list-group>
      </div>
      <div class="col mb-3">
        <b-list-group>
          <h5 class="text-underline main-item">Other Dashboards</h5>
          <router-link to="/custom" target="_blank" class="sub-item">
            Create Your Dashboard
          </router-link>
          <router-link to="/health-profiles" target="_blank" class="sub-item"
            >Health Profiles</router-link
          >
          <a href="https://ngf.fmohconnect.gov.ng/" target="_blank" class="sub-item"
            >Governors' Dashboard</a
          >
          <router-link to="/presidential-bond-scorecard" target="_blank" class="sub-item"
            >Scorecard Dashboard of Presidential Bond Indicators</router-link
          >
        </b-list-group>
      </div>
      <div class="col mb-3" v-if="isAuthenticated">
        <b-list-group>
          <h5 class="text-underline main-item">Custom Dashboards</h5>
          <router-link
            v-for="dashboard in userDashboards"
            :key="dashboard.id"
            :to="'/custom/public/' + dashboard.id"
            target="_blank"
            class="sub-item"
          >
            {{ dashboard.name_of_dashboard }}
          </router-link>
        </b-list-group>
      </div>
      <div class="col mb-3 d-md-none">
        <b-list-group>
          <h5 class="text-underline main-item">User Profile</h5>
          <div @click="handleLoginClick" class="text-dark sub-item cursor-pointer">
            Login/Register
          </div>
        </b-list-group>
      </div>
    </div>
  </div>
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
      const userEmail = obj.email;
      const filteredArr = arr.filter((item) => item.email === userEmail);
      return filteredArr;
    },

    openAdvancedAnalytics(index, label) {
      console.log(`Opening Advanced Analytics for: ${label} (index ${index})`);

      const relativeUrl = this.$router.resolve({
        path: '/dashboard/Advanced_Analytics',
        query: { index },
      }).href;

      const fullUrl = `${window.location.origin}${relativeUrl}`;

      localStorage.setItem('advanced_url', fullUrl);
      window.open(fullUrl, '_blank');
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
    handleLoginClick() {
      this.$emit('show-auth-modal');
    },
  },

  async mounted() {
    this.loading = true;

    // prevent excess request in dev mode
    const { data } = await this.SAVE_DASHBOARDS();

    this.userDashboards = data.results.filter((item) => item.is_private === false);
    this.loading = false;
  },

  watch: {
    isAuthenticated(newValue, oldValue) {
      if (newValue && !oldValue) {
        // User is newly authenticated
        this.refreshUserData();
      }
    },
    getDashboards(newValue) {
      this.userDashboards = this.filterArray(this.getUser, newValue);
    },
  },
};
</script>

<style lang="scss" scoped>
div {
  &.dropdown-expanded {
    position: absolute;
    width: 80vw;
    z-index: 5;
    left: -0.5vw;
    // right: 10px;
    // top: 3rem;
    color: black;
    max-height: 30rem;
    overflow-y: auto;
    a {
      color: inherit;
    }
  }
  div.list-group {
    h5.text-underline {
      font-size: 1rem !important;
    }
  }
  .list-group-item {
    font-family: 'Work Sans';
    padding: 0.25rem 1.25rem;
    border: 0;
    font-size: 0.95rem;
  }
  .sub-nav {
    margin-top: 1rem;
    font-weight: 700;
    font-size: 1.1rem;
    font-family: 'Work Sans';
  }
}
h5.text-underline {
  border-bottom: 1px solid lightgrey;
  padding: 0.2rem 0;
  margin: 0.7rem 1.3rem;
  font-size: 1.2rem;
  font-family: 'Work Sans';
  font-weight: 700;
}

// to check this
.main-item {
  display: flex;
  justify-content: left;
  padding: 0.2rem 0;
  margin: 0.7rem 1.3rem;
  letter-spacing: var(--unnamed-character-spacing-0);
  text-align: left;
  font: normal normal bold 20px/24px Work Sans;
  letter-spacing: 0px;
  color: #404040;
  opacity: 1;
}

.sub-item {
  display: flex;
  justify-content: left;
  margin-left: 1.3rem;
  letter-spacing: var(--unnamed-character-spacing-0);
  text-align: left;
  font: normal normal normal 16px/19px Work Sans;
  letter-spacing: 0px;
  color: #404040;
  opacity: 1;
}

.sub-item-bold {
  display: flex;
  justify-content: left;
  margin-left: 1.3rem;
  letter-spacing: var(--unnamed-character-spacing-0);
  font: normal normal 600 16px/19px Work Sans;
  letter-spacing: 0px;
  color: #404040;
  opacity: 1;
  font-size: 14px;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
<!--
<script>
export default {
  // props: {
  //   show: {
  //     type: Boolean,
  //     required: true,
  //     default: false
  //   }
  // },

  data() {
    return {};
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
div {
  &.dropdown-expanded {
    position: absolute;
    width: 80vw;
    z-index: 5;
    left: -0.5vw;
    top: 5.1vh;
    color: black;
    max-height: 30rem;
    overflow-y: auto;
    a {
      color: inherit;
    }
  }
  div.list-group{
    h5.text-underline{
      font-size: 1rem !important;
    }
  }
  .list-group-item {
    font-family: 'Work Sans';
    padding: 0.25rem 1.25rem;
    border: 0;
    font-size: 0.95rem;
  }
  .sub-nav {
    margin-top: 1rem;
    font-weight: 700;
    font-size: 1.1rem;
    font-family: 'Work Sans';
  }
}
h5.text-underline {
  border-bottom: 1px solid lightgrey;
  padding: 0.2rem 0;
  margin: 0.7rem 1.3rem;
  font-size: 1.2rem;
  font-family: 'Work Sans';
  font-weight: 700;
}
</style> -->
