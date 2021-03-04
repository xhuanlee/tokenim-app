import React, { useCallback, useEffect } from 'react';
import { connect } from 'dva';
import InfiniteScroll from 'react-infinite-scroller';
import { List, Spin, Typography, Avatar, Modal, Form, Input, Upload, Button, DatePicker, PageHeader } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import router from 'umi/router';
import style from './ClubHouse.less';
import { DEFAULT_AVATAR } from '@/app/constant';

const Room = ({ room, goToRoom }) => {
  const { id, title, description, dueTime, moderators, speakers } = room;
  let authors = [];
  if (moderators && moderators.length > 0) {
    authors = authors.concat(moderators);
  }
  if (speakers && speakers.length > 0) {
    authors = authors.concat(speakers);
  }

  return (
    <div className={style.roomItem} style={{ marginBottom: '16px', cursor: 'pointer' }} onClick={() => goToRoom(room)}>
      <h2 style={{ marginBottom: '0px' }}><span>{title}</span><span style={{ fontSize: 14, fontWeight: 'unset', marginLeft: '16px' }}>{dueTime}</span></h2>
      <Avatar.Group>
        {
          authors.map(item => (<Avatar size="large" src={item.avatar && item.avatar !== '' ? item.avatar : DEFAULT_AVATAR} />))
        }
      </Avatar.Group>
      <div>
        <span style={{ fontStyle: 'italic' }}>{authors.reduce((pre, item) => `${pre}${pre === '' ? '' : ' / '}${item.nickname}`, '')}</span>
      </div>
      <Typography>
        {description}
      </Typography>
    </div>
  );
};

const ClubHouse = (props) => {
  const { dispatch, loading, clubhouse } = props;
  const { rooms, totalRoom, hasMore, needCreate, newChatRoomModal, user } = clubhouse;
  const fetchingMore = loading.effects['clubhouse/fetchMore'];
  const savingUser = loading.effects['clubhouse/saveServerUser'];
  const savingRoom = loading.effects['clubhouse/saveNewChatRoom'];
  const [ form ] = Form.useForm();
  const [ chatRoomForm ] = Form.useForm();

  useEffect(() => {
    dispatch({ type: 'clubhouse/fetchRooms' });
  }, []);
  useEffect(() => {
    dispatch({ type: 'clubhouse/fetchUser' });
  }, []);

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };
  const loadMore = useCallback((page) => {
    dispatch({ type: 'clubhouse/fetchMore', payload: { page } });
  }, []);
  const goToRoom = useCallback((room) => {
    dispatch({ type: 'clubhouse/saveCurrentRoom', payload: { currentRoom: room } });
    router.push(`/club-house/${room.id}`);
  }, []);
  const saveUserInfo = useCallback(() => {
    form.validateFields().then(values => {
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
      dispatch({ type: 'clubhouse/saveServerUser', payload: { user } });
    }).catch(error => {
    });
  }, []);
  const clickNewChatRoom = useCallback(() => {
    dispatch({ type: 'clubhouse/saveNewChatRoomModal', payload: { newChatRoomModal: true } });
  }, []);
  const cancelNewChatRoom = useCallback(() => {
    dispatch({ type: 'clubhouse/saveNewChatRoomModal', payload: { newChatRoomModal: false } });
  }, []);
  const saveNewChatRoom = useCallback(() => {
    chatRoomForm.validateFields().then(values => {
      console.log('submit chat room info: ', values);
      if (values.dueTime) {
        values.dueTime = values.dueTime.format('yyyy-MM-DD HH:mm:ss');
      }
      if (values.moderators) {
        values.moderators = values.moderators.replaceAll('\n', ';').replaceAll(',', ';').replaceAll('|', ';');
      }
      if (values.speakers) {
        values.speakers = values.speakers.replaceAll('\n', ';').replaceAll(',', ';').replaceAll('|', ';');
      }
      const room = new FormData();
      for (let key in values) {
        room.append(key, values[key] || '');
      }
      dispatch({ type: 'clubhouse/saveNewChatRoom', payload: { room } });
    }).catch(error => {
    });
  }, []);
  const normFile = (e) => {
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
    <>
      <PageHeader
        avatar={{ src: user && user.avatar && user.avatar !== '' ? user.avatar : DEFAULT_AVATAR}}
        className="site-page-header"
        backIcon={false}
        title="Rooms"
        subTitle={`${totalRoom} rooms`}
        extra={[ <Button type="primary" onClick={clickNewChatRoom}>New Room</Button> ]}
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
            renderItem={(item) => (<Room room={item} goToRoom={goToRoom} />)}
          >
            {
              hasMore && fetchingMore && (
                <div style={{ textAlign: 'center' }}>
                  <Spin />
                </div>
              )
            }
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
            rules={[
              { required: true, message: 'Please input your nickname' }
            ]}
          >
            <Input placeholder="please input your nickname" />
          </Form.Item>
          <Form.Item
            name="twitter"
            label="twitter"
          >
            <Input placeholder="please input your twitter link" />
          </Form.Item>
          <Form.Item
            name="facebook"
            label="facebook"
          >
            <Input placeholder="please input your facebook link" />
          </Form.Item>
          <Form.Item
            name="wechat"
            label="wechat"
          >
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
          <Form.Item
            name="introduce"
            label="introduce"
          >
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
            rules={[
              { required: true, message: 'Please input room title' }
            ]}
          >
            <Input placeholder="please input your nickname" />
          </Form.Item>
          <Form.Item
            name="description"
            label="description"
            rules={[
              { required: true, message: 'Please input room description' }
            ]}
          >
            <Input.TextArea placeholder="please input room description" />
          </Form.Item>
          <Form.Item
            name="category"
            label="category"
            rules={[
              { required: true, message: 'Please input category' }
            ]}
          >
            <Input placeholder="please input category" />
          </Form.Item>
          <Form.Item
            name="keywords"
            label="keywords"
          >
            <Input placeholder="please input your facebook link" />
          </Form.Item>
          <Form.Item
            name="dueTime"
            label="due time"
            rules={[
              { required: true, message: 'Please input due time' }
            ]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            name="moderators"
            label="moderators"
            rules={[
              { required: true, message: 'Please input moderators' }
            ]}
          >
            <Input.TextArea placeholder="please input moderators" />
          </Form.Item>
          <Form.Item
            name="speakers"
            label="speakers"
            rules={[
              { required: true, message: 'Please input speakers' }
            ]}
          >
            <Input.TextArea placeholder="please input speakers" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default connect(state => ({
  loading: state.loading,
  clubhouse: state.clubhouse,
}))(ClubHouse);
