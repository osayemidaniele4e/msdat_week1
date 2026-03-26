import axiosInstance from '@/plugins/axios';
import axios from 'axios';

export default {
  /**
   * @Function to send data and get prediction for the data sent
   * @Author samuel
   * @param {*} commit
   * @param {string} payload
   * @description function to get prediction for data sent
   * @returns {Promise}
   */
  async PREDICTIVE_ANALYSIS({ commit }, payload) {
    console.log(payload, 'DATA@DATA');
    try {
      const { data } = await axiosInstance.post('/data/predictive_analysis/', payload);
      commit('setPredictedData', data);
      console.log(data, 'DATA@');
      return data;
    } catch (error) {
      commit('setError', error);
      return 'Error';
    }
  },

  async getPredictiveAnalysisData({ commit }, payload) {
    try {
      const response = await axios.post(
        'https://n8n.e4eweb.space/webhook/aa428806-7e11-4c09-ab3e-8a813b53eeed',
        payload
      );

      const previous = response.data.Actual.map((item) => [item.period, parseFloat(item.value)]);
      const prediction = Object.entries(response.data.Predicted[0]);

      const resp = {
        previous,
        prediction,
      };

      return resp; // ✅ Now you're returning from the outer function
    } catch (error) {
      commit('setError', error);
      return 'Error';
    }
  },
  /**
   * @Function to set section title in the state
   * @Author moses
   * @param {*} commit
   * @param {string} payload
   * @description function to set section title in the state
   * @returns {Promise}
   */
  setSectionTitle({ commit }, payload) {
    commit('setSectionTitle', payload);
  },
};
