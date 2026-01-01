from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    from_json, col, when, to_json, struct
)
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, TimestampType
from pyspark.ml import PipelineModel

MODEL_PATH = "models/weather_rf_v2"
KAFKA_BOOTSTRAP = "localhost:9092"
INPUT_TOPIC = "weather_events"
OUTPUT_TOPIC = "weather_alerts"
CHECKPOINT_DIR = "checkpoints/weather_alerts"

def main():
    spark = (
        SparkSession.builder
        .appName("Weather Streaming Inference")
        .getOrCreate()
    )

    spark.sparkContext.setLogLevel("WARN")

    print("📦 Loading trained ML model...")
    model = PipelineModel.load(MODEL_PATH)

    # ----------------------------
    # Kafka input schema
    # ----------------------------
    schema = StructType([
        StructField("city", StringType()),
        StructField("temperature_celsius", DoubleType()),
        StructField("humidity", DoubleType()),
        StructField("wind_kph", DoubleType()),
        StructField("timestamp", TimestampType()),
    ])

    print("📡 Reading Kafka stream...")
    raw_df = (
        spark.readStream
        .format("kafka")
        .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP)
        .option("subscribe", INPUT_TOPIC)
        .option("startingOffsets", "latest")
        .option("failOnDataLoss", "false")
        .load()
    )

    parsed_df = (
        raw_df
        .select(from_json(col("value").cast("string"), schema).alias("data"))
        .select("data.*")
    )

    # ----------------------------
    # 🔑 RECREATE TRAINING BUCKETS
    # ----------------------------

    enriched_df = (
        parsed_df

        # Temperature bucket
        .withColumn(
            "temperature_bucket",
            when(col("temperature_celsius") < 10, "cold")
            .when(col("temperature_celsius") < 25, "mild")
            .otherwise("hot")
        )

        # Humidity bucket
        .withColumn(
            "humidity_bucket",
            when(col("humidity") < 30, "low")
            .when(col("humidity") < 70, "medium")
            .otherwise("high")
        )

        # Wind bucket
        .withColumn(
            "wind_bucket",
            when(col("wind_kph") < 10, "low")
            .when(col("wind_kph") < 25, "medium")
            .otherwise("high")
        )
    )

    print("🤖 Running model inference...")
    predictions = model.transform(enriched_df)

    # ----------------------------
    # 🚨 ALERT LOGIC
    # ----------------------------
    alerts = (
        predictions
        .filter(col("prediction") == 1.0)
        .select(
            to_json(
                struct(
                    col("city"),
                    col("temperature_celsius"),
                    col("humidity"),
                    col("wind_kph"),
                    col("prediction"),
                    col("timestamp")
                )
            ).alias("value")
        )
    )

    print("🚨 Writing alerts to Kafka...")
    query = (
        alerts.writeStream
        .format("kafka")
        .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP)
        .option("topic", OUTPUT_TOPIC)
        .option("checkpointLocation", CHECKPOINT_DIR)
        .outputMode("append")
        .start()
    )

    query.awaitTermination()

if __name__ == "__main__":
    main()
