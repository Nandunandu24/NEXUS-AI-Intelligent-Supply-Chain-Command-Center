from pyspark.sql import SparkSession
from pyspark.sql.functions import col, trim, to_date

def main():
    spark = (
        SparkSession.builder
        .appName("WeatherBatchIngestion")
        .getOrCreate()
    )

    input_path = "/home/nandini/omni_ai/data/raw/weather/weather.csv"
    output_path = "/home/nandini/omni_ai/data/processed/weather/weather_cleaned"

    print("Reading weather CSV...")
    df = spark.read.option("header", True).csv(input_path)

    # 🔍 Always inspect schema (production habit)
    print("Columns found:")
    print(df.columns)

    print("Initial row count:", df.count())

    # ✅ CORRECT mapping for YOUR dataset
    df_clean = df.select(
        to_date(col("last_updated")).alias("date"),
        trim(col("country")).alias("country"),
        trim(col("location_name")).alias("city"),
        col("temperature_celsius").cast("double"),
        col("humidity").cast("double"),
        col("wind_kph").cast("double"),
        col("precip_mm").cast("double")
    )

    df_clean = (
        df_clean
        .dropna()
        .dropDuplicates()
    )

    print("Cleaned row count:", df_clean.count())

    print("Writing cleaned data...")
    (
        df_clean
        .coalesce(1)
        .write
        .mode("overwrite")
        .option("header", True)
        .csv(output_path)
    )

    spark.stop()
    print("Weather Spark job completed successfully")

if __name__ == "__main__":
    main()
