from pydantic import BaseModel


class StepCreate(BaseModel):
    name: str
    workflow_id: str


class StepResponse(BaseModel):
    id: str
    name: str
    status: str
    workflow_id: str

    class Config:
        from_attributes = True