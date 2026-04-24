const getters = {
  getConfigObject: (state) => state.configObject,
  getSelectedConfig: (state) => state.selectedConfigurations,
  getLoadingStatus: (state) => state.loading,
  getIsGenerating: (state) => state.isGenerating,
  getIsResponding: (state) => state.isResponding,
  getIsTypingEffect: (state) => state.isTypingEffect,
  getConversation: (state) => state.conversationHistory,
  getIndicators: (state) => state.controlConfig[0].setup[0].options,
  getControlConfig: (state) => state.controlConfig[0].payload,
  getSelectedSection: (state) => state.selectedSection,
  getCustomDashboards: (state) => state.dashboards,
  getIDCDatasources: (state) => state.controlConfig[2].setup[1].options,
  getFunFact: (state) => state.funFact,
};

export default getters;
