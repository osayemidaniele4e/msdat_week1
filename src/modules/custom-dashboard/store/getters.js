export default {
  showloader(state) {
    return state.loader.show;
  },
  dashboardDetails(state) {
    return state.dashboardDetails;
  },
  dashboardMode(state) {
    return state.dashboardMode;
  },

  getEmbedUrl(state) {
    return state.embeddedUrl;
  },
  getNewEmbedUrlTitle(state) {
    return state.setNewEmbedUrlTitle;
  },
  getNewEmbedIframeTitle(state) {
    return state.setNewEmbedIframeTitle;
  },
  getNewEmbedDashboardDescription(state) {
    return state.setNewEmbedDashboardDescription;
  },
  getUrl(state) {
    return state.embedUrl;
  },
  getUrlTitle(state) {
    return state.embeddedUrlTitle;
  },
  getEmbedIframe(state) {
    return state.embeddedIframe;
  },
  getIframeEmbed(state) {
    return state.embedIframe;
  },
  getIframeEmbedTitle(state) {
    return state.embeddedIframeTitle;
  },

  indicators(state) {
    return state.indicators;
  },

  getRmnchs(state) {
    return state.rmnchs;
  },
  getprogramArea(state) {
    return state.masterData;
  },
  getVisibility(state) {
    return state.visibility;
  },
  notesArea(state) {
    // console.log(state.isNotExistYear);
    return state.notes;
  },

  // IndicatorsShortName(state){
  //   return state.indicatorsShortName;
  // },

  // ******* Data Source Selection ************** //

  dataSource(state) {
    return state.dataSource;
  },
  getDataSource(state) {
    return state.SurveyArray;
  },

  selectedIndicator(state) {
    return state.selectedIndicator;
  },
  selectedDataSource(state) {
    return state.selectedDataSource;
  },
  selectedYears(state) {
    return state.selectedYears;
  },
  selectedLevels(state) {
    return state.selectedLevels;
  },

  // ******* Indicators Levels ************** //

  indicatorsLevels(state) {
    return state.levels;
  },
  indicatorsYear(state) {
    return state.years;
  },

  // Arrangment of Sections
  arrangedSections(state) {
    return state.ArrangedSections;
  },
  customDashboard(state) {
    // const data = state.customDashboard.filter(element => element.isShow)
    return state.customDashboard;
  },

  // Loader Component
  Indicatorloading(state) {
    return state.loader.indicator;
  },
  Datasourceloading(state) {
    return state.loader.datasource;
  },
  Levelsloading(state) {
    return state.loader.levels;
  },
  Yearsloading(state) {
    return state.loader.years;
  },
  editMode(state) {
    return state.editMode;
  },
  isPublicDashboard(state) {
    return state.publicDashboard;
  },

  getAllSources(state) {
    return state.allDataSources;
  },
  getSelectedLevels(state) {
    return state.selectedLevels;
  },
  getSelectedYears(state) {
    return state.selectedYears;
  },
};
