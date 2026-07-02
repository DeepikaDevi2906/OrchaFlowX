from core.executor import WorkflowExecutor

executor = WorkflowExecutor()

executor.add_step("A")
executor.add_step("B")
executor.add_step("C")
executor.add_step("D")

executor.add_dependency("A", "B")
executor.add_dependency("A", "C")
executor.add_dependency("B", "D")
executor.add_dependency("C", "D")

print(executor.start())

print(executor.complete_step("A"))

print(executor.complete_step("B"))

print(executor.complete_step("C"))