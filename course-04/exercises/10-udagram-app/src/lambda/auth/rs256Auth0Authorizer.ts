
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDBTCCAe2gAwIBAgIJLSfi8nTCk8ftMA0GCSqGSIb3DQEBCwUAMCAxHjAcBgNV
BAMTFWRldi16dXp1LmV1LmF1dGgwLmNvbTAeFw0yMDA1MDQxMDUzNDRaFw0zNDAx
MTExMDUzNDRaMCAxHjAcBgNVBAMTFWRldi16dXp1LmV1LmF1dGgwLmNvbTCCASIw
DQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANMgYMoGRu4Cht7+g1tpP2GZ9Zt6
yVce74BXbcwKfrwH8nmuMrK3pdlO9yxLQyySxLuwkXe5PwhWPf2wwjkGUyZ6sda/
aRH3NdpsXuXCdBZmHY7kqpjmeCZ5xwEshpsClqXyAWym8uyM5TuqIUX7eZfj4Nzq
VE0OTiuEFlZI5Jh3xQ9HJumU/OoFGH2lBZ2BAfufPiBNNwAaa9aSZwzsGxxhn0gt
4MgDyplum+TQ1PEuTSoydGNFmzba9N9EKpVRJ/wfS95YY9OUMslS7uQzrnRF1TKy
yRB+Pfj1nMxsO2aCf6+fmBVVZf9vSRKc7bJ90oOxIguNmUdEliWF5UBmWWkCAwEA
AaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUSg+Z6Lxeu8Xboz6FNEa/
AlsNx00wDgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQCbeFpBQBdV
+kSQ53/n/lDALNb/xppqJAUFap20l3dGtA02IADytNG/4FaihgZQBrYvOV9WcWSR
Z3gXoqkJzyfsHgpMQlO7Y8CoeqZOYREe4Vwwq6nmjmxsk4E7bMAxNFpR3a1z1ODn
axOoGmW22c0y1oGYD3MLnn/JmwXY2m3t12enY3WWDbom3bp9Ogbtisnv5DDg3oMs
mfThVWK6EKI895TS0igyF4SOOpoLRnnatCKNa7X6qy2b1rZCeBoD0MimPLcE986n
g6F6iyJWlyw4eZ67fzquD3wn+Jtd3khA7GJTFXvOmWTWyNFHksuM4Ro+FmTjb1oF
kcHDkCTTA6xx
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
