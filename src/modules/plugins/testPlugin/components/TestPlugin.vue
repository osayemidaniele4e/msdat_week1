<template>
  <div class="position-fixed zIndex">
    <div class="header d-flex justify-content-between position-relative">
      <div class="left-content">
        <h1>Data Insights</h1>
        <span>Look up qualitative data now</span>
      </div>
      <div class="profile">
        <div class="img">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRj1y_ODSdX2err5lXo0YN1TsQD9OyZqOwU7Q&usqp=CAU"
            alt=""
            class="img"
          />
        </div>
        <div class="icon">
          <b-icon font-scale="" icon="bell-fill"></b-icon>
        </div>
      </div>
      <p @click="toggleComponent" class="close-icon">X</p>
    </div>
     <!-- Search Form -->
     <form @submit.prevent="searchKeywords" class="proj-main">
        <div class="d-flex-row gap-2 justify-content-center px-4 pt-2">
          <label class="">Get Contextual Data Right Away</label>
          <div class="form-control search-input">
            <input type="text" class="" v-model="query" placeholder="Enter Keywords or Url">
            <button type="submit" class="btn search-icon p-2"><b-icon icon="search" aria-hidden="true"></b-icon></button>

          </div>
          </div>
          <div class="mt-2 ml-4">
            <p>Or search by</p>
          </div>
          <div class="content mx-auto">
              <!-- <div v-if="feeds.length > 0" class="navigation my-3 border-bottom d-flex">
                <div class="mx-2" v-for="(item, index) in navigationList" :key="index">
                  <h5
                    @click="setSelectedItem(item.name)"
                    :class="[item.name === selectedItem ? 'activeItem' : 'item']"
                  >
                    {{ item.name }}
                  </h5>
                </div>
              </div> -->
              <div  class="mt-0">
                <div class="">
                  <label class="typo__label">Indicator</label>
                  <Multiselect
                    v-model="selectedIndicator"
                    deselect-label="Can't remove this value"
                    track-by="name"
                    label="name"
                    placeholder="Select Indicator"
                    :options="indicators"
                    :searchable="false"
                    :allow-empty="false"
                  >
                  </Multiselect>
                </div>
                  <div class="mt-2">
                  <label class="typo__label">Data Source</label>
                  <Multiselect
                    v-model="selectedIndicator"
                    deselect-label="Can't remove this value"
                    track-by="name"
                    label="name"
                    placeholder="Select Data Source"
                    :options="indicators"
                    :searchable="false"
                    :allow-empty="false"
                    class="multiselect"
                  >
                  </Multiselect>
                </div>
                  <div class="row">
                  <div class="col-7">
                    <div class="mt-2">
                      <label class="typo__label">Location</label>
                      <Multiselect
                        v-model="selectedIndicator"
                        deselect-label="Can't remove this value"
                        track-by="name"
                        label="name"
                        placeholder="Select Location"
                        :options="indicators"
                        :searchable="false"
                        :allow-empty="false"
                      >
                      </Multiselect>
                    </div>
                  </div>
                    <div class="col-5">
                    <div class="mt-2">
                      <label class="typo__label">Year</label>
                      <Multiselect
                        v-model="selectedIndicator"
                        deselect-label="Can't remove this value"
                        track-by="name"
                        label="name"
                        placeholder="Select Year"
                        :options="indicators"
                        :searchable="false"
                        :allow-empty="false"
                      >
                      </Multiselect>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex mt-4 ">
                <button type="button" class="btn btn-secondary btn-lg btn-block search-btn">SEARCH</button>
                </div>

            </div>
                </div>
      </form>
      <div v-if="feeds.length > 0" class="feeds">
        <div
          @mouseover="setLink(feed.link)"
          @mouseleave="setLink(null)"
          v-for="(feed, index) in feeds"
          :key="index"
          class=""
        >
          <!-- <div class="feedItem">
            <h1>{{ feed.title }}</h1>
            <h2>{{ formatBody(feed.body) }}</h2>
          </div> -->
          </div>
          <span class="img-search">images for conceptual search</span>
              </div>
              <h1 class="link my-3">{{ hoveredLink }}</h1>
              <div class="mt-1 d-flex align-items-center justify-content-between toggle-btn footer">
                <div class="d-flex align-items-center">
                  <b-form-checkbox
                    switch
                    name="confidence range"
                    size="lg"
                    value="ON"
                    unchecked-value="OFF"
                  ></b-form-checkbox>
                  <p class="mb-0">View contextual data on hover</p>
                </div>
                  <button
                  @click="reset"
                  type="button"
                  class="btn btn-outline-primary btn-sm rounded text-right"
                >
                  reset
                </button>
              </div>
            </div>
  </template>

<script>
import Multiselect from 'vue-multiselect';

export default {
  name: 'ContextPluginView',
  components: {
    Multiselect,
  },
  data() {
    return {
      value: [],
      options: [
        { name: 'Vue.js', language: 'JavaScript' },
        { name: 'Adonis', language: 'JavaScript' },
        { name: 'Rails', language: 'Ruby' },
        { name: 'Sinatra', language: 'Ruby' },
        { name: 'Laravel', language: 'PHP' },
        { name: 'Phoenix', language: 'Elixir' },
      ],
      navigationList: [
        { name: 'All' },
        { name: 'infographics' },
        { name: 'news' },
        { name: 'images' },
        { name: 'video' },
      ],
      selectedItem: 'All',
      selectedIndicator: null,
      feeds: [],
      indicators: [
        { name: 'Vue.js', language: 'JavaScript' },
        { name: 'Rails', language: 'Ruby' },
        { name: 'Sinatra', language: 'Ruby' },
        { name: 'Laravel', language: 'PHP', $isDisabled: true },
        { name: 'Phoenix', language: 'Elixir' },
      ],
      hoveredLink: null,
    };
  },
  methods: {
    searchKeywords() {
      this.$emit('searchKeywords', this.query);
    },

    toggleVisibility() {
      localStorage.setItem('contextPlugin', 'false');
    },
    setSelectedItem(name) {
      this.selectedItem = name;
    },
    setLink(link) {
      this.hoveredLink = link;
    },
    formatBody(str) {
      return `${str.substring(0, 100)} .... ....`;
    },
    reset() {
      this.feeds = [];
    },
    toggleComponent() {
      this.$emit('setActiveComponent', 'main');
    },
  },
};
</script>
  <style scoped>

  .proj-main{
    width: 100%;
    height: 100%;
    background-color: #fff;
    border-radius: 10px;
    padding:0 20px;
  }
  .proj-main p{
    font-size: 14px;
    font-weight: 600;
  }
  .header {
    background-color: #1c6d90;
    height: 77px;
    padding: 20px;
    padding-right: 40px;
  }
  .header h1 {
    font-size: 1px;
    text-align: left;
    font: normal normal bold 22px/14px Work Sans;
    letter-spacing: 0px;
    color: #ffffff;
    opacity: 1;
    margin: 0;
  }
  .header span {
    font: normal normal normal 15px/18px Work Sans;
    letter-spacing: 0px;
    color: #ffffff;
    opacity: 1;
    margin: 0;
    margin-top: -4px;
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
  .header p:hover {
    background-color: rgb(239, 100, 100);
    color: white;
    padding-top: 5px;
    padding-bottom: 5px;
  }
  .zIndex {
    position: fixed;
    z-index: 9999;
    right: 20px;
    top: 70px;
    background-color: whitesmoke;
    width: 500px;
    height: 777px;
    border: 1px groove #1c6d90;
    border-radius: 8px;
  }
  .profile {
    position: relative;
  }
  .profile .img {
    height: 39px;
    width: 39px;
    background-color: whitesmoke;
    border-radius: 50%;
  }
  .profile .icon {
    position: absolute;
    bottom: -10px;
    right: -10px;
    background-color: white;
    height: 20px;
    width: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
  }
  .profile .icon svg {
    color: #1c6d90;
    font-size: 14px;
  }
.search-btn{
  background-color: #1c6d90;
  color: #fff;
  border-radius: 10px;
  border: none;
  outline: none;
  width: 100%;
  height: 50px;
  font-size: 15px;
  cursor: pointer;
}
.search-btn:hover{
  background-color: #1c6d90;
}

  .search-btn:active{
    background-color: #1c6d90;
    outline: none;
    border: none;
  }

  .search-btn:focus{
    background-color: #1c6d90;
    outline: none;
    border: none;
  }
  .search-input{
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #1c6d90;

  }

  .search-input input{
    border: none;
    outline: none;
    width: 100%;
  }

  .search-icon{
    height: 2.2em;
    width: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: medium;
    box-shadow: none;
  }
  .search-icon:hover{
    color: #000;
  }
  .search-icon:focus{
    color: #000;
    box-shadow: none;
    border: none;

  }

  .typo__label {
    font: bold 14px/17px Work Sans;
    letter-spacing: 0px;
    color: #222222;
    opacity: 1;
    margin: 0;
  }

  .multiselect{
    color: #1c6d90;
  }
  .content {
    width: 90%;
    margin-top: 10px;
  }

  .feeds {
    height: 50vh;
    overflow-y: auto;
  }
  .navigation .item {
    font-size: 18px !important;
    cursor: pointer;
    font-weight: normal;
  }
  .navigation .activeItem {
    font-size: 18px !important;
    cursor: pointer;
  }
  .toggle-btn p {
    font-size: 18px !important;
  }
  .link {
    font-size: 14px !important;
    height: 20px;
  }
  .feedItem {
    cursor: pointer;
  }
  .feedItem h1 {
    font-size: 23px !important;
  }
  .feedItem h2 {
    font: normal normal normal 18px/19px Work Sans;
  }
  .img-search {
    font-size: 18px !important;
    font: normal normal normal 18px/19px Work Sans;
    letter-spacing: 0px;
    color: #222222;
  }
  .footer {
    position: absolute;
    bottom: 5px;
    width: 90%;
  }
  </style>
