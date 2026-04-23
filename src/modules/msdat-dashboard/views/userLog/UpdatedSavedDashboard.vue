<template>
  <div class="container-fluid">
    <h4 class="text-center my-4">Your Private Dashboards</h4>

    <div
      v-if="privateDashboards.length === 0 && privateMapDashboards.length === 0"
      class="border border-primary rounded mx-3 mb-1 pb-1 text-center"
    >
      <small>You have no existing private dashboards. Click the button below to create one!</small>
    </div>

    <b-list-group v-if="privateDashboards.length">
      <b-list-group-item
        v-for="dashboard in privateDashboards"
        :key="dashboard.id"
        href="#"
        :class="`flex-column align-items-start py-2 border-bottom`"
        @click="loadDashboard(dashboard)"
      >
        <div class="d-flex w-100 justify-content-between">
          <div @click="copy(`${dashboard.link}${dashboard.id}`, $event)" class="mb-1">
            <strong class="text-primary mr-2">{{ dashboard.config.dashboardDetails.name }}</strong>
            <b-button-group size="xs">
              <b-button @click="edit($event, dashboard)" class="py-1" variant="info">
                <b-icon icon="pencil"></b-icon>
              </b-button>
              <b-button @click="remove($event, dashboard)" class="py-1" variant="danger">
                <b-icon icon="trash-fill"></b-icon>
              </b-button>
            </b-button-group>
          </div>
          <small>{{ moment(dashboard.lastEdited || dashboard.created).fromNow() }}</small>
        </div>
        <p class="m-0 p-0">{{ dashboard.config.dashboardDetails.description }}</p>
      </b-list-group-item>
    </b-list-group>

    <b-list-group v-if="privateMapDashboards.length">
      <h4 class="text-center m-2">Your Private Map Visualizations</h4>
      <b-list-group-item
        v-for="dashboard in privateMapDashboards"
        :key="dashboard.id"
        href="#"
        :class="`flex-column align-items-start py-2 border-bottom`"
        @click="loadDashboard(dashboard)"
      >
        <div class="d-flex w-100 justify-content-between">
          <div @click="copy(`${dashboard.link}${dashboard.id}`, $event)" class="mb-1">
            <strong class="text-primary mr-2">{{ dashboard.config.dashboardDetails.name }}</strong>
            <b-button-group size="xs">
              <b-button @click="edit($event, dashboard)" class="py-1" variant="info">
                <b-icon icon="pencil"></b-icon>
              </b-button>
              <b-button @click="remove($event, dashboard)" class="py-1" variant="danger">
                <b-icon icon="trash-fill"></b-icon>
              </b-button>
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
      <b-list-group-item
        v-for="dashboard in publicDashboards"
        :key="dashboard.id"
        href="#"
        :class="`flex-column align-items-start py-2 border-bottom`"
        @click="open(dashboard.link)"
      >
        <div class="d-flex w-100 justify-content-between">
          <div @click="copy(`${dashboard.link}${dashboard.id}`, $event)" class="mb-1">
            <strong class="text-primary mr-2">{{ dashboard.name_of_dashboard }}</strong>
            <b-button-group size="xs">
              <b-button class="py-1" variant="info">Copy Link</b-button>
            </b-button-group>
          </div>
          <small>{{
            dashboard.isConfirmed
              ? 'Approved'
              : dashboard.disapproved
              ? 'Disapproved'
              : 'Awaiting Approval'
          }}</small>
        </div>
        <p class="m-0 p-0">{{ dashboard.description }}</p>
      </b-list-group-item>
    </b-list-group>

    <b-list-group v-if="publicMapDashboards.length">
      <h4 class="text-center m-2">Public Map Visualizations</h4>
      <b-list-group-item
        v-for="dashboard in publicMapDashboards"
        :key="dashboard.id"
        href="#"
        :class="`flex-column align-items-start py-2 border-bottom`"
        @click="open(dashboard.link)"
      >
        <div class="d-flex w-100 justify-content-between">
          <div @click="copy(`${dashboard.link}${dashboard.id}`, $event)" class="mb-1">
            <strong class="text-primary mr-2">{{ dashboard.name_of_dashboard }}</strong>
            <b-button-group size="xs">
              <b-button class="py-1" variant="info">Copy Link</b-button>
            </b-button-group>
          </div>
          <small>{{
            dashboard.isConfirmed
              ? 'Approved'
              : dashboard.disapproved
              ? 'Disapproved'
              : 'Awaiting Approval'
          }}</small>
        </div>
        <p class="m-0 p-0">{{ dashboard.description }}</p>
      </b-list-group-item>
    </b-list-group>

    <div class="px-3 pt-2">
      <b-button @click="$router.push('/my-dashboard/details')" variant="primary" class="w-100"
        >Add New</b-button
      >
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import moment from 'moment';
// import ApiServices from '@/modules/data-layer/services/ApiServices';

export default {
  data() {
    return {
      customDashboardsList: JSON.parse(
        localStorage.getItem('customDashboardsList') || JSON.stringify({})
      ),
      publicDashboards: [],
      publicMapDashboards: [],
      privateDashboards: [],
      privateMapDashboards: [],
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
      e.preventDefault();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url);
        this.$swal.fire('URL copied to clipboard!');
      } else {
        const el = document.createElement('textarea');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        this.$swal.fire('URL copied to clipboard!');
      }
    },
    refreshDashboards() {
      // Load from local storage
      const localPrivateDashboards = [...this.list];
      this.privateDashboards = localPrivateDashboards.filter((dashboard) => !this.isMapDashboard(dashboard));
      this.privateMapDashboards = localPrivateDashboards.filter((dashboard) => this.isMapDashboard(dashboard));

      // Load from backend
      this.$store.dispatch('getDashboards').then(({ result }) => {
        console.log(result, '@@@@TY@@@@@ 2');
        const backendPrivate = result
          .filter((req) => req.email === this.getUser.email && req.is_private === true)
          .map((req) => ({
            ...req,
            config: { ...JSON.parse(req.config) },
          }));

        // Combine local and backend private dashboards, avoid duplicates by tracking IDs
        const allPrivate = [...this.list];
        backendPrivate.forEach((bp) => {
          if (!allPrivate.find((p) => p.id === bp.id)) {
            allPrivate.push(bp);
          }
        });
        this.privateDashboards = allPrivate.filter((dashboard) => !this.isMapDashboard(dashboard));
        this.privateMapDashboards = allPrivate.filter((dashboard) => this.isMapDashboard(dashboard));

        const allPublic = result
          .filter((req) => req.email === this.getUser.email && req.is_private === false)
          .map((req) => ({
            ...req,
            config: { ...JSON.parse(req.config) },
          }));
        this.publicDashboards = allPublic.filter((dashboard) => !this.isMapDashboard(dashboard));
        this.publicMapDashboards = allPublic.filter((dashboard) => this.isMapDashboard(dashboard));
        this.loading = false;
      }).catch((err) => {
        console.log(err);
        this.loading = false;
        this.$swal.fire('Could not retrieve your public dashboards from the server. Your local dashboards are still available.');
      });
    },
    load(dashboard) {
      const { dashboardDetails, composedData, surveyArray, sectionsArray } = dashboard.config;

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
        component: () => import('@/modules/dynamic-dashboard/index.vue'),
      });
    },
    isMapDashboard(dashboard) {
      const sections = dashboard?.config?.sectionsArray;
      if (!Array.isArray(sections)) return false;
      const sectionNames = sections.map((section) => (
        (section?.name || section?.fieldName || '').toLowerCase().trim()
      ));
      return sectionNames.length === 1 && sectionNames[0] === 'map visualization';
    },
    edit(e, dashboard) {
      e.stopPropagation();
      this.load(dashboard);
      this.$store.commit('startEdit');
      this.$router.push('/my-dashboard/details');
    },
    remove(e, dashboard) {
      e.stopPropagation();
      this.$swal
        .fire({
          title: 'Confirm delete Dashboard',
          showDenyButton: true,
          denyButtonText: 'Cancel',
        })
        .then((result) => {
          if (result.isConfirmed) {
            const newList = this.list.filter((dashb) => dashb.id !== dashboard.id);
            this.customDashboardsList = {
              ...this.customDashboardsList,
              [this.getUser.username]: newList,
            };
            localStorage.setItem('customDashboardsList', JSON.stringify(this.customDashboardsList));
          }
        });
    },
  },
  async mounted() {
<<<<<<< HEAD
    this.$store
      .dispatch('getDashboards')
      .then(({ result }) => {
        this.privateDashboards = result
          .filter((req) => req.email === this.getUser.email && req.is_private === true)
          .map((req) => ({
            ...req,
            config: { ...JSON.parse(req.config) },
          }));
        this.publicDashboards = result
          .filter((req) => req.email === this.getUser.email && req.is_private === false)
          .map((req) => ({
            ...req,
            config: { ...JSON.parse(req.config) },
          }));
        this.loading = false;
      })
      .catch((err) => {
        console.log(err);
        this.loading = false;
        this.$swal.fire('Could not retrieve your public dashboards');
      });
    // const { data } = await ApiServices.getCustomDashboard();
    // console.log(data, 'Custom Dashboards');
    // this.publicDashboards = data.data.results
    //   .filter((item) => item.email === this.getUser.email)
    //   .map((item) => ({
    //     ...item,
    //     config: { ...JSON.parse(item.config) },
    //   }));
=======
    this.refreshDashboards();

    // Watch for route changes to refresh when navigating to saved dashboards
    this.$watch('$route.hash', (newHash) => {
      if (newHash === '/savedDashboards') {
        this.refreshDashboards();
      }
    });
  },
  activated() {
    // Called when component becomes active (especially with keep-alive)
    this.refreshDashboards();
>>>>>>> 7adc198c5a5438b37ff5c5f8d9b136a2e30d0f8a
  },
};
</script>

<style scoped>
.dash-button {
  background-color: #007bff;
  color: white;
  border-radius: 10px;
  padding: 10px 20px;
  margin-top: 20px;
}
</style>
