from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col
from pyspark.sql.types import *

spark = SparkSession.builder \
    .appName("OmniSustainStreaming") \
    .getOrCreate()

schema = StructType([
    StructField("container_id", StringType()),
    StructField("lat", DoubleType()),
    StructField("lon", DoubleType()),
    StructField("delay_minutes", IntegerType()),
    StructField("temperature", DoubleType()),
    StructField("timestamp", DoubleType())
])

df = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "localhost:9092") \
    .option("subscribe", "logistics_events") \
    .load()

parsed = df.select(
    from_json(col("value").cast("string"), schema).alias("data")
).select("data.*")

query = parsed.writeStream \
    .format("parquet") \
    .option("path", "data/processed/logistics") \
    .option("checkpointLocation", "data/checkpoints/logistics") \
    .start()

query.awaitTermination()
