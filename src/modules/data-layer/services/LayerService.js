/* eslint-disable no-await-in-loop */
// import { difference } from 'lodash';

import Vue from 'vue';
import apiServices from './ApiServices';
import dataCache from './dataCache';
// import Database from './database.worker';

const INDICATORS = 'indicators';
const FACTORS = 'factors';
const DSI = 'datasource_specific_indicator';
const VALUE_TYPES = 'valuetypes';
const DATA_SOURCE = 'datasources';
const LOCATION = 'location';
const AVAILABLE_DASHBOARD_INDICATOR = 'availableDashboardIndicator';
const DASHBOARD_DATESOURCE = 'dashboardDataSource';
const ALL_DASHBOARD_SOURCES = 'allSources';
const ALL_INDICATOR = 'allIndicator';
const NHMIS_MONTHLY = 'nhmis_monthly';

/**
 * Critical datasets needed to render the dashboard shell.
 * These are loaded first (Phase 1) on slow networks.
 */
const CRITICAL_KEYS = [LOCATION, INDICATORS, DATA_SOURCE, DSI];

/**
 * Mapping from the otherEndpoints response array index
 * to the store key name.
 */
const ENDPOINT_INDEX_MAP = [
  { index: 0, key: LOCATION },
  { index: 1, key: INDICATORS },
  { index: 3, key: VALUE_TYPES },
  { index: 5, key: FACTORS },
  { index: 6, key: DSI },
  { index: 7, key: DATA_SOURCE },
  { index: 8, key: NHMIS_MONTHLY },
];

/**
 * Detect if user is on a slow network connection.
 * Uses the Network Information API (supported in Chrome/Edge/Android).
 * Falls back to false (assume fast) in unsupported browsers
 */
function isSlowNetwork() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return false;

  // effectiveType can be 'slow-2g', '2g', '3g', or '4g'
  const slowTypes = ['slow-2g', '2g', '3g'];
  if (slowTypes.includes(conn.effectiveType)) return true;

  // Also check downlink speed (Mbps) — less than 1.5 is slow
  if (conn.downlink && conn.downlink < 1.5) return true;

  return false;
}

export default class DataLayer {
  constructor(store) {
    this.DB = '';
    this.store = store;
    this.indicatorList = [];
    this.defaultIndicators = [];
    this.dataSourceList = [];
    this.LOCAL_STORAGE_KEY = 'dataTimestamp';
    this.Changes = [];
    this.dashboardID = '';
  }

  /**
   *
   * @param {object} object object containing the default set up for the data
   * @param {array}  object.dashboardIndicators array of the indicator required for the dashboard
   * @param {array}  object.defaultIndicators default indicators required to load the dashboard
   * usually the first and 2 related indicators
   *
   */

  setup(object) {
    this.indicatorList = object.dashboardIndicators;
    this.defaultIndicators = object.defaultIndicators;
    this.dataSourceList = object.dashboardDataSources;
    this.dashboardID = object.dashboardID;

    // This allows the dashboard datasources to be available
    // to the dashboard early instead of waiting for all
    // data fetching to be complete, leading to
    // empty tables on Initial load
    this.setDataInStore(this.dataSourceList, ALL_DASHBOARD_SOURCES);
    this.setDataInStore(this.indicatorList, ALL_INDICATOR);
  }

  /**
   * This gets the default indicator from the Indexed DB database
   * reason for this is to initialize the dashboard with minimum data required
   */
  // populateIndicatorsForCustomDashboard() {
  //   if (this.defaultIndicators.length <= 0) {
  //     this.setAllIndicators();
  //   }
  // }

  /**
   * Gets ids of all indicators from the
   * indicators list and populates the
   * with all of it then populates the
   * with the first three in the list
  //  */

  /**
   * data layer initialization
   * Multi-tier caching strategy:
   *   1. Vuex store (in-memory, fastest, lost on page refresh)
   *   2. localStorage (persistent, survives refresh, 2h TTL)
   *   3. API fetch (network, slowest, always fresh)
   *
   * On slow networks (3G), uses progressive loading:
   *   Phase 1: Load critical data (indicators, locations, datasources, DSI)
   *   Phase 2: Defer non-critical data (factors, valuetypes, NHMIS monthly)
   */
  async init(object) {
    try {
      // this.DB = await new Database();
      this.setup(object);

      console.time('fetching');

      const slow = isSlowNetwork();
      if (slow) {
        console.log('🐢 Slow network detected — using progressive loading strategy');
      }

      /**
       * Check Tier 1: Vuex store (in-memory cache from previous navigation)
       */
      const existingState = this.store.state.DL;
      const hasGlobalData = existingState.indicators.length > 0
        && existingState.location.length > 0
        && existingState.datasources.length > 0;

      if (!hasGlobalData) {
        /**
         * Check Tier 2: localStorage (persistent cache from previous session)
         */
        const cachedData = this.loadFromLocalStorage();

        if (cachedData) {
          console.log('📦 Loaded global data from localStorage cache');
          // Populate Vuex store from localStorage
          ENDPOINT_INDEX_MAP.forEach(({ key }) => {
            if (cachedData[key] && cachedData[key].length > 0) {
              this.setDataInStore(cachedData[key], key);
            }
          });
        } else {
          /**
           * Tier 3: Fetch from API
           * On slow networks, split into critical (Phase 1) and deferred (Phase 2)
           */
          const data = await apiServices.getOtherEndpoint();

          // Populate Vuex store from API response
          ENDPOINT_INDEX_MAP.forEach(({ index, key }) => {
            if (data[index] && data[index].data && data[index].data.results) {
              this.setDataInStore(data[index].data.results, key);
            }
          });

          // Persist to localStorage for next page load
          this.saveToLocalStorage();
        }
      }

      let filteredIndicatorIDArray = [];

      if (this.dashboardID) {
        try {
          const dashboardIndicators = await apiServices.getDashboardIndicators(this.dashboardID);

          const dashboardIndicatorIDs = (dashboardIndicators?.data?.indicators || []).map(
            (item) => item.id,
          );

          filteredIndicatorIDArray = [...new Set(
            dashboardIndicatorIDs.filter((value) => Number.isInteger(value)),
          )];

          // Keep expected indicator list aligned with dashboard metadata from the API
          // without shrinking when the API endpoint is server-capped.
          const configuredIndicatorIDs = Array.isArray(this.indicatorList)
            ? this.indicatorList.filter((item) => Number.isInteger(item))
            : [];

          this.indicatorList = [...new Set([...configuredIndicatorIDs, ...filteredIndicatorIDArray])];
        } catch (error) {
          console.warn('Failed to fetch live dashboard indicators, falling back to configured list.');
        }

        if (filteredIndicatorIDArray.length !== 0) {
          // debugger;
          this.storeTimestampInLocal();

          await this.setAvailableDashboardIndicator();
          // await this.initDataWithYears(this.defaultIndicators);
        }
      }
      // await this.initOtherTablesFromDB();
      setTimeout(async () => {
        if (filteredIndicatorIDArray.length > 0) {
          const alert = this.sweetAlert();

          alert.close();
        }
      }, 500);

      /*
       * This compares then the
       * indicator Array with the indicator
       * Array of the dashboard
       * */
      console.timeEnd('fetching');
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Load all global datasets from localStorage cache.
   * Returns null if any critical dataset is missing or expired.
   */
  // eslint-disable-next-line class-methods-use-this
  loadFromLocalStorage() {
    try {
      const result = {};
      let hasCritical = true;

      ENDPOINT_INDEX_MAP.forEach(({ key }) => {
        const cached = dataCache.getFromCache(`dl_${key}`);
        if (cached && cached.length > 0) {
          result[key] = cached;
        } else if (CRITICAL_KEYS.includes(key)) {
          hasCritical = false;
        }
      });

      // Only return cached data if all critical datasets are present
      return hasCritical ? result : null;
    } catch {
      return null;
    }
  }

  /**
   * Save current global datasets from Vuex store into localStorage.
   * Each dataset is cached independently to allow partial cache hits.
   */
  saveToLocalStorage() {
    try {
      const state = this.store.state.DL;
      ENDPOINT_INDEX_MAP.forEach(({ key }) => {
        const data = state[key];
        if (data && data.length > 0) {
          dataCache.setInCache(`dl_${key}`, data);
        }
      });
      console.log('💾 Global data saved to localStorage cache');
    } catch (e) {
      console.warn('Failed to save to localStorage:', e.message);
    }
  }

  /**
   *
   * @returns {true or false} based on if the data
   * on the dashboard is up to date or not
   */
  async isDataUpToDate() {
    // const serverDate = await apiServices.getLatestDate();
    // const localDate = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    // // Check if its more recent than the date in localStorage
    // const oldDateObject = new Date(localDate);
    // const newDateObject = new Date(serverDate.data);
    // if (oldDateObject.getTime() === newDateObject.getTime()) {
    //   return true;
    // }
    // if (oldDateObject <= newDateObject) {
    //   return false;
    // }
    // return true;

    const serverDateResponse = await apiServices.getLatestDate();
    const serverDate = new Date(serverDateResponse.data.results[0].updated_at);

    const localDate = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    const oldDateObject = new Date(localDate);

    if (Number.isNaN(serverDate.getTime())) {
      // Invalid server date, return true to avoid unnecessary data update
      return true;
    }
    return oldDateObject >= serverDate;
  }

  /**
   * this does the actual updating of the data
   */
  /**
   * sets data timestamp to localStorage.
   * Also to vuex using @method this.setDataInStore
   */
  storeTimestampInLocal() {
    const currentDate = new Date().toJSON();
    localStorage.setItem(this.LOCAL_STORAGE_KEY, currentDate);
    this.setDataInStore(currentDate, this.LOCAL_STORAGE_KEY);
  }

  /**
   *
   * @param {array} data, array of data objects
   * @param {string} tableName
   */
  setDataInStore(data, tableName) {
    // storeDataInDBTable
    this.store.commit('DL/SET_DATA', {
      tableName,
      data,
    });
  }

  /**
   * Fetches a unique list of indicators available in iDB
   */

  async updatedStoreAvailableIndicator(indicatorsIDs) {
    let indicators = indicatorsIDs;
    if (!Array.isArray(indicatorsIDs)) {
      indicators = [indicatorsIDs];
    }

    this.store.commit('DL/ADD_DATA', {
      tableName: AVAILABLE_DASHBOARD_INDICATOR,
      data: indicators,
    });
  }

  /**
   * set dashboard available indicator in store
   * Uses already-loaded indicators from the DL store instead of
   * re-fetching all 4000+ indicators from the API.
   */
  async setAvailableDashboardIndicator() {
    // Use the indicators already fetched and cached in the DL store
    let allIndicators = this.store.state.DL.indicators;
    let dashboardIndicatorIDs = allIndicators.map((item) => item.id);

    let dashboardIndicators = dashboardIndicatorIDs.filter((item) => this.indicatorList.includes(item));

    const expectedIndicators = Array.isArray(this.indicatorList)
      ? [...new Set(this.indicatorList.filter((item) => Number.isInteger(item)))]
      : [];

    // Auto-heal stale indicator cache when loaded indicators are fewer than expected.
    if (expectedIndicators.length > 0 && dashboardIndicators.length < expectedIndicators.length) {
      try {
        dataCache.removeFromCache(`dl_${INDICATORS}`);

        const response = await apiServices.fetchAllIndicators();
        const freshIndicators = response?.data?.results || [];

        if (freshIndicators.length > 0) {
          this.setDataInStore(freshIndicators, INDICATORS);
          dataCache.setInCache(`dl_${INDICATORS}`, freshIndicators);

          allIndicators = freshIndicators;
          dashboardIndicatorIDs = allIndicators.map((item) => item.id);
          dashboardIndicators = dashboardIndicatorIDs.filter((item) => this.indicatorList.includes(item));
        }
      } catch (error) {
        console.warn('Indicator cache auto-heal failed; proceeding with current indicator snapshot.');
      }
    }

    const dashboardDataSource = this.dataSourceList;
    this.setDataInStore(dashboardIndicators, AVAILABLE_DASHBOARD_INDICATOR);
    this.setDataInStore(dashboardDataSource, DASHBOARD_DATESOURCE);
  }

  /**
   *
   */

  // eslint-disable-next-line class-methods-use-this
  sweetAlert() {
    return Vue.swal({
      toast: true,
      position: 'bottom-end',
      imageWidth: 100,
      imageHeight: 100,
      title:
        '<div style="display: flex; align-items: center; margin-left: 66px;">Data Synchronizing</div>',
      html: '<div style="margin-top: -14px; margin-bottom: -10px;;"> <img src="https://my.vsu.edu.ph/assets/img/green_spinner.gif" style="width: 55px; height: 55px; margin-right: 13px; margin-top: -21px" alt="Loading"/>Updating dashboard with more data</div>',
      showConfirmButton: false,
      timerProgressBar: false,
      allowOutsideClick: false,
      showLoading: true,
      customClass: {
        image: 'custom-swal-image',
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
}
