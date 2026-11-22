import logging
from typing import Dict, Any, Optional
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command
from app.agents.state import ClaimGraphState
from app.agents.intake_agent import intake_node
from app.agents.policy_agent import policy_node
from app.agents.fraud_agent import fraud_node
from app.agents.subrogation_agent import subrogation_node
from app.agents.estimator_agent import estimator_node
from app.agents.adjudicator_agent import adjudicator_node
from app.core.checkpointer import get_checkpointer

logger = logging.getLogger("claimflow.graph")


def build_claim_graph(checkpointer=None):
    """
    Builds the stateful 6-agent LangGraph topology:
    1. intake_agent (FNOL & IDP Reader)
    2. Parallel fan-out: policy_agent, fraud_agent, subrogation_agent
    3. Fan-in: estimator_agent (Damage Benchmark & Pure Python Payout Math)
    4. adjudicator_agent (Supervisor & HITL interrupt router)
    """
    workflow = StateGraph(ClaimGraphState)

    # Register 6 Agent Nodes
    workflow.add_node("intake", intake_node)
    workflow.add_node("policy", policy_node)
    workflow.add_node("fraud", fraud_node)
    workflow.add_node("subrogation", subrogation_node)
    workflow.add_node("estimator", estimator_node)
    workflow.add_node("adjudicator", adjudicator_node)

    # Topology: START -> intake
    workflow.add_edge(START, "intake")

    # Parallel Fan-Out: intake -> [policy, fraud, subrogation]
    workflow.add_edge("intake", "policy")
    workflow.add_edge("intake", "fraud")
    workflow.add_edge("intake", "subrogation")

    # Fan-In: [policy, fraud, subrogation] -> estimator
    workflow.add_edge("policy", "estimator")
    workflow.add_edge("fraud", "estimator")
    workflow.add_edge("subrogation", "estimator")

    # Estimator -> Adjudicator
    workflow.add_edge("estimator", "adjudicator")

    # Adjudicator -> END
    workflow.add_edge("adjudicator", END)

    if checkpointer is None:
        checkpointer = get_checkpointer()

    return workflow.compile(checkpointer=checkpointer)


# Global compiled app
claim_graph_app = build_claim_graph()


def execute_claim(
    claim_id: str,
    thread_id: str,
    raw_narrative: str,
    policy_number: str = "POL-882910",
    policy_bound_date: str = "2026-01-01",
    raw_pdf_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Runs the graph for a claim from START up to completion or HITL interrupt().
    """
    initial_state: ClaimGraphState = {
        "claim_id": claim_id,
        "thread_id": thread_id,
        "raw_narrative": raw_narrative,
        "redacted_narrative": "",
        "pii_token_map": {},
        "raw_pdf_path": raw_pdf_path,
        "policy_number": policy_number,
        "policy_bound_date": policy_bound_date,
        "intake": None,
        "policy": None,
        "fraud": None,
        "subrogation": None,
        "estimator": None,
        "adjudication": None,
        "hitl_decision": None,
        "final_resolution": None
    }

    config = {"configurable": {"thread_id": thread_id}}
    result = claim_graph_app.invoke(initial_state, config=config)
    return result


def resume_claim(thread_id: str, hitl_decision: Dict[str, Any]) -> Dict[str, Any]:
    """
    Resumes a paused claim workflow from durable checkpoint using Command(resume=hitl_decision).
    """
    config = {"configurable": {"thread_id": thread_id}}
    # Resume the interrupted graph
    result = claim_graph_app.invoke(Command(resume=hitl_decision), config=config)
    return result
