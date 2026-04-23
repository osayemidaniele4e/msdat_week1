<template>
  <div class="whats-new-admin-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="eyebrow">Content operations</p>
        <h2>What&apos;s New Management</h2>
        <p>
          Curate product updates, feature releases, and dashboard announcements from one polished
          control center.
        </p>
      </div>

      <div class="hero-metrics">
        <div class="metric-card">
          <span>Total updates</span>
          <strong>{{ updates.length }}</strong>
        </div>
        <div class="metric-card subtle">
          <span>Visible categories</span>
          <strong>{{ categorySummary }}</strong>
        </div>
      </div>
    </section>

    <section class="content-shell">
      <div class="toolbar">
        <div class="toolbar-copy">
          <p class="toolbar-label">Admin actions</p>
          <h3>Published updates</h3>
        </div>

        <div class="toolbar-actions">
          <b-button class="secondary-btn" @click="showPublicModal"> Show Modal </b-button>
          <b-button class="primary-btn" @click="openCreateWhatsNewModal"> Add New Update </b-button>
        </div>
      </div>

      <div class="table-shell">
        <b-overlay :show="isLoading" rounded="sm">
          <b-table
            class="updates-table"
            :items="updates"
            :fields="fields"
            hover
            responsive
            :busy="isLoading"
            show-empty
            empty-text="No updates have been published yet."
          >
            <template #cell(title)="row">
              <div class="title-cell">
                <span class="title-main">{{ row.item.title }}</span>
                <small class="title-sub">{{ truncateText(row.item.content, 92) }}</small>
              </div>
            </template>

            <template #cell(category_name)="row">
              <span class="category-pill" :class="categoryClass(row.item.category_name)">
                {{ row.item.category_name || 'Unknown' }}
              </span>
            </template>

            <template #cell(created_at)="row">
              <div class="meta-cell">
                <span>{{ formatDate(row.item.created_at) }}</span>
              </div>
            </template>

            <template #cell(publish_state)="row">
              <span
                class="publish-pill"
                :class="row.item.is_published ? 'published' : 'unpublished'"
              >
                {{ row.item.is_published ? 'Published' : 'Draft' }}
              </span>
            </template>

            <template #cell(actions)="row">
              <div class="action-menu-wrap">
                <b-dropdown
                  right
                  variant="link"
                  no-caret
                  toggle-class="action-menu-trigger text-decoration-none"
                  menu-class="action-menu-dropdown"
                >
                  <template #button-content>
                    <b-icon-three-dots-vertical></b-icon-three-dots-vertical>
                  </template>

                  <b-dropdown-item @click="openEditModal(row.item)">
                    <b-icon-pencil-square class="mr-2"></b-icon-pencil-square>
                    Update
                  </b-dropdown-item>
                  <b-dropdown-item @click="openViewModal(row.item)">
                    <b-icon-eye class="mr-2"></b-icon-eye>
                    View
                  </b-dropdown-item>
                  <b-dropdown-item @click="confirmPublishToggle(row.item)">
                    <b-icon-upload class="mr-2"></b-icon-upload>
                    {{ row.item.is_published ? 'Unpublish' : 'Publish' }}
                  </b-dropdown-item>
                  <b-dropdown-item @click="confirmDelete(row.item)">
                    <b-icon-trash class="mr-2"></b-icon-trash>
                    Delete
                  </b-dropdown-item>
                </b-dropdown>
              </div>
            </template>
          </b-table>
        </b-overlay>
      </div>
    </section>

    <div v-if="showCreateWhatsNewComponent" class="create-modal-overlay">
      <CreateWhatsNew
        :initial-data="modalUpdateData"
        @saved="handleSavedUpdate"
        @closeModal="closeCreateWhatsNewModal"
      />
    </div>

    <b-modal
      id="whats-new-view-modal"
      v-model="showViewModal"
      centered
      ok-only
      ok-title="Close"
      modal-class="premium-modal"
      content-class="premium-modal-content"
      header-class="premium-modal-header"
      body-class="premium-modal-body"
    >
      <template #modal-title>
        <div class="modal-title-wrap">
          <span class="modal-eyebrow">Update details</span>
          <strong>{{ selectedUpdate ? selectedUpdate.title : 'Preview' }}</strong>
        </div>
      </template>

      <div v-if="selectedUpdate" class="preview-grid">
        <div class="preview-meta">
          <span class="category-pill" :class="categoryClass(selectedUpdate.category_name)">
            {{ selectedUpdate.category_name || 'Unknown' }}
          </span>
          <span class="preview-date">{{ formatDate(selectedUpdate.created_at) }}</span>
        </div>
        <p class="preview-copy">{{ selectedUpdate.content }}</p>
        <div v-if="selectedUpdate.dashboard_name" class="preview-link">
          <span class="field-label">Dashboard name</span>
          <strong>{{ selectedUpdate.dashboard_name }}</strong>
        </div>
      </div>
    </b-modal>

    <b-modal
      id="whats-new-publish-modal"
      v-model="showPublishModal"
      centered
      hide-footer
      modal-class="premium-modal"
      content-class="premium-modal-content"
      header-class="premium-modal-header"
      body-class="premium-modal-body"
    >
      <template #modal-title>
        <div class="modal-title-wrap">
          <span class="modal-eyebrow">Confirm action</span>
          <strong>{{
            publishTargetState ? 'Publish this update?' : 'UnPublish this update ?'
          }}</strong>
        </div>
      </template>

      <div class="status-modal-copy">
        <span
          class="status-orb"
          :class="publishTargetState ? 'status-orb-publish' : 'status-orb-unpublish'"
        ></span>
        <div>
          <p class="status-modal-title">
            {{
              publishTargetState
                ? 'Make this update visible to users'
                : 'Make this update not visible to users'
            }}
          </p>
          <p class="status-modal-text">
            <strong>{{ selectedUpdate ? selectedUpdate.title : 'This update' }}</strong>
            {{
              publishTargetState
                ? " will become visible in the What's New experience."
                : " will not be visible in the What's New experience."
            }}
          </p>
        </div>
      </div>

      <div class="modal-actions status-modal-actions">
        <b-button class="secondary-btn" @click="showPublishModal = false"> Cancel </b-button>
        <b-button class="primary-btn" @click="togglePublishState">
          {{ publishTargetState ? 'Publish update' : 'Change to draft' }}
        </b-button>
      </div>
    </b-modal>

    <b-modal
      id="whats-new-delete-modal"
      v-model="showDeleteModal"
      centered
      hide-footer
      modal-class="premium-modal"
      content-class="premium-modal-content"
      header-class="premium-modal-header"
      body-class="premium-modal-body"
    >
      <template #modal-title>
        <div class="modal-title-wrap">
          <span class="modal-eyebrow">Confirm action</span>
          <strong>Delete this update permanently?</strong>
        </div>
      </template>

      <div class="status-modal-copy">
        <span class="status-orb status-orb-delete"></span>
        <div>
          <p class="status-modal-title">This action cannot be undone</p>
          <p class="status-modal-text">
            <strong>{{ selectedUpdate ? selectedUpdate.title : 'This update' }}</strong>
            will be permanently removed from the What&apos;s New records and will no longer be
            available for publishing, editing, or recovery from this admin page.
          </p>
        </div>
      </div>

      <div class="modal-actions status-modal-actions">
        <b-button class="secondary-btn" @click="showDeleteModal = false">
          Cancel
        </b-button>
        <b-button class="danger-btn" @click="deleteUpdate">
          Delete update
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import ApiServices from '@/modules/data-layer/services/ApiServices';
import CreateWhatsNew from './CreateWhatsNew.vue';

export default {
  name: 'WhatsNewPage',
  components: {
    CreateWhatsNew,
  },
  data() {
    return {
      isLoading: false,
      updates: [],
      selectedUpdate: null,
      showCreateWhatsNewComponent: false,
      showViewModal: false,
      showPublishModal: false,
      showDeleteModal: false,
      publishTargetState: true,
      modalUpdateData: null,
      fields: [
        { key: 'title', label: 'Update', thStyle: { width: '34%' } },
        { key: 'category_name', label: 'Type' },
        { key: 'created_at', label: 'Published' },
        { key: 'publish_state', label: 'Status' },
        { key: 'actions', label: 'Actions', class: 'text-right' },
      ],
    };
  },
  computed: {
    categorySummary() {
      const categories = [
        ...new Set(this.updates.map((item) => item.category_name).filter(Boolean)),
      ];
      return categories.length ? categories.join(', ') : 'None yet';
    },
  },
  methods: {
    ...mapMutations('MSDAT_STORE', ['toggleShowWhatsNew']),
    normalizeUpdate(item = {}) {
      return {
        id: item.id,
        title: item.title || '',
        content: item.content || '',
        category: item.category ?? null,
        category_name: item.category_name || this.getCategoryName(item.category),
        dashboard_name: item.dashboard_name || '',
        is_published: typeof item.is_published === 'boolean' ? item.is_published : true,
        created_at: item.created_at || '',
        updated_at: item.updated_at || '',
      };
    },
    getCategoryName(category) {
      const categoryMap = {
        1: 'Dataset',
        2: 'Dashboard',
        3: 'Feature',
      };

      return categoryMap[category] || '';
    },
    getCategoryId(categoryName) {
      const categoryMap = {
        Dataset: 1,
        Dashboard: 2,
        Feature: 3,
      };

      return categoryMap[categoryName] || null;
    },
    async fetchUpdates() {
      this.isLoading = true;
      try {
        const { data } = await ApiServices.getWhatsNew();
        this.updates = (data.results || []).map(this.normalizeUpdate).sort((a, b) => {
          const first = new Date(b.created_at || b.updated_at || 0).getTime();
          const second = new Date(a.created_at || a.updated_at || 0).getTime();
          return first - second;
        });
      } catch (error) {
        console.error('Error fetching updates:', error);
        this.$swal('Unable to load updates right now.');
      } finally {
        this.isLoading = false;
      }
    },
    showPublicModal() {
      this.toggleShowWhatsNew();
    },
    openCreateWhatsNewModal() {
      this.modalUpdateData = null;
      this.showCreateWhatsNewComponent = true;
    },
    closeCreateWhatsNewModal() {
      this.showCreateWhatsNewComponent = false;
      this.modalUpdateData = null;
    },
    openEditModal(item) {
      this.modalUpdateData = this.normalizeUpdate(item);
      this.showCreateWhatsNewComponent = true;
    },
    openViewModal(item) {
      this.selectedUpdate = this.normalizeUpdate(item);
      this.showViewModal = true;
    },
    confirmDelete(item) {
      this.selectedUpdate = this.normalizeUpdate(item);
      this.showDeleteModal = true;
    },
    confirmPublishToggle(item) {
      const normalizedItem = this.normalizeUpdate(item);
      this.selectedUpdate = normalizedItem;
      this.publishTargetState = !normalizedItem.is_published;
      this.showPublishModal = true;
    },
    async handleSavedUpdate() {
      this.showCreateWhatsNewComponent = false;
      this.modalUpdateData = null;
      await this.fetchUpdates();
    },
    async togglePublishState() {
      if (!this.selectedUpdate?.id) {
        return;
      }

      try {
        await ApiServices.updateWhatsNew(this.selectedUpdate.id, {
          is_published: this.publishTargetState,
        });
        this.$swal(
          this.publishTargetState
            ? 'Update published successfully.'
            : 'Update unpublished successfully.',
        );
        await this.fetchUpdates();
      } catch (error) {
        console.error('Error updating publish state:', error);
        this.$swal('Unable to change publish status right now.');
      } finally {
        this.showPublishModal = false;
        this.selectedUpdate = null;
      }
    },
    async deleteUpdate() {
      if (!this.selectedUpdate?.id) {
        return;
      }

      try {
        await ApiServices.deleteWhatsNew(this.selectedUpdate.id);
        this.$swal('Update deleted successfully.');
        await this.fetchUpdates();
      } catch (error) {
        console.error('Error deleting update:', error);
        this.$swal('Unable to delete this update right now.');
      } finally {
        this.showDeleteModal = false;
        this.selectedUpdate = null;
      }
    },
    categoryClass(category) {
      return {
        dataset: category === 'Dataset',
        dashboard: category === 'Dashboard',
        feature: category === 'Feature',
      };
    },
    truncateText(value, limit = 100) {
      if (!value) {
        return 'No description added.';
      }

      return value.length > limit ? `${value.slice(0, limit)}...` : value;
    },
    formatDate(value) {
      if (!value) {
        return 'No date';
      }

      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value));
    },
  },
  mounted() {
    this.fetchUpdates();
  },
};
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');

.whats-new-admin-page {
  min-height: calc(100vh - 160px);
  padding: 28px;
  background: radial-gradient(circle at top left, rgba(43, 124, 109, 0.14), transparent 34%),
    radial-gradient(circle at bottom right, rgba(203, 164, 92, 0.1), transparent 28%),
    linear-gradient(145deg, #f4f9f8 0%, #fbf7f0 52%, #f4faf9 100%);
  font-family: 'Manrope', sans-serif;
}

.hero-panel,
.content-shell {
  border: 1px solid rgba(18, 59, 49, 0.08);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 24px 60px rgba(10, 33, 29, 0.08);
  backdrop-filter: blur(14px);
}

.hero-panel {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
  padding: 28px;
}

.hero-copy {
  max-width: 720px;
}

.eyebrow,
.toolbar-label,
.modal-eyebrow {
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.eyebrow {
  margin-bottom: 12px;
  color: #2f7769;
}

.hero-copy h2 {
  margin-bottom: 12px;
  font: 700 clamp(2rem, 2.8vw, 2.8rem) / 1.05 'Playfair Display', serif;
  color: #163a33;
}

.hero-copy p:last-child {
  margin: 0;
  color: #607479;
  line-height: 1.7;
}

.hero-metrics {
  display: grid;
  gap: 14px;
  align-content: start;
  min-width: 240px;
}

.metric-card {
  padding: 18px 20px;
  border-radius: 22px;
  background: linear-gradient(135deg, #0f4d42, #1d7565);
  color: #f8fcfb;
}

.metric-card.subtle {
  background: linear-gradient(135deg, rgba(15, 77, 66, 0.08), rgba(29, 117, 101, 0.02));
  color: #173a33;
}

.metric-card span {
  display: block;
  margin-bottom: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.metric-card strong {
  font-size: 1.35rem;
}

.content-shell {
  padding: 28px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.toolbar-copy h3 {
  margin: 6px 0 0;
  font: 700 1.5rem/1.1 'Playfair Display', serif;
  color: #173a33;
}

.toolbar-label {
  color: #629182;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
}

.primary-btn,
.secondary-btn,
.danger-btn,
.table-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0.85rem 1.25rem;
  border-radius: 16px;
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.primary-btn {
  border: 0;
  background: linear-gradient(135deg, #0d5c6e 0%, #1a7b79 100%);
  box-shadow: 0 16px 32px rgba(13, 92, 110, 0.22);
  color: #ffffff;
}

.primary-btn:hover,
.primary-btn:focus {
  transform: translateY(-1px);
  box-shadow: 0 20px 36px rgba(13, 92, 110, 0.28);
}

.secondary-btn {
  border: 1px solid rgba(13, 92, 110, 0.14);
  background: #f6faf9;
  box-shadow: 0 10px 24px rgba(17, 47, 53, 0.08);
  color: #103740;
}

.secondary-btn:hover,
.secondary-btn:focus {
  transform: translateY(-1px);
  background: #ffffff;
  border-color: rgba(13, 92, 110, 0.18);
  color: #103740;
}

.secondary-btn:active,
.secondary-btn:not(:disabled):not(.disabled):active {
  background: #ffffff;
  border-color: rgba(13, 92, 110, 0.22);
  color: #103740;
}

.danger-btn {
  border: 0;
  background: linear-gradient(135deg, #b03c3c 0%, #d45757 100%);
  box-shadow: 0 16px 32px rgba(176, 60, 60, 0.2);
  color: #ffffff;
}

.danger-btn:hover,
.danger-btn:focus {
  transform: translateY(-1px);
  box-shadow: 0 20px 36px rgba(176, 60, 60, 0.26);
}

.table-shell {
  border: 1px solid rgba(18, 59, 49, 0.08);
  border-radius: 24px;
  background: #fcfefd;
  overflow: hidden;
}

.updates-table {
  margin-bottom: 0;
}

.updates-table ::v-deep thead th {
  padding: 18px 20px;
  border-bottom: 1px solid rgba(18, 59, 49, 0.08);
  background: #f4faf8;
  color: #55706a;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.updates-table ::v-deep tbody td {
  padding: 18px 20px;
  vertical-align: middle;
  border-top: 1px solid rgba(18, 59, 49, 0.06);
}

.title-cell {
  display: grid;
  gap: 4px;
  max-width: 360px;
}

.title-main {
  font-weight: 700;
  color: #173a33;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-sub,
.meta-cell {
  color: #708684;
}

.title-sub {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
}

.category-pill.dataset {
  background: rgba(24, 111, 95, 0.1);
  color: #176e5d;
}

.category-pill.dashboard {
  background: rgba(13, 92, 110, 0.1);
  color: #0d5c6e;
}

.category-pill.feature {
  background: rgba(203, 164, 92, 0.14);
  color: #8c6a22;
}

.publish-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
}

.publish-pill.published {
  background: rgba(24, 111, 95, 0.1);
  color: #176e5d;
}

.publish-pill.unpublished {
  background: rgba(140, 106, 34, 0.12);
  color: #8c6a22;
}

.action-menu-wrap {
  display: flex;
  justify-content: flex-end;
}

.action-menu-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(18, 59, 49, 0.1);
  border-radius: 12px;
  background: #f6faf9;
  color: #173a33 !important;
  box-shadow: 0 10px 20px rgba(10, 33, 29, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.action-menu-trigger:hover,
.action-menu-trigger:focus {
  transform: translateY(-1px);
  background: #ffffff;
  box-shadow: 0 14px 24px rgba(10, 33, 29, 0.08);
}

::v-deep .action-menu-dropdown {
  min-width: 180px;
  padding: 8px;
  border: 1px solid rgba(18, 59, 49, 0.08);
  border-radius: 16px;
  box-shadow: 0 18px 40px rgba(10, 33, 29, 0.12);
}

::v-deep .action-menu-dropdown .dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  color: #173a33;
  font-size: 0.9rem;
  font-weight: 600;
}

::v-deep .action-menu-dropdown .dropdown-item:hover,
::v-deep .action-menu-dropdown .dropdown-item:focus {
  background: #f4faf8;
  color: #0d5c6e;
}

.modal-title-wrap {
  display: grid;
  gap: 4px;
}

.modal-eyebrow {
  color: #6a8f85;
}

.modal-title-wrap strong {
  color: #163a33;
  font-size: 1.15rem;
}

.form-grid {
  display: grid;
  gap: 18px;
}

.field-wide {
  grid-column: 1 / -1;
}

.form-field {
  display: grid;
  gap: 10px;
}

.field-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #173a33;
}

.field-control {
  width: 100%;
  min-height: 54px;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(18, 59, 49, 0.12);
  border-radius: 16px;
  background: #f8fbfa;
  color: #173a33;
}

.field-textarea {
  min-height: 140px;
  resize: vertical;
}

.field-control:focus {
  outline: none;
  border-color: rgba(13, 92, 110, 0.45);
  box-shadow: 0 0 0 0.2rem rgba(13, 92, 110, 0.12);
  background: #ffffff;
}

.form-error {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(176, 60, 60, 0.08);
  color: #9b3b3b;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 22px;
}

.status-modal-copy {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: flex-start;
}

.status-orb {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  flex-shrink: 0;
}

.status-orb-publish {
  background: linear-gradient(135deg, rgba(24, 111, 95, 0.2), rgba(24, 111, 95, 0.08));
  box-shadow: inset 0 0 0 1px rgba(24, 111, 95, 0.18);
}

.status-orb-unpublish {
  background: linear-gradient(135deg, rgba(140, 106, 34, 0.18), rgba(140, 106, 34, 0.08));
  box-shadow: inset 0 0 0 1px rgba(140, 106, 34, 0.18);
}

.status-orb-delete {
  background: linear-gradient(135deg, rgba(176, 60, 60, 0.18), rgba(176, 60, 60, 0.08));
  box-shadow: inset 0 0 0 1px rgba(176, 60, 60, 0.18);
}

.status-modal-title {
  margin: 0 0 8px;
  color: #173a33;
  font-size: 1rem;
  font-weight: 800;
}

.status-modal-text {
  margin: 0;
  color: #607479;
  line-height: 1.75;
}

.status-modal-actions {
  margin-top: 24px;
}

.preview-grid {
  display: grid;
  gap: 16px;
}

.preview-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.preview-date,
.preview-copy {
  color: #607479;
}

.preview-copy {
  margin: 0;
  line-height: 1.7;
}

.preview-link {
  display: grid;
  gap: 6px;
  padding: 16px;
  border-radius: 18px;
  background: #f6faf9;
}

.delete-copy {
  margin: 0;
  color: #607479;
  line-height: 1.7;
}

.create-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(7, 17, 15, 0.34);
  backdrop-filter: blur(6px);
}

.create-modal-overlay ::v-deep .create-whats-new-overlay {
  min-height: calc(100vh - 48px);
  padding: 0;
  background: transparent;
  backdrop-filter: none;
}

::v-deep .premium-modal-content {
  border: 1px solid rgba(18, 59, 49, 0.1);
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(10, 33, 29, 0.14);
}

::v-deep .premium-modal-header {
  border-bottom: 1px solid rgba(18, 59, 49, 0.08);
  padding: 20px 24px 14px;
}

::v-deep .premium-modal-body {
  padding: 22px 24px 24px;
}

@media (max-width: 991px) {
  .hero-panel,
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-metrics {
    width: 100%;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .whats-new-admin-page {
    padding: 18px;
  }

  .content-shell,
  .hero-panel {
    padding: 20px;
  }

  .toolbar-actions,
  .modal-actions,
  .preview-meta {
    flex-direction: column;
    align-items: stretch;
  }

  .status-modal-copy {
    grid-template-columns: 1fr;
  }

  .hero-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
