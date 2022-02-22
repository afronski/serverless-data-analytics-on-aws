# *Apache Spark UI*

You can use this container image to start the *Apache Spark History Server (SHS)* and view the *Spark UI* locally.

## Pre-requisites

- *Docker* or *Podman*.
  - Remember to adjust commands below to your tool of choice - for me, it's `podman`.
- Exported environment variable named `S3_BUCKET` that contains name of the S3 bucket with the logs.

## Build container image

1. Clone this repository and change into the `examples/01-emr-serverless/utilities/spark-ui` directory.
   ```shell
   cd examples/02-emr-serverless/utilities/spark-ui/
   ```
2. Login to *Amazon ECR* (we take a base image from there).
   ```shell
   aws ecr get-login-password --region us-east-1 | podman login --username AWS --password-stdin 755674844232.dkr.ecr.us-east-1.amazonaws.com
   ```
3. Build the image.
   ```shell
   podman build -t emr/spark-ui .
   ```

## Start the Spark History Server

You can use a pair of *AWS* access key and secret key, or temporary *AWS* credentials.

1. Set `LOG_DIR` to the location of your *Apache Spark* logs.
   ```shell
   export LOG_DIR=s3://${S3_BUCKET}/logs/applications/$APPLICATION_ID/jobs/$JOB_RUN_ID/sparklogs/
   ```
2. Set your *AWS* access key and secret key, and optionally session token.
   ```shell
   export AWS_ACCESS_KEY_ID="ASIAxxxxxxxxxxxx"
   export AWS_SECRET_ACCESS_KEY="yyyyyyyyyyyyyyy"
   export AWS_SESSION_TOKEN="zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"
   ```
3. Run the container image.
   ```shell
   podman run --rm -it                                                  \
     -p 18080:18080                                                     \
     -e SPARK_HISTORY_OPTS="-Dspark.history.fs.logDirectory=$LOG_DIR -Dspark.hadoop.fs.s3.customAWSCredentialsProvider=com.amazonaws.auth.DefaultAWSCredentialsProviderChain" \
     -e AWS_REGION=us-east-1                                            \
     -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY -e AWS_SESSION_TOKEN \
    emr/spark-ui
   ```
4. Access the *Spark UI* via `http://localhost:18080`.
