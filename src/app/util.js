import { message, notification } from 'antd';
import { formatMessage } from 'umi-plugin-locale';
import { ethereum_rpc_endpoint } from '../../config';

export const LOCALE_CN = 'zh-CN';
export const LOCALE_EN = 'en-US';

export const sendRequest = (url, callback, data) => {
  if (data) {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data
    }).then(res => res.json()).then(res => callback(undefined, res)).catch(err => callback(err));
  } else {
    fetch(url).then(res => res.json()).then(res => callback(undefined, res)).catch(err => callback(err));
  }
}

const converter = {
  Wei: 1,
  Gwei: 1000000000,
  Ether: 1000000000000000000,
}

export const converEther = (value, unit) => {
  switch (unit) {
    case 'wei':
    case 'Wei':
      return value / converter.Wei;

    case 'gwei':
    case 'Gwei':
    case 'GWei':
      return value / converter.Gwei;
    case 'ether':
    case 'eth':
    case 'Ether':
    case 'ETH':
      return value / converter.Ether;
    default:
      if (value / converter.Ether > 0.0001) {
        return {
          value: value / converter.Ether,
          unit: 'Ether',
          secondValue: value / converter.Wei,
          secondUnit: 'Wei'
        }
      } else if (value / converter.Gwei > 0.0001) {
        return {
          value: value / converter.Gwei,
          unit: 'Gwei',
          secondValue: value / converter.Wei,
          secondUnit: 'Wei'
        }
      } else {
        return {
          value: value / converter.Wei,
          unit: 'Wei',
          secondValue: value / converter.Ether,
          secondUnit: 'Ether'
        }
      }
  }
}


export const formatTime = (timestamp) => {
  var d = new Date(timestamp);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`
}

export const shortenAddress = (address, length = 8) => {
  if (address && length > 6) {
    return address.slice(0, Math.floor(length / 2) + 1) + '...' + address.slice(1 - Math.floor(length / 2));
  }
  return '';
}

export const copyToClipboard = (str) => {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  message.info(formatMessage({ id: 'copy_address_success' }));
};

const notificationKey = {
  'init': formatMessage({ id: 'init' }),
  'initContract': formatMessage({ id: 'init_ontract' }),
  'login': formatMessage({ id: 'login' }),
  'newAccount': formatMessage({ id: 'new_account' }),
  'transFax': formatMessage({ id: 'transfer_fax' }),
  'buyFax': formatMessage({ id: 'buy_fax' }),
  'approve': formatMessage({ id: 'approve' }),
  'importKeystore': formatMessage({ id: 'import_keystore' }),
  'importPrivateKey': formatMessage({ id: 'import_privateKey' }),

  'newMessage': formatMessage({ id: 'new_message' }),
  'transEther': formatMessage({ id: 'trans_ether' }),
  'transactionDone': formatMessage({ id: 'transaction_done' }),
  'receiveTransaction': formatMessage({ id: 'receive_transaction' }),
}

export const showNotification = (key, type, description, duration) => {
  switch (type) {
    case 'error':
      notification.error({
        key: key,
        message: formatMessage({ id: key }) + formatMessage({ id: 'notification_error' }),
        description: description || formatMessage({ id: 'notification_error_des' }),
        duration: duration || null,
      })
      return;
    case 'success':
      notification.success({
        key: key,
        message: formatMessage({ id: key }) + formatMessage({ id: 'notification_success' }),
        description: description || '',
        duration: duration || 5,
      })
      return;
    default:
      notification.info({
        key: key,
        message: formatMessage({ id: key }),
        description: description || '',
        duration: duration || 5,
      })
      return;
  }
}

export const closeNotification = (key) => {
  notification.close(key);
}

export const download = (filename, text) => {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export const stringToColour = (str) => {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var j = 0; j < 3; j++) {
    var value = (hash >> (j * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

export function formatLocale(locale) {

  if (locale && (locale.toLowerCase() === 'en' || locale.toLowerCase() === 'en-us' || locale.toLowerCase() === 'english')) {
    return LOCALE_EN;
  }

  return LOCALE_CN;
}

export async function promiseSleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export function getLocalShhKeyPair(address) {
  const ShhKeyStr = localStorage.getItem('ShhKey') || '{}';
  let ShhKeyObj = {};
  try {
    ShhKeyObj = JSON.parse(ShhKeyStr);
  } catch (e) {
    console.log(e)
  }
  const ShhKey = ShhKeyObj[ethereum_rpc_endpoint] || {};
  const id = ShhKey[address] && ShhKey[address].id
  const pubKey = ShhKey[address] && ShhKey[address].pubKey;
  const priKey = ShhKey[address] && ShhKey[address].priKey;

  return { id, priKey, pubKey };
}
