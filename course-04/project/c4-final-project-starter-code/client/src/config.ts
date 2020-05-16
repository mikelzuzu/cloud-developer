// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '0yalk7fn06'
export const apiEndpoint = `https://${apiId}.execute-api.eu-west-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-zuzu.eu.auth0.com',            // Auth0 domain
  clientId: 'd0HjgHlQ4VDJV7IABO0R2C4oHlmHTkkx',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
