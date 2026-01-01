from pyspark.sql import SparkSession
from pyspark.ml import Pipeline
from pyspark.ml.feature import StringIndexer, VectorAssembler
from pyspark.ml.classification import LogisticRegression
from pyspark.ml.evaluation import MulticlassClassificationEvaluator

INPUT_PATH = "/home/nandini/omni_ai/data/ml/features/weather_features"
MODEL_PATH = "/home/nandini/omni_ai/data/ml/models/weather_classifier"

def main():
    spark = (
        SparkSession.builder
        .appName("WeatherModelTraining")
        .getOrCreate()
    )

    df = spark.read.parquet(INPUT_PATH)

    # Encode categorical fields
    city_indexer = StringIndexer(
        inputCol="city",
        outputCol="city_idx",
        handleInvalid="keep"
    )

    label_indexer = StringIndexer(
        inputCol="temperature_bucket",
        outputCol="label"
    )

    # Assemble features
    assembler = VectorAssembler(
        inputCols=["city_idx", "humidity", "wind_kph"],
        outputCol="features"
    )

    # Classifier
    lr = LogisticRegression(
        maxIter=20,
        regParam=0.01,
        elasticNetParam=0.0
    )

    pipeline = Pipeline(stages=[
        city_indexer,
        label_indexer,
        assembler,
        lr
    ])

    # Train / test split
    train_df, test_df = df.randomSplit([0.8, 0.2], seed=42)

    model = pipeline.fit(train_df)

    predictions = model.transform(test_df)

    evaluator = MulticlassClassificationEvaluator(
        labelCol="label",
        predictionCol="prediction",
        metricName="accuracy"
    )

    accuracy = evaluator.evaluate(predictions)
    print(f"✅ Model accuracy: {accuracy:.4f}")

    # Save model
    model.write().overwrite().save(MODEL_PATH)
    print("✅ Model saved successfully")

    spark.stop()

if __name__ == "__main__":
    main()
