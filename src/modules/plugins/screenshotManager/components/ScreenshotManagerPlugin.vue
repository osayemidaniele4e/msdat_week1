<template>
    <div class="screenshot-manager-plugin">
      <div class="screenshot-gallery">
        <div v-for="(screenshot, index) in screenshots" :key="index" class="screenshot-item">
          <img :src="screenshot" alt="Screenshot" @click="downloadScreenshot(screenshot)">
          <button class="delete-btn" @click="deleteScreenshot(index)">
            <b-icon icon="x" aria-hidden="true"></b-icon>
          </button>
        </div>
      </div>
      <button @click="captureScreenshot">
        <b-icon icon="camera-fill" aria-hidden="true"></b-icon> Take Screenshot
      </button>
      <button @click="setActiveComponent('main')">Close</button>
    </div>
  </template>

<script>
import html2canvas from 'html2canvas';

export default {
  name: 'ScreenshotManagerPlugin',
  data() {
    return {
      screenshots: [],
    };
  },
  methods: {
    setActiveComponent(component) {
      this.$emit('setActiveComponent', component);
    },
    captureScreenshot() {
      html2canvas(document.body).then((canvas) => {
        const data = canvas.toDataURL('image/png');
        this.screenshots.push(data);
      });
    },
    downloadScreenshot(screenshot) {
      const link = document.createElement('a');
      link.href = screenshot;
      link.download = 'screenshot.png';
      link.click();
    },
    deleteScreenshot(index) {
      this.screenshots.splice(index, 1);
    },
  },
};
</script>

  <style scoped>
  .screenshot-manager-plugin {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #fff;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    z-index: 9999;
  }

  .screenshot-gallery {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 10px;
  }

  .screenshot-item {
    position: relative;
    margin: 5px;
  }

  .screenshot-item img {
    max-width: 100px;
    max-height: 100px;
    cursor: pointer;
  }

  .delete-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #ff0000;
    color: #fff;
    border: none;
    border-radius: 50%;
    padding: 4px;
    font-size: 12px;
    cursor: pointer;
  }

  button {
    background-color: #333;
    color: #fff;
    border: none;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 5px;
  }
  </style>
