<template>
  <div>
    <Header ref="theHeader"></Header>
    <b-row style="position: relative" class="py-0 mt-sm-3 justify-content-center">
      <!-- <img
        style="height: 62vh; width: 63vw"
        src="@/assets/img/analytics/bkg.png"
        alt="path background"
      /> -->
      <!-- position: absolute; -->
      <div
        style="
          left: 0;
          top: 0;
          padding: 5%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-around;
          height: 100%;

          margin-bottom: -95px;
        "
      >
        <div class="d-flex flex-column align-items-center custom-Header">
          <h1 class="header-subText">Create your custom dashboard</h1>
          <h2 class="text-center">Design your dashboard, customize data</h2>
          <h2 class="text-center">No coding skills required!</h2>
        </div>
      </div>
    </b-row>
    <b-container fluid class="pt-0 mt-0 mb-3">
      <div class="image-scroll">
        <p class="mt-2 header-subText">Here are a few dashboard samples</p>
        <div ref="scrollContainer" class="mt-3 mb-5 d-flex scrolling-container">
          <img
            v-for="(image, index) in images"
            :key="index"
            :src="require(`@/assets/img/${image}`)"
            alt=""
            class="d-flex"
          />
        </div>
      </div>
      <div class="mt-0 mb-3 p-5">
        <h4 class="text-center header-subText">How to create your custom dashboard</h4>
        <b-row align="center" class="mx-5 px-5 hero">
          <b-col md="auto" lg="auto" sm="12" class="svg">
            <customDashboardSvg :name="61" class="svg-1"></customDashboardSvg>
            <p style="font-size: 16px !important">Select Data</p>
          </b-col>
          <b-col md="auto" lg="auto" sm="12" align-self="center" class="svg-arrow">
            <customDashboardSvg :name="78"></customDashboardSvg>
          </b-col>
          <b-col md="auto" lg="auto" sm="12" class="svg">
            <customDashboardSvg :name="62" class="svg-2"></customDashboardSvg>
            <p style="font-size: 16px !important">Arrange Widgets</p>
          </b-col>
          <b-col md="auto" lg="auto" sm="12" align-self="center" class="svg-arrow">
            <customDashboardSvg :name="79"></customDashboardSvg>
          </b-col>
          <div class="mxw-400">
            <b-col md="auto" lg="auto" sm="12" class="svg">
              <customDashboardSvg :name="77"></customDashboardSvg>
              <p style="font-size: 16px !important">Visualize Dashboard</p>
            </b-col>
          </div>
        </b-row>
        <!-- <div class="text-center">
          <b-button id="get-started" @click="$router.push('/custom/login')" class="px-4 py-3"
            >Get Started Here</b-button
          >
        </div> -->
      </div>

      <div class="container d-flex justify-content-center align-items-center">
        <div class="row">
          <div class="card mr-3 custom-card m-3 justify-content-center align-items-center">
            <img
              src="@/assets/img/Group 81.png"
              class="card-img-top p-2"
              style="visibility: hidden"
            />
            <div class="card-body">
              <h4 class="card-title">Available Health Data</h4>
              <p class="card-text">
                Our platform helps you set up a custom dashboard to suit your needs. The dashboard
                includes cleaned data on specific key health indicators in Nigeria. This data is
                available for your use.
              </p>
              <b-button id="get-started" @click="startStandardFlow" class="px-3 py-2"
                >Get Started Here</b-button
              >
            </div>
          </div>
          <div class="card mr-3 custom-card m-3 justify-content-center align-items-center">
            <img
              src="@/assets/img/Group 81.png"
              class="card-img-top p-2"
              style="visibility: hidden"
            />
            <div class="card-body">
              <h4 class="card-title">Map Visualizations</h4>
              <p class="card-text">
                Build dedicated, highly interactive map visualizations of any health indicators across regions in the country. Perfect for geographic and spatial analysis of healthcare data.
              </p>
              <b-button id="get-started" @click="startMapFlow" class="px-3 py-2"
                >Create map visualization here</b-button
              >
            </div>
          </div>
          <div class="card custom-card m-3 justify-content-center align-items-center">
            <div style="position: absolute; top: 0; right: 0; margin-top: 10px; margin-right: 10px">
              <b-button
                class="px-3 py-2"
                disabled
                style="background-color: #141414 !important; border-radius: 22px; font-size: 11px"
                >Currently in development</b-button
              >
            </div>
            <img src="" class="card-img-top p-2" style="visibility: hidden" />
            <div class="card-body">
              <h4 class="card-title">Customizable Data</h4>
              <p class="card-text">
                Good news! This platform is not limited to the available data; you can also upload
                the data you're tracking within your team. You'll have the ability to input your
                data and select your preferred visualization.
              </p>
              <b-button id="inactive-button" disabled class="px-3 py-2 inactive-button-style"
                >Indicate interest here</b-button
              >
              <!-- <a href="#" class="btn btn-primary">Indicate interest here</a> -->
            </div>
          </div>
        </div>
      </div>

      <!-- <div class="image-scroll">
        <p class="mt-5 header-subText">Here are a few dashboard samples</p>
        <div horizontal class="mt-0 mb-5 d-flex" style="width: 100%; overflow: hidden">
          <img src="@/assets/img/Image 3.png" alt="" class="d-flex" />
          <img src="@/assets/img/(per 1000 live births).png" alt="" class="d-flex" />
          <img src="@/assets/img/(per 1000 live births) (NHMIS - 2019).png" alt="" class="d-flex" />
          <img src="@/assets/img/(per 1000 live births) NDHS_2018.png" alt="" class="d-flex" />
        </div>
      </div> -->

      <!-- <b-row style="padding-left: 70.000000026px; padding-right: 70.000000026px">
        <b-col lg="8" sm="12" class="p-0 text-left">
          <b-row class="features">
            <b-col>
              <h4 style="font-size: 24px; font-weight: 500">Available Health Data</h4>
              <p class="d-flex text-justify mb-4" style="font-size: 15px !important">
                Our platform helps you set up a custom dashboard to suit your needs. The dashboard
                includes cleaned data on specific key health indicators in Nigeria. This data is
                available for your use. The platform allows for the segmentation of your charts,
                enabling you to organize your visualizations into any section of your choice, giving
                you control over your data and making it easier to analyze.
              </p>
              <b-button style="font-size: 1rem; border-radius: 8px">Design your dashboard</b-button>
            </b-col>
          </b-row>
          <b-row class="features">
            <b-col>
              <h4 style="font-size: 24px; font-weight: 500">Customizable Data</h4>
              <p class="text-justify mb-4" style="font-size: 15px !important">
                Good news! This platform is not limited to the available data; you can also upload
                the data you're tracking within your team. You'll have the ability to input your
                data and select your preferred visualization. This feature is currently in
                development, and we're eager to incorporate your requirements into the design. If
                you're interested in contributing to the development of this feature, please express
                your interest below.
              </p>
              <b-button style="font-size: 1rem; border-radius: 8px"
                >INDICATE INTEREST HERE</b-button
              >
            </b-col>
          </b-row>
        </b-col>
        <b-col lg="4" sm="12">
          <div>
            <img
              class="img-fluid d-block mx-auto pb-5 mb-5"
              src="@/assets/img/Group 81.png"
              alt=""
            />
          </div>
        </b-col>
      </b-row> -->
    </b-container>
    <Footer />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
// import CdFooter from '../components/footer.vue';
// import SavedDashboardList from '../components/SavedDashboardList.vue';
import customDashboardSvg from '../svg/customDashboardSvgs.vue';
import Header from '../../msdat-dashboard/views/about/layout/theHeader.vue';
import Footer from '../../msdat-dashboard/views/about/layout/theFooter.vue';

export default {
  data() {
    return {
      images: [
        'Image 3.png',
        '(per 1000 live births).png',
        '(per 1000 live births) (NHMIS - 2019).png',
        '(per 1000 live births) NDHS_2018.png',
        'Image 3.png',
        '(per 1000 live births).png',
        '(per 1000 live births) (NHMIS - 2019).png',
        '(per 1000 live births) NDHS_2018.png',
      ],
      scrollInterval: null,
      scrollSpeed: 3000, // Adjust the scroll speed in milliseconds
    };
  },
  name: 'landing',
  components: {
    // CdFooter,
    customDashboardSvg,
    // SavedDashboardList,
    Header,
    Footer,
  },
  computed: {
    ...mapGetters('AUTH_STORE', ['isAuthenticated']),
  },
  mounted() {
    this.startAutoScroll();
  },
  methods: {
    startAutoScroll() {
      const container = this.$refs.scrollContainer;
      if (!container) return;
      const containerWidth = container.offsetWidth;
      const imagesWidth = container.scrollWidth;

      if (imagesWidth > containerWidth) {
        this.scrollInterval = setInterval(() => {
          container.scrollLeft += 1; // Adjust the scroll amount
          if (container.scrollLeft >= imagesWidth - containerWidth) {
            container.scrollLeft = 0;
          }
        }, this.scrollSpeed);
      }
    },
    startStandardFlow() {
      this.$store.dispatch('setDashboardMode', 'standard');
      this.$router.push('/custom/login');
    },
    startMapFlow() {
      this.$store.dispatch('setDashboardMode', 'map');
      this.$router.push('/custom/login');
    },
  },
  beforeDestroy() {
    clearInterval(this.scrollInterval);
  },
};
</script>

<style lang="scss" scoped>
.container-fluid {
  margin-top: 54.750000014px;
}
.hero {
  width: 100%;
  margin: auto !important;
  align-items: center !important;
  justify-content: center !important;
}
#get-started {
  background-color: #3f8994;
  color: #ffffff;
  max-width: 306.000000077px;
  font-weight: 500;
  font-size: 13px;
  border-radius: 7.000000002px;
  text-transform: none;
  transition: background-color 0.3s ease;
}
#get-started:hover {
  background-color: #103f47 !important; /* Change background color on hover */
}
#samples {
  color: #202020;
  font-size: 20px;
  font-weight: 400;
  text-align: center;
}
.btn {
  background-color: #3f8994;
  color: #ffffff;
  max-width: 253.500000063px;
  text-transform: uppercase;
}
.nav {
  padding: 0px 80px;
}
.header-text {
  color: #201f1f;
  font-family: 'DM Sans', sans-serif;
  h1 {
    font-weight: bold;
    font-size: 40px;
    margin-bottom: 32.250000008px;
  }
  h2 {
    font-weight: normal;
    color: #202020;
    font-size: 22.5px;
    margin-bottom: 11.250000003px;
  }
  h3 {
    font-weight: bold;
    color: #202020;
    font-size: 22.5px;
  }
}
.features:first-child {
  margin-bottom: 59.250000015px;
}
.features:last-child {
  margin-bottom: 91.500000023px;
}
.features {
  h4 {
    font-weight: normal;
    font-size: 22.5px;
    color: #202020;
    margin-bottom: 17.250000004px;
  }
  p {
    font-weight: normal;
    font-size: 15.000000004px;
    color: #202020;
    margin-bottom: 41.25000001px;
  }
}

.col-7 {
  padding: 0px;
}
a {
  color: #202020;
}
.svg {
  flex-grow: 0;
  margin-top: 62.250000016px;

  p {
    font-weight: normal;
    font-size: 27.000000007px;
    color: #202020;
    // margin-bottom: 41.25000001px;
    margin-top: 20.287500005px;
  }
}
.list-group-item {
  border: none;
  background-color: #f6f6f6;
}
.list-group {
  margin-top: 54.000000014px;
  margin-bottom: 99.000000025px;
}
.list-group::-webkit-scrollbar {
  display: none;
}

.header-subText {
  color: #000;
  font-weight: 450;
  font-size: 1.2rem;
  text-align: center;
  letter-spacing: 1px;
  margin-bottom: 10px;
}

.custom-card {
  width: 400px;
  height: 400px; /* Adjust height as needed */
  box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.2); /* Add box shadow */
  transition: 0.3s; /* Add transition effect */
  border-radius: 12px;
}
.custom-card .card-body {
  height: 300px; /* Set fixed height for card body */
}
.custom-card img {
  height: 150px; /* Adjust image height as needed */
  object-fit: cover; /* Maintain aspect ratio */
  margin: 0;
}
.custom-card .card-text {
  text-align: left; /* Align text to the left */
  height: 55%; /* Set fixed height for card-text */
  overflow: hidden; /* Hide overflow text */
}
.custom-card .btn {
  font-size: 14px; /* Adjust button font size */
  padding: 8px 10px; /* Adjust button padding */
  text-transform: none; /* Prevent uppercase for button text */
  transition: background-color 0.3s ease;
  border: none;
}

.scrolling-container {
  animation: scroll 25s linear infinite; /* Adjust duration and timing function as needed */
}

.image-scroll {
  margin: 90px 0px;
}

.image-scroll img {
  max-width: 100%;
  height: auto;
}

.inactive-button-style {
  background-color: #6c757d; /* Grey background color */
  color: #fff; /* Grey text color */
  cursor: not-allowed; /* Change cursor to not-allowed */
  border-radius: 7.000000002px;
  max-width: 306.000000077px;
  font-weight: 500;
  font-size: 13px;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%); /* Adjust the percentage to scroll */
  }
}

/* Ensure images are responsive */
.scrolling-container img {
  max-width: 100%;
  height: auto;
}

@media (max-width: 680px) {
  .nav {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 0px;
    // background: #201f1f;
  }
  .header-text h1 {
    font-size: 30px;
    margin-top: 30px;
  }
  .header-text h2 {
    font-size: 20px;
  }
  .header-text h3 {
    font-size: 20px;
    margin-top: 20px;
  }
  .header-subText {
    font-size: 1rem;
    margin-bottom: 12px;
  }
  .custom-Header h2 {
    font-size: 28px;
    line-height: 43px;
  }
  .svg-1 {
    margin-left: -35px;
  }
  .svg-2 {
    margin-left: -30px;
  }
  .custom-card {
    width: 100%;
  }
}
</style>
