/* eslint-disable no-param-reassign */

const composedData = sessionStorage.getItem('composedData');
const SurveyArray = sessionStorage.getItem('surveyArray');
const SectionsArray = sessionStorage.getItem('sectionsArray');
const dashboardDetails = localStorage.getItem('dashboardDetails');
const customDashboard = localStorage.getItem('customDashboardStatus') || false;

const forRefreshingAll = (fieldArray) => {
  fieldArray.years.map((year) => {
    if (year.selected === true) {
      year.selected = false;
    }
    return year;
  });
  fieldArray.levels.map((level) => {
    if (level.selected === true) {
      level.selected = false;
    }
    return level;
  });
  return fieldArray;
};

// The Default setting of state
function getDefaultState() {
  return {
    loader: {
      show: false,
      indicator: false,
      datasource: false,
      levels: false,
      years: false,
    },
    allSelected: false,
    // loading: false,
    step: 1,
    customDashboard: JSON.parse(customDashboard),
    dashboardDetails: JSON.parse(dashboardDetails) || {},
    rmnchs: [],
    masterData: JSON.parse(composedData) || [],
    SurveyArray: JSON.parse(SurveyArray) || [],
    notes: [],
    visibility: 'private',
    editMode: false,
    ArrangedSections: SectionsArray
      ? JSON.parse(SectionsArray)
      : [
        {
          id: 0,
          name: 'Indicator Overview',
          active: false,
          isShow: false,
        },
        {
          id: 1,
          name: 'Zonal Analysis',
          active: false,
          isShow: false,
        },
        {
          id: 2,
          name: 'Indicator Comparison',
          active: false,
          isShow: false,
        },
        {
          id: 3,
          name: 'Dataset Comparison',
          active: false,
          isShow: false,
        },
        {
          id: 4,
          name: 'Multi-source Comparison',
          active: false,
          isShow: false,
        },
      ],
    embedUrl: '',
    embedIframe: '',
  };
}

const showLoaderTrue = (sta) => {
  if (
    sta.levels === true
    || sta.indicator === true
    || sta.datasource === true
    || sta.years === true
  ) {
    sta.show = true;
  } else {
    sta.show = false;
  }
};
export default {
  updateStep(state, payload) {
    state.step = payload;
  },

  setDashboardMode(state, payload) {
    localStorage.setItem('dashboardMode', payload);
    state.dashboardMode = payload;
  },

  setUrlEmbed(state, payload) {
    state.embedUrl = payload;
  },
  setUrlEmbedTitle(state, payload) {
    state.embedUrlTitle = payload;
  },
  setIframe(state, payload) {
    state.embedIframe = payload;
  },
  setIframeTitle(state, payload) {
    state.embedIframeTitle = payload;
  },

  resetState(state) {
    Object.assign(state, getDefaultState());
  },
  clearAllData(state, payload) {
    state.masterData = payload;
    state.SurveyArray = payload;
  },

  // Dashboard Details
  dashboardDetails(state, payload) {
    localStorage.setItem('dashboardDetails', JSON.stringify(payload));
    state.dashboardDetails = payload;
  },

  setPArea(state, payload) {
    state.masterData = payload;
  },

  setAllSources(state, payload) {
    state.allDataSources = payload;
  },

  // For Notices
  isNotExistYear(state, payload) {
    state.isNotExistYear.push(payload);
  },

  setLevels(state, payload) {
    state.selectedLevels = payload;
  },

  setYears(state, payload) {
    state.selectedYears = payload;
  },

  // For selection of Single Indicator
  selectionIndicator(state, payload) {
    let found = false;
    state.masterData = state.masterData.map((element) => {
      // forRefreshingAll(payload);
      if (found === false) {
        element.children.map((child) => {
          if (child.id === payload.id) {
            // element.parent.selected = true;
            found = true;
            child.selected = payload.checked;
            if (payload.checked) {
              element.parent.selected = true;
            } else {
              element.parent.selected = false;
            }
            state.notes = [];
            forRefreshingAll(child);
            return child;
          }
          return child;
        });
        const isAnyChildChecked = element.children.some((c) => c.selected === true);
        if (isAnyChildChecked && isAnyChildChecked === true) {
          element.parent.isChildSelected = true;
        } else {
          element.parent.isChildSelected = false;
        }
      }
      // if (counter === 0) {
      //   element.parent.isChildSelected = false;
      //   element.showList = false;
      // }
      if (element.parent.isChildSelected === true) {
        element.showList = true;
      }
      return element;
    });
  },

  // Selecting All the Indicators
  AllselectionIndicator(state, payload) {
    state.masterData = state.masterData.map((element) => {
      element.children.map((child) => {
        if (element.parent.value === payload.name) {
          element.parent.selected = payload.checked;
          element.parent.isChildSelected = payload.checked;
          child.selected = payload.checked;
        }
        element.showList = payload.showList;
        return child;
      });
      return element;
    });
  },

  // ******** Data Source Selection ***************** //

  setDArea(state, payload) {
    state.SurveyArray = payload;
  },

  selectionDataSource(state, payload) {
    state.SurveyArray = state.SurveyArray.map((element) => {
      // eslint-disable-next-line no-unused-vars
      let counter = 0;
      element.children.map((child) => {
        if (child.id === payload.id) {
          child.selected = payload.checked;
        }
        if (payload.checked) {
          // element.parent.selected = true;
          counter = 1;
        } else if (child.selected) {
          counter++;
        }
        return child;
      });
      return element;
    });
  },

  // ******** Indicator Levels ***************** //

  getLevels(state, payload) {
    state.masterData = state.masterData.map((child) => {
      child.children.map((x) => {
        if (payload.id === x.id) {
          x.levels = payload.Datalevels;
        }
        return x;
      });
      return child;
    });
  },

  levelsHandler(state, payload) {
    state.masterData = state.masterData.map((element) => {
      element.children.map((child) => {
        child.levels.map((level) => {
          if (level.value === payload.value) {
            // eslint-disable-next-line no-param-reassign
            level.selected = payload.checked;
          }
          return level;
        });
        return child;
      });
      return element;
    });
  },

  // *************** INDICATOR YEARS *************** //

  getYears(state, payload) {
    state.masterData = state.masterData.map((child) => {
      child.children.map((x) => {
        if (payload.id === x.id) {
          // eslint-disable-next-line no-param-reassign
          x.years = payload.years;
          // x.years.map(year => { year.selected = Math.random() > 0.9 })
        }
        return x;
      });
      return child;
    });
  },

  yearsHandler(state, payload) {
    state.masterData = state.masterData.map((element) => {
      element.children.map((child) => {
        child.years.map((year) => {
          if (year.value === payload.value) {
            year.selected = payload.checked;
          }
          return year;
        });
        return child;
      });
      element.showNotes = payload.showNotes;
      return element;
    });
    let distinctYearsArray = [];
    state.masterData = state.masterData.map((element) => {
      element.children.map((child) => {
        if (child.selected === true) {
          child.years.map((year) => {
            if (year.selected === true) {
              distinctYearsArray.push(year.value);
            }
            return year;
          });
        }
        return child;
      });
      return element;
    });
    distinctYearsArray = [...new Set(distinctYearsArray)];
    const msgs = [];

    state.masterData.map((element) => {
      element.children.map((child) => {
        if (child.selected === true) {
          let yearsDoesnotContain = '';

          // distinctYearsArray.map((distYear) => {

          // });
          const foundData = child.years.find((year) => year.value === payload.value);
          if (foundData === undefined) {
            if (yearsDoesnotContain.length > 0) {
              yearsDoesnotContain += ', ';
            }
            yearsDoesnotContain += payload.value;
          }
          if (yearsDoesnotContain.length > 0) {
            msgs.push(`${child.short_name} has no ${yearsDoesnotContain}`);
          }
          state.notes = msgs;
        }
        return child;
      });
      return element;
    });
  },

  selectedYear(state, payload) {
    state.selectedYears = payload;
  },

  // For Arranging the Sections
  arrangedSections(state, payload) {
    state.ArrangedSections = payload;
  },

  deactivateAllSections(state) {
    state.ArrangedSections.map((element) => {
      element.isShow = false;
      return element;
    });
  },

  dynamicSection(state, payload) {
    // state.ArrangedSections.filter(element => element.name !== payload.checkedField)
    state.ArrangedSections.map((element) => {
      if (element.name === payload.checkedField) {
        // eslint-disable-next-line no-param-reassign
        element.isShow = payload.checked;
      }
      return element;
    });
  },

  customDashboard(state, payload) {
    localStorage.setItem('customDashboardStatus', JSON.stringify(payload));
    state.customDashboard = payload;
  },

  // ******** Select All Data ********* //

  selectAll(state, payload) {
    state.allSelected = payload;
  },
  setEmbedUrl(state, url) {
    state.embeddedUrl = url;
  },
  setNewEmbedUrlTitle(state, title) {
    state.setNewEmbedUrlTitle = title;
  },
  setNewEmbedIframeTitle(state, title) {
    state.setNewEmbedIframeTitle = title;
  },
  setNewEmbedDashboardDescription(state, description) {
    state.setNewEmbedDashboardDescription = description;
  },
  setEmbedIframe(state, iframe) {
    state.embeddedIframe = iframe;
  },
  setEmbedUrlTitle(state, title) {
    state.embeddedUrlTitle = title;
    state.setNewEmbedUrlTitle = title;
  },
  setEmbedIframeTitle(state, title) {
    state.embeddedIframeTitle = title;
    state.setNewEmbedIframeTitle = title;
  },

  // ********* LOADING ********//
  setIndiLoading(state, payload) {
    state.loader.indicator = payload;
    // state.loader.show = payload;
    showLoaderTrue(state.loader);
  },
  setDSLoading(state, payload) {
    state.loader.datasource = payload;
    // state.loader.show = payload;
    showLoaderTrue(state.loader);
  },
  setLevelsLoading(state, payload) {
    state.loader.levels = payload;
    // state.loader.show = payload;
    showLoaderTrue(state.loader);
  },
  setYearsLoading(state, payload) {
    state.loader.years = payload;
    // state.loader.show = payload;
    showLoaderTrue(state.loader);
  },

  setVisibility(state, payload) {
    console.log('state visibility', payload);
    state.visibility = payload;
  },

  setIsPublicDashboard(state, payload) {
    state.isPublicDashboard = payload;
  },
  setAllPublicDashboards(state, payload) {
    state.allPublicDashboards = payload;
  },
  // setshowLoader(state) {
  //   const loader = state.loader;
  //   if (loader.levels === true || loader.indicator === true || loader.datasource === true || loader.years === true) {
  //     loader.show = true;
  //   } else {
  //     loader.show = false;
  //   }
  // }

  // *************** TRACK DASHBOARD EDIT *************** //

  startEdit(state) {
    state.editMode = true;
  },
  endEdit(state) {
    state.editMode = false;
  },
};
