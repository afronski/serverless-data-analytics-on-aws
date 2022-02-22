import { StackProps } from "aws-cdk-lib";

import { InstanceType } from "aws-cdk-lib/aws-ec2";

export interface RegionalInfrastructureStackProps extends StackProps {
  userName: string;

  createIDE: boolean;
  instanceTypeIDE?: InstanceType;
}
