//import { getAddress, signText } from './ethers.service';
import {  signText } from '../metamask';
import { generateChallenge } from './generate-challenge'
import { authenticate } from './authenticate'

export const login = async (address) => {
  // we grab the address of the connected wallet
//  const address = await getAddress();

  // we request a challenge from the server
  const challengeResponse = await generateChallenge(address?address:window.ethereum.selectedAddress);
  console.log(challengeResponse)
  // sign the text with the wallet
  const signature = await signText(address?address:window.ethereum.selectedAddress, challengeResponse.data.challenge.text)
  console.log(signature)

  const accessTokens = await authenticate(address?address:window.ethereum.selectedAddress, signature);
  console.log(accessTokens);
  // you now have the accessToken and the refreshToken
  // {
  //  data: {
  //   authenticate: {
  //    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjB4YjE5QzI4OTBjZjk0N0FEM2YwYjdkN0U1QTlmZkJjZTM2ZDNmOWJkMiIsInJvbGUiOiJub3JtYWwiLCJpYXQiOjE2NDUxMDQyMzEsImV4cCI6MTY0NTEwNjAzMX0.lwLlo3UBxjNGn5D_W25oh2rg2I_ZS3KVuU9n7dctGIU",
  //    refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjB4YjE5QzI4OTBjZjk0N0FEM2YwYjdkN0U1QTlmZkJjZTM2ZDNmOWJkMiIsInJvbGUiOiJyZWZyZXNoIiwiaWF0IjoxNjQ1MTA0MjMxLCJleHAiOjE2NDUxOTA2MzF9.2Tdts-dLVWgTLXmah8cfzNx7sGLFtMBY7Z9VXcn2ZpE"
  //   }
  // }
}
