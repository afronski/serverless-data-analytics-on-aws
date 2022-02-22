import { StackProps } from "aws-cdk-lib";

import { Bucket } from "aws-cdk-lib/aws-s3";

export interface SharedInfrastructureStackProps extends StackProps {
  outputBucketForEMRAndRedshift: Bucket;
}
