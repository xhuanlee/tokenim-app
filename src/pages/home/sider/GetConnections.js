import { useEffect, useState } from "react";
//import { DEMO_ADDRESS, CYBERCONNECT_ENDPOINT } from "../helpers/constants";
import { GraphQLClient, gql } from "graphql-request";
import MeetingRoom from '@/pages/home/content/MeetingRoom';
import "../../../layouts/cyberconnect.css";

const CYBERCONNECT_ENDPOINT = "https://api.cybertino.io/connect/";

const DEMO_ADDRESS = "0x69adadff2459558b663291601d6fe41fbce00a8a";

// Initialize the GraphQL Client
const client = new GraphQLClient(CYBERCONNECT_ENDPOINT);

const h1 = {
  fontFamily: '"Outfit", sans-serif',
  fontSize: '1.5rem'
};

const tableStyle = {
  boxShadow: '0 2px 8px rgb(84 70 35 / 15%), 0 1px 3px rgb(84 70 35 / 15%)',
  borderRadius: 4
}

const head_itemStyle = {
  boxShadow: '0 2px 8px rgb(84 70 35 / 15%), 0 1px 3px rgb(84 70 35 / 15%)',
  borderRadius: 4,
  display: 'grid',
  gridTemplateColumns: '4fr 2fr',
  gridGap: 20,
  fontFamily: '"Outfit", sans-serif',
  padding: '10px 20px'
}

const headStyle = {
  borderRadius: '4px 4px 0px 0px',
  background: '#2c2c2c',
  color: '#ffffff',
  fontWeight: 500,
  textAlign: 'center',
  textTransform: 'uppercase'
}

const itemStyle = {
  display: 'grid',
  gridTemplateColumns: '4fr 2fr',
  gridGap: 20,
  fontFamily: '"Outfit", sans-serif',
  padding: '10px 20px',
  fontWeight: 300
}

// .item:nth-child(2n + 1) {
//   background: rgb(247, 247, 247, 0);
// }
//
// .item:nth-child(2n) {
//   background: rgb(247, 247, 247, 0.5);
// }

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  console.log(JSON.stringify(props));

  useEffect(() => {
    client
      .request(GET_CONNECTIONS, {address:address?address:window.App.loginAddress,first:5})
      .then((res) => {
        setLoading(false);
        setFollowers(res?.identity?.followers?.list);
        setFollowings(res?.identity?.followings?.list);
      })
      .catch((e) => {
        setLoading(false);
        setError(e.message);
      });
  }, [address]);

  if (loading) return "Loading...";
  if (error) return `Error! ${error}`;

  // return (
  //   <div>
  //     <h2>{DEMO_ADDRESS}</h2>
  //     <h1>Followers</h1>
  //   </div>);
  return (
    <div>
      <h2>{address}</h2>
      <h1>Followers</h1>
      <div className="table" style={{boxShadow: '0 2px 8px rgb(84 70 35 / 15%), 0 1px 3px rgb(84 70 35 / 15%)',
        borderRadius: 4}}>
        <div className="head" style={head_itemStyle}>
          <div>Address</div>
          <div>Domain</div>
        </div>
        {followers.length > 0 &&
        followers.map((elem, idx) => (
          <div key={idx} className="item" style={itemStyle}>
            <div>{elem.address}</div>
            <div>{elem.domain ? elem.domain : "-"}</div>
          </div>
        ))}
      </div>
      <h1>Followings</h1>
      <div className="table">
        <div className="head" style={head_itemStyle}>
          <div>Address</div>
          <div>Domain</div>
        </div>
        {followings.length > 0 &&
        followings.map((elem, idx) => (
          <div key={idx} className="item" style={itemStyle}>
            <div>{elem.address}</div>
            <div>{elem.domain ? elem.domain : "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GetConnections;
