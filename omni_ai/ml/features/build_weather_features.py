from pyspark.sql import SparkSession
from pyspark.sql.functions import when, col

INPUT_PATH = "/home/nandini/omni_ai/data/streaming/weather"
OUTPUT_PATH = "/home/nandini/omni_ai/data/ml/features/weather_features"

def main():
    spark = (
        SparkSession.builder
        .appName("WeatherFeatureEngineering")
        .getOrCreate()
    )

    df = spark.read.parquet(INPUT_PATH)

    # Temperature buckets (label)
    df = df.withColumn(
        "temperature_bucket",
        when(col("temperature_celsius") < 15, "cold")
        .when(col("temperature_celsius") < 30, "mild")
        .otherwise("hot")
    )

    # Select ML features
    features = df.select(
        "city",
        "humidity",
        "wind_kph",
        "temperature_bucket"
    )

    features.write.mode("overwrite").parquet(OUTPUT_PATH)

    print("✅ Feature dataset created")
    spark.stop()

if __name__ == "__main__":
    main()
