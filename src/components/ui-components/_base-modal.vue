<template>
  <div>
    <b-modal
      footer-class="justify-content-between"
      header-class="header-color"
      :header-bg-variant="header"
      ref="main-modal"
      centered
      :size="size"
      :no-close-on-backdrop="noCloseOnBackdrop"
      :no-close-on-esc="noCloseOnEsc"
      v-on:hidden="hide"
      class="w-25 px-3"
    >
      <template #modal-header="{ close }">
        <slot name="title"> modal slot title fallback </slot>
        <b-icon
          icon="x"
          @click="close()"
          style="width: 25px; height: 25px"
        ></b-icon>
      </template>
      <slot> modal content </slot>
      <template

        #modal-footer="{ close }"
      >
        <div class="d-flex">
          <button class="btn btn-danger work-sans" @click="close()">CLOSE</button>
        </div>
        <slot name="footer-btn" class="flex-shrink-1 p-2"> </slot>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: {
    showModal: {
      type: Boolean,
      default: () => false,
    },
    /**
     * align with bootstrap-vue
     */
    size: {
      type: String,
      default: () => ('xl'),
    },
    header: {
      type: String,
      default: () => ('secondary'),
    },
    noCloseOnBackdrop: {
      type: Boolean,
      default: () => false,
    },
    noCloseOnEsc: {
      type: Boolean,
      default: () => false,
    },
  },
  watch: {
    showModal(newValue) {
      if (newValue) {
        this.$refs['main-modal'].show();
        return;
      }
      this.$refs['main-modal'].hide();
    },
  },
  methods: {
    hide() {
      this.$emit('hidden');
    },
  },
};
</script>

<style lang="scss" scoped>
.header-color {
  background-color: #ececec !important;
}
.edit-footer-class {
  justify-content: space-between !important;
}
</style>
