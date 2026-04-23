<template>
    <div class="screenshot-manager-main">
      <button @click="setActiveComponent('plugin')">
        <b-icon icon="camera-fill" aria-hidden="true"></b-icon>
      </button>
    </div>
  </template>

<script>
export default {
  name: 'ScreenshotManagerMain',
  methods: {
    setActiveComponent(component) {
      this.$emit('setActiveComponent', component);
    },
  },
};
</script>

  <style scoped>
  .screenshot-manager-main {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
  }

  .screenshot-manager-main button {
    background-color: #333;
    color: #fff;
    border: none;
    padding: 10px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
  }
  </style>
