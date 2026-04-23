<template>
  <div class="accessibility-plugin">
    <div class="accessibility-header">
      <h3>Accessibility Settings</h3>
      <button class="close-btn" @click="setActiveComponent('main')" title="Close Accessibility Panel">
        <b-icon icon="x" aria-hidden="true"></b-icon>
      </button>
    </div>

    <div class="accessibility-controls">
      <!-- High Contrast Toggle -->
      <div class="control-group">
        <label class="control-label">
          <input
            type="checkbox"
            v-model="highContrastEnabled"
            @change="toggleHighContrast"
            aria-describedby="high-contrast-desc"
          >
          <span>High Contrast Mode</span>
        </label>
        <p id="high-contrast-desc" class="control-description">
          Increases color contrast for better visibility
        </p>
      </div>

      <!-- Font Size Controls -->
      <div class="control-group">
        <label class="control-label">Font Size</label>
        <div class="font-size-controls">
          <button @click="decreaseFontSize" :disabled="fontSizeLevel <= 1" title="Decrease Font Size">
            <b-icon icon="dash" aria-hidden="true"></b-icon>
          </button>
          <span class="font-size-display">{{ fontSizeLevel }}</span>
          <button @click="increaseFontSize" :disabled="fontSizeLevel >= 5" title="Increase Font Size">
            <b-icon icon="plus" aria-hidden="true"></b-icon>
          </button>
        </div>
        <p class="control-description">
          Adjust text size for better readability (1-5)
        </p>
      </div>

      <!-- Focus Indicator Toggle -->
      <div class="control-group">
        <label class="control-label">
          <input
            type="checkbox"
            v-model="enhancedFocusEnabled"
            @change="toggleEnhancedFocus"
            aria-describedby="focus-desc"
          >
          <span>Enhanced Focus Indicators</span>
        </label>
        <p id="focus-desc" class="control-description">
          Makes keyboard focus more visible
        </p>
      </div>

      <!-- Reduced Motion Toggle -->
      <div class="control-group">
        <label class="control-label">
          <input
            type="checkbox"
            v-model="reducedMotionEnabled"
            @change="toggleReducedMotion"
            aria-describedby="motion-desc"
          >
          <span>Reduce Motion</span>
        </label>
        <p id="motion-desc" class="control-description">
          Minimizes animations and transitions
        </p>
      </div>

      <!-- Screen Reader Announcements -->
      <div class="control-group">
        <label class="control-label">Test Screen Reader</label>
        <button @click="testScreenReader" class="test-btn">
          <b-icon icon="volume-up-fill" aria-hidden="true"></b-icon>
          Test Announcement
        </button>
        <p class="control-description">
          Test screen reader announcements
        </p>
      </div>

      <!-- Reset Button -->
      <div class="control-group">
        <button @click="resetSettings" class="reset-btn">
          <b-icon icon="arrow-counterclockwise" aria-hidden="true"></b-icon>
          Reset All Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccessibilityPlugin',
  data() {
    return {
      highContrastEnabled: false,
      fontSizeLevel: 3,
      enhancedFocusEnabled: false,
      reducedMotionEnabled: false,
    };
  },
  mounted() {
    this.loadSettings();
  },
  methods: {
    setActiveComponent(component) {
      this.$emit('setActiveComponent', component);
    },

    toggleHighContrast() {
      if (this.highContrastEnabled) {
        document.body.classList.add('high-contrast');
        this.$announceForAccessibility('High contrast mode enabled');
      } else {
        document.body.classList.remove('high-contrast');
        this.$announceForAccessibility('High contrast mode disabled');
      }
      this.saveSettings();
    },

    increaseFontSize() {
      if (this.fontSizeLevel < 5) {
        this.fontSizeLevel++;
        this.applyFontSize();
        this.$announceForAccessibility(`Font size increased to level ${this.fontSizeLevel}`);
      }
    },

    decreaseFontSize() {
      if (this.fontSizeLevel > 1) {
        this.fontSizeLevel--;
        this.applyFontSize();
        this.$announceForAccessibility(`Font size decreased to level ${this.fontSizeLevel}`);
      }
    },

    applyFontSize() {
      const multiplier = 0.8 + (this.fontSizeLevel - 1) * 0.1; // 0.8x to 1.2x
      document.documentElement.style.fontSize = `${16 * multiplier}px`;
      this.saveSettings();
    },

    toggleEnhancedFocus() {
      if (this.enhancedFocusEnabled) {
        document.body.classList.add('enhanced-focus');
        this.$announceForAccessibility('Enhanced focus indicators enabled');
      } else {
        document.body.classList.remove('enhanced-focus');
        this.$announceForAccessibility('Enhanced focus indicators disabled');
      }
      this.saveSettings();
    },

    toggleReducedMotion() {
      if (this.reducedMotionEnabled) {
        document.body.classList.add('reduced-motion');
        this.$announceForAccessibility('Reduced motion enabled');
      } else {
        document.body.classList.remove('reduced-motion');
        this.$announceForAccessibility('Reduced motion disabled');
      }
      this.saveSettings();
    },

    testScreenReader() {
      this.$announceForAccessibility('This is a test announcement for screen readers. Accessibility features are working correctly.');
    },

    resetSettings() {
      this.highContrastEnabled = false;
      this.fontSizeLevel = 3;
      this.enhancedFocusEnabled = false;
      this.reducedMotionEnabled = false;

      // Remove all accessibility classes
      document.body.classList.remove('high-contrast', 'enhanced-focus', 'reduced-motion');
      document.documentElement.style.fontSize = '';

      this.saveSettings();
      this.$announceForAccessibility('All accessibility settings have been reset to default');
    },

    saveSettings() {
      const settings = {
        highContrastEnabled: this.highContrastEnabled,
        fontSizeLevel: this.fontSizeLevel,
        enhancedFocusEnabled: this.enhancedFocusEnabled,
        reducedMotionEnabled: this.reducedMotionEnabled,
      };
      localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    },

    loadSettings() {
      try {
        const saved = localStorage.getItem('accessibility-settings');
        if (saved) {
          const settings = JSON.parse(saved);
          this.highContrastEnabled = settings.highContrastEnabled || false;
          this.fontSizeLevel = settings.fontSizeLevel || 3;
          this.enhancedFocusEnabled = settings.enhancedFocusEnabled || false;
          this.reducedMotionEnabled = settings.reducedMotionEnabled || false;

          // Apply saved settings
          if (this.highContrastEnabled) {
            document.body.classList.add('high-contrast');
          }
          if (this.enhancedFocusEnabled) {
            document.body.classList.add('enhanced-focus');
          }
          if (this.reducedMotionEnabled) {
            document.body.classList.add('reduced-motion');
          }
          this.applyFontSize();
        }
      } catch (error) {
        console.warn('Failed to load accessibility settings:', error);
      }
    },
  },
};
</script>

<style scoped>
.accessibility-plugin {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  max-width: 320px;
  max-height: 70vh;
  overflow-y: auto;
  border: 2px solid #007acc;
}

.accessibility-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.accessibility-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  color: #666;
  border-radius: 4px;
}

.close-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.close-btn:focus {
  outline: 2px solid #007acc;
}

.accessibility-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
}

.control-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.control-description {
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.font-size-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.font-size-controls button {
  background-color: #007acc;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.font-size-controls button:hover:not(:disabled) {
  background-color: #005c99;
}

.font-size-controls button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.font-size-controls button:focus {
  outline: 2px solid #ffcc00;
}

.font-size-display {
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

.test-btn,
.reset-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.reset-btn {
  background-color: #dc3545;
}

.test-btn:hover {
  background-color: #218838;
}

.reset-btn:hover {
  background-color: #c82333;
}

.test-btn:focus,
.reset-btn:focus {
  outline: 2px solid #ffcc00;
}
</style>
