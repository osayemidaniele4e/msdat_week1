/* eslint-disable no-param-reassign */
// const WorkerPlugin = require('worker-plugin');

// const path = require('path');
// const PrerenderSPAPlugin = require('prerender-spa-plugin');

// // const Renderer = PrerenderSPAPlugin.PuppeteerRenderer;

// const plugins = [
//   new PrerenderSPAPlugin(
//     // (REQUIRED) Absolute path to static root
//     path.join(__dirname, 'dist'),
//     // (REQUIRED) List of routes to prerender
//     [
//       '/',
//     ],
//     // (OPTIONAL) Compatible options from v2.
//     {
//       captureAfterTime: 15000,
//     },
//   ),
//   new PrerenderSPAPlugin(
//     path.join(__dirname, 'dist'),
//     [
//       '/dashboard',
//     ],
//     {
//       captureAfterTime: 15000,
//     },
//   ),
//   new PrerenderSPAPlugin(
//     path.join(__dirname, 'dist'),
//     [
//       '/dashboard/Health_Outcomes_and_Service_Coverage',
//     ],
//     {
//       captureAfterTime: 15000,
//     },
//   ),
//   new PrerenderSPAPlugin(
//     path.join(__dirname, 'dist'),
//     [
//       '/dashboard/Advanced_Analytics',
//     ],
//     {
//       captureAfterTime: 15000,
//     },
//   ),
//   new PrerenderSPAPlugin(
//     path.join(__dirname, 'dist'),
//     [
//       '/dashboard/Health_Facility',
//     ],
//     {
//       captureAfterTime: 15000,
//     },
//   ),
//   new PrerenderSPAPlugin(
//     path.join(__dirname, 'dist'),
//     [
//       '/dashboard/Health_Financing',
//     ],
//     {
//       captureAfterTime: 15000,
//     },
//   ),
//   new PrerenderSPAPlugin(
//     path.join(__dirname, 'dist'),
//     [
//       '/dashboard/Demographics',
//     ],
//     {
//       captureAfterTime: 15000,
//     },
//   ),
//   new PrerenderSPAPlugin(
//     path.join(__dirname, 'dist'),
//     [
//       '/dashboard/Health_Workforce',
//     ],
//     {
//       captureAfterTime: 15000,
//     },
//   ),
//   new PrerenderSPAPlugin(
//     path.join(__dirname, 'dist'),
//     [
//       '/dashboard/Health_Service_Access',
//     ],
//     {
//       captureAfterTime: 15000,
//     },
//   ),
//   new PrerenderSPAPlugin(
//     path.join(__dirname, 'dist'),
//     [
//       '/dashboard/Disease_Surveillance',
//     ],
//     {
//       captureAfterTime: 15000,
//     },
//   ),
// new PrerenderSPAPlugin({
//   staticDir: path.join(__dirname, 'dist'),
//   routes: ['/'],
//   renderer: new Renderer({
//     renderAfterElementExists: '#app',
//     renderAfterDocumentEvent: 'app-mounted',
//     renderAfterTime: 1000,
//     maxConcurrentRoutes: 5,
//     ignoreJSErrors: true,
//     headless: false,
//   }),
// }),
// new PrerenderSPAPlugin({
//   staticDir: path.join(__dirname, 'dist'),
//   routes: ['/dashboard'],
//   renderer: new Renderer({
//     renderAfterElementExists: '#app',
//     renderAfterDocumentEvent: 'app-mounted',
//     renderAfterTime: 1000,
//     maxConcurrentRoutes: 5,
//     ignoreJSErrors: true,
//     headless: false,
//   }),
// }),
// new PrerenderSPAPlugin({
//   staticDir: path.join(__dirname, 'dist'),
//   routes: ['/dashboard/Health_Outcomes_and_Service_Coverage'],
//   renderer: new Renderer({
//     renderAfterElementExists: '#app',
//     renderAfterDocumentEvent: 'app-mounted',
//     renderAfterTime: 1000,
//     maxConcurrentRoutes: 5,
//     ignoreJSErrors: true,
//     headless: false,
//   }),
// }),
// new PrerenderSPAPlugin({
//   staticDir: path.join(__dirname, 'dist'),
//   routes: ['/dashboard/Advanced_Analytics'],
//   renderer: new Renderer({
//     renderAfterElementExists: '#app',
//     renderAfterDocumentEvent: 'app-mounted',
//     renderAfterTime: 1000,
//     maxConcurrentRoutes: 5,
//     ignoreJSErrors: true,
//     headless: false,
//   }),
// }),
// new PrerenderSPAPlugin({
//   staticDir: path.join(__dirname, 'dist'),
//   routes: ['/dashboard/Health_Facility'],
//   renderer: new Renderer({
//     renderAfterElementExists: '#app',
//     renderAfterDocumentEvent: 'app-mounted',
//     renderAfterTime: 1000,
//     maxConcurrentRoutes: 5,
//     ignoreJSErrors: true,
//     headless: false,
//   }),
// }),
// new PrerenderSPAPlugin({
//   staticDir: path.join(__dirname, 'dist'),
//   routes: ['/dashboard/Health_Financing'],
//   renderer: new Renderer({
//     renderAfterElementExists: '#app',
//     renderAfterDocumentEvent: 'app-mounted',
//     renderAfterTime: 1000,
//     maxConcurrentRoutes: 5,
//     ignoreJSErrors: true,
//     headless: false,
//   }),
// }),
// new PrerenderSPAPlugin({
//   staticDir: path.join(__dirname, 'dist'),
//   routes: ['/dashboard/Demographics'],
//   renderer: new Renderer({
//     renderAfterElementExists: '#app',
//     renderAfterDocumentEvent: 'app-mounted',
//     renderAfterTime: 1000,
//     maxConcurrentRoutes: 5,
//     ignoreJSErrors: true,
//     headless: false,
//   }),
// }),
// new PrerenderSPAPlugin({
//   staticDir: path.join(__dirname, 'dist'),
//   routes: ['/dashboard/Health_Workforce'],
//   renderer: new Renderer({
//     renderAfterElementExists: '#app',
//     renderAfterDocumentEvent: 'app-mounted',
//     renderAfterTime: 1000,
//     maxConcurrentRoutes: 5,
//     ignoreJSErrors: true,
//     headless: false,
//   }),
// }),
// new PrerenderSPAPlugin({
//   staticDir: path.join(__dirname, 'dist'),
//   routes: ['/dashboard/Health_Service_Access'],
//   renderer: new Renderer({
//     renderAfterElementExists: '#app',
//     renderAfterDocumentEvent: 'app-mounted',
//     renderAfterTime: 1000,
//     maxConcurrentRoutes: 5,
//     ignoreJSErrors: true,
//     headless: false,
//   }),
// }),
// new PrerenderSPAPlugin({
//   staticDir: path.join(__dirname, 'dist'),
//   routes: ['/dashboard/Disease_Surveillance'],
//   renderer: new Renderer({
//     renderAfterElementExists: '#app',
//     renderAfterDocumentEvent: 'app-mounted',
//     renderAfterTime: 1000,
//     maxConcurrentRoutes: 5,
//     ignoreJSErrors: true,
//     headless: false,
//   }),
// }),
// ];

module.exports = {
  lintOnSave: false,
  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @import "@/scss/abstracts/_variables.scss";
        `,
      },
    },
  },
  configureWebpack: (config) => {
    config.module.rules = [
      {
        test: /\.worker\.js$/i,
        use: [
          {
            loader: 'comlink-loader',
            options: {
              singleton: true,
            },
          },
        ],
      },
      ...config.module.rules,
    ];
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'https://msdat2api.e4eweb.space/api/',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
    disableHostCheck: true,
  },
};
