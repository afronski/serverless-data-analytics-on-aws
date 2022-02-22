# Source Code for the talk *"Serverless Data Analytics on AWS"*

This is a repository that contains demos for 3 *Serverless Data Analytics* services announced as previews or public
previews during *AWS re:Invent 2021* in December 2021:

- *Amazon EMR Serverless* (*preview* available in a single region - `us-east-1`)
- *Amazon Redshift Serverless* (*public preview* available in a few *AWS* regions)
- *Amazon MSK Serverless* (*public preview* available in a single region - `us-east-2`)

Access to those services remains in *public preview* or *preview* as of *22.02.2022*.

## Pre-requisites

### *Amazon EMR Serverless*

- If you want to run *Amazon EMR Serverless* example, you need to sign-up in order to get access to the preview. You
  can do it [here](https://pages.awscloud.com/EMR-Serverless-Preview.html).
- Additionally, you need to add to your `aws-cli` installation `emr-serverless` command via following lines:
  ```shell
  aws s3 cp s3://elasticmapreduce/emr-serverless-preview/artifacts/latest/dev/cli/service.json ./service.json
  aws configure add-model --service-model file://service.json
  ```
- Remember, this feature at the moment is in a *public preview* available in a single region:
  - `us-east-1` (*N. Virginia*).
- Make sure you've at least once visited *AWS Glue Data Catalog* in the *AWS Management Console*, and you've created
  a `default` database in the `us-east-1` region.

### *Amazon Redshift Serverless*

- It does not have any support in *AWS CLI* at the moment.
- This is a *public preview*, which you can use in the following regions:
  - `us-east-1` (*N. Virginia*)
  - `us-east-2` (*Ohio*)
  - `us-west-1` (*N. California*)
  - `us-west-2` (*Oregon*)
  - `eu-west-1` (*Ireland*)
  - `eu-central-1` (*Frankfurt*)
  - `ap-northeast-1` (*Tokyo*)
- According to the announcement [here](https://aws.amazon.com/blogs/aws/introducing-amazon-redshift-serverless-run-analytics-at-any-scale-without-having-to-manage-infrastructure/),
  **until** this service is in the *preview* you get a one time $500 in *AWS Credits* to experiment with it.

### *Amazon MSK Serverless*

- There is a support for that feature in *AWS CLI* in the newest versions.
- Remember, this feature at the moment is in a *public preview* available in a single region:
  - `us-east-2` (*Ohio*).

## License

- [MIT](LICENSE)

## Authors

- [Wojciech Gawroński (afronski)](https://github.com/afronski) (aka [AWS Maniac](https://awsmaniac.com))
