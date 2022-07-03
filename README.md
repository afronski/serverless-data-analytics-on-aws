# *"Serverless Data Analytics on AWS"*: Examples and Source Code

This is a repository that contains demos for 3 *Serverless Data Analytics* services announced during *AWS re:Invent 2021* in December 2021:

- *Amazon MSK Serverless*
- *Amazon EMR Serverless*
- *Amazon Redshift Serverless* (*public preview* available in a few *AWS* regions)

## Pre-requisites

### *Amazon MSK Serverless*

- There is a support for that feature in *AWS CLI* in the newest versions.

### *Amazon EMR Serverless*

- There is a support for that feature in *AWS CLI* in the newest versions.
- Make sure you've at least once visited *AWS Glue Data Catalog* in the *AWS Management Console*, and you've created a `default` database in the given region where you want to use that.

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

## License

- [MIT](./LICENSE)

## Authors

- [Wojciech Gawroński (afronski)](https://github.com/afronski) (aka [AWS Maniac](https://awsmaniac.com))
