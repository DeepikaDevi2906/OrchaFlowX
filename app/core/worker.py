import pika

from prometheus_client import start_http_server

from core.config import settings
from core.rabbitmq import publish

from db.database import SessionLocal
from db.models import Step

from services.step_service import (
    update_step_status,
    increment_retry,
    find_next_ready_steps
)

from services.compensation_service import compensate

from observability.logger import logger

from observability.metrics import (
    step_completed,
    step_failed,
    retry_counter,
    compensation_counter
)

MAX_RETRIES = 3


def execute_step(ch, method, properties, body):

    db = SessionLocal()

    step_id = body.decode()

    try:

        current_step = (
            db.query(Step)
            .filter(Step.id == step_id)
            .first()
        )

        if current_step is None:

            logger.error("Step not found")

            ch.basic_ack(
                delivery_tag=method.delivery_tag
            )

            return


        update_step_status(
            db,
            step_id,
            "RUNNING"
        )

        logger.info("--------------------------------")
        logger.info(f"Executing Step : {current_step.name}")
        logger.info(f"Retry Count : {current_step.retry_count}")
        logger.info("--------------------------------")


        if current_step.name == "Process Payment":

            raise Exception(
                "Payment Gateway Timeout"
            )

        update_step_status(
            db,
            step_id,
            "COMPLETED"
        )

        step_completed.inc()

        logger.info(
            f"{current_step.name} Completed Successfully"
        )


        ready_steps = find_next_ready_steps(
            db,
            current_step.workflow_id
        )

        for next_step in ready_steps:

            logger.info(
                f"Publishing : {next_step.name}"
            )

            publish(
                str(next_step.id)
            )

    except Exception as e:

        logger.error(
            f"Execution Failed : {e}"
        )

        current_step = increment_retry(
            db,
            step_id
        )

        retry_counter.inc()

        logger.warning(
            f"Retry Count : {current_step.retry_count}"
        )

        if current_step.retry_count < MAX_RETRIES:

            logger.warning("Retrying Step...")

            publish(step_id)

        else:

            update_step_status(
                db,
                step_id,
                "FAILED"
            )

            step_failed.inc()

            logger.error(
                "Maximum Retries Reached"
            )

            logger.warning(
                "Starting Saga Compensation..."
            )

            completed_steps = (
                db.query(Step)
                .filter(
                    Step.workflow_id == current_step.workflow_id,
                    Step.status == "COMPLETED"
                )
                .order_by(
                    Step.id.desc()
                )
                .all()
            )

            for completed_step in completed_steps:

                update_step_status(
                    db,
                    str(completed_step.id),
                    "COMPENSATING"
                )

                logger.info(
                    f"Rolling Back : {completed_step.name}"
                )

                compensate(
                    completed_step.name
                )

                compensation_counter.inc()

                update_step_status(
                    db,
                    str(completed_step.id),
                    "COMPENSATED"
                )

                logger.info(
                    f"{completed_step.name} Compensated Successfully"
                )

            logger.info(
                "Saga Compensation Completed"
            )

    finally:

        db.close()

        ch.basic_ack(
            delivery_tag=method.delivery_tag
        )


start_http_server(8001)

logger.info(
    "Prometheus Metrics running at http://localhost:8001"
)

connection = pika.BlockingConnection(

    pika.ConnectionParameters(

        host=settings.rabbitmq_host,

        port=settings.rabbitmq_port,

        heartbeat=600,

        blocked_connection_timeout=300,

        credentials=pika.PlainCredentials(
            "guest",
            "guest"
        )

    )

)

channel = connection.channel()

channel.queue_declare(
    queue="workflow_queue"
)

channel.basic_qos(
    prefetch_count=1
)

channel.basic_consume(
    queue="workflow_queue",
    on_message_callback=execute_step
)

logger.info(
    "Worker Started... Waiting for messages..."
)

channel.start_consuming()