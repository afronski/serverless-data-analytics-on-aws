import * as fs from "fs";
import * as path from "path";

import * as yaml from "js-yaml";

import { Stack, Tags, RemovalPolicy, Fn } from "aws-cdk-lib";
import { Construct } from "constructs";

import { CfnEnvironmentEC2 } from "aws-cdk-lib/aws-cloud9";
import { GatewayVpcEndpointAwsService, Peer, Port, SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { CfnAssociation, CfnDocument } from "aws-cdk-lib/aws-ssm";

import { RegionalInfrastructureStackProps } from "./props/regional-infrastructure-stack-props";

export class RegionalInfrastructureStack extends Stack {
  public readonly outputBucket: Bucket;

  constructor(scope: Construct, id: string, props: RegionalInfrastructureStackProps) {
    super(scope, id, props);

    const accountId = Stack.of(this).account;
    const region = Stack.of(this).region;

    // Amazon S3 Bucket for various logs.

    this.outputBucket = new Bucket(this, "LogsS3Bucket", {
      bucketName: `test-infrastructure-stack-bucket-for-logs-in-${region}`,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL
    });

    this.outputBucket.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // Shared VPC for the IDE that will be connected to the various clusters.

    const vpc = new Vpc(this, "MainVPC", {
      maxAzs: 3,
      natGateways: 3
    });

    const vpcGateway = vpc.node.findChild("VPCGW");

    const nat1 = vpc.node.findChild("PublicSubnet1").node.findChild("NATGateway");
    const nat2 = vpc.node.findChild("PublicSubnet2").node.findChild("NATGateway");
    const nat3 = vpc.node.findChild("PublicSubnet3").node.findChild("NATGateway");

    nat1.node.addDependency(vpcGateway);
    nat2.node.addDependency(vpcGateway);
    nat3.node.addDependency(vpcGateway);

    vpc.addGatewayEndpoint("S3VPCEndpoint", { service: GatewayVpcEndpointAwsService.S3 });
    vpc.addGatewayEndpoint("DynamoDBVPCEndpoint", { service: GatewayVpcEndpointAwsService.DYNAMODB });

    const securityGroupName = "sls-data-analytics-sg";

    const securityGroup = new SecurityGroup(this, "SLS-DA-SG", {
      securityGroupName,
      vpc,
      allowAllOutbound: true
    });

    securityGroup.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcp(5439));

    securityGroup.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcp(9092));
    securityGroup.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcp(9094));
    securityGroup.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcp(9096));
    securityGroup.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcp(9098));
    securityGroup.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcp(2181));

    securityGroup.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcp(10000));
    securityGroup.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcp(18080));

    // And then you can create AWS Cloud9 IDE instance if needed.
    // If the AWS Cloud9 has special tag applied SSM document kicks in and completes bootstrapping.

    if (props.createIDE && props.instanceTypeIDE) {
      const content = fs.readFileSync(path.join(__dirname, "assets/aws-cloud9-bootstrap.yml")).toString();

      const document = new CfnDocument(this, "Cloud9IDEAutomationScript", {
        documentType: "Command",
        content: yaml.load(content)
      });

      new CfnAssociation(this, "Cloud9IDEAssociation", {
        name: Fn.ref(document.logicalId),
        outputLocation: {
          s3Location: {
            outputS3BucketName: this.outputBucket.bucketName,
            outputS3KeyPrefix: "aws-cloud9/bootstrapping-logs/"
          }
        },
        targets: [ { key: "tag:BootstrapViaSSM", values: [ "true" ] } ]
      });

      const ide = new CfnEnvironmentEC2(this, "MainIDE", {
        name: `ide-for-${props.userName}`,
        description: `IDE for ${props.userName}.`,

        instanceType: props.instanceTypeIDE.toString(),

        subnetId: vpc.privateSubnets[0].subnetId,

        ownerArn: `arn:aws:iam::${accountId}:user/${props.userName}`,

        connectionType: "CONNECT_SSM",
        automaticStopTimeMinutes: 60,

        imageId: "resolve:ssm:/aws/service/cloud9/amis/amazonlinux-2-x86_64"
      });

      // Kick-off SSM bootstrapping.
      Tags.of(ide).add("BootstrapViaSSM", "true");
    }
  }
}
