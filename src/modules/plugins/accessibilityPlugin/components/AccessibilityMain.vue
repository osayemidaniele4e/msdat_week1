<template>
  <div class="accessibility-main">
    <button @click="setActiveComponent('plugin')" title="Open Accessibility Settings">
      <b-icon icon="universal-access-circle" aria-hidden="true"></b-icon>
    </button>
  </div>
</template>

<script>
export default {
  name: 'AccessibilityMain',
  methods: {
    setActiveComponent(component) {
      this.$emit('setActiveComponent', component);
    },
  },
};
</script>

<style scoped>
.accessibility-main {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 9999;
}

.accessibility-main button {
  background-color: #007acc;
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.accessibility-main button:hover {
  background-color: #005c99;
  transform: scale(1.1);
}

.accessibility-main button:focus {
  outline: 3px solid #ffcc00;
  outline-offset: 2px;
}
</style>
