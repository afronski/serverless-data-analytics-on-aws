#!/usr/bin/env node

import "source-map-support/register";

import * as cdk from "aws-cdk-lib";

import { InstanceClass, InstanceSize, InstanceType } from "aws-cdk-lib/aws-ec2";

import { RegionalInfrastructureStack } from "../lib/regional-infrastructure-stack";
import { SharedInfrastructureStack } from "../lib/shared-infrastructure-stack";

const accountId = process.env.AWS_ACCOUNT_ID || null;
const userName = process.env.AWS_USERNAME || null;

if (!accountId) {
  throw new Error("Environment variable `AWS_ACCOUNT_ID` is required.");
}

if (!userName) {
  throw new Error("Environment variable `AWS_USERNAME` is required.");
}

const app = new cdk.App();

const usEast1Infrastructure = new RegionalInfrastructureStack(app, "TestInfrastructureStackForEMRAndRedshift", {
  env: { account: accountId, region: "us-east-1" },

  userName,
  createIDE: true,
  instanceTypeIDE: InstanceType.of(InstanceClass.M5, InstanceSize.LARGE)
});

new RegionalInfrastructureStack(app, "TestInfrastructureStackForMSK", {
  env: { account: accountId, region: "us-east-2" },

  // We use a beefier instance for IDE in this region to load test Amazon MSK Serverless cluster.
  userName,
  createIDE: true,
  instanceTypeIDE: InstanceType.of(InstanceClass.M5, InstanceSize.XLARGE2)
});

new SharedInfrastructureStack(app, "SharedInfrastructureStack", {
  env: { account: accountId, region: "us-east-1" },

  outputBucketForEMRAndRedshift: usEast1Infrastructure.outputBucket
});
