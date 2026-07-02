import pika

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
            print("Step not found")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return

        print("\n--------------------------------")
        print(f"Executing : {current_step.name}")
        print(f"Retry Count : {current_step.retry_count}")
        print("--------------------------------")

        # ----------------------------------------
        # Simulate Permanent Failure
        # ----------------------------------------

        if current_step.name == "Process Payment":
            raise Exception("Payment Gateway Timeout")

        # ----------------------------------------
        # Step Successful
        # ----------------------------------------

        update_step_status(
            db,
            step_id,
            "COMPLETED"
        )

        print(f"✅ {current_step.name} Completed Successfully")

        # ----------------------------------------
        # Publish Next Ready Steps
        # ----------------------------------------

        ready_steps = find_next_ready_steps(
            db,
            current_step.workflow_id
        )

        for next_step in ready_steps:

            print(f"Publishing Next Step : {next_step.name}")

            publish(str(next_step.id))

    except Exception as e:

        print(f"❌ Execution Failed : {e}")

        current_step = increment_retry(
            db,
            step_id
        )

        print(f"Retry Count : {current_step.retry_count}")

        if current_step.retry_count < MAX_RETRIES:

            print("Retrying...")

            publish(step_id)

        else:

            print("\nMaximum Retries Reached")
            print("Workflow Failed")
            print("Starting Saga Compensation...\n")

            update_step_status(
                db,
                step_id,
                "FAILED"
            )

            # ----------------------------------------
            # Rollback completed steps
            # ----------------------------------------

            completed_steps = (
                db.query(Step)
                .filter(
                    Step.workflow_id == current_step.workflow_id,
                    Step.status == "COMPLETED"
                )
                .order_by(Step.id.desc())
                .all()
            )

            for completed_step in completed_steps:

                print(f"Rolling Back : {completed_step.name}")

                compensate(
                    completed_step.name
                )

    finally:

        db.close()

        ch.basic_ack(
            delivery_tag=method.delivery_tag
        )


# ----------------------------------------
# RabbitMQ Connection
# ----------------------------------------

connection = pika.BlockingConnection(
    pika.ConnectionParameters(
        host=settings.rabbitmq_host,
        port=settings.rabbitmq_port,
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

print("🚀 Worker Started... Waiting for messages...")

channel.start_consuming()