import adapter from 'webrtc-adapter';
import { setLocale } from 'umi-plugin-locale';
import qs from 'qs';
import { formatLocale } from '@/app/util';
import FaxTokenIM from '@/app/index';

export const dva = {
  config: {
    onError(err) {
      err.preventDefault();
      console.error(err.message);
    },
  },
};

const { search } = window.location;
let { locale } = qs.parse(search, { ignoreQueryPrefix: true });
console.log(`locale from query: ${locale}`);
if (!locale || locale.trim() === '') {
  locale = localStorage.getItem('umi_locale');
  console.log(`locale from localStorage: ${locale}`);
}
locale = formatLocale(locale);
console.log(`set locale to: ${locale}`);
setLocale(locale);

let initInterval;
initInterval = setInterval(() => {
  console.log('check dispatch...');
  if (window.g_app && window.g_app._store && window.g_app._store.dispatch) {
    FaxTokenIM.init();
    clearInterval(initInterval);
  }
}, 200);

console.log(`webrtc-adapter(browser): ${adapter.browserDetails.browser}`);
console.log(`webrtc-adapter(version): ${adapter.browserDetails.version}`);
