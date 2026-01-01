from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when, hour, from_unixtime
from pyspark.ml.feature import VectorAssembler, StandardScaler
from pyspark.ml.classification import LogisticRegression
from pyspark.ml import Pipeline
from pyspark.ml.evaluation import BinaryClassificationEvaluator

def main():
    spark = (
        SparkSession.builder
        .appName("WeatherHotBinaryClassifier")
        .getOrCreate()
    )

    input_path = "data/streaming/weather/weather_events.parquet"
    model_path = "data/ml/models/weather_hot_classifier"

    print("📥 Loading weather events parquet...")
    df = spark.read.parquet(input_path)

    # ---------------------------
    # 1️⃣ Label Engineering
    # ---------------------------
    df = df.withColumn(
        "label",
        when(col("temperature_celsius") >= 30, 1).otherwise(0)
    )

    # ---------------------------
    # 2️⃣ Feature Engineering
    # ---------------------------
    df = df.withColumn(
        "heat_index",
        col("temperature_celsius") * col("humidity") / 100
    )

    df = df.withColumn(
        "wind_cooling",
        col("temperature_celsius") - col("wind_kph") * 0.1
    )

    df = df.select(
        "temperature_celsius",
        "humidity",
        "wind_kph",
        "heat_index",
        "wind_cooling",
        "label"
    )

    df = df.dropna()

    # ---------------------------
    # 3️⃣ Train / Test Split
    # ---------------------------
    train_df, test_df = df.randomSplit([0.8, 0.2], seed=42)

    # ---------------------------
    # 4️⃣ ML Pipeline
    # ---------------------------
    assembler = VectorAssembler(
        inputCols=[
            "temperature_celsius",
            "humidity",
            "wind_kph",
            "heat_index",
            "wind_cooling",
        ],
        outputCol="features_raw"
    )

    scaler = StandardScaler(
        inputCol="features_raw",
        outputCol="features",
        withStd=True,
        withMean=True
    )

    classifier = LogisticRegression(
        featuresCol="features",
        labelCol="label",
        maxIter=50,
        regParam=0.01
    )

    pipeline = Pipeline(stages=[assembler, scaler, classifier])

    # ---------------------------
    # 5️⃣ Train Model
    # ---------------------------
    print("🚀 Training binary classifier...")
    model = pipeline.fit(train_df)

    # ---------------------------
    # 6️⃣ Evaluation
    # ---------------------------
    predictions = model.transform(test_df)

    evaluator = BinaryClassificationEvaluator(
        labelCol="label",
        rawPredictionCol="rawPrediction",
        metricName="areaUnderROC"
    )

    auc = evaluator.evaluate(predictions)
    accuracy = predictions.filter(
        col("prediction") == col("label")
    ).count() / predictions.count()

    print(f"✅ Accuracy: {accuracy:.4f}")
    print(f"✅ AUC: {auc:.4f}")

    # ---------------------------
    # 7️⃣ Save Model
    # ---------------------------
    model.write().overwrite().save(model_path)
    print(f"💾 Model saved at: {model_path}")

    spark.stop()

if __name__ == "__main__":
    main()
