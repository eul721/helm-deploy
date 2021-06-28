#!/bin/sh -l

AWS_ACCESS_KEY_ID=$1
AWS_SECRET_ACCESS_KEY=$2
CLUSTER=$3
DRY_RUN=$4
CHART_LOCATION=$5
VALUE_FILES=$6
VALUES=$7

KUBETOKEN=$(aws eks get-token --cluster-name $CLUSTER --region us-east-1 | jq -c -r '.status.token')
CLUSTER_ENDPOINT=$(aws eks describe-cluster --name $CLUSTER --region us-east-1 | jq -c -r '.cluster.endpoint')

echo $KUBETOKEN
echo $CLUSTER_ENDPOINT