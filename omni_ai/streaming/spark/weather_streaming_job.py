from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, window
from pyspark.sql.types import StructType, StringType, DoubleType, IntegerType, LongType


KAFKA_BOOTSTRAP = "localhost:9092"
TOPIC = "weather_events"
OUTPUT_PATH = "/home/nandini/omni_ai/data/processed/weather_streaming"


def main():
    spark = (
        SparkSession.builder
        .appName("WeatherKafkaStreaming")
        .getOrCreate()
    )

    spark.sparkContext.setLogLevel("WARN")

    # Kafka source
    raw_df = (
        spark.readStream
        .format("kafka")
        .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP)
        .option("subscribe", TOPIC)
        .option("startingOffsets", "latest")
        .load()
    )

    # Schema
    weather_schema = StructType() \
        .add("city", StringType()) \
        .add("temperature_celsius", DoubleType()) \
        .add("humidity", IntegerType()) \
        .add("wind_kph", DoubleType()) \
        .add("timestamp", LongType())

    parsed_df = (
        raw_df
        .selectExpr("CAST(value AS STRING)")
        .select(from_json(col("value"), weather_schema).alias("data"))
        .select("data.*")
    )

    # Windowed aggregation
    agg_df = (
        parsed_df
        .withColumn("event_time", col("timestamp").cast("timestamp"))
        .groupBy(
            window(col("event_time"), "1 minute"),
            col("city")
        )
        .avg("temperature_celsius")
        .withColumnRenamed("avg(temperature_celsius)", "avg_temp")
    )

    # Sink
    query = (
        agg_df.writeStream
        .format("parquet")
        .option("path", OUTPUT_PATH)
        .option("checkpointLocation", OUTPUT_PATH + "/_checkpoint")
        .outputMode("append")
        .start()
    )

    query.awaitTermination()


if __name__ == "__main__":
    main()
