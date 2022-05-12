
// ref: https://umijs.org/config/
export default {
  treeShaking: true,
  hash: true,
  minimizer: 'terserjs',
  routes: [
    {
      path: '/',
      component: '../layouts/index',
      routes: [
        { path: '/', component: '../pages/index' },
        { path: '/register', component: '../pages/register' },
        { path: '/regSuccess', component: '../pages/regSuccess' },
        { path: '/home', component: '../pages/home/HomePage' },
        { path: '/status', component: '../pages/status' },
        { path: '/invest', component: '../pages/invest' },
        { path: '/club-house', component: '../pages/ClubHouse' },
        { path: '/club-house/:id', component: '../pages/ClubHouseRoom' },
        { path: '/meetingroom', component: '../pages/home/content/RoomList' },
        { path: '/meetingroom/:id', component: '../pages/home/content/MeetingRoom' },
      ]
    }
  ],
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: { webpackChunkName: true },
      title: 'BeagleDAO, Social Network for Crypto Metaverse',
      dll: false,
      locale: {
        enable: true,
        default: 'zh-CN',
      },
      routes: {
        exclude: [
          /models\//,
          /services\//,
          /model\.(t|j)sx?$/,
          /service\.(t|j)sx?$/,
          /components\//,
        ],
      },
    }],
  ],
  extraBabelPlugins:[["@babel/plugin-proposal-nullish-coalescing-operator"]],
  proxy: {
    '/clubhouse-api': {
      'target': 'https://t.callt.net/',
      'changeOrigin': true,
    },
  }
}
