import pika

try:
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host="localhost",
            port=5672,
            credentials=pika.PlainCredentials(
                "guest",
                "guest"
            )
        )
    )

    print("Connected!")

    connection.close()

except Exception as e:
    print(type(e))
    print(repr(e))