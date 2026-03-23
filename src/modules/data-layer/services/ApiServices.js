import axiosInstance, { noHeadersInstance, authInstance } from '@/plugins/axios';
import apiEndpoints from '../config/endpoint';

const getDashboard = async () => axiosInstance.get(apiEndpoints.getDashboard);
const getDashboardById = async (id) => axiosInstance.get(apiEndpoints.getDashboardById + id);
const getUpdatedData = async (theDate) =>
  axiosInstance.get(`${apiEndpoints.getUpdatedDataDate}?datetime=${theDate}`);
const getSingleIndicator = async (indicator) =>
  axiosInstance.get(`${apiEndpoints.getData}?indicator=${indicator}`);
const getRequiredEndpoint = async (apiEndpoint) => axiosInstance.get(`/${apiEndpoint}`);
const getLatestDate = async () => axiosInstance.get('data/?ordering=-updated_at&size=1');
const getIndicatorsWithAvailable = async (indicatorID) =>
  axiosInstance.get(`indicators/${indicatorID}/years_available/`);
const getIndicatorsWithPeriod = async (indicatorID, period) =>
  axiosInstance.get(`${apiEndpoints.getData}indicator=${indicatorID}&period=${period}`);
const getAllDataSources = async () => axiosInstance.get('datasources');
const getSingleIndicatorObj = async (indicatorID) => axiosInstance.get(`indicators/${indicatorID}`);
const getSingleDataSourceObj = async (datasourcesID) =>
  axiosInstance.get(`datasources/${datasourcesID}`);
const getSingleLocationObj = async (locationID) => axiosInstance.get(`location/${locationID}`);
const getFactors = async () => axiosInstance.get('/factors/');
const getSpecificIndicator = async () => axiosInstance.get('/datasource_specific_indicator/');
const getDashboardDatasources = async (indicatorID) =>
  axiosInstance.get(`/dashboards/${indicatorID}/datasources/`);
const getIndicatorTableData = async (indicatorID, datasourceId, valueType, location) =>
  axiosInstance.get(
    `${apiEndpoints.getTableData}indicator=${indicatorID}&location=${location}&datasource=${datasourceId}&ordering=-created_at&value_type=${valueType}`
  );
const getSpecificDashboard = async (dashboardName) =>
  axiosInstance.get(`/dashboards/?name=${dashboardName}`);
const getDashboardIndicator = async (dashboardID) =>
  axiosInstance.get(`/dashboards/${dashboardID}/indicators/`);
const getIndicatorDatasources = async (indicatorID) =>
  axiosInstance.get(`indicators/${indicatorID}/datasources/`);
const getDataObj = async (obj) =>
  axiosInstance.get(`data/?size=2000&indicator=${obj.indicatorID}&datasource=${obj.datasourceID}`);

const getAllDataObj = async (obj) =>
  axiosInstance.get(
    `data/?size=2000&indicator=${obj.indicatorID}&datasource=${obj.datasourceID}&period=${obj.period}`
  );
const getNHMISData = async (obj) =>
  axiosInstance.get(
    `data/?size=2000&indicator=${obj.indicator}&datasource=30&value_type=5&period=${obj.period}`
  );
const getAllNHMISData = async (obj) =>
  axiosInstance.get(
    `data/?size=5000&indicator=${obj.indicator}&datasource=30&value_type=5&location=1`
  );
const getNHMISDataObj = async (obj) =>
  axiosInstance.get(
    `data/?size=2000&indicator=${obj.indicator}&datasource=${obj.datasource}&ordering=-created_at&location=1`
  );
const getWhatsNew = async () => axiosInstance.get('news/updates/?size=1000');
const saveWhatsNew = async (data) => authInstance.post('news/updates/', data);
const tagIndicator = async (data) => authInstance.post('tags/', data);
const getTags = async () => axiosInstance.get('tags/');
const saveCustomDashboard = async (data) => axiosInstance.post('custom-dashboard/', data);
const getSingleCustomDashboard = async (id) => axiosInstance.get(`custom-dashboard/${id}`);
const getCustomDashboard = async () => axiosInstance.get('custom-dashboard/');
const fetchAllDataSources = async () => axiosInstance.get('datasources/?size=100');
const fetchAllCoverageLevels = async (id) =>
  axiosInstance.get(`datasource_specific_indicator/${id}`);
const fetchAllIndicators = async () => axiosInstance.get('indicators/?size=4000');
const fetchAllLocation = async () => axiosInstance.get('location/?size=1000');
const getTriangulation = async (obj) => {
  const params = new URLSearchParams({
    primary_datasource: obj.primary,
    secondary_datasource: obj.secondary,
  });

  // Add optional parameters if they exist
  if (obj.optional) params.append('third_datasource', obj.optional);
  if (obj.selectedIndicator) params.append('indicator_id', obj.selectedIndicator);
  if (obj.selectedLocation) params.append('location_id', obj.selectedLocation);

  return noHeadersInstance.get(`triangulation_dashboard/?${params.toString()}`);
};
const getFunFact = async (payload) => {
  const response = await fetch(
    'https://n8n.e4eweb.space/webhook/99f746a7-2f1b-435a-aaaa-32096bb5baca',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Webhook error ${response.status}: ${text}`);
  }

  const data = await response.json(); // ✅ await once

  return data;
};

const getAiIndicatorsSuggestions = async (payload) => {
  const response = await fetch(
    'https://n8n.e4eweb.space/webhook/0bd06292-e8c8-433b-9c2d-89ba64006845',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Webhook error ${response.status}: ${text}`);
  }

  const data = await response.json(); // ✅ await once

  return data;
};

const getDataWithPeriod = async (obj) => {
  const { indicator, datasource, location, value_type, period } = obj || {};

  // only fire request if all required props are truthy and not just empty strings
  if (
    [indicator, datasource, location, value_type, period].every(
      (val) => val !== undefined && val !== null && val.toString().trim() !== ''
    )
  ) {
    return axiosInstance.get(
      `data/?size=3000&indicator=${indicator}&datasource=${datasource}&location=${location}&value_type=${value_type}&period=${period}`
    );
  }

  // do nothing if validation fails
  return;
};

// const getDataWithPeriod = async (obj) =>
//   axiosInstance.get(
//     `data/?size=3000&indicator=${obj.indicator}&datasource=${obj.datasource}&location=${obj.location}&value_type=${obj.value_type}&period=${obj.period}`
//   );
// const getZonalData = async (obj) => axiosInstance.get(`data/?size=3000&indicator=${obj.indicator}&datasource=${obj.datasource}&period=${obj.period}`);
const getZonalData = async (obj) => {
  const { indicator, datasource, period } = obj || {};

  // fire request only when all props are valid
  if (indicator && datasource && period) {
    return axiosInstance.get(
      `data/?size=3000&indicator=${indicator}&datasource=${datasource}&period=${period}`
    );
  }

  // do nothing if validation fails
  return;
};
const getZonalData2 = async (obj) =>
  axiosInstance.get(
    `data/?size=3000&indicator=${obj.indicator}&datasource=${obj.datasource}&period=${obj.period}&location=${obj.location}`
  );

const getDataByDatasource = async (dataSourceID) =>
  axiosInstance.get(`data/?size=3000&datasource=${dataSourceID}`);
const getPeriodByDatasource = async (dataSourceID) =>
  axiosInstance.get(`period-data/?datasource=${dataSourceID}`);

const getPeriod = async (obj) => {
  const { datasource, indicator, location } = obj || {};

  if ([datasource, indicator, location].every((val) => Number.isInteger(val))) {
    return axiosInstance.get(
      `period-data/?datasource=${datasource}&indicator=${indicator}&location=${location}`
    );
  }

  // do nothing if validation fails
  return;
};

// const getPeriod = async (obj) =>
//   axiosInstance.get(
//     `period-data/?datasource=${obj.datasource}&indicator=${obj.indicator}&location=${obj.location}`
//   );
const getPeriodWithoutLocation = async (obj) =>
  axiosInstance.get(`period-data/?datasource=${obj.datasource}&indicator=${obj.indicator}`);
const getLocations = async (obj) => {
  const { datasource, indicator } = obj;

  // Block if either contains a dash (-)
  if (String(datasource).includes('-') || String(indicator).includes('-')) {
    throw new Error('Request blocked: datasource or indicator contains a hyphen (-).');
  }

  return axiosInstance.get(`location-data/?datasource=${datasource}&indicator=${indicator}`);
};
const getIndicatorDataSources = async (indicatorID) =>
  axiosInstance.get(`indicator-data/datasources/${indicatorID}`);
const getDataSourceIndicators = async (dataSourceID) =>
  axiosInstance.get(`datasource-data/indicators/${dataSourceID}`);

// https://msdat-api.fmohconnect.gov.ng/api/data/?size=1000&indicator=7

const otherEndpoints = [
  apiEndpoints.getLocation,
  apiEndpoints.getIndicator,
  apiEndpoints.getLHL,
  apiEndpoints.getValueType,
  apiEndpoints.getLinks,
  apiEndpoints.getFactors,
  apiEndpoints.getDSI,
  apiEndpoints.getDataSource,
  apiEndpoints.getNhmisMonthly,
];

const getOtherEndpoint = async () =>
  Promise.all(otherEndpoints.map((endpoint) => getRequiredEndpoint(endpoint)));
const getDataWithValueType = async (obj) =>
  axiosInstance.get(
    `data/?size=3000&indicator=${obj.indicator}&datasource=${obj.datasource}&location=1&value_type=${obj.value_type}`
  );
const getParentData = async (obj) =>
  axiosInstance.get(
    `data/?size=3000&indicator=${obj.indicator}&datasource=${obj.datasource}&location=${obj.location}&period=${obj.period}`
  );

const getDashboardData = async (id, obj) => {
  if (id !== null && id !== undefined) {
    const params = new URLSearchParams({ caching: true });

    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    return axiosInstance.get(`dashboard-data/${id}/?${params.toString()}`);
  }
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  return axiosInstance.get(`data/?${params.toString()}`);
};

const getDashboardIndicators = async (dashboardID) =>
  axiosInstance.get(`dashboard-data/indicators/${dashboardID}/`);

export default {
  otherEndpoints,
  // getLastUpdatedDate,
  getSingleIndicator,
  getRequiredEndpoint,
  getDashboard,
  getUpdatedData,
  getOtherEndpoint,
  getLatestDate,
  getIndicatorsWithAvailable,
  getIndicatorsWithPeriod,
  getDashboardById,
  getAllDataSources,
  getSingleIndicatorObj,
  getFactors,
  getSpecificIndicator,
  getDashboardDatasources,
  getSingleDataSourceObj,
  getIndicatorTableData,
  getSpecificDashboard,
  getDashboardIndicator,
  getIndicatorDatasources,
  getDataObj,
  getAllDataObj,
  getNHMISDataObj,
  getNHMISData,
  getAllNHMISData,
  getWhatsNew,
  saveWhatsNew,
  saveCustomDashboard,
  getSingleCustomDashboard,
  getCustomDashboard,
  fetchAllDataSources,
  fetchAllIndicators,
  fetchAllLocation,
  getTriangulation,
  getSingleLocationObj,
  getDataWithPeriod,
  getDataWithValueType,
  getParentData,
  getZonalData,
  getZonalData2,
  getDataByDatasource,
  getPeriodByDatasource,
  getPeriod,
  getLocations,
  getIndicatorDataSources,
  getDataSourceIndicators,
  getDashboardData,
  getPeriodWithoutLocation,
  getDashboardIndicators,
  fetchAllCoverageLevels,
  tagIndicator,
  getTags,
  getFunFact,
  getAiIndicatorsSuggestions,
};
