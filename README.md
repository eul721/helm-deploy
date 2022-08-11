# Helm Deploy Github action

This github action deploys helm releases into specified cluster.

It features:
* EKS Auth
* Helm command dispatches
* Diff tool for preview


## Usage

```yaml
on: push
name: deploy
jobs:
  deploy:
    name: deploy to cluster
    runs-on: ubuntu-latest
    steps:
    - name: Inject slug/short variables
        uses: rlespinasse/github-slug-action@v3.x
    - uses: actions/checkout@v2
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    - name: Gen build info
        run: |
          echo VER=$(git rev-parse --short=8 ${{ github.sha }}) >> $GITHUB_ENV
          REF=$(echo "${{ github.ref }}" | awk -F'/' '{print $3}')
          CLUSTER=<<cluster_name>
          echo "BRANCH=$REF" >> $GITHUB_ENV
          echo "CLUSTER=$CLUSTER" >> $GITHUB_ENV
    - name: Helm Deploy
        uses: eul721/helm-deploy@v1.0.0
        with:
          cluster: ${{ env.CLUSTER }}
          dry-run: true
          namespace: app_namespace
          release-name: my_app_${{ env.BRANCH }}
          chart-location: <<helm_chart_location_relative_to_repo_root>>
          value-files: helm_values/${{ env.BRANCH }}/base.yaml,helm_values/${{ env.BRANCH }}/app.yaml
          values: "app.tag=${{ env.VER }}"
```

## Arguments
|Argument|Description|Default|Notes|
|-|-|-|-|
|`cluster`|Cluster to deploy to|-|Required|
|`dry-run`|Whether to perform a dry run|`'true'`|If `'true'`, helm will not actually deploy to the cluster, but perform a dry-run and present a changeset to output|
|`namespace`|K8s namespace to deploy to|-|Required. If doesn't exist, will be created on the fly.|
|`release-name`|K8s release name|-|Required|
|`chart-location`|Path to the helm chart|-|Required. Relative to repo root.|
|`value-files`|Comma-delimited list of paths to value files used in the deployment|-|Optional. In the format of `path1,path2,path3`
|`values`|Comma-delimited list of kv pairs to be used in the deployment adhoc|-|Optional. In the format of `key1=val1,key2=val2,key3=val3`|

## Printing a Helm Diff Preview

You can use the same action to run a [helm diff](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjqk8CU9b3xAhUQHjQIHbx_CdwQFjAAegQIAhAD&url=https%3A%2F%2Fgithub.com%2Fdatabus23%2Fhelm-diff&usg=AOvVaw1CxcOMadRByfe_yGw0xToE) and use the changeset in a comment/workflow step. To do so

```yaml
- name: Helm Diff Download
  id: helm_diff_download
  if: github.event_name == 'pull_request'
  uses: eul721/helm-deploy@v1.0.0
  with:
    cluster: ${{ env.CLUSTER }}
    dry-run: true
    namespace: publisher-service
    release-name: download-service-${{ env.BRANCH }}
    chart-location: helm_chart
    value-files: helm_values/${{ env.BRANCH }}/base.yaml,helm_values/${{ env.BRANCH }}/download.yaml
    values: "app.tag=${{ env.VER }}"
- name: Comment PR
  uses: actions/github-script@0.9.0
  if: github.event_name == 'pull_request'
  env:
    DOWNLOAD_OUTPUT: "```\n${{ steps.helm_diff_download.outputs.results }}\n```"
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    script: |
      output = `
      github-actions[bot]: \n
      **Changelist**\n
      <details>
        <summary>download:</summary>\n\n
        ${process.env.DOWNLOAD_OUTPUT}\n\n
      </details>`;
      github.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: output
      })
```