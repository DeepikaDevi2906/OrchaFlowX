from prometheus_client import Counter

workflow_started = Counter(
    "workflow_started_total",
    "Total workflows started"
)

workflow_completed = Counter(
    "workflow_completed_total",
    "Total workflows completed"
)

workflow_failed = Counter(
    "workflow_failed_total",
    "Total workflows failed"
)

step_completed = Counter(
    "step_completed_total",
    "Total workflow steps completed"
)

step_failed = Counter(
    "step_failed_total",
    "Total workflow steps failed"
)

retry_counter = Counter(
    "workflow_retry_total",
    "Total workflow retries"
)

compensation_counter = Counter(
    "workflow_compensation_total",
    "Total compensation events"
)