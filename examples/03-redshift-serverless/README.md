# Example for *Amazon Redshift Serverless*

## Steps

Log in to the *AWS Management Console* and go to the *Amazon Redshift*. Create *Serverless* cluster, and then open *SQL Query Editor v2* in a new tab.

Next we need to load the data into *S3 Bucket*. Move to the directory `examples/03-redshift-serverless/tickit` and sync all the files with the bucket:

```shell
export S3_BUCKET=<YOUR_BUCKET_NAME>
aws s3 sync . s3://${S3_BUCKET}/tickit/ --delete
```

Now, when data is ready the provided *SQL* files can be executed in order inside the query editor. Remember to replace placeholder for the *S3 Bucket* in the file `01-load-data.sql`!
