import React, { useCallback, useEffect } from 'react';
import { connect } from 'dva';
import InfiniteScroll from 'react-infinite-scroller';
import {
  List,
  Spin,
  Typography,
  Avatar,
  Modal,
  Form,
  Input,
  Upload,
  Button,
  DatePicker,
  PageHeader,
} from 'antd';
import Icon, { UploadOutlined } from '@ant-design/icons';
import router from 'umi/router';
import style from '../../ClubHouse.less';
//import { DEFAULT_AVATAR } from '@/app/constant';
import NeedLogin from '@/pages/home/NeedLogin';
import { ReactComponent as svgCONTACT } from '../../../../public/image/SVG/CONTACT.svg';

function addPreZero4(num) {
  return (`0000${num}`).slice(-4);
}
const DEFAULT_AVATAR='/image/beagle_beati.jpg'

const names=['snoopy','lou','alan','david','will','author','luis','frank','mary','shirley'
            ,'satoshi','baker','henry','steven','luke','bill','woody','fire','john','flower']

const RoomSummary = ({ room, goToRoom , defaultRoom}) => {
  const { name, _id, id, title, description, dueTime, moderators, speakers } = room;
  let randomname = addPreZero4(Math.round(Math.random() * 10000));
  let authors = [{avatar:`https://www.larvalabs.com/public/images/cryptopunks/punk${randomname}.png`,nickname:names[randomname%20]}];
  randomname = addPreZero4(Math.round(Math.random() * 10000));
  if (moderators && moderators.length > 0) {
    authors = authors.concat(moderators);
  }
  else
    authors = authors.concat([{avatar:`https://www.larvalabs.com/public/images/cryptopunks/punk${randomname}.png`,nickname:names[randomname%20]}]);
  randomname = addPreZero4(Math.round(Math.random() * 10000));
  if (speakers && speakers.length > 0) {
    authors = authors.concat(speakers);
  }
  else
    authors = authors.concat([{avatar:`https://www.larvalabs.com/public/images/cryptopunks/punk${randomname}.png`,nickname:names[randomname%20]}]);
  let fontSize = 14;
  let fontWeight = 'unset';
  let fontColor = 'black';
  if (_id==defaultRoom) {
    fontSize = 24;
    fontWeight = 'bold';
    fontColor = 'blue';
  }
  return (
    <div
      className={style.roomItem}
      style={{ marginLeft:5,marginRight:5, marginBottom: '16px', cursor: 'pointer' ,backgroundColor:'lightgrey',borderRadius:5}}
      onClick={() => goToRoom(room)}
    >
      <h2 style={{ marginBottom: '0px' }}>
        <span style={{ fontWeight: fontWeight,color:fontColor}}>{name}</span>
        <span style={{ fontSize: 14, fontWeight: 'unset', marginLeft: '16px' }}>{dueTime}</span>
      </h2>
      <Avatar.Group>
        {authors.map(item => (
          <Avatar
            size="large" style={{border:0}}
            src={item.avatar && item.avatar !== '' ? item.avatar : DEFAULT_AVATAR}
          />
        ))}
      </Avatar.Group>
      <div>
        <span style={{ fontStyle: 'italic' }}>
          {authors.reduce((pre, item) => `${pre}${pre === '' ? '' : ' / '}${item.nickname}`, '')}
        </span>
      </div>
      <Typography>{_id}</Typography>
    </div>
  );
};

const RoomList = props => {
  const { server, dispatch, loading, meetingroom,targetRoom } = props;
  const { rooms, totalRoom, hasMore, needCreate, newChatRoomModal, user } = meetingroom;
  const fetchingMore = loading.effects['meetingroom/fetchMore'];
  const savingUser = loading.effects['meetingroom/saveServerUser'];
  const savingRoom = loading.effects['meetingroom/saveNewChatRoom'];
  const [form] = Form.useForm();
  const [chatRoomForm] = Form.useForm();

  useEffect(() => {
    dispatch({ type: 'meetingroom/setServer', payload: { meetingServer: server } });
    console.log("meetingroom.server:"+meetingroom.server);
    console.log("server:"+server);
    dispatch({ type: 'meetingroom/fetchRooms',payload: { meetingServer: server } });
  }, [dispatch, meetingroom.server, server]);
  useEffect(() => {
    dispatch({ type: 'meetingroom/fetchUser' });
  }, [dispatch]);

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };
  const loadMore = useCallback(
    page => {
      dispatch({ type: 'meetingroom/fetchMore', payload: { page } });
    },
    [dispatch],
  );
  const goToRoom = useCallback(
    room => {
      console.log(JSON.stringify(room));
      room.title = room.name;
      // room.speakers=[{address:'0xaaaddddeeee',nickName:'alan',avatar:'https://s2.loli.net/2021/12/16/UEdKoBsS3JNtfAy.jpg'}];
      dispatch({ type: 'meetingroom/saveCurrentRoom', payload: { currentRoom: room } });
      //router.push(`/meetingroom/${room._id}`);
      router.push(`/home?s=chat&room=${room._id}`);
      console.log('enter:' + room._id);
    },
    [dispatch],
  );
  const saveUserInfo = useCallback(() => {
    form
      .validateFields()
      .then(values => {
        console.log('submit user info: ', values);
        if (values.avatar && values.avatar.length > 0) {
          values.avatar = values.avatar[0].originFileObj;
        } else {
          delete values['avatar'];
        }
        const user = new FormData();
        for (let key in values) {
          user.append(key, values[key] || '');
        }
        dispatch({ type: 'meetingroom/saveServerUser', payload: { user } });
      })
      .catch(error => {});
  }, [dispatch, form]);
  const clickNewChatRoom = useCallback(() => {
    dispatch({ type: 'meetingroom/saveNewChatRoomModal', payload: { newChatRoomModal: true } });
  }, [dispatch]);
  const cancelNewChatRoom = useCallback(() => {
    dispatch({ type: 'meetingroom/saveNewChatRoomModal', payload: { newChatRoomModal: false } });
  }, [dispatch]);
  const saveNewChatRoom = useCallback(() => {
    chatRoomForm
      .validateFields()
      .then(values => {
        console.log('submit chat room info: ', values);
        if (values.dueTime) {
          values.dueTime = values.dueTime.format('yyyy-MM-DD HH:mm:ss');
        }
        if (values.moderators) {
          values.moderators = values.moderators
            .replaceAll('\n', ';')
            .replaceAll(',', ';')
            .replaceAll('|', ';');
        }
        if (values.speakers) {
          values.speakers = values.speakers
            .replaceAll('\n', ';')
            .replaceAll(',', ';')
            .replaceAll('|', ';');
        }
        const room = new FormData();
        for (let key in values) {
          room.append(key, values[key] || '');
        }
        dispatch({ type: 'meetingroom/saveNewChatRoom', payload: { room } });
      })
      .catch(error => {});
  }, [chatRoomForm, dispatch]);
  const normFile = e => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      if (e.length > 1) {
        return [e[0]];
      }
      return e;
    }
    if (e && e.fileList.length > 1) {
      return [e.fileList[e.fileList.length - 1]];
    }
    return e && e.fileList;
  };

  return (
    <div>
      <PageHeader
        avatar={{ src: user && user.avatar && user.avatar !== '' ? user.avatar : DEFAULT_AVATAR }}
        //avatar={<Icon component={svgCONTACT}>}
        className="site-page-header"
        backIcon={false}
        title="Rooms"
        subTitle={`${totalRoom} rooms`}
        extra={[
          <Button type="primary" onClick={clickNewChatRoom}>
            New Room
          </Button>,
        ]}
      />
      <div className={style.listContainer}>
        <InfiniteScroll
          initialLoad={false}
          pageStart={1}
          loadMore={loadMore}
          hasMore={!fetchingMore && hasMore}
          useWindow={false}
          threshold={120}
        >
          <List
            dataSource={rooms}
            renderItem={item => <RoomSummary room={item} goToRoom={goToRoom} defaultRoom={targetRoom}/>}
          >
            {hasMore && fetchingMore && (
              <div style={{ textAlign: 'center' }}>
                <Spin />
              </div>
            )}
          </List>
        </InfiniteScroll>
      </div>
      <Modal
        visible={needCreate}
        title="Finish user info"
        cancelText="Cancel"
        okText="OK"
        closable={false}
        maskClosable={false}
        cancelButtonProps={{ disabled: true }}
        okButtonProps={{ loading: savingUser }}
        onOk={saveUserInfo}
      >
        <Form form={form} {...formItemLayout}>
          <Form.Item
            name="nickname"
            label="nickname"
            rules={[{ required: true, message: 'Please input your nickname' }]}
          >
            <Input placeholder="please input your nickname" />
          </Form.Item>
          <Form.Item name="twitter" label="twitter">
            <Input placeholder="please input your twitter link" />
          </Form.Item>
          <Form.Item name="facebook" label="facebook">
            <Input placeholder="please input your facebook link" />
          </Form.Item>
          <Form.Item name="wechat" label="wechat">
            <Input placeholder="please input your wechat account" />
          </Form.Item>
          <Form.Item
            name="avatar"
            label="avatar"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            extra="choose you avatar"
          >
            <Upload name="avatar" listType="picture">
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="introduce" label="introduce">
            <Input.TextArea placeholder="please input your introduce" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        visible={newChatRoomModal}
        title="New Chat Room"
        cancelText="Cancel"
        okText="Create"
        closable
        maskClosable
        onCancel={cancelNewChatRoom}
        onOk={saveNewChatRoom}
        okButtonProps={{ loading: savingRoom }}
      >
        <Form form={chatRoomForm} {...formItemLayout}>
          <Form.Item
            name="title"
            label="title"
            rules={[{ required: true, message: 'Please input room title' }]}
          >
            <Input placeholder="please input your nickname" />
          </Form.Item>
          <Form.Item
            name="description"
            label="description"
            rules={[{ required: true, message: 'Please input room description' }]}
          >
            <Input.TextArea placeholder="please input room description" />
          </Form.Item>
          <Form.Item
            name="category"
            label="category"
            rules={[{ required: true, message: 'Please input category' }]}
          >
            <Input placeholder="please input category" />
          </Form.Item>
          <Form.Item name="keywords" label="keywords">
            <Input placeholder="please input your facebook link" />
          </Form.Item>
          <Form.Item
            name="dueTime"
            label="due time"
            rules={[{ required: true, message: 'Please input due time' }]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            name="moderators"
            label="moderators"
            rules={[{ required: true, message: 'Please input moderators' }]}
          >
            <Input.TextArea placeholder="please input moderators" />
          </Form.Item>
          <Form.Item
            name="speakers"
            label="speakers"
            rules={[{ required: true, message: 'Please input speakers' }]}
          >
            <Input.TextArea placeholder="please input speakers" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomList;
