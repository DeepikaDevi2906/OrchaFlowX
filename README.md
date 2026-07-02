# 🚀 OrchaFlowX

> A Distributed Workflow Orchestration Engine for Reliable Event-Driven Task Execution

OrchaFlowX is a distributed workflow orchestration platform that executes dependency-aware workflows using a Directed Acyclic Graph (DAG). It supports asynchronous task execution with RabbitMQ, automatic dependency scheduling, configurable retry mechanisms, and Saga-inspired compensation for fault-tolerant workflow processing.

---

## ✨ Features

- DAG-based Workflow Execution
- Dynamic Dependency Resolution
- Distributed Worker Architecture
- RabbitMQ Asynchronous Task Queue
- Automatic Step Scheduling
- Configurable Retry Mechanism
- Saga-inspired Compensation
- PostgreSQL Persistence
- RESTful APIs with FastAPI
- Docker Support
- Alembic Database Migrations

---

## 🏗️ Architecture

```
                   Client
                      │
                      ▼
              FastAPI REST API
                      │
                      ▼
             Workflow Scheduler
                      │
                      ▼
                 DAG Executor
                      │
                      ▼
               RabbitMQ Queue
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
   Worker Process 1            Worker Process 2
        │                           │
        └─────────────┬─────────────┘
                      ▼
                 PostgreSQL
```

---

# ⚙️ Tech Stack

| Technology | Purpose |
|------------|---------|
| FastAPI | REST API |
| Python | Backend |
| PostgreSQL | Persistent Storage |
| RabbitMQ | Message Broker |
| SQLAlchemy | ORM |
| Alembic | Database Migrations |
| Docker | Containerization |

---

# 📂 Project Structure

```
OrchaFlowX
│
├── app
│   ├── api
│   ├── core
│   ├── db
│   ├── schemas
│   ├── services
│   ├── observability
│   └── main.py
│
├── migrations
│
├── requirements.txt
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/DeepikaDevi2906/OrchaFlowX.git

cd OrchaFlowX
```

---

## Create Virtual Environment

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux / Mac

```bash
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Configure Environment

Create a `.env` file.

Example:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/orchaflowx

RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672

APP_NAME=OrchaFlowX
```

---

## Run Database Migrations

```bash
alembic upgrade head
```

---

## Start RabbitMQ

Using Docker:

```bash
docker run -d \
-p 5672:5672 \
-p 15672:15672 \
rabbitmq:3-management
```

RabbitMQ Dashboard

```
http://localhost:15672
```

Default Credentials

```
Username : guest
Password : guest
```

---

## Run FastAPI

```bash
uvicorn app.main:app --reload
```

Swagger UI

```
http://localhost:8000/docs
```

---

## Start Worker

```bash
python -m app.core.worker
```

---

# 🔄 Workflow Execution

1. Create Workflow
2. Add Workflow Steps
3. Define Step Dependencies
4. Execute Workflow
5. Scheduler identifies ready steps
6. RabbitMQ publishes tasks
7. Worker executes steps asynchronously
8. Next ready steps are automatically scheduled

---

# 🔁 Retry Mechanism

Each workflow step maintains a retry counter.

If a task fails:

- Retry Count increments
- Task is republished to RabbitMQ
- Execution resumes automatically

Example

```
Retry 1
↓

Retry 2
↓

Retry 3
↓

FAILED
```

---

# 🔄 Saga-inspired Compensation

If a workflow step exceeds the maximum retry limit:

- Step is marked as FAILED
- Previously completed workflow steps are compensated
- Compensation executes in reverse order

Example

```
Validate Customer ✅

↓

Reserve Inventory ✅

↓

Process Payment ❌

↓

Saga Compensation

↓

Release Inventory

↓

Undo Customer Validation
```

---

# 📡 REST APIs

### Workflow APIs

- Create Workflow
- Get All Workflows
- Get Workflow
- Delete Workflow

### Step APIs

- Add Step
- List Steps

### Dependency APIs

- Add Dependency

### Execution API

```
POST /workflows/{workflow_id}/execute
```

---

# 🧪 Sample Workflow

```
Validate Customer
        │
        ▼
Reserve Inventory
        │
        ▼
Process Payment
        │
        ▼
Generate Invoice
        │
        ▼
Notify Customer
```


# 🎯 Future Enhancements

- Redis Distributed Cache
- Workflow Monitoring Dashboard
- Workflow Visualization
- Parallel DAG Execution
- Exponential Backoff Retry
- JWT Authentication
- WebSocket Live Updates
- Kubernetes Deployment
- Prometheus Metrics
- Grafana Dashboard
