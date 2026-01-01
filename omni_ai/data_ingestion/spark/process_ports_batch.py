import os
import glob
import shutil
import logging

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, trim

# -----------------------------
# CONFIG
# -----------------------------
INPUT_CSV = "data/raw/ports/world_port_index.csv"
TEMP_OUTPUT_DIR = "data/processed/ports/_tmp_ports_csv"
FINAL_OUTPUT_FILE = "data/processed/ports/ports_cleaned.csv"

# -----------------------------
# LOGGING
# -----------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ports-batch")

# -----------------------------
# MAIN
# -----------------------------
def main():
    # 🔴 Disable Hadoop NativeIO (CRITICAL for Windows)
    os.environ["HADOOP_OPTS"] = "-Djava.library.path="
    os.environ["SPARK_LOCAL_HOSTNAME"] = "localhost"

    spark = (
        SparkSession.builder
        .appName("ProcessWorldPortIndexCSV")
        .config("spark.sql.execution.arrow.pyspark.enabled", "false")
        .config("spark.hadoop.io.native.lib.available", "false")
        .getOrCreate()
    )

    try:
        logger.info("Starting ports batch processing")

        # -----------------------------
        # READ CSV
        # -----------------------------
        df = spark.read.csv(
            INPUT_CSV,
            header=True,
            inferSchema=False
        )

        row_count = df.count()
        logger.info(f"Rows read from CSV: {row_count}")

        # -----------------------------
        # CLEAN DATA (minimal + safe)
        # -----------------------------
        cleaned_df = (
            df.select(
                trim(col("World Port Index Number")).alias("port_id"),
                trim(col("Main Port Name")).alias("port_name"),
                trim(col("Country Code")).alias("country_code"),
                trim(col("World Water Body")).alias("water_body"),
                trim(col("Latitude")).alias("latitude"),
                trim(col("Longitude")).alias("longitude")
            )
        )

        logger.info(f"Rows after cleaning: {cleaned_df.count()}")

        # -----------------------------
        # WRITE TEMP CSV (1 PARTITION)
        # -----------------------------
        (
            cleaned_df
            .coalesce(1)  # 🔴 force single CSV
            .write
            .mode("overwrite")
            .option("header", "true")
            .csv(TEMP_OUTPUT_DIR)
        )

        # -----------------------------
        # AUTO-MERGE CSV
        # -----------------------------
        part_files = glob.glob(f"{TEMP_OUTPUT_DIR}/part-*.csv")

        if not part_files:
            raise RuntimeError("No CSV part file generated")

        os.makedirs(os.path.dirname(FINAL_OUTPUT_FILE), exist_ok=True)

        shutil.move(part_files[0], FINAL_OUTPUT_FILE)
        shutil.rmtree(TEMP_OUTPUT_DIR)

        # -----------------------------
        # SUCCESS MESSAGE
        # -----------------------------
        print("\n========================================")
        print("✅ PORTS CSV BATCH COMPLETED SUCCESSFULLY")
        print(f"📄 Output file: {FINAL_OUTPUT_FILE}")
        print("========================================\n")

        logger.info("Ports batch job completed")

    finally:
        spark.stop()
        logger.info("Spark session stopped cleanly")


if __name__ == "__main__":
    main()
