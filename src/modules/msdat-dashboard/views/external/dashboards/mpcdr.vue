<template>
  <div>
    <the-header ref="theHeader" />
    <div class="d-flex justify-content-center">
      <div class="tab-content">
        <div class="d-flex justify-content-center dashboard-frame-wrap" v-if="currentTab === 'Dashboard'">
          <b-embed
            type="iframe"
            aspect="16by9"
            :src="url"
            :width="width"
            :height="height"
          ></b-embed>
        </div>
      </div>
    </div>
    <the-footer />
  </div>
</template>

<script>
import theHeader from '../../about/layout/theHeader.vue';
import theFooter from '../../about/layout/theFooter.vue';

export default {
  name: 'MPCDRDashboard',
  components: {
    theHeader,
    theFooter,
  },
  data() {
    return {
      currentTab: 'Dashboard',
      url: 'https://public.tableau.com/views/MPCDR_Dashboard/Dashboard1?:language=en-US&:embed=y&:display_count=n&publish=yes&:showVizHome=no&:embed=true',
      width: '100%',
      height: '700',
      showComing: true,
      currentTitle: 'MPCDR Dashboard',
    };
  },
  methods: {
    setTab(tab) {
      this.currentTab = tab;
      this.currentTitle = tab;
    },
  },
};
</script>

<style scoped>
.dashboard-frame-wrap {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}
.main {
  display: flex;
  width: 100%;
  height: 100%;
  padding: 0px 20px;
  margin-bottom: 40px;
}
.base {
  height: auto;
  width: 95vw;
}
.heading {
  margin: 10px;
}
.tab-container {
  display: flex;
  justify-content: flex-start;
  margin: 7px 0px;
  width: 100%;
  padding-top: 5px;
  border-bottom: 0.5px solid #007d53;
}
.tab {
  padding: 10px;
  text-align: center;
  cursor: pointer;
  border: 1px solid #007d53;
  background-color: #ffffff;
  width: 200px;
}
.tab.active {
  background-color: #007d53;
  color: #fff;
}
.tab + .tab {
  margin-left: 10px;
}
.tab-content {
  width: 100%;
  padding: 7px;
}
</style>
