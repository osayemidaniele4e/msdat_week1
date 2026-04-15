import { MutationTree } from 'vuex';
import { clone, cloneDeep } from 'lodash';
import { State, ControlPanelConfig } from '../types/index';

type setOptionsPayload = {
  panelIndex: number;
  groupIndex: number;
  key: string;
  values: [] | string | number;
};
type setPayload = {
  controlIndex: number;
  groupIndex: number;
  key: string;
  value: [] | string | number;
};

type PayloadEntry = Record<string, any>;

const isPayloadEntry = (payload: unknown): payload is PayloadEntry =>
  typeof payload === 'object' && payload !== null;

const normalizePayloadValue = (currentValue: unknown, nextValue: unknown) => {
  if (Array.isArray(currentValue)) {
    return Array.isArray(nextValue) ? nextValue : [nextValue];
  }

  return nextValue;
};

const writePayloadValue = (payload: unknown, obj: setPayload) => {
  if (!isPayloadEntry(payload)) return;

  payload[obj.key] = normalizePayloadValue(payload[obj.key], obj.value);
};

const updateControlPayload = (state: State, obj: setPayload) => {
  const controlPanel = state.controlConfig?.[obj.controlIndex];

  if (!controlPanel || controlPanel.payload === null) return;

  if (Array.isArray(controlPanel.payload)) {
    const groupedPayload = controlPanel.payload?.[obj.groupIndex];

    if (groupedPayload !== undefined) {
      writePayloadValue(groupedPayload, obj);
      return;
    }

    controlPanel.payload.forEach((payloadItem) => {
      writePayloadValue(payloadItem, obj);
    });
    return;
  }

  writePayloadValue(controlPanel.payload, obj);
};

const updateControlPayload2 = (state: State, obj: setPayload) => {
  const controlPanel = state.controlConfig?.[obj.controlIndex];

  if (!controlPanel || controlPanel.payload === null) return;

  if (Array.isArray(controlPanel.payload)) {
    const groupedPayload = controlPanel.payload?.[obj.groupIndex];

    if (groupedPayload !== undefined) {
      writePayloadValue(groupedPayload, obj);
      return;
    }

    controlPanel.payload.forEach((payloadItem) => {
      writePayloadValue(payloadItem, obj);
    });
    return;
  }

  writePayloadValue(controlPanel.payload, obj);
};

export type Conversation = {
  user: boolean;
  message: string;
};

const mutations: MutationTree<State> = {
  SET_ISGENERATING: (state, payload) => {
    state.isGenerating = payload;
  },
  SET_ISRESPONDING: (state, payload) => {
    state.isResponding = payload;
  },
  SET_ISTYPINGEFFECT: (state, payload) => {
    state.isTypingEffect = payload;
  },
  SET_CONVERSATION: (state, payload) => {
    state.conversationHistory = [payload];
  },
  SET_SECTION_INDEX: (state, payload) => {
    state.selectedSectionIndex = payload;
  },

  POP_LAST: (state) => {
    state.conversationHistory = [...state.conversationHistory.slice(0, -1)];
  },
  PUSH_CONVERSATION: (state, payload: Conversation) => {
    state.conversationHistory = [...state.conversationHistory, payload];
  },
  CLEAR_CONVERSATION: (state) => {
    state.conversationHistory = [];
  },
  SET_INITIAL: (state, payload) => {
    state.default.indicator = payload.indicator;
    state.default.datasource = payload.datasource;
    state.default.location = payload.location;
  },
  setSelectedState(state, payload) {
    state.selectedState = payload;
  },
  /**
   * This just set the Option on the state for all the defaults
   * @param {*} payload The payload for the data values
   * @param {*} payload.panelIndex this get th index of the current control panel you want
   * to change the options
   * @param {*} payload.controlIndex this actual control
   * @param {*} payload.values The data you wish to change
   */
  SETUP_CONTROL_OPTIONS: (state, payload) => {
    state.controlConfig[payload.panelIndex].setup[payload.controlIndex].options = payload.values;
  },

  SETUP_CONTROL_OPTIONS1: (state, obj: setOptionsPayload) => {
    const checkTheObject = state.controlConfig[obj.panelIndex].setup[0];
    if (Array.isArray(checkTheObject)) {
      const setUpArrayOfObject = state.controlConfig[obj.panelIndex].setup[obj.groupIndex];
      const keyIndex = setUpArrayOfObject.findIndex((option) => option.key === obj.key);
      state.controlConfig[obj.panelIndex].setup[obj.groupIndex][keyIndex].options = obj.values;
    } else {
      const keyIndex = state.controlConfig[obj.panelIndex].setup.findIndex(
        (item) => item.key === obj.key
      );
      if (state.controlConfig[obj.panelIndex].setup[keyIndex] !== undefined) {
        state.controlConfig[obj.panelIndex].setup[keyIndex].options = obj?.values;
      }
    }
  },

  /**
   * This just to set default options dropdown on a control panel
   * @param {Array} payload The payload for the data values
   * @param {Number} panelIndex this is the position of the
   * control panel you want to change in the array
   * @param {number} controlIndex the controlIndex you want to change in the panelIndex
   * suggesting that as against to using index to locate the
   * control panel let give each panel and id
   */
  setControlOptions: (
    state,
    { panelIndex, controlIndex, controlIndex2, values, multipleSetup }
  ) => {
    if (multipleSetup) {
      state.controlConfig[panelIndex].setup[controlIndex][controlIndex2].options = values;
    } else {
      state.controlConfig[panelIndex].setup[controlIndex].options = values;
    }
  },

  TOGGLE_VISIBILITY: (state, { panelIndex, key, value }) => {
    // eslint-disable-next-line max-len
    const keyIndex = state.controlConfig[panelIndex].setup.findIndex((item) => item.key === key);
    state.controlConfig[panelIndex].setup[keyIndex].visibility = value;
  },
  // set default on individual control panel
  //   SET_DEFAULT: (state, { controlIndex, key, value }) => {
  //     state.controlConfig[controlIndex].defaults[key] = value;
  //   },
  SET_PAYLOAD: (state, obj: setPayload) => {
    updateControlPayload(state, obj);
  },

  SET_INDICATOR_COMPARISON_PAYLOAD: (state, obj: setPayload) => {
    if (state.controlConfig[2].payload !== null) {
      state.controlConfig[2].payload[obj.key] = [];
      // eslint-disable-next-line no-return-assign, no-param-reassign
      const tempIndicator = [];
      tempIndicator.push(obj.value);
      state.controlConfig[2].payload[obj.key] = tempIndicator;
    }
  },

  SET_ZONAL_DATASOURCE: (state, obj: setPayload) => {
    // Now it's safe to push the value
    state.controlConfig[1].payload[obj.key] = obj.value;
  },

  SET_MULTI_PAYLOAD: (state, obj: setPayload) => {
    if (state.controlConfig[4].payload !== null) {
      // eslint-disable-next-line no-return-assign, no-param-reassign
      state.controlConfig[4].payload.forEach((item) => (item.indicator = obj.value));
    }
  },
  // SET_MULTI_DATASOURCE_PAYLOAD: (state, obj: setPayload) => {
  //   if (state.controlConfig[4].payload !== null) {
  //     // eslint-disable-next-line no-return-assign, no-param-reassign
  //     state.controlConfig[4].payload.forEach((item) => (item.datasource = obj.value));
  //   }
  // },
  SET_DATASET_DATASOURCE_PAYLOAD: (state, obj: setPayload) => {
    const item = state.controlConfig?.[3];
    if (item && item.payload) {
      // eslint-disable-next-line no-param-reassign
      item.payload[obj.key] = [obj.value];
    }
  },

  SET_GIS_MULTI_PAYLOAD: (state, obj: setPayload) => {
    if (state.controlConfig[2].payload !== null) {
      // eslint-disable-next-line no-return-assign, no-param-reassign
      state.controlConfig[2].payload.forEach((item) => (item.indicator = obj.value));
    }
  },

  SET_SECTION: (state, text) => {
    state.selectedSection = text;
  },

  SET_FUN_FACT: (state, text) => {
    state.funFact = text;
  },

  SET_DASHBOARD: (state, dashboards) => {
    state.dashboards = dashboards;
  },

  SET_SECTION_PAYLOAD: (state, obj: setPayload) => {
    updateControlPayload2(state, obj);
  },
  SET_INDICATOR_DATASOURCES: (state, datasources) => {
    state.indicatorDatasources = datasources;
  },

  SET_URL_DATASOURCE: (state, text) => {
    state.urlDatasource = text;
  },
  SET_URL_LOCATION: (state, text) => {
    state.urlLocation = text;
  },
  SET_URL_PERIOD: (state, text) => {
    state.urlPeriod = text;
  },

  SET_LOCATION: (state, text) => {
    state.location = text;
  },

  SET_MULTI_DATASOURCE_PAYLOAD: (state, obj: setPayload) => {
    const item = state.controlConfig?.[4];
    if (item && Array.isArray(item.payload)) {
      // eslint-disable-next-line no-param-reassign
      item.payload.forEach((p) => (p.datasource = obj.value));
    }
  },

  SET_MULTI_LOCATION_PAYLOAD: (state, obj: setPayload) => {
    if (state.controlConfig[4].payload !== null) {
      // eslint-disable-next-line no-return-assign, no-param-reassign
      state.controlConfig[4].payload.forEach((item) => (item.location = obj.value));
    }
  },

  SET_MULTI_PERIOD_PAYLOAD: (state, obj: setPayload) => {
    if (state.controlConfig[4].payload !== null) {
      // eslint-disable-next-line no-return-assign, no-param-reassign
      state.controlConfig[4].payload.forEach((item) => (item.period = obj.value));

      // eslint-disable-next-line no-return-assign, no-param-reassign
      state.controlConfig[4].payload.forEach((item) => (item.year = obj.value));
    }
  },

  SET_IDC_INDICATOR_OPTIONS: (state, obj: setPayload) => {
    state.controlConfig[2].setup[4].options = obj.value;
  },

  // SET_IDC_INDICATOR_PAYLOAD: (state, obj: setPayload) => {
  //   state.controlConfig[2].payload[obj.key].push(obj.value);
  // },

  SET_IDC_INDICATOR_PAYLOAD: (state, obj: setPayload) => {
    // Ensure payload[obj.key] is initialized as an array
    if (!Array.isArray(state.controlConfig[2].payload[obj.key])) {
      state.controlConfig[2].payload[obj.key] = [];
    }

    // Now it's safe to push the value
    state.controlConfig[2].payload[obj.key].push(obj.value);
  },

  SET_GIS_MULTI_DATASOURCE_PAYLOAD: (state, obj: setPayload) => {
    if (state.controlConfig[2].payload !== null) {
      // eslint-disable-next-line no-return-assign, no-param-reassign
      state.controlConfig[2].payload.forEach((item) => (item.datasource = obj.value));
    }
  },
  SET_MULTI_YEAR_PAYLOAD: (state, obj: setPayload) => {
    if (state.controlConfig[4].payload !== null) {
      // eslint-disable-next-line no-return-assign, no-param-reassign
      state.controlConfig[4].payload.forEach((item) => (item.year = obj.value));
    }
  },

  SET_GIS_MULTI_YEAR_PAYLOAD: (state, obj: setPayload) => {
    if (state.controlConfig[2].payload !== null) {
      // eslint-disable-next-line no-return-assign, no-param-reassign
      state.controlConfig[2].payload.forEach((item) => (item.year = obj.value));
    }
  },

  /**
   * This function is used to add configuration to the control panel
   * in other world create a control panel
   * @param {*} payload This should follow the the control panel object formatter
   */
  ADD_CONTROL_PANEL: (state, payload: ControlPanelConfig) => {
    state.controlConfig.push(payload);
  },

  /**
   * i feel this might come in handy some day
   */
  CLEAR_CONTROL_PANEL: (state) => {
    state.controlConfig = [];
  },

  /**
   * Cache the full list of dashboards fetched from the API
   * so subsequent navigations don't require re-fetching.
   */
  SET_DASHBOARDS: (state, payload) => {
    state.dashboards = payload;
  },

  toggleShowDataSourceList: (state) => {
    state.showDataSourceList = true;
  },

  closeShowDataSourceList: (state) => {
    state.showDataSourceList = false;
  },

  toggleShowWhatsNew: (state) => {
    state.showWhatsNew = true;
  },

  closeShowWhatsNew: (state) => {
    state.showWhatsNew = false;
  },

  toggleShowShareSection: (state) => {
    state.showShareSection = true;
  },

  closeShowShareSection: (state) => {
    state.showShareSection = false;
  },

  /**
   * This function is used to set control options
   */
  SET_ALL_CONTROL_OPTIONS: (state, { key, payload }) => {
    state.controlConfig.forEach((controlPanel) => {
      if (controlPanel.setup.length > 0) {
        if (!Array.isArray(controlPanel.setup[0])) {
          controlPanel.setup.forEach((control) => {
            if (control.key === key) {
              // eslint-disable-next-line no-param-reassign
              control.options = payload;
            }
          });
        } else {
          // Taking into consideration the multi-source comparison section
          controlPanel.setup.forEach((control) => {
            control.forEach((groupControl) => {
              if (groupControl.key === key) {
                // eslint-disable-next-line no-param-reassign
                groupControl.options = payload;
              }
            });
          });
        }
      }
    });
  },

  UPDATE_IDC_DATASOURCEs: (state, payload) => {
    state.controlConfig[2].setup[1].options = payload;
  },

  UPDATE_IDC_INDICATORS: (state, payload) => {
    state.controlConfig[2].setup[5].options = payload;
  },

  SET_ALL_CONFIG_RESOURCE(state, { entity, value }) {
    state.controlConfig = state.controlConfig.map((item) => {
      if (!item.payload) return item;

      const currentValue = item.payload[entity];

      return {
        ...item,
        payload: {
          ...item.payload,
          [entity]: Array.isArray(currentValue) ? (Array.isArray(value) ? value : [value]) : value,
        },
      };
    });
  },

  SET_CONFIGURATIONS: (state, payload) => {
    state.configObject = payload;
  },
  SET_SELECTED_CONFIG: (state, payload) => {
    state.selectedConfigurations[`${payload.entity}`] = payload.payload;
  },
  UPDATE_ALL_DATASOURCES: (state, payload) => {
    state.controlConfig.forEach((item) => {
      if (item.label !== 'Multi-Source Comparison' && item.label !== 'Disaggregation') {
        item.setup.forEach((source) => {
          if (source.key === 'datasource') {
            // eslint-disable-next-line no-param-reassign
            source.options = payload;
          }
        });
      }
    });
  },

  SET_ADVANCED_MULTISOURCE_DEFAULT_DATASOURCES: (state, payload) => {
    state.selectedConfigurations.dataSource = payload;
    state.controlConfig.forEach((item) => {
      if (item.label === 'Multi-Source Indicator Comparison') {
        item.payload.forEach((source) => {
          // eslint-disable-next-line no-param-reassign
          source.datasource = payload;
        });
      }
    });
  },

  SET_GIS_MULTISOURCE_DEFAULT_DATASOURCES: (state, payload) => {
    state.selectedConfigurations.dataSource = payload;
    state.controlConfig.forEach((item) => {
      if (item.label === 'Multi-Source Indicator Comparison') {
        item.payload.forEach((source) => {
          // eslint-disable-next-line no-param-reassign
          source.datasource = payload;
        });
      }
    });
  },

  UPDATE_PROGRAM_AREAS: (state, payload) => {
    state.controlConfig.forEach((item) => {
      if (item.label === 'Multi-Source Indicator Comparison') {
        item.payload.forEach((source, index) => {
          if (index === payload.index) {
            // eslint-disable-next-line no-param-reassign
            source.indicator = payload.content.indicators[0];
          }
        });
      }
    });
  },
  UPDATE_LOADING_STATUS: (state) => {
    state.loading = false;
  },
  UPDATE_ALL_YEARS: (state, payload) => {
    state.controlConfig.forEach((item) => {
      if (
        item.label !== 'Multi-Source Comparison' &&
        item.label !== 'Disaggregation' &&
        item.label !== 'Dataset Comparison'
      ) {
        item.setup.forEach((source) => {
          if (source.key === 'year') {
            // eslint-disable-next-line no-param-reassign
            source.options = payload;
          }
        });
      }
    });
  },
  UPDATE_MULTI_YEARS: (state, payload) => {
    state.controlConfig.forEach((item) => {
      if (item.label === 'Multi-Source Comparison') {
        item.setup.forEach((source) => {
          // eslint-disable-next-line no-shadow
          source.forEach((item: { key: string; options: any }) => {
            if (item.key === 'year') {
              // eslint-disable-next-line no-param-reassign
              item.options = payload;
            }
          });
        });
      }
    });
  },
};

export default mutations;
