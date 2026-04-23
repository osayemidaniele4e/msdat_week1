<template>
  <div class="text-center">
    <b-button size="lg" v-b-modal.dashboard-list class="bg-white text-primary border border-primary">
      <h4>View your dashboards</h4>
    </b-button>

    <b-modal id="dashboard-list" centered scrollable>
      <template slot="modal-header">
        <h4 class="text-center w-100">Your Dashboards</h4>
      </template>
      <div v-if="!list.length" class="border border-primary rounded mx-3 mb-1 pb-1 text-center">
        <small>You have no existing dashboards. Click button below to create one!</small>
      </div>
      <b-list-group>
        <b-list-group-item v-for="dashboard in list"
          :key="dashboard.id" href="#"
          :class="`flex-column align-items-start py-2 border-bottom`"
          @click="loadDashboard(dashboard)"
        >
          <div class="d-flex w-100 justify-content-between">
            <div class="mb-1">
              <strong class="text-primary mr-2">{{ dashboard.config.dashboardDetails.name }}</strong>
              <b-button-group size="xs">
                <b-button @click="edit($event, dashboard)" class="py-1" variant="info"><b-icon icon="pencil"></b-icon></b-button>
                <b-button @click="remove($event, dashboard)" class="py-1" variant="danger"><b-icon icon="trash-fill"></b-icon></b-button>
              </b-button-group>
            </div>
            <small>{{ moment(dashboard.lastEdited || dashboard.created).fromNow() }}</small>
          </div>
          <p class="m-0 p-0">{{ dashboard.config.dashboardDetails.description }}</p>
        </b-list-group-item>
      </b-list-group>
      <strong class="m-2 w-100 text-center" v-if="loading">loading your public dashboards...</strong>
      <b-list-group v-if="publicDashboards.length">
        <h4 class="text-center m-2">Public Dashboards</h4>
        <b-list-group-item v-for="dashboard in publicDashboards"
          :key="dashboard.id" href="#"
          :class="`flex-column align-items-start py-2 border-bottom`"
          @click="open(dashboard.link)"
        >
          <div class="d-flex w-100 justify-content-between">
            <div class="mb-1">
              <strong class="text-primary mr-2">{{ dashboard.name_of_dashboard }}</strong>
              <b-button-group size="xs">
                <b-button @click="copy(dashboard.link, $event)" class="py-1" variant="info">Copy Link</b-button>
              </b-button-group>
            </div>
            <small>{{ dashboard.isConfirmed ? 'Approved' : dashboard.disapproved ? 'Disapproved' : 'Awaiting Approval' }}</small>
          </div>
          <p class="m-0 p-0">{{ dashboard.description }}</p>
        </b-list-group-item>
      </b-list-group>
      <div class="px-3 pt-2">
        <b-button @click="$router.push('/my-dashboard/details')" variant="primary" class="w-100">Add New</b-button>
      </div>
      <template #modal-footer="{ hide }">
        <b-button @click="hide()">Cancel</b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import moment from 'moment';

export default {
  data() {
    return {
      customDashboardsList: JSON.parse(localStorage.getItem('customDashboardsList') || JSON.stringify({})),
      publicDashboards: [],
      loading: true,
    };
  },
  computed: {
    ...mapGetters('AUTH_STORE', ['getUser']),
    list() {
      return this.customDashboardsList[this.getUser.username] || [];
    },
  },
  methods: {
    moment,
    open(url) {
      window.open(url);
    },
    copy(url, e) {
      e.stopPropagation();
      navigator.clipboard.writeText(url);
    },
    load(dashboard) {
      const {
        dashboardDetails, composedData, surveyArray, sectionsArray,
      } = dashboard.config;

      this.$store.dispatch('resetState');
      this.$store.dispatch('dashboardConfiguration', dashboardDetails);
      this.$store.dispatch('customDashboard', true);

      this.$store.commit('setPArea', composedData);
      this.$store.commit('setDArea', surveyArray);
      this.$store.commit('arrangedSections', sectionsArray);
      this.$store.commit('setEmbedUrl', dashboard.embedded_url);
      this.$store.commit('setEmbedIframe', dashboard.embedded_iframe);
    },
    loadDashboard(dashboard) {
      this.load(dashboard);

      const t = dashboard.config.dashboardDetails.name.replace(/\s+/g, '_').toLowerCase();
      this.$router.push({
        path: `/dashboard/${t}`,
        component: () => import('../../dynamic-dashboard/index.vue'),
      });
    },
    edit(e, dashboard) {
      e.stopPropagation();
      this.load(dashboard);
      this.$store.commit('startEdit');
      this.$router.push('/my-dashboard/details');
    },
    remove(e, dashboard) {
      e.stopPropagation();
      this.$swal.fire({
        title: 'Confirm delete Dashboard',
        showDenyButton: true,
        denyButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          const newList = this.list.filter((dashb) => dashb.id !== dashboard.id);
          this.customDashboardsList = { ...this.customDashboardsList, [this.getUser.username]: newList };
          localStorage.setItem('customDashboardsList', JSON.stringify(this.customDashboardsList));
        }
      });
    },
  },
  mounted() {
    this.$store.dispatch('getDashboards').then((response) => {
      const data = response.result;

      this.publicDashboards = Object.values(data)
        .filter((req) => req.email === this.getUser.email)
        .map((req) => ({
          ...req, config: { ...JSON.parse(req.config) },
        }));
      this.loading = false;
    }).catch((err) => {
      console.log(err);
      this.loading = false;
      this.$swal.fire('Could not retrieve your public dashboards');
    });
  },
};
</script>
