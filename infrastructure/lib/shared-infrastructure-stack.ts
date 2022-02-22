import * as statement from "cdk-iam-floyd";

import { CfnOutput, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

import { CompositePrincipal, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

import { SharedInfrastructureStackProps } from "./props/shared-infrastructure-stack-props";

export class SharedInfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props: SharedInfrastructureStackProps) {
    super(scope, id, props);

    // Adding relevant IAM roles.

    const emrServerlessRole = new Role(this, "EMRServerlessRole", {
      roleName: "emr-serverless-iam-role",
      assumedBy: new ServicePrincipal("emr-serverless.amazonaws.com")
    });

    emrServerlessRole.addToPolicy(
      new statement.S3()
        .allow()
        .on("arn:aws:s3:::noaa-gsod-pds")
        .on("arn:aws:s3:::noaa-gsod-pds/*")
        .on(props.outputBucketForEMRAndRedshift.bucketArn)
        .on(`${props.outputBucketForEMRAndRedshift.bucketArn}/*`)
        .toGetObject()
        .toListBucket()
    );

    emrServerlessRole.addToPolicy(
      new statement.S3()
        .allow()
        .on(props.outputBucketForEMRAndRedshift.bucketArn)
        .on(`${props.outputBucketForEMRAndRedshift.bucketArn}/*`)
        .toPutObject()
        .toDeleteObject()
    );

    emrServerlessRole.addToPolicy(
      new statement.Glue()
        .allow()
        .onAllResources()
        .toGetDatabase()
        .toGetDatabases()
        .toCreateTable()
        .toGetTable()
        .toGetTables()
        .toGetPartition()
        .toGetPartitions()
        .toCreatePartition()
        .toBatchCreatePartition()
        .toGetUserDefinedFunction()
        .toGetUserDefinedFunctions()
    );

    new CfnOutput(this, "EMRServerlessIAMRoleARN", {
      value: emrServerlessRole.roleArn
    });

    const redshiftServerlessRole = new Role(this, "RedshiftServerlessRole", {
      roleName: "redshift-serverless-iam-role",
      assumedBy: new CompositePrincipal(
        new ServicePrincipal("redshift.amazonaws.com") ,
        new ServicePrincipal("redshift-serverless.amazonaws.com")
      )
    });

    redshiftServerlessRole.addToPolicy(
      new statement.S3()
        .allow()
        .on(props.outputBucketForEMRAndRedshift.bucketArn)
        .on(`${props.outputBucketForEMRAndRedshift.bucketArn}/*`)
        .toGetObject()
        .toListBucket()
    );

    new CfnOutput(this, "RedshiftServerlessIAMRoleARN", {
      value: redshiftServerlessRole.roleArn
    });
  }
}
