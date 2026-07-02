from core.executor import WorkflowExecutor
from core.rabbitmq import publish

executor = WorkflowExecutor()

executor.add_step("Validate User")
executor.add_step("Check Room Availability")
executor.add_step("Reserve Room")
executor.add_step("Process Payment")
executor.add_step("Send Confirmation")

executor.add_dependency(
    "Validate User",
    "Check Room Availability"
)

executor.add_dependency(
    "Check Room Availability",
    "Reserve Room"
)

executor.add_dependency(
    "Reserve Room",
    "Process Payment"
)

executor.add_dependency(
    "Process Payment",
    "Send Confirmation"
)

ready_steps = executor.start()

for step in ready_steps:
    publish(step)