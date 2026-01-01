from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime, timedelta

default_args = {
    "owner": "omni",
    "retries": 2,
    "retry_delay": timedelta(minutes=5)
}

with DAG(
    dag_id="omni_sustain_ingestion",
    start_date=datetime(2024, 1, 1),
    schedule_interval="@hourly",
    default_args=default_args,
    catchup=False
) as dag:

    run_streaming = BashOperator(
        task_id="run_spark_streaming",
        bash_command="spark-submit data_ingestion/spark/spark_streaming.py"
    )

    run_streaming
