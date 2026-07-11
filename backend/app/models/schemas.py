from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class UserDTO(BaseModel):
    id: str
    name: str
    email: str
    role: str
    plant_id: str

class QueryRequest(BaseModel):
    query: str = Field(..., description="The diagnostic user query")
    history: List[Dict[str, str]] = Field(default=[], description="Chat history context")
    role: str = Field(..., description="The RBAC role of the querying user")

class Citation(BaseModel):
    text: str
    source: str
    link: str

class KgPath(BaseModel):
    nodes: List[str]
    edges: List[str]

class QueryResponse(BaseModel):
    answer: str
    citations: List[Citation]
    confidence: float
    related_assets: List[str]
    related_incidents: List[str]
    kg_path: KgPath
    alternative_actions: List[str]
    compliance_impact: str

class ExtractedMetadataDTO(BaseModel):
    equipment_ids: List[str]
    plant_locations: List[str]
    engineers: List[str]
    dates: List[str]
    regulations: List[str]
    asset_types: List[str]
    failure_codes: List[str]
    operating_limits: List[str]
    maintenance_schedule: List[str]
    safety_instructions: List[str]

class DocumentDTO(BaseModel):
    id: str
    name: str
    type: str
    size: str
    upload_date: str
    status: str
    ocr_status: str
    confidence: float
    version: str
    author: str
    approval_status: str
    linked_assets: List[str]
    compliance_tags: List[str]
    extracted_metadata: ExtractedMetadataDTO

class CorrectiveActionCreate(BaseModel):
    action: str
    regulation: str
    priority: str
    assignee: str
    deadline: str

class SystemNotificationDTO(BaseModel):
    id: str
    severity: str
    type: str
    message: str
    details: Optional[str] = None
    timestamp: str
    is_read: bool
    action_url: Optional[str] = None
    action_label: Optional[str] = None
