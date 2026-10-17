# OrchaFlowX

**A distributed workflow orchestration engine for reliable, event-driven task execution.**

OrchaFlowX executes dependency-aware workflows modeled as Directed Acyclic Graphs (DAGs). Workflow steps are scheduled automatically as their dependencies complete, dispatched asynchronously through RabbitMQ, and executed by independent worker processes. Failed steps are retried with a configurable limit, and when a step fails permanently, Saga-inspired compensation rolls back previously completed steps to keep the system in a consistent state.

![Python](https://img.shields.io/badge/Python-3.x-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-REST%20API-009688)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-Message%20Broker-FF6600)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Persistence-336791)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED)

---

## Key Features

| Area | Capability |
|---|---|
| **Orchestration** | DAG-based workflow modeling with dynamic dependency resolution and automatic scheduling of ready steps |
| **Distributed execution** | Asynchronous task dispatch via RabbitMQ to independent, horizontally scalable worker processes |
| **Fault tolerance** | Configurable per-step retries and Saga-inspired compensation executed in reverse order |
| **Persistence** | Workflow, step and execution state stored in PostgreSQL, with schema versioning via Alembic |
| **Observability** | Prometheus metrics and Grafana dashboards for throughput and failure monitoring |
| **API** | RESTful FastAPI service with interactive Swagger documentation |
| **Deployment** | Docker support for local and containerized environments |

---

## Architecture

```
                     Client
                        │
                        ▼
               FastAPI REST API
                        │
                        ▼
               Workflow Scheduler ──────────┐
                        │                   │
                        ▼                   │
                  DAG Executor              │
                        │                   │
                        ▼                   │
                 RabbitMQ Queue             │
                        │                   │
          ┌─────────────┴─────────────┐     │
          ▼                           ▼     │
     Worker Process 1          Worker Process N
          │                           │     │
          └─────────────┬─────────────┘     │
                        ▼                   │
                   PostgreSQL ◄─────────────┘
                        │
                        ▼
             Prometheus  →  Grafana
```

**Components**

- **FastAPI REST API**: accepts workflow definitions, steps, dependencies and execution requests.
- **Workflow Scheduler**: determines which steps are ready to run based on the state of their dependencies.
- **DAG Executor**: resolves the dependency graph and publishes ready steps as tasks.
- **RabbitMQ**: decouples scheduling from execution and delivers tasks to available workers.
- **Workers**: consume tasks, execute steps, report results and trigger scheduling of downstream steps.
- **PostgreSQL**: the source of truth for workflow, step and execution state.
- **Prometheus and Grafana**: collect and visualize execution metrics.

---

## Tech Stack

| Technology | Role |
|---|---|
| Python | Core language |
| FastAPI | REST API layer |
| RabbitMQ | Message broker for asynchronous task dispatch |
| PostgreSQL | Persistent state storage |
| SQLAlchemy | ORM |
| Alembic | Database migrations |
| Prometheus | Metrics collection |
| Grafana | Metrics visualization |
| Docker | Containerization |

---

## Design Decisions

### RabbitMQ over Kafka

The engine requires per-task acknowledgements, straightforward retries and dead-letter handling for tasks that repeatedly fail. RabbitMQ provides these natively. Kafka's strengths, such as log replay and very high throughput, were not requirements at this scale and would have meant building task-level acknowledgement and retry semantics on top of it.

### At-least-once delivery with idempotent tasks

If a worker crashes after completing a task but before acknowledging it, RabbitMQ redelivers the task, which can cause duplicate execution. Rather than pursuing exactly-once delivery, which is complex and costly to guarantee in a distributed system, OrchaFlowX accepts at-least-once delivery and makes task execution idempotent. Each task carries a unique key, and a worker checks whether that key is already marked complete before executing. Completed tasks are skipped, so redeliveries do not repeat side effects.

### Saga-inspired compensation over distributed transactions

Workflow steps may span multiple independent operations, so a single atomic transaction across all of them is not practical. Instead of two-phase commit, which blocks on coordination and is fragile under coordinator failure, each step can define a compensating action. When a workflow fails permanently, compensations run in reverse order to undo completed work.

---

## Workflow Execution Lifecycle

1. A client creates a workflow and adds its steps.
2. Dependencies between steps are defined, forming a DAG.
3. The client triggers execution.
4. The scheduler identifies steps whose dependencies are satisfied.
5. Ready steps are published to RabbitMQ.
6. Workers consume and execute the steps asynchronously.
7. On completion, newly unblocked downstream steps are scheduled automatically.
8. The workflow completes when all steps succeed, or compensates if a step fails permanently.

**Example workflow**

```
Validate Customer → Reserve Inventory → Process Payment → Generate Invoice → Notify Customer
```

---

## Fault Tolerance

### Retry mechanism

Each step maintains a retry counter. When a step fails:

1. The retry count is incremented.
2. The task is republished to RabbitMQ.
3. Execution resumes automatically on an available worker.

When the retry limit is exceeded, the step is marked `FAILED` and compensation begins.

```
Attempt → Retry 1 → Retry 2 → Retry 3 → FAILED → Compensation
```

### Saga-inspired compensation

When a step fails permanently, previously completed steps are compensated in reverse order of execution.

```
Validate Customer   ✔ completed
Reserve Inventory   ✔ completed
Process Payment     ✘ failed (retries exhausted)

Compensation (reverse order):
  1. Release Inventory
  2. Undo Customer Validation
```

---

## API Reference

Full interactive documentation is available at `http://localhost:8000/docs` once the server is running.

| Resource | Operations |
|---|---|
| **Workflows** | Create, list, retrieve, delete |
| **Steps** | Add a step to a workflow, list steps |
| **Dependencies** | Define a dependency between two steps |
| **Execution** | `POST /workflows/{workflow_id}/execute` |

---

## Getting Started

### Prerequisites

- Python 3.x
- PostgreSQL
- Docker (for RabbitMQ)

### 1. Clone the repository

```bash
git clone https://github.com/DeepikaDevi2906/OrchaFlowX.git
cd OrchaFlowX
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure the environment

Copy `.env.example` to `.env` and update the values:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/orchaflowx
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
APP_NAME=OrchaFlowX
```

### 5. Apply database migrations

```bash
alembic upgrade head
```

### 6. Start RabbitMQ

```bash
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

The management dashboard is available at `http://localhost:15672` (default credentials `guest` / `guest`, intended for local development only).

### 7. Start the API server

```bash
uvicorn app.main:app --reload
```

### 8. Start one or more workers

```bash
python -m app.core.worker
```

Run the command in additional terminals to start more workers.

---

## Project Structure

```
OrchaFlowX/
├── app/
│   ├── api/              # REST API routes
│   ├── core/             # Scheduler, DAG executor and worker logic
│   ├── db/               # Database session and models
│   ├── schemas/          # Request and response schemas
│   ├── services/         # Business logic
│   ├── observability/    # Prometheus metrics
│   └── main.py           # Application entry point
├── migrations/           # Alembic migrations
├── docker-compose.yml
├── requirements.txt
├── .env.example
└── README.md
```

