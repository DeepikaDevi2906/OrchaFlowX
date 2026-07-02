import pika

from core.config import settings


def publish(step_id):

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

    channel.queue_declare(queue="workflow_queue")

    channel.basic_publish(
        exchange="",
        routing_key="workflow_queue",
        body=str(step_id)
    )

    print(f"Published : {step_id}")

    connection.close()