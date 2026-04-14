<template>
  <div>
    <div v-if="showComing" class="show-coming">
      <div class="coming-soon-text">This section is coming soon....</div>
      <img src="../../../../../../assets/svg/chart2.svg" alt="" class="svg1">
    </div>
    <div>
      <b-embed type="iframe" :src="url" :width="width" :height="height"></b-embed>
    </div>
  </div>
</template>
<script>
import { mapMutations } from 'vuex';
// import config from './config/dashboard_config';
export default {
  name: 'ScatterplotSection',
  data() {
    return {
      title: '',
      url: 'https://public.tableau.com/shared/73RC8WSPQ?:display_count=n&:origin=viz_share_link:showVizHome=no&:embed=true',
      width: '100%',
      height: 'auto',
      showComing: false,
    };
  },
  methods: {
    ...mapMutations('MSDAT_STORE', ['ADD_CONTROL_PANEL', 'CLEAR_CONTROL_PANEL']),
  },
};
</script>
<style scoped>
.heading {
  margin: 10px;
}
.main-text {
  font-size: 25px;
  text-align: center;
  color: black;
}
.sub-text {
  color: black;
  font-size: 15px;
  text-align: left;
  font-weight: 100;
}
.show-coming{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.svg1{
  width: 400px;
}
.coming-soon-text{
  font-size: 15px;
  font-weight: 500;
  margin: 30px;
}
</style>
