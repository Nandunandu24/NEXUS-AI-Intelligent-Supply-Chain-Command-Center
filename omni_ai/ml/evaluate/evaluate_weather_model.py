from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when
from pyspark.ml import PipelineModel
from pyspark.ml.evaluation import (
    MulticlassClassificationEvaluator,
    BinaryClassificationEvaluator
)

def main():
    spark = SparkSession.builder \
        .appName("Weather Model Evaluation") \
        .getOrCreate()

    MODEL_PATH = "data/ml/models/weather_hot_classifier"
    DATA_PATH = "data/streaming/weather/weather_events.parquet"

    print("📥 Loading trained model...")
    model = PipelineModel.load(MODEL_PATH)

    print("📥 Loading evaluation data...")
    df = spark.read.parquet(DATA_PATH)

    # --------------------------------------------------
    # 🔑 Feature Engineering (MUST MATCH TRAINING)
    # --------------------------------------------------
    df = df.withColumn(
        "heat_index",
        col("temperature_celsius") + col("humidity") * 0.1
    )

    df = df.withColumn(
        "wind_cooling",
        col("temperature_celsius") - col("wind_kph") * 0.2
    )

    # --------------------------------------------------
    # 🔑 RECREATE LABEL (THIS WAS MISSING)
    # Same logic as training
    # --------------------------------------------------
    df = df.withColumn(
        "label",
        when(col("heat_index") > 35, 1.0).otherwise(0.0)
    )

    print("🔍 Running model inference...")
    predictions = model.transform(df)

    # --------------------------------------------------
    # Evaluators
    # --------------------------------------------------
    accuracy_eval = MulticlassClassificationEvaluator(
        labelCol="label",
        predictionCol="prediction",
        metricName="accuracy"
    )

    precision_eval = MulticlassClassificationEvaluator(
        labelCol="label",
        predictionCol="prediction",
        metricName="weightedPrecision"
    )

    recall_eval = MulticlassClassificationEvaluator(
        labelCol="label",
        predictionCol="prediction",
        metricName="weightedRecall"
    )

    f1_eval = MulticlassClassificationEvaluator(
        labelCol="label",
        predictionCol="prediction",
        metricName="f1"
    )

    auc_eval = BinaryClassificationEvaluator(
        labelCol="label",
        rawPredictionCol="rawPrediction",
        metricName="areaUnderROC"
    )

    # --------------------------------------------------
    # Metrics
    # --------------------------------------------------
    accuracy = accuracy_eval.evaluate(predictions)
    precision = precision_eval.evaluate(predictions)
    recall = recall_eval.evaluate(predictions)
    f1 = f1_eval.evaluate(predictions)
    auc = auc_eval.evaluate(predictions)

    print("\n✅ Evaluation Results")
    print(f"Total Samples : {predictions.count()}")
    print(f"Accuracy      : {accuracy:.4f}")
    print(f"Precision     : {precision:.4f}")
    print(f"Recall        : {recall:.4f}")
    print(f"F1 Score      : {f1:.4f}")
    print(f"ROC-AUC       : {auc:.4f}")

    spark.stop()

if __name__ == "__main__":
    main()
