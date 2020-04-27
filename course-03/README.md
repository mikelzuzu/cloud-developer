# CI/CD process with travis and Kubeone

My approach for using travis to build and deploy the application is based on that K8S is running in a public ip/domain. For local testing, I was happy enough with the builds and publish into Dockerhub by travis.


## Creating a cluster in AWS

### Terrafom 
In this case I used terraform scripts provided by [Kubeone](https://github.com/kubermatic/kubeone/tree/master/examples/terraform/aws) 
1. Install terraform version specified in the [Kubeone](https://github.com/kubermatic/kubeone/blob/master/docs/quickstart-aws.md) 
2. export AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables that the terraform script should use. Otherwise it will pick from `~/.aws/credentials`
3. Download specific [release](https://github.com/kubermatic/kubeone/releases) version and navigate to `./examples/terraform/aws`
4. Once in that directory:
```bash
terraform init
```
**Note:** You need to run this command only the first time before using scripts.
5. Modify `terraform.tfvars` or `variables.tf` in order to add cluster name, AWS region, instances size and [similar](https://github.com/kubermatic/kubeone/blob/master/examples/terraform/aws/variables.tf).
```bash
cluster_name = "udagram-zuzu-dev"
aws_region = "us-east-1"
ssh_public_key_file = "~/.ssh/k8s_rsa.pub"
control_plane_volume_size = 30
worker_type = "t2.micro"
```
6. Run `terraform plan` to check what will change or create.
7. Run `terraform apply` to provision the infrastructure.

### Kubeone
1. Create the config file with the version of Kubernetes to be deployed
```yaml
apiVersion: kubeone.io/v1alpha1
kind: KubeOneCluster
versions:
  kubernetes: '1.17.5'
cloudProvider:
  name: 'aws'
```
2. Create JSON output of terraform: `terraform output -json > tf.json`
3. Run the install command: `kubeone install config.yaml --tfjson <dir-previous-file>`
4. At the end of the process and when the cluster is provisioned a config file will be generated wit the name **<cluster_name>-kubeconfig**
```bash
kubectl --kubeconfig=<cluster_name>-kubeconfig
```

or export the `KUBECONFIG` environment variable and kubectl will read from there

```bash
export KUBECONFIG=$PWD/<cluster_name>-kubeconfig
```


## Travis Configuration
- Some environment variables are stored in travis, some others in travis.yml:
    - DOCKER_USER
    - DOCKER_PASSWD
- Steps in travis file:
    1. Remove existing docker-compose
    2. Install specific docker-compose and kubectl versions
    3. Build docker images
    4. Push docker images to Dockerhub
    5. Deploy our application and env variables (secrets including)
    6. Wait until the pods are running

## Zero down time
- This is something that kubernetes does out of the box but I added the strategy in the deployments. It is specified that it cannot go to less than replica counts the number of pods so it is allowed to increase in two the number of pods in the updating process. Let's say that if they were two replicas, during the update process it can be increased until for and they should be all the time two pods serving traffic (this example is with the desire 2 number of pods).

## Autoscaling
Inside course-03/exercises/udacity-c3-deployment/k8s there are templates for autoscaling.
In order to use the horizontal pod autoscaler (hpa) resource, there is a need to install metrics-server
```bash
helm install --namespace kube-system metrics-server stable/metrics-server --set args[0]="--kubelet-insecure-tls"
```