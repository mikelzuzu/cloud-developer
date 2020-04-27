# SECURITY
In order to not expose secrets in source control, I decided to encrypt it using [sealed-secrets](https://github.com/bitnami-labs/sealed-secrets)

## INSTALLATION
### K8S cluster
I used this chart to install the tool in the cluster in order to be able to decrypt.
```bash
helm install --namespace kube-system sealed-secrets-controller stable/sealed-secrets
```
### LOCALLY
There are different ways of doing it depends on the OS but realeases can be found [here](https://github.com/bitnami-labs/sealed-secrets/releases)


## HOW TO GET the cert to use the cli locally:
```bash
kubeseal --controller-name=sealed-secrets-controller --controller-namespace=kube-system --fetch-cert > mycert.pem
```
If this approach does not work we can port forward:
```bash
kubectl port-forward sealed-secrets-controller-6ffb7b4cb4-hrmgk 8080:8080 -n kube-system
```
`sealed-secrets-controller-6ffb7b4cb4-hrmgk` is the name of the pod running in your container.
And after curl:
```bash
curl -O localhost:8080/v1/cert.pem
```
After we can use the cli to encrypt our data. 

```bash
kubectl create secret generic mysecret --dry-run --from-literal=foo=bar -o json > mysecret.json
```
```bash
kubeseal --cert cert.pem <mysecret.json > mysealedsecret.json
```
now we can commit mysealedsecret.json to source control

```bash
kubectl create -f mysealedsecret.json
```

For more details follow the official [documentation](https://github.com/bitnami-labs/sealed-secrets/blob/master/README.md).
