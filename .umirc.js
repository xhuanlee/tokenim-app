
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
      ]
    }
  ],
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: { webpackChunkName: true },
      title: 'IClub, Instant Messaging Network for Blockchain',
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
  proxy: {
    '/clubhouse-api': {
      'target': 'http://localhost:8099/',
      'changeOrigin': true,
    },
  }
}
