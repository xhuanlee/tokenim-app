import { useEffect, useState } from "react";
//import { DEMO_ADDRESS, CYBERCONNECT_ENDPOINT } from "../helpers/constants";
import { GraphQLClient, gql } from "graphql-request";
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
export function GetConnections(address) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);

  useEffect(() => {
    client
      .request(GET_CONNECTIONS, {address:address,first:5})
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

  return (
    <div>
      <h2>{DEMO_ADDRESS}</h2>
      <h1>Followers</h1>
    </div>);
  return (
    <div>
      <h2>{DEMO_ADDRESS}</h2>
      <h1>Followers</h1>
      <div className="table">
        <div className="head">
          <div>Address</div>
          <div>Domain</div>
        </div>
        {followers.length > 0 &&
        followers.map((elem, idx) => (
          <div key={idx} className="item">
            <div>{elem.address}</div>
            <div>{elem.domain ? elem.domain : "-"}</div>
          </div>
        ))}
      </div>
      <h1>Followings</h1>
      <div className="table">
        <div className="head">
          <div>Address</div>
          <div>Domain</div>
        </div>
        {followings.length > 0 &&
        followings.map((elem, idx) => (
          <div key={idx} className="item">
            <div>{elem.address}</div>
            <div>{elem.domain ? elem.domain : "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}