FROM 755674844232.dkr.ecr.us-east-1.amazonaws.com/spark/emr-6.4.0

USER root
RUN ln -s /usr/share/aws/aws-java-sdk/aws-java-sdk-bundle-*.jar /usr/lib/spark/jars/
RUN ln -s /usr/share/aws/emr/emrfs/lib/emrfs-hadoop-assembly-*.jar /usr/lib/spark/jars/
RUN mkdir /mnt/s3 && chown spark:spark /mnt/s3

USER spark:spark
ENV SPARK_NO_DAEMONIZE=true
ENTRYPOINT [ "/usr/lib/spark/sbin/start-history-server.sh" ]
