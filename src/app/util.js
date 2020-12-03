import { message, notification } from 'antd';

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
  message.info('地址拷贝成功!');
};

const notificationKey = {
  'init': '初始化',
  'initContract': '合约初始化',
  'login': '登陆',
  'newAccount': '新建账户',
  'transFax': 'Fax交易',
  'buyFax': '购买FAX',
  'approve': '批准FAX',
  'importKeystore': '导入Keystore',
  'importPrivateKey': '导入Private Key',

  'newMessage': '新消息',
  'transEther': '以太币交易',
  'transactionDone': '以太币交易',
  'receiveTransaction': '收到新交易',
}

export const showNotification = (key, type, description, duration) => {
  switch (type) {
    case 'error':
      notification.error({
        key: key,
        message: notificationKey[key] + '出错',
        description: description || '详情请查看控制台',
        duration: duration || null,
      })
      return;
    case 'success':
      notification.success({
        key: key,
        message: notificationKey[key] + '成功',
        description: description || '',
        duration: duration || 5,
      })
      return;
    default:
      notification.info({
        key: key,
        message: notificationKey[key],
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

  if (locale && (locale.toLowerCase() === 'en' || locale.toLowerCase() === 'en-US' || locale.toLowerCase() === 'english')) {
    return LOCALE_EN;
  }

  return LOCALE_CN;
}
