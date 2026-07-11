from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import QueryRequest, QueryResponse, Citation, KgPath
from app.services.agent_service import agent_executor

router = APIRouter(prefix="/agents", tags=["AI Agents"])

@router.post("/query", response_model=QueryResponse)
async def query_copilot(payload: QueryRequest):
    """
    Exposes the LangGraph multi-agent diagnostic runner.
    Deconstructs the query, retrieves RAG vector embeddings, inspects the Neo4j graph, 
    and synthesizes a verified operational intelligence response.
    """
    try:
        # Execute LangGraph state machine
        inputs = {
            "query": payload.query,
            "user_role": payload.role,
            "chat_history": payload.history,
            "planner_instructions": "",
            "retrieved_chunks": [],
            "neo4j_subgraph": {},
            "maintenance_diagnostics": {},
            "compliance_checks": {},
            "rca_results": {},
            "synthesized_answer": "",
            "confidence_score": 0.0,
            "citations": []
        }
        result = await agent_executor.ainvoke(inputs)
        
        # Build Response
        citations = [
            Citation(text=c["text"], source=c["source"], link=c["link"])
            for c in result.get("citations", [])
        ]
        
        kg = result.get("neo4j_subgraph", {"nodes": [], "edges": []})
        maint = result.get("maintenance_diagnostics", {})
        comp = result.get("compliance_checks", {})
        rca = result.get("rca_results", {})
        
        return QueryResponse(
            answer=result.get("synthesized_answer", "No answer synthesized."),
            citations=citations,
            confidence=result.get("confidence_score", 0.93),
            related_assets=kg.get("nodes", []),
            related_incidents=[rca.get("historical_similar", "INC-401")] if rca.get("historical_similar") else [],
            kg_path=KgPath(
                nodes=kg.get("nodes", []),
                edges=kg.get("edges", [])
            ),
            alternative_actions=[
                maint.get("diagnosis", "Switch to auxiliary duty pump."),
                "Inspect safety tags."
            ],
            compliance_impact=comp.get("findings", "No compliance issues flagged.")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
