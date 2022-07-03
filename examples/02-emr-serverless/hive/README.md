# *Amazon EMR Serverless* application that invokes *Hive* query

This example shows how to run a *Hive* query on *Amazon EMR Serverless*.

**ℹ️ Throughout this demo, you will utilize environment variables to allow for easy copy/paste!**

## Setup

**ℹ️ You should have already completed the pre-requisites in this repo's [README](/README.md). Also, this example requires that you have access to the *AWS Glue Data Catalog*.**

Define some environment variables to be used later:

```shell
export S3_BUCKET=<YOUR_BUCKET_NAME>
export JOB_ROLE_ARN=arn:aws:iam::<ACCOUNT_ID>:role/emr-serverless-iam-role
```

First, make sure the `01-query.sql` and `00-initialize-schema.sql` scripts are uploaded to an S3 bucket in the given region:

```shell
aws s3 cp 00-initialize-schema.sql s3://${S3_BUCKET}/code/hive/
aws s3 cp 01-query.sql s3://${S3_BUCKET}/code/hive/
```

Now, let's create and start an *Application* on *EMR Serverless*. Applications are where you submit jobs and are associated with a specific open source framework and release version.

For this application, you'll configure [pre-initialized capacity](https://docs.aws.amazon.com/emr/latest/EMR-Serverless-UserGuide/application-capacity-api.html) to ensure this application can begin running jobs immediately.

**ℹ️ Please note that leaving a pre-initialized application running will incur costs in your *AWS Account*.**

```shell
aws emr-serverless create-application     \
  --type HIVE                             \
  --name hive-serverless-demo             \
  --release-label "emr-5.34.0-preview"    \
  --initial-capacity '{
      "DRIVER": {
        "workerCount": 1,
        "resourceConfiguration": {
          "cpu": "2vCPU",
          "memory": "4GB",
          "disk": "30gb"
        }
      },
      "TEZ_TASK": {
        "workerCount": 10,
        "resourceConfiguration": {
          "cpu": "4vCPU",
          "memory": "8GB",
          "disk": "30gb"
        }
      }
    }'                                    \
    --maximum-capacity '{
      "cpu": "400vCPU",
      "memory": "1024GB",
      "disk": "1000GB"
    }'
```

This will return information about your application:

```json
{
  "applicationId": "<APPLICATION_ID>",
  "arn": "arn:aws:emr-serverless:us-east-1:<ACCOUNT_ID>:/applications/<APPLICATION_ID>",
  "name": "hive-serverless-demo"
}
```

You'll set an `APPLICATION_ID` environment variable to reuse later:

```shell
export APPLICATION_ID=<APPLICATION_ID>
```

Get the state of your application:

```shell
aws emr-serverless get-application --application-id $APPLICATION_ID
```

Once your application is in `CREATED` state, you can go ahead and start it:

```shell
aws emr-serverless start-application --application-id $APPLICATION_ID
```

Once your application is in `STARTED` state, you can submit jobs. With [pre-initialized capacity](https://docs.aws.amazon.com/emr/latest/EMR-Serverless-UserGuide/application-capacity-api.html), you can define a minimum amount of resources that *EMR Serverless* keeps ready to respond to interactive queries. *EMR Serverless* will scale your application up as necessary to respond to workloads, but return to the pre-initialized capacity when there is no activity. You can start or stop an application to effectively pause your application so that you are not billed for resources you're not using. If you don't need second-level response times in your workloads, you can use the default capacity and EMR Serverless will decommission all resources when a job is complete and scale back up as more workloads come in.

## Run your job

Now that you've created your application, you can submit jobs to it at any time:

```shell
aws emr-serverless start-job-run              \
    --application-id $APPLICATION_ID          \
    --execution-role-arn $JOB_ROLE_ARN        \
    --job-driver '{
      "hive": {
        "initQueryFile": "s3://'${S3_BUCKET}'/code/hive/00-initialize-schema.sql",
        "query": "s3://'${S3_BUCKET}'/code/hive/01-query.sql",
        "parameters": "--hiveconf hive.exec.scratchdir=s3://'${S3_BUCKET}'/hive/scratch --hiveconf hive.metastore.warehouse.dir=s3://'${S3_BUCKET}'/hive/warehouse"
      }
    }'                                        \
    --configuration-overrides '{
      "applicationConfiguration": [
        {
          "classification": "hive-site",
          "properties": {
            "hive.driver.cores": "2",
            "hive.driver.memory": "4g",
            "hive.tez.container.size": "8192",
            "hive.tez.cpu.vcores": "4"
          }
        }
      ],
      "monitoringConfiguration": {
        "s3MonitoringConfiguration": {
          "logUri": "s3://'${S3_BUCKET}'/hive-logs/"
        }
      }
    }'
```

As a result, you will get the job run identifier:

```json
{
  "applicationId": "<APPLICATION_ID>",
  "arn": "arn:aws:emr-serverless:us-east-1:<ACCOUNT_ID>:/applications/<APPLICATION_ID>/jobruns/<JOB_RUN_ID>",
  "jobRunId": "<JOB_RUN_ID>"
}
```

Let's set our `JOB_RUN_ID` variable, so you can use it to monitor the job progress:

```shell
export JOB_RUN_ID=<JOB_RUN_ID>
aws emr-serverless get-job-run --application-id $APPLICATION_ID --job-run-id $JOB_RUN_ID
```

The job should start within a few seconds since you're making use of pre-initialized capacity.

You can also look at our logs while the job is running:

```shell
aws s3 ls s3://${S3_BUCKET}/hive-logs/applications/$APPLICATION_ID/jobs/$JOB_RUN_ID/
```

Or copy the stdout of the job:

```shell
aws s3 cp s3://${S3_BUCKET}/hive-logs/applications/$APPLICATION_ID/jobs/$JOB_RUN_ID/HIVE_DRIVER/stdout.gz - | gunzip
```

## Clean-up

When you're all done, make sure to call `stop-application` to decommission your capacity and `delete-application` if you're all done:

```shell
aws emr-serverless stop-application --application-id $APPLICATION_ID
aws emr-serverless delete-application --application-id $APPLICATION_ID
```

## *Tez UI* Debugging

First, follow the steps in [building the Tez UI Docker container](/examples/02-emr-serverless/utilities/tez-ui) to build the  container locally.

Then, get credentials and set `S3_LOG_URI`:

```shell
export AWS_ACCESS_KEY_ID="AKIAxxxxxxxxxxxx"
export AWS_SECRET_ACCESS_KEY="yyyyyyyyyyyyyyy"
export AWS_SESSION_TOKEN="zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"

export S3_LOG_URI=s3://${S3_BUCKET}/hive-logs
```

Now you can fire up our container via *Docker* or *Podman*:

```shell
podman run --rm -d                                                                 \
  --name emr-serverless-tez-ui                                                     \
  -p 8088:8088 -p 8188:8188 -p 9999:9999                                           \
  -e AWS_REGION -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY -e AWS_SESSION_TOKEN \
  -e S3_LOG_URI -e JOB_RUN_ID -e APPLICATION_ID                                    \
  emr/tez-ui
```

After start, you can open the *Tez UI* at `http://localhost:9999/tez-ui`. When you're done, stop the container:

```shell
podman stop emr-serverless-tez-ui
```
