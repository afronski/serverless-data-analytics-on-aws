# Example for *Amazon Redshift Serverless*

## Steps

Log in to the *AWS Management Console* and go to the *Amazon Redshift*. Create *Serverless* cluster, and then open *SQL Query Editor v2* in a new tab.

Next we need to load the data into *S3 Bucket*. Move to the directory `examples/03-redshift-serverless/tickit` and sync all the files with the bucket:

```shell
export S3_BUCKET=<YOUR_BUCKET_NAME>
aws s3 sync . s3://${S3_BUCKET}/tickit/ --delete
```

Now, when data is ready the provided *SQL* files can be executed in order inside the query editor. Remember to replace placeholder for the *S3 Bucket* in the file `01-load-data.sql`!

## Known Limitations

- There are some documented bugs with *SQL Query Editor v2* in *Amazon Redshift* console.
- Remark: it works in a specific list of *Availability Zones (AZs)* in `us-east-1` and `us-east-2`.
- There is no maintenance window with *Amazon Redshift Serverless*.
  - Software version updates are automatically applied.
    - Any ongoing connections are dropped at the point in time when *Amazon Redshift* switch versions.
    - Clients need to reestablish connections and *Amazon Redshift Serverless* works instantly.
- You can only have one serverless endpoint for each AWS Account.
  - Public endpoints are not supported at the moment.
