/* eslint-disable camelcase */

interface Config {
  name?: string;
  dashboardDetails?: {
    name: string;
    description: string;
    category: string;
  };
  composedData?: {
    parent: {
      isChildSelected: boolean;
    };
    children: {
      id: number;
      selected: boolean;
    }[];
  }[];
  surveyArray?: {
    children: {
      id: number;
      selected: boolean;
    }[];
  }[];
  sectionsArray?: {
    id: number;
    name: string;
    active: boolean;
    isShow: boolean;
  }[];
}

interface DashboardEntry {
  id: number;
  name: string;
  email: string;
  category: string;
  reason: string | null;
  description: string;
  // eslint-disable-next-line camelcase
  name_of_dashboard: string;
  organization: string | null;
  config: Config | string;
  link: string;
  embedded_url: string | null;
  embedded_iframe: string | null;
  created: string;
}

export interface State {
  indicatorComparision: boolean;
  zonalAnalysis: boolean;
  indicatorComparsionByPeriod: boolean;
  multisourceComparison: boolean;
  datasetComperision: boolean;
  dynamicDashboard: boolean;
  selectedState: any;
  default: Defaults;
  controlConfig: ControlPanelConfig[];
  selectedConfigurations: {
    indicator: Object;
    dataSource: Object;
    period: Object;
    allDataSources: Object;
    allYears: Object;
  };
  configObject: {};
  loading: boolean;
  isGenerating: boolean;
  isTypingEffect: boolean;
  isResponding: boolean;
  conversationHistory: Conversation[];
  selectedSection: string;
  selectedSectionIndex: string;
  location: string;
  showDataSourceList: boolean;
  showWhatsNew: boolean;
  showShareSection: boolean;
  dashboards: DashboardEntry[];
  indicatorDatasources: any[];
  urlDatasource: number;
  urlLocation: number;
  urlPeriod: string;
  funFact: string | null;
}

export type Conversation = {
  user: boolean;
  message: string;
};

export interface SetupObject {
  /**
   * An  example of the setup object.
   * */
  visibility?: boolean;
  type: 'dropdown' | 'checkbox' | 'toggle';
  class?: string[];
  dropdownProps?: object; // an object of the multiselect dropdown,
  label: string;
  key: 'indicator' | 'location' | 'datasource' | 'year' | 'visualization' | 'target' | 'numdenum';
  options: [];
}

export interface ControlPanelConfig {
  /**
   * The name of the control panel.
   * @type {string}
   * */

  label: string;
  setup: Array<SetupObject> | SetupObject[][] | any;
  payload: PayloadObject[] | PayloadObject[][] | null;
}

export interface PayloadObject {
  indicator: object;
  location: object;
  datasource: object;
  year: string;
  compareBy: number;
  visualization: string;
  target: {
    national: Boolean;
    sdg: Boolean;
  };
  numdenum: Boolean;
}

export interface Defaults {
  indicator: number;
  datasource: number;
  location: number;
  year: string | null;
}
