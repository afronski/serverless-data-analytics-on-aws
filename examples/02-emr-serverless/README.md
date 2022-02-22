# Example for *Amazon EMR Serverless*

## How to use that?

We have a few different directories here. Two are representing examples how to operate with *Amazon EMR Serverless*:

- [`hive`](./hive): contains example how to run a *Hive* queries via *EMR Serverless* application.
- [`pyspark`](./pyspark): contains example how to run a *PySpark* job via *EMR Serverless* application.

Another two are for the debugging purposes - either via *Apache Spark UI* for *PySpark* or via *Tez UI*, where we can
debug *Hive* queries:

- [`utilities/spark-ui`](./utilities/spark-ui): it contains definitions for building a container with *Apache Spark UI*.
- [`utilities/tez-ui`](./utilities/tez-ui): it contains definitions for building a container with *Tez UI*.

In both cases we are building container images that allow us to do this locally based on the logs stored in *S3* bucket.

## Known Limitations

- It only works in `us-east-1` at the moment.
- No *AWS CloudFormation*, nor *AWS Management Console* support at the moment - only *AWS CLI*.
- It supports only `SPARK` or `HIVE` application types at the moment.
- You can have up to 10 running applications per account.
- You can have up to 100 active workers per application.
- A job can run up to three hours.
- A job can access *AWS* service endpoints within the same region.
  - Cross-regional *AWS* service access and access to internet are not supported.
