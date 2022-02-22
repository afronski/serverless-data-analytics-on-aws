# *Amazon EMR Serverless* application with *PySpark* job

This example shows how to run a *PySpark* job on *Amazon EMR Serverless*.

**ℹ️ Throughout this demo, you will utilize environment variables to allow for easy copy/paste!**

## Setup

**ℹ️ You should have already completed the pre-requisites in this repo's [README](/README.md).**

Define some environment variables to be used later:

```shell
export S3_BUCKET=<YOUR_BUCKET_NAME>
export JOB_ROLE_ARN=arn:aws:iam::<ACCOUNT_ID>:role/emr-serverless-iam-role
```

First, make sure the `job.py` script is uploaded to an *S3* bucket in the `us-east-1` region:

```shell
aws s3 cp job.py s3://${S3_BUCKET}/code/pyspark/
```

Now, let's create and start an *Application* on *EMR Serverless*. Applications are where you submit jobs and are
associated with a specific open source framework and release version.

For this application, we'll configure [pre-initialized capacity](https://docs.aws.amazon.com/emr/latest/EMR-Serverless-UserGuide/application-capacity-api.html)
to ensure this application can begin running jobs immediately.

**ℹ️ Please note that leaving a pre-initialized application running will incur costs in your *AWS Account*.**

  ```shell
aws emr-serverless create-application   \
  --type SPARK                          \
  --name pyspark-serverless-demo        \
  --release-label "emr-6.5.0-preview"   \
  --initial-capacity '{
    "DRIVER": {
      "workerCount": 2,
      "resourceConfiguration": {
        "cpu": "2vCPU",
        "memory": "4GB"
      }
    },
    "EXECUTOR": {
      "workerCount": 10,
      "resourceConfiguration": {
        "cpu": "4vCPU",
        "memory": "4GB"
      }
    }
  }'                                    \
  --maximum-capacity '{
    "cpu": "200vCPU",
    "memory": "200GB",
    "disk": "1000GB"
  }'
```

This will return information about your application. In this case, we've created an application that can handle
2 simultaneous *Spark* apps with an initial set of *10* executors, each with *4 vCPU* and *4 GB* of memory, that can
scale up to *200 vCPUs* or *50* executors:

```json
{
  "applicationId": "<APPLICATION_ID>",
  "arn": "arn:aws:emr-serverless:us-east-1:<ACCOUNT_ID>:/applications/<APPLICATION_ID>",
  "name": "pyspark-serverless-demo"
}
```

We'll set an `<APPLICATION_ID>` environment variable to reuse later:

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

Once your application is in `STARTED` state, you can submit jobs:

With [pre-initialized capacity](https://docs.aws.amazon.com/emr/latest/EMR-Serverless-UserGuide/application-capacity-api.html),
you can define a minimum amount of resources that *EMR Serverless* keeps ready to respond to interactive queries.
*EMR Serverless* will scale your application up as necessary to respond to workloads, but return to the pre-initialized
capacity when there is no activity. You can start or stop an application to effectively pause your application so that
you are not billed for resources you're not using. If you don't need second-level response times in your workloads,
you can use the default capacity and EMR Serverless will decomission all resources when a job is complete and scale
back up as more workloads come in.

## Run your job

Now that you've created your application, you can submit jobs to it at any time.

You define our `sparkSubmitParameters` with resources that match our pre-initialized capacity, but *EMR Serverless* will
still automatically scale as necessary.

**ℹ️ Note that with *Spark* jobs, you must account for *Spark* overhead and configure our executor with less memory
than the application.**

In this case, we're also configuring *Spark* logs to be delivered to our *S3* bucket:

```shell
aws emr-serverless start-job-run        \
  --application-id $APPLICATION_ID      \
  --execution-role-arn $JOB_ROLE_ARN    \
  --job-driver '{
    "sparkSubmit": {
      "entryPoint": "s3://'${S3_BUCKET}'/code/pyspark/job.py",
      "sparkSubmitParameters": "--conf spark.driver.cores=1 --conf spark.driver.memory=3g --conf spark.executor.cores=4 --conf spark.executor.memory=3g --conf spark.executor.instances=10"
    }
  }'                                    \
  --configuration-overrides '{
    "monitoringConfiguration": {
      "s3MonitoringConfiguration": {
        "logUri": "s3://'${S3_BUCKET}'/logs/"
      }
    }
  }'
```

This will return information about your application:

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
```

```shell
aws emr-serverless get-job-run --application-id $APPLICATION_ID --job-run-id $JOB_RUN_ID
```

The job should start within a few seconds since we're making use of pre-initialized capacity.

You can also look at our logs while the job is running:

```shell
aws s3 ls s3://${S3_BUCKET}/logs/applications/$APPLICATION_ID/jobs/$JOB_RUN_ID/
```

Or copy the stdout of the job:

```shell
aws s3 cp s3://${S3_BUCKET}/logs/applications/$APPLICATION_ID/jobs/$JOB_RUN_ID/SPARK_DRIVER/stdout.gz - | gunzip
```

## Clean-up

When you're all done, make sure to call `stop-application` to decommission your capacity and `delete-application`
if you're all done:

```shell
aws emr-serverless stop-application --application-id $APPLICATION_ID
aws emr-serverless delete-application --application-id $APPLICATION_ID
```

## *Spark UI* Debugging

First, follow the steps in [building the Spark UI Docker container](/examples/02-emr-serverless/utilities/spark-ui) to
build the container locally.

Next, get credentials and set `LOG_DIR`:

```shell
export AWS_ACCESS_KEY_ID="AKIAxxxxxxxxxxxx"
export AWS_SECRET_ACCESS_KEY="yyyyyyyyyyyyyyy"
export AWS_SESSION_TOKEN="zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"

export LOG_DIR=s3://${S3_BUCKET}/logs/applications/$APPLICATION_ID/jobs/$JOB_RUN_ID/sparklogs/
```

Now you can fire up our container via *Docker* or *Podman*:

```shell
podman run --rm -d                                                    \
  --name emr-serverless-spark-ui                                      \
  -p 18080:18080                                                      \
  -e SPARK_HISTORY_OPTS="-Dspark.history.fs.logDirectory=$LOG_DIR -Dspark.hadoop.fs.s3.customAWSCredentialsProvider=com.amazonaws.auth.DefaultAWSCredentialsProviderChain" \
  -e AWS_REGION=us-east-1                                             \
  -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY -e AWS_SESSION_TOKEN  \
  emr/spark-ui
```

After start, you can access the *Spark UI* via following address: `http://localhost:18080`. When you're done, stop the
container:

```shell
podman stop emr-serverless-spark-ui
```

## Using the *AWS Glue Data Catalog* with *EMR Serverless*

You can use the *AWS Glue Data Catalog* along with *SparkSQL* in *EMR Serverless* by setting the proper *Hive Metastore*
config item.

You can do this when creating a new `SparkSession` in your *PySpark* code, make sure you also call
`enableHiveSupport()`:

```python
from pyspark.sql import SparkSession

spark = (
  SparkSession.builder.appName("SparkSQL")
  .config(
    "hive.metastore.client.factory.class",
    "com.amazonaws.glue.catalog.metastore.AWSGlueDataCatalogHiveClientFactory"
  )
  .enableHiveSupport()
  .getOrCreate()
)

# You can query tables with SparkSQL:
spark.sql("SHOW TABLES").show()

# Or you can also them with native Spark code:
print(spark.catalog.listTables())
```
