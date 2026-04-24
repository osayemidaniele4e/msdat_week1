import mutations from './mutations';
import actions from './actions';
import getters from './getters';

// helper to safely parse JSON
const safeJSONParse = (value, fallback = null) => {
  if (!value || value === 'undefined') return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const composedData = sessionStorage.getItem('composedData');
const SurveyArray = sessionStorage.getItem('surveyArray');
const SectionsArray = sessionStorage.getItem('sectionsArray');
const dashboardDetails = localStorage.getItem('dashboardDetails');
const customDashboard = localStorage.getItem('customDashboardStatus') || false;
const embedUrl = sessionStorage.getItem('embedUrl');
const setEmbedUrlTitle = sessionStorage.getItem('setEmbedUrlTitle');
const setEmbedIframeTitle = sessionStorage.getItem('setEmbedIframeTitle');
const setEmbedDashboardDesc = sessionStorage.getItem('setEmbedDashboardDesc');
const embedIframe = sessionStorage.getItem('embedIframe');
const embedUrlTitle1 = sessionStorage.getItem('embedUrlTitle');
const embedIframeTitle2 = sessionStorage.getItem('embedIframeTitle');

const store = {
  state: {
    loader: {
      show: false,
      indicator: false,
      datasource: false,
      levels: false,
      years: false,
    },
    allSelected: false,
    step: 1,
    customDashboard: safeJSONParse(customDashboard, false),
    dashboardMode: localStorage.getItem('dashboardMode') || 'standard',
    dashboardDetails: safeJSONParse(dashboardDetails, {}),
    rmnchs: [],
    masterData: safeJSONParse(composedData, []),
    SurveyArray: safeJSONParse(SurveyArray, []),
    notes: [],
    visibility: 'private',
    editMode: false,
    ArrangedSections: safeJSONParse(SectionsArray, [
      {
        id: 0, name: 'Indicator Overview', active: false, isShow: false,
      },
      {
        id: 1, name: 'Zonal analysis', active: false, isShow: false,
      },
      {
        id: 2, name: 'Indicator Comparison', active: false, isShow: false,
      },
      {
        id: 3, name: 'Dataset Comparison', active: false, isShow: false,
      },
      {
        id: 4, name: 'Multi-source Comparison', active: false, isShow: false,
      },
    ]),
    dashboardRequest: {},
    publicDashboard: false,
    allPublicDashboards: [],
    selectedIndicators: [],
    embeddedUrl: safeJSONParse(embedUrl, ''),
    setNewEmbedUrlTitle: safeJSONParse(setEmbedUrlTitle, ''),
    setNewEmbedIframeTitle: safeJSONParse(setEmbedIframeTitle, ''),
    setNewEmbedDashboardDescription: safeJSONParse(setEmbedDashboardDesc, ''),
    embeddedIframe: safeJSONParse(embedIframe, ''),
    embeddedUrlTitle: safeJSONParse(embedUrlTitle1, ''),
    embeddedIframeTitle: safeJSONParse(embedIframeTitle2, ''),
    embedUrl: '',
    embedUrlTitle: '',
    embedIframe: '',
    embedIframeTitle: '',
    allDataSources: [],
    selectedLevels: [],
    selectedYears: [],
  },

  mutations,
  actions,
  getters,
};

export default store;
