# Installation
> `npm install serverless
> sls config credentials --provider aws --key {{Access key ID}} --secret {{Secret access key}} --profile serverless
> sls deploy -v --aws-profile serverless
> sls remove -v --aws-profile serverless

# Summary


# Security with Auth0

## Auth0 HS256
In order to configure Auth with AWS secrets manager, go into AWS console. In the list of secrets, choose the one from `serverless.yaml` file that we created. I our case it should be "Auth0Secret-dev" (dev it is because our stage name). Now it is needed to create `Secret Value`.

- key: this field should be the one defined in the `serverless.yaml` which in our case is "auth0Secret"
- value: this has to be taken from Auth0. The value can be found in the application that we created -> settings -> Client secret


# Details


### Additional Details

