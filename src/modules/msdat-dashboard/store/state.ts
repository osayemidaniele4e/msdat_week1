/* eslint-disable no-shadow */

import { MutationTree } from 'vuex';
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

const state: State = {
  // ***** Auther: Ghufran Ahmed
  indicatorComparision: false,
  zonalAnalysis: false,
  selectedState: '',
  indicatorComparsionByPeriod: false,
  multisourceComparison: false,
  datasetComperision: false,
  dynamicDashboard: false,
  default: {
    indicator: 7,
    datasource: 6,
    location: 1,
    year: null,
  },
  controlConfig: [],
  selectedConfigurations: {
    indicator: null,
    dataSource: null,
    period: null,
    allDataSources: null,
    allYears: null,
  },
  configObject: {},
  loading: true,
  isGenerating: false,
  isTypingEffect: false,
  isResponding: false,
  conversationHistory: [],
  selectedSection: 'Indicator Overview',
  selectedSectionIndex: '0',
  location: 'Nigeria',
  showDataSourceList: false,
  showWhatsNew: false,
  showShareSection: false,
  dashboards: [],
  indicatorDatasources: [],
  urlDatasource: 1,
  urlLocation: 1,
  urlPeriod: '2023',
  funFact: '',
};

export default state;
