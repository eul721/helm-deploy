#!/bin/sh -l

set -xe

CLUSTER=$3
DRY_RUN=$4
NAMESPACE=$5
RELEASE_NAME=$6
CHART_LOCATION=$7
VALUE_FILES=$8
VALUES=$9

export AWS_ACCESS_KEY_ID=$1
export AWS_SECRET_ACCESS_KEY=$2
export AWS_DEFAULT_REGION=us-east-1

KUBETOKEN=$(aws eks get-token --cluster-name $CLUSTER  | jq -c -r '.status.token')
CLUSTER_ENDPOINT=$(aws eks describe-cluster --name $CLUSTER  | jq -c -r '.cluster.endpoint')


kubectl config set-cluster cluster \
    --server=$CLUSTER_ENDPOINT \
    --insecure-skip-tls-verify
kubectl config set-context cluster \
    --cluster=cluster
kubectl config use-context cluster

CMD_VALUE_FILES=
for path in $(echo $VALUE_FILES | sed "s/,/ /g")
do
    # call your procedure/other scripts here below
    CMD_VALUE_FILES="${CMD_VALUE_FILES} -f ./$path "
done

CMD_VALUES=" --set $VALUES "
echo $CMD_VALUE_FILES

OUTPUT=
if [ "$DRY_RUN" = "true" ]; then
    # Do helm diff and print out result
    OUTPUT=$( \
        helm diff upgrade --install \
            --kube-token=$KUBETOKEN \
            --no-color \
            $RELEASE_NAME $CHART_LOCATION \
            -n $NAMESPACE \
            $CMD_VALUE_FILES \
            $CMD_VALUES \
    )
else
    OUTPUT=$( \
        helm upgrade --install \
            --kube-token=$KUBETOKEN \
            --create-namespace \
            $RELEASE_NAME $CHART_LOCATION \
            -n $NAMESPACE \
            $CMD_VALUE_FILES \
            $CMD_VALUES \
    )
fi

OUTPUT="${OUTPUT//'%'/'%25'}"
OUTPUT="${OUTPUT//$'\n'/'%0A'}"
OUTPUT="${OUTPUT//$'\r'/'%0D'}"
echo "::set-output name=results::$OUTPUT"

