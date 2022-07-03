#!/usr/bin/env node

import "source-map-support/register";

import * as cdk from "aws-cdk-lib";

import { InstanceClass, InstanceSize, InstanceType } from "aws-cdk-lib/aws-ec2";

import { RegionalInfrastructureStack } from "../lib/regional-infrastructure-stack";
import { SharedInfrastructureStack } from "../lib/shared-infrastructure-stack";

const account = process.env.AWS_ACCOUNT_ID || process.env.CDK_DEFAULT_ACCOUNT || null;
const region = process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION || null;
const userName = process.env.AWS_USERNAME || null;

if (!account) {
  throw new Error("Environment variable `AWS_ACCOUNT_ID` or `CDK_DEFAULT_ACCOUNT` is required.");
}

if (!region) {
  throw new Error("Environment variable `AWS_REGION` or `CDK_DEFAULT_REGION` is required.");
}

if (!userName) {
  throw new Error("Environment variable `AWS_USERNAME` is required.");
}

const app = new cdk.App();

const infrastructure = new RegionalInfrastructureStack(app, "TestInfrastructureStack", {
  env: { account, region },

  userName,
  createIDE: true,
  instanceTypeIDE: InstanceType.of(InstanceClass.M5, InstanceSize.XLARGE2)
});

new SharedInfrastructureStack(app, "SharedInfrastructureStack", {
  env: { account, region },

  outputBucketForEMRAndRedshift: infrastructure.outputBucket
});
