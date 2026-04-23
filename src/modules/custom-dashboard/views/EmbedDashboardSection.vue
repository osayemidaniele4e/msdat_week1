<template>
  <b-container style="width: 85%" fluid>
    <template>
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <h2
            style="
              background-color: #f5f5f5;
              width: 100%;
              font-family: Work Sans;
              font-size: 23px;
              font-weight: bold;
            "
          >
            <span class="col-6">
              {{ details.name }}
            </span>
          </h2>
          <div
            style="
              background-color: #f5f5f5;
              width: 70%;
              font-family: Work Sans;
              font-size: 14px;

              margin-bottom: 10px;
            "
          >
            <p class="col-12">
              {{ details.description }}
            </p>
          </div>
        </div>
      </div>
      <div class="d-flex mb-4">
        <div
          @click="toggleTab('embedUrl')"
          class="px-5 py-2 mr-2"
          :class="[activeTab === 'embedUrl' ? 'embed-choice-active' : 'embed-choice']"
        >
          Embed External Page (Link)
        </div>
        <div
          @click="toggleTab('embedIframe')"
          class="px-5 py-2"
          :class="[activeTab === 'embedIframe' ? 'embed-choice-active' : 'embed-choice']"
        >
          Embed External Page (Iframe)
        </div>
      </div>
      <div class="w-100">
        <b-row>
          <b-col md="12" sm="12">
            <div v-if="activeTab === 'embedUrl'" class="">
              <h2>Embed External Page(Link)</h2>
              <div class="mb-3 mt-4 embed">
                <label>Embed External Page Title:</label>
                <input v-model="urlTitle" type="text" placeholder="Enter Page Title" required />
                <div class="mb-3 mt-3 embed">
                  <label>Link To The Embedded Page:</label>
                  <input
                    v-model="url"
                    type="text"
                    placeholder="Page Link - Example: ( https://example.com )"
                    required
                  />
                </div>
              </div>
            </div>
            <div v-if="activeTab === 'embedIframe'" class="">
              <h2>Embed External Page (Iframe)</h2>
              <div class="embed mt-4">
                <label>External Page (Iframe) Title:</label>
                <input v-model="iframeTitle" type="text" placeholder="Enter Title" required />
              </div>
              <div class="embed">
                <label>Paste External Page (Iframe) Code:</label>
                <textarea
                  :rows="5"
                  v-model="embedded_iframe"
                  placeholder='<iframe src="https://example.com"></iframe>'
                  required
                ></textarea>
              </div>
            </div>
            <div class="Description">
              <label>Dashboard Description:</label>
              <textarea
                :rows="5"
                v-model="description"
                placeholder="Enter Description "
                required
              ></textarea>
            </div>
          </b-col>
        </b-row>
      </div>
    </template>

    <b-row align-h="end" class="mt-5 mb-5 mr-2 text-right">
      <!-- <b-col class="align-baseline" cols="auto"
                ><p class="baseline">Save for Later</p>
              </b-col> -->
      <b-col cols="auto"
        ><b-button style="font-family: Work Sans" class="editBtn" @click="backToPrefrence">
          Back to Data Table</b-button
        ></b-col
      >
      <b-col cols="auto"
        ><b-button style="font-family: Work Sans" @click="saveEmbed" class="nextBtn"
          >Next Page</b-button
        ></b-col
      >
    </b-row>
  </b-container>
</template>

<script>
export default {
  data() {
    return {
      embedded_url: null,
      embedded_iframe: null,
      url: '',
      urlTitle: '',
      iframeTitle: '',
      activeTab: 'embedUrl',
      description: '',
    };
  },
  computed: {
    details() {
      return this.$store.getters.dashboardDetails;
    },
  },

  mounted() {
    this.$store.commit('updateStep', 4);
    this.activeTab = localStorage.getItem('activeTab') || 'embedUrl';
    this.url = this.$store.getters.getUrl;
    this.embedded_iframe = this.$store.getters.getIframeEmbed;
    this.urlTitle = this.$store.getters.getNewEmbedUrlTitle;
    this.iframeTitle = this.$store.getters.getNewEmbedIframeTitle;
    this.description = this.$store.getters.getNewEmbedDashboardDescription;
  },

  methods: {
    toggleTab(tab) {
      this.activeTab = tab;
    },
    saveEmbed() {
      // save url to store
      this.$store.dispatch('setEmbedUrl', this.modifyTableauUrl(this.url));
      this.$store.dispatch('setNewEmbedUrlTitleAction', this.urlTitle);
      this.$store.dispatch('setNewEmbedIframeTitleAction', this.iframeTitle);
      this.$store.dispatch('setEmbedDashboardDescriptionAction', this.description);
      console.log(this.urlTitle, 'urlTitle');
      localStorage.setItem('activeTab', this.activeTab);

      // save iframe to store
      this.$store.dispatch('setEmbedIframe', this.embedded_iframe);
      // this.$store.dispatch('setEmbedIframeTitle', this.iframeTitle);
      this.$router.push('sections');
    },

    backToPrefrence() {
      this.$router.push('data-table');
    },
    modifyTableauUrl(url) {
      // return url.includes('public.tableau.com') ? `${url}:showVizHome=no&embed=true` : url;
      let result;
      if (url.includes('public.tableau.com')) {
        result = `${url}:showVizHome=no&embed=true`;
      } else if (url.includes('public.tableau.com') && url.includes('showVizHome=no&embed=true')) {
        result = url;
      } else {
        result = url;
      }
      return result;
    },
  },
};
</script>

<style scoped>
.embed input,
textarea {
  width: 100%;
  padding: 8px;
  margin: 5px 0;
  border-radius: 5px;
}
label {
  margin-bottom: -20px;
  font-size: 16px;
}
.nextBtn {
  background-color: #3f8994;
  color: #ffffff;
  max-width: 253.500000063px;
  text-transform: uppercase;
  border-color: #3f8994;
  font-size: 15.00000375px;
}

.editBtn {
  background-color: #eaeaea;
  color: #000000;
  max-width: 253.500000063px;
  text-transform: uppercase;
  border-color: #eaeaea;
  font-size: 15.00000375px;
}

.embed-choice {
  background-color: #f5f5f5;
  color: #000000;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  border: 1px solid #dcdcdc;
  border-radius: 5px;
}
.embed-choice:hover {
  background-color: #dcdcdc;
  color: #000000;
}
.embed-choice-active {
  background-color: #3f8994;
  color: #ffffff;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  border: 1px solid #dcdcdc;
  border-radius: 5px;
}
.embed-choice-active:hover {
  background-color: #3f8994;
  color: #ffffff;
}
</style>
