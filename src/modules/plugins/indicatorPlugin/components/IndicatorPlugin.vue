<template>
    <div class="position-fixed zIndex">
      <div class="header d-flex justify-content-center position-relative">
        <div>
          <h1>Intelligent Indicator Search</h1>
        </div>
        <p @click="toggleComponent" class="close-icon">x</p>
      </div>

        <!-- Search client is running, show search functionality -->
        <form @submit.prevent="SearchIndicator">
          <div class="d-flex gap-2 justify-content-center p-2">
          <input type="text" class="form-control search-input" v-model="query" id="indicator-search-text-input" placeholder="Search For...">

<button type="submit" class="btn search-icon p-2"><b-icon icon="search" aria-hidden="true"></b-icon></button>
</div>
        </form>

        <!-- <div>
          {{}}
        </div> -->
    <div class="text-center mt-5" v-if="loader">
      <b-spinner variant="primary" label="Loading..."></b-spinner>
    </div>
      <div class="container mt-5 overflow-auto" v-if="displayTable" style="height: 90%">
          <b-table
          responsive
      id="my-table"
      :items="items"
      :per-page="perPage"
      :current-page="currentPage"
      small
      :fields="fields"
      style="height: 50%"
    ></b-table>

    <div class="mt-3">
      <b-pagination
      v-model="currentPage"
      :total-rows="tablerows"
      :per-page="perPage"
      aria-controls="my-table"
    ></b-pagination>

<p class="mt-3">Current Page: {{ currentPage }}</p>
</div>
      </div>

      <div v-if="noResult" class="mt-5 text-center text-primary">
        No Results Found
      </div>

      <footer>Powered by eHealth4everyone</footer>
    </div>
  </template>

<script>
// import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

export default {
  name: 'IndicatorPluginView',
  data() {
    return {
      RequestModel: 'https://query.e4eweb.space/query/',
      items: [],
      fields: [
        { key: 'short_name', label: 'Indicator Name' },
        { key: 'full_name', label: 'Indicator Full Name' },
        { key: 'indicator_type', label: 'Indicator Type' },
        { key: 'indicator_type', label: 'Indicator Type' },
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'program_area', label: 'Program Area' },
        { key: 'datasources', label: 'DataSources' },
        // Add other fields as needed
      ],
      perPage: 5,
      currentPage: 1,
      query: '',
      loading: false,
      displayTable: false,
      noResult: false,
    };
  },

  methods: {
    async SearchIndicator() {
      this.query.replace(/\s/g, '%20');
      this.displayTable = false;
      this.noResult = false;
      this.loading = true;
      try {
        const username = process.env.VUE_APP_INDICATOR_SEARCH_USERNAME;
        const password = process.env.VUE_APP_INDICATOR_SEARCH_PASSWORD;
        const response = await this.$axios.get(`${this.RequestModel + this.query}`, {
          auth: {
            username,
            password,
          },
        });
        const { result } = response.data;
        if (result) {
          this.items = result;
          this.loading = false;
          this.displayTable = true;
        } else {
          this.loading = false;
          this.noResult = true;
        }
      } catch (error) {
        this.loading = false;
        this.noResult = true;
      }
    },
    toggleComponent() {
      this.$emit('setActiveComponent', 'main');
    },

  },
  computed: {
    tablerows() {
      return this.items.length;
    },
    loader() {
      return this.loading;
    },
  },
  watch:
  {
    loading(newVal) {
      this.loading = newVal;
      console.log('loading new val', newVal);
    },
  },
};
</script>
  <style scoped>
  .header {
    background-color: inherit;
    height: 77px;
    padding: 20px;
    padding-right: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .header h1 {
    font-size: 1px;
    text-align: center;
    font: normal normal bold 22px/14px Work Sans;
    letter-spacing: 0px;
    color: var(--green);
    opacity: 1;
    margin: 0;
  }

  .search-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5em;
    margin-top: -15px;
  }

  .search-input {
    height: 2.2em;
    width: 26em;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    border: none;
    padding-inline: 1.8em;
    box-shadow: none;
  }
  .search-input::placeholder
  {
    color: lightgrey;
  }

  .search-input:focus {
    outline: 2px solid #5cb85c;

  }

  .search-icon, .search-icon:focus, .search-icon:hover {
    height: 2.2em;
    width: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    color: green;
    font-size: medium;
    box-shadow: none;
  }

  .init {
    top: 15%;
  }

  .search-results {
    margin-top: 0.5em;
    max-height: 450px;
    /* Adjust the height as needed */
    overflow-y: scroll;
    background-color: white;

  }

  /* Adjust the styles for the hits and item as needed */

  .zIndex {
    position: fixed;
    z-index: 9999;
    right: 0px;
    top: 70px;
    background-color: whitesmoke;
    width: 500px;
    height: 777px;
    border: 1px groove #1c6d90;
    border-radius: 8px;
    bottom: 50px;
  }

  .content {
    width: 90%;
    margin-top: 20px;
  }

  footer {
    width: 100%;
    border-top: 1px solid;
    position: fixed;
    bottom: 0px;
    font-size: 0.75em;
    padding: 0.5em;
    background-color: white;
  }

  .header p {
    background-color: whitesmoke;
    height: 25px;
    width: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    cursor: pointer;
    position: absolute;
    right: -5px;
    top: -5px;
  }

  .result-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-inline: 1em;
  }
  </style>
