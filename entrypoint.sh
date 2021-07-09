#!/bin/sh -l

set -xe

CLUSTER=$3
UNINSTALL=$4
DRY_RUN=$5
NAMESPACE=$6
RELEASE_NAME=$7
CHART_LOCATION=$8
VALUE_FILES=$9
VALUES=${10}

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

helm plugin install https://github.com/databus23/helm-diff || true # this can't be in Dockerfile due to user pathing issue

CMD_VALUE_FILES=
for path in $(echo $VALUE_FILES | sed "s/,/ /g")
do
    # call your procedure/other scripts here below
    CMD_VALUE_FILES="${CMD_VALUE_FILES} -f ./$path "
done

CMD_VALUES=" --set $VALUES "
echo $CMD_VALUE_FILES

OUTPUT=
if [ "$UNINSTALL" = "true" ]; then
    # Uninstall release
    OUTPUT=$( \
        helm uninstall \
            --kube-token=$KUBETOKEN \
            -n $NAMESPACE $RELEASE_NAME \
    )
else
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
fi

OUTPUT="${OUTPUT//'%'/'%25'}"
OUTPUT="${OUTPUT//$'\n'/'%0A'}"
OUTPUT="${OUTPUT//$'\r'/'%0D'}"
echo "::set-output name=results::$OUTPUT"

