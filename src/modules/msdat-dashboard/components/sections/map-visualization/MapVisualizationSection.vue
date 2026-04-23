<template>
  <div class="row">
    <div class="col-md-12">
      <ZonalMap :controlPanelProps="controlPanelProps" :colors="regionalColor" :fullWidth="true" />
    </div>
  </div>
</template>

<script>
import ZonalMap from '../zonal-analysis/map.vue';

export default {
  name: 'MapVisualizationSection',
  data() {
    return {
      regionalColor: [
        {
          id: 1,
          color: 'black',
        },
        {
          id: 2,
          color: '#89d880',
        },
        {
          id: 3,
          color: '#8ab9bb',
        },
        {
          id: 4,
          color: '#5c3819',
        },
        {
          id: 5,
          color: '#f872a0',
        },
        {
          id: 6,
          color: '#e1e164',
        },
        { id: 7, color: '#7d8ade' },
      ],
    };
  },
  props: {
    controlPanelProps: {
      type: Object,
      required: true,
    },
  },
  components: {
    ZonalMap,
  },
};
</script>
