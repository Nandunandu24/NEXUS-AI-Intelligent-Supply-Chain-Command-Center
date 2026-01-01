from pyspark.sql import SparkSession

INPUT_PATH = "/home/nandini/omni_ai/data/streaming/weather"

def main():
    spark = (
        SparkSession.builder
        .appName("WeatherBatchAnalytics")
        .getOrCreate()
    )

    df = spark.read.parquet(INPUT_PATH)

    df.createOrReplaceTempView("weather")

    result = spark.sql("""
        SELECT
            city,
            COUNT(*) AS records,
            ROUND(AVG(temperature_celsius), 2) AS avg_temp,
            MAX(wind_kph) AS max_wind
        FROM weather
        GROUP BY city
        ORDER BY avg_temp DESC
    """)

    result.show(truncate=False)
    spark.stop()

if __name__ == "__main__":
    main()
