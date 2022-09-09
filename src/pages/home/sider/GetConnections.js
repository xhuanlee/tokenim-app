import { useCallback, useEffect, useState } from 'react';
//import { DEMO_ADDRESS, CYBERCONNECT_ENDPOINT } from "../helpers/constants";
import { GraphQLClient, gql } from "graphql-request";
import MeetingRoom from '@/pages/home/content/MeetingRoom';
import styles from "../../../layouts/cyberconnect.css";
import router from 'umi/router';
import { FaxTokenImAPI } from '../../../app/api';

const CYBERCONNECT_ENDPOINT = "https://api.cybertino.io/connect/";

const DEMO_ADDRESS = "0x69adadff2459558b663291601d6fe41fbce00a8a";

// Initialize the GraphQL Client
const client = new GraphQLClient(CYBERCONNECT_ENDPOINT);

// You can add/remove fields in query
const GET_CONNECTIONS = gql`
  query($address: String!, $first: Int) {
    identity(address: $address) {
      followings(first: $first) {
        list {
          address
          domain
        }
      }
      followers(first: $first) {
        list {
          address
          domain
        }
      }
    }
  }
`;

// You can change the below variables
const variables = {
  address: DEMO_ADDRESS,
  first: 5
};

//export default function GetConnections(address) {
//export function GetConnections(address) {
  const GetConnections = props => {
  const { address } = props && props.address?props:window.App.loginAddress;
    const { dispatch } = props;
  // const {addContact} = props?props:console.log('no addContact');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [names,setNames]=useState([])
  console.log(JSON.stringify(props));
    const  setChatToUser = useCallback(user => {
      let address=user.target.getAttribute('address');
      let name=user.target.getAttribute('name');
      dispatch({ type: 'media/saveChatUser', payload: { chatUser: {address: address,nickName:name,time:new Date()} } });
      // const {
      //   location: {
      //     query: { s },
      //   },
      const {s} = props.query;
      if (s) {
        router.push('/home');
      }
    },[dispatch, props.query]);
  const clickAddContact = useCallback(() => {
    //   dispatch({ type: 'meetingroom/saveNewChatRoomModal', payload: { newChatRoomModal: true } });
    // }, [dispatch]);
    props && props.addContact?props.addContact():console.log('add Contact');
  },[props]);

  useEffect(() => {
    client
      .request(GET_CONNECTIONS, {address:address?address:window.App.loginAddress,first:5})
      .then((res) => {
        const followersList =res?.identity?.followers?.list.map(async function(follower) {
            if (follower.domain)
              return follower;
            else
              if (names[follower.address])
                return {...follower,domain:names[follower.address]};
            else {
                const domain = await FaxTokenImAPI.getEnsName(address);
                console.log(follower.address, domain);
                names[follower.address] = domain;
                setNames(names);
                for (let i = 0; followers.length; i++)
                  if (followers[i].address == follower.address){
                    followers[i].domain = domain;
                    setFollowers(followers);
                    }
              return {...follower, domain:domain};
            }
          }
          );
        setFollowers(res?.identity?.followers?.list);
//        setFollowers(followers);
        const followingsList =  res?.identity?.followings?.list.map(async function(following) {
            if (following.domain)
              return following;
            else
            if (names[following.address])
              return {...following,domain:names[following.address]};
            else{
              const domain = await FaxTokenImAPI.getEnsName(address);
              console.log(following.address,domain);
              names[following.address]=domain;
              setNames(names);
              for (let i = 0; followings.length; i++)
                if (followings[i].address == following.address){
                  followings[i].domain = domain;
                  setFollowers(followings);
                }
              return {...following,domain:domain};
            }
          }
        );
//        setFollowings(followings);
        setFollowings(res?.identity?.followings?.list);
        setLoading(false);

      })
      .catch((e) => {
        setLoading(false);
        setError(e.message);
      });
  }, [address, followers, followings, names]);

  if (loading) return "Loading...";
  if (error) return `Error! ${error}`;

  // return (
  //   <div>
  //     <h2>{DEMO_ADDRESS}</h2>
  //     <h1>Followers</h1>
  //   </div>);
  return (
    <div>
      <h3>{address}</h3>
      <h1>Followers</h1>
      <div className={styles.table} >
        <div className={styles.head} >
          <div>Address</div>
          <div>Domain</div>
        </div>
        {followers.length > 0 &&
        followers.map((elem, idx) => (
          <div key={idx} className={styles.item} >
            <div><a name={elem.domain} address={elem.address}
              onClick={
              setChatToUser
            }
            >
              {elem.address}</a></div>
            <div>{elem.domain && elem.domain.length>0 ? elem.domain :names[elem.address]?names[elem.address]:"-"}</div>
          </div>
        ))}
      </div>
      <h1>Followings</h1>
      <div className={styles.table}>
        <div className={styles.head} >
          <div>Address</div>
          <div>Domain</div>
        </div>
        {followings.length > 0 &&
        followings.map((elem, idx) => (
          <div className={styles.item}  key={idx} >
            <div>
            <a name={elem.domain} address={elem.address}
                    onClick={
                      setChatToUser
                    }
            >{elem.address}
            </a>
            </div>
            <div>{elem.domain && elem.domain.length>0? elem.domain :names[elem.address]?names[elem.address]:"-"}</div>
          </div>
        ))}
      </div>
      <h3 className={styles.button} ><a  onClick={clickAddContact}>Add Contact</a></h3>
    </div>
  );
}

export default GetConnections;
