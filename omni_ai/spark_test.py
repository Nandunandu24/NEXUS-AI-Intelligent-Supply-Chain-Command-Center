from pyspark.sql import SparkSession

spark = (
    SparkSession.builder
    .appName("SparkTest")
    .master("local[*]")
    .config("spark.ui.showConsoleProgress", "false")
    .getOrCreate()
)

print("Spark version:", spark.version)

df = spark.range(10)
print("Count:", df.count())

spark.stop()
