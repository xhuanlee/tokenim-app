import request from 'umi-request';

const ROOM_LIST = [
  {
    id: 1,
    name: 'BTC talk',
    dueTime: '2020-03-02 12:00:00',
    description: 'Bitcoin when used on a mobile device allows you to pay with a simple two-step scan-and-pay. There\'s no need to sign up, swipe your card, type a PIN, or sign anything. All you need to receive Bitcoin payments is to display the QR code in your Bitcoin wallet app and let the other party scan your mobile, or touch the two phones together!',
    moderators: [
      { address: '0xaFe45aFb', nickname: 'Jane', avatar: 'https://i.loli.net/2021/03/02/iu63RyHvkQpIcbZ.jpg', introduce: 'Bitcoin when used on a mobile device allows you to pay with a simple two-step scan-and-pay', twitter: 'https://twitter.com/xhuan_lee', facebook: 'https://www.facebook.com/profile.php?id=100010004525054', wechat: 'treeli822', },
      { address: '0xaFe45aFb', nickname: 'Jack Sparrow', avatar: 'https://i.loli.net/2021/03/02/arfsoqHhxCt2YQk.png', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
    speakers: [
      { address: '0xaFe45aFb', nickname: 'Hollow', avatar: 'https://i.loli.net/2021/03/02/zXtOWmwc8ah6Cd2.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Michal', avatar: 'https://i.loli.net/2021/03/02/5l26j7aFBCrIXbm.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
  },
  {
    id: 2,
    name: '论近现代中国的发展和未来机遇',
    dueTime: '2020-03-02 12:00:00',
    description: 'Bitcoin when used on a mobile device allows you to pay with a simple two-step scan-and-pay. There\'s no need to sign up, swipe your card, type a PIN, or sign anything. All you need to receive Bitcoin payments is to display the QR code in your Bitcoin wallet app and let the other party scan your mobile, or touch the two phones together!',
    moderators: [
      { address: '0xaFe45aFb', nickname: 'Jack Sparrow', avatar: 'https://i.loli.net/2021/03/02/arfsoqHhxCt2YQk.png', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
    speakers: [
      { address: '0xaFe45aFb', nickname: 'Michal', avatar: 'https://i.loli.net/2021/03/02/5l26j7aFBCrIXbm.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Hollow', avatar: 'https://i.loli.net/2021/03/02/zXtOWmwc8ah6Cd2.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Jane', avatar: 'https://i.loli.net/2021/03/02/iu63RyHvkQpIcbZ.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
  },
  {
    id: 3,
    name: 'Tesla talk about electricity',
    dueTime: '2020-03-02 12:00:00',
    description: 'Bitcoin when used on a mobile device allows you to pay with a simple two-step scan-and-pay. There\'s no need to sign up, swipe your card, type a PIN, or sign anything. All you need to receive Bitcoin payments is to display the QR code in your Bitcoin wallet app and let the other party scan your mobile, or touch the two phones together!',
    moderators: [
      { address: '0xaFe45aFb', nickname: 'Michal', avatar: 'https://i.loli.net/2021/03/02/5l26j7aFBCrIXbm.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Jack Sparrow', avatar: 'https://i.loli.net/2021/03/02/arfsoqHhxCt2YQk.png', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
    speakers: [
      { address: '0xaFe45aFb', nickname: 'Jane', avatar: 'https://i.loli.net/2021/03/02/iu63RyHvkQpIcbZ.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Hollow', avatar: 'https://i.loli.net/2021/03/02/zXtOWmwc8ah6Cd2.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
  },
  {
    id: 4,
    name: 'Electronic car is the future?',
    dueTime: '2020-03-02 12:00:00',
    description: 'Bitcoin when used on a mobile device allows you to pay with a simple two-step scan-and-pay. There\'s no need to sign up, swipe your card, type a PIN, or sign anything. All you need to receive Bitcoin payments is to display the QR code in your Bitcoin wallet app and let the other party scan your mobile, or touch the two phones together!',
    moderators: [
      { address: '0xaFe45aFb', nickname: 'Hollow', avatar: 'https://i.loli.net/2021/03/02/zXtOWmwc8ah6Cd2.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Jack Sparrow', avatar: 'https://i.loli.net/2021/03/02/arfsoqHhxCt2YQk.png', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
    speakers: [
      { address: '0xaFe45aFb', nickname: 'Jane', avatar: 'https://i.loli.net/2021/03/02/iu63RyHvkQpIcbZ.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Michal', avatar: 'https://i.loli.net/2021/03/02/5l26j7aFBCrIXbm.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
  },
  {
    id: 5,
    name: 'Never Give Up Hope !!!',
    dueTime: '2020-03-02 12:00:00',
    description: 'Bitcoin when used on a mobile device allows you to pay with a simple two-step scan-and-pay. There\'s no need to sign up, swipe your card, type a PIN, or sign anything. All you need to receive Bitcoin payments is to display the QR code in your Bitcoin wallet app and let the other party scan your mobile, or touch the two phones together!',
    moderators: [
      { address: '0xaFe45aFb', nickname: 'Jack Sparrow', avatar: 'https://i.loli.net/2021/03/02/arfsoqHhxCt2YQk.png', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
    speakers: [
      { address: '0xaFe45aFb', nickname: 'Michal', avatar: 'https://i.loli.net/2021/03/02/5l26j7aFBCrIXbm.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Jane', avatar: 'https://i.loli.net/2021/03/02/iu63RyHvkQpIcbZ.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Hollow', avatar: 'https://i.loli.net/2021/03/02/zXtOWmwc8ah6Cd2.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
  },
  {
    id: 6,
    name: 'BTC talk',
    dueTime: '2020-03-02 12:00:00',
    description: 'Bitcoin when used on a mobile device allows you to pay with a simple two-step scan-and-pay. There\'s no need to sign up, swipe your card, type a PIN, or sign anything. All you need to receive Bitcoin payments is to display the QR code in your Bitcoin wallet app and let the other party scan your mobile, or touch the two phones together!',
    moderators: [
      { address: '0xaFe45aFb', nickname: 'Jack Sparrow', avatar: 'https://i.loli.net/2021/03/02/arfsoqHhxCt2YQk.png', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
    speakers: [
      { address: '0xaFe45aFb', nickname: 'Jane', avatar: 'https://i.loli.net/2021/03/02/iu63RyHvkQpIcbZ.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Michal', avatar: 'https://i.loli.net/2021/03/02/5l26j7aFBCrIXbm.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Hollow', avatar: 'https://i.loli.net/2021/03/02/zXtOWmwc8ah6Cd2.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
  },
  {
    id: 7,
    name: 'BTC talk',
    dueTime: '2020-03-02 12:00:00',
    description: 'Bitcoin when used on a mobile device allows you to pay with a simple two-step scan-and-pay. There\'s no need to sign up, swipe your card, type a PIN, or sign anything. All you need to receive Bitcoin payments is to display the QR code in your Bitcoin wallet app and let the other party scan your mobile, or touch the two phones together!',
    moderators: [
      { address: '0xaFe45aFb', nickname: 'Jack Sparrow', avatar: 'https://i.loli.net/2021/03/02/arfsoqHhxCt2YQk.png', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
    speakers: [
      { address: '0xaFe45aFb', nickname: 'Jane', avatar: 'https://i.loli.net/2021/03/02/iu63RyHvkQpIcbZ.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Michal', avatar: 'https://i.loli.net/2021/03/02/5l26j7aFBCrIXbm.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Hollow', avatar: 'https://i.loli.net/2021/03/02/zXtOWmwc8ah6Cd2.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
  },
  {
    id: 8,
    name: 'BTC talk',
    dueTime: '2020-03-02 12:00:00',
    description: 'Bitcoin when used on a mobile device allows you to pay with a simple two-step scan-and-pay. There\'s no need to sign up, swipe your card, type a PIN, or sign anything. All you need to receive Bitcoin payments is to display the QR code in your Bitcoin wallet app and let the other party scan your mobile, or touch the two phones together!',
    moderators: [
      { address: '0xaFe45aFb', nickname: 'Jack Sparrow', avatar: 'https://i.loli.net/2021/03/02/arfsoqHhxCt2YQk.png', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
    speakers: [
      { address: '0xaFe45aFb', nickname: 'Jane', avatar: 'https://i.loli.net/2021/03/02/iu63RyHvkQpIcbZ.jpg', introduce: 'hello, world!!!Bitcoin when used on a mobile device allows you to pay with a simple two-step scan-and-pay.', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Michal', avatar: 'https://i.loli.net/2021/03/02/5l26j7aFBCrIXbm.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Hollow', avatar: 'https://i.loli.net/2021/03/02/zXtOWmwc8ah6Cd2.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
  },
  {
    id: 9,
    name: 'BTC talk',
    dueTime: '2020-03-02 12:00:00',
    description: 'Bitcoin when used on a mobile device allows you to pay with a simple two-step scan-and-pay. There\'s no need to sign up, swipe your card, type a PIN, or sign anything. All you need to receive Bitcoin payments is to display the QR code in your Bitcoin wallet app and let the other party scan your mobile, or touch the two phones together!',
    moderators: [
      { address: '0xaFe45aFb', nickname: 'Jack Sparrow', avatar: 'https://i.loli.net/2021/03/02/arfsoqHhxCt2YQk.png', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
    speakers: [
      { address: '0xaFe45aFb', nickname: 'Jane', avatar: 'https://i.loli.net/2021/03/02/iu63RyHvkQpIcbZ.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Michal', avatar: 'https://i.loli.net/2021/03/02/5l26j7aFBCrIXbm.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Hollow', avatar: 'https://i.loli.net/2021/03/02/zXtOWmwc8ah6Cd2.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
  },
  {
    id: 10,
    name: 'BTC talk',
    dueTime: '2020-03-02 12:00:00',
    description: 'Bitcoin when used on a mobile device allows you to pay with a simple two-step scan-and-pay. There\'s no need to sign up, swipe your card, type a PIN, or sign anything. All you need to receive Bitcoin payments is to display the QR code in your Bitcoin wallet app and let the other party scan your mobile, or touch the two phones together!',
    moderators: [
      { address: '0xaFe45aFb', nickname: 'Jack Sparrow', avatar: 'https://i.loli.net/2021/03/02/arfsoqHhxCt2YQk.png', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
    speakers: [
      { address: '0xaFe45aFb', nickname: 'Jane', avatar: 'https://i.loli.net/2021/03/02/iu63RyHvkQpIcbZ.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Michal', avatar: 'https://i.loli.net/2021/03/02/5l26j7aFBCrIXbm.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
      { address: '0xaFe45aFb', nickname: 'Hollow', avatar: 'https://i.loli.net/2021/03/02/zXtOWmwc8ah6Cd2.jpg', introduce: 'hello, world!!!', twitter: '', facebook: '', wechat: '', },
    ],
  },
];

export async function fetchMoreRoom(server, page, pageSize, query) {
  return request.get(server+'getRooms/');
//  return request.get(`https://t.callt.net:3001/getRooms/`);
//  return request.get(`https://t.callt.net:3001/getRooms/?page=${page || ''}&pageSize=${pageSize || ''}&query=${query || ''}`);
}

export async function fetchUser(address) {
  return request.get(`/clubhouse-api/user?address=${address}`);
}

export async function saveUser(user) {
  return request.post('/clubhouse-api/user', { data: user });
}

export async function saveChatRoom(room) {
  return request.post('https://t.callt.net:3001/CreateToken/', { data: room });
}

export function isHost(room, address) {
  if (room && room.moderators) {
    for (let i = 0; i < room.moderators.length; i++) {
      if (address === room.moderators[i].address) {
        return true;
      }
    }
  }

  if (room && room.speakers) {
    for (let i = 0; i < room.speakers.length; i++) {
      if (address === room.speakers[i].address) {
        return true;
      }
    }
  }

  return false;
};
