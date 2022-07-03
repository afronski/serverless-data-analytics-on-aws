# Example for *Amazon MSK Serverless*

## Steps

**ℹ️ Throughout this demo, you will utilize environment variables to allow for easy copy/paste!**

As a first step you should head to this directory `examples/01-msk-serverless`. Then we need to export *JAR* file into
the that *Java* `CLASSPATH` which will handle *IAM* authentication via *SASL*:

```shell
export CLASSPATH=$(pwd)/aws-msk-iam-auth-1.1.2-all.jar
```

Next, we need to get addresses of the *Apache Kafka* brokers - either from the *AWS Management Console* or from the
*AWS CLI*:

```shell
export CLUSTER_NAME=<PUT HERE YOUR SERVERLESS CLUSTER NAME>
export CLUSTER_ARN=$(aws kafka list-clusters-v2 --cluster-name ${CLUSTER_NAME} | jq -r ".ClusterInfoList[0].ClusterArn")
export KAFKA_BROKERS=$(aws kafka get-bootstrap-brokers --cluster-arn ${CLUSTER_ARN} | jq -r ".BootstrapBrokerStringSaslIam")
```

Now we can create new topic:

```shell
export TOPIC=sls-testing-topic
kafka-topics --create --bootstrap-server ${KAFKA_BROKERS} --replication-factor 3 --partitions 3 --topic ${TOPIC} --command-config client-config.properties
```

We can verify that newly created topic is available:

```shell
kafka-topics --list --bootstrap-server ${KAFKA_BROKERS} --command-config client-config.properties
```

Let's connect with the console producer to it:

```shell
kafka-console-producer --bootstrap-server ${KAFKA_BROKERS} --producer.config client-config.properties --topic ${TOPIC}
```

Now, please open one additional terminal session, and connect with console consumer to the same topic:

```shell
kafka-console-consumer --bootstrap-server ${KAFKA_BROKERS} --topic ${TOPIC} --from-beginning --consumer.config client-config.properties --group main-consumer-group
```

Now every single thing you will enter on the producer side, will be immediately visible on the consumer side.

## Known Limitations

- **No way to choose *Apache Kafka* version**.
- **Only *IAM* authentication is supported**.
- No *AWS CloudFormation* support at the moment.
- No way to reconfigure brokers at the moment.
- Quotas are restrictive:
  - Maximum data retention: `1 day`
  - Maximum ingress throughput: `200 MBps`
  - Maximum egress throughput: `400 MBps`
  - Max number of client connections: `1000`
  - Maximum message size: `8 MB`
  - Maximum request size: `100 MB`
  - Maximum fetch bytes per request: `55 MB`
  - Maximum number of consumer groups: `500`
  - Maximum number of partitions: `120`
  - Maximum ingress throughput per partition: `5 MBps`
  - Maximum egress throughput per partition: `10 MBps`
  - Maximum partition size: `250 GB`
  - Maximum number of client VPCs per serverless cluster: `5`
  - Maximum number of *Serverless* clusters per account: `1`
