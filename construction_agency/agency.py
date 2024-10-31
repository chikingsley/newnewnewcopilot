from agency_swarm import Agency
from prd_agent.prd_agent import PRDAgent
from document_agent.document_agent import DocumentAgent
from technical_agent.technical_agent import TechnicalAgent
from compliance_agent.compliance_agent import ComplianceAgent
from cost_agent.cost_agent import CostAgent

# Initialize agents
prd_agent = PRDAgent()
doc_agent = DocumentAgent()
tech_agent = TechnicalAgent()
compliance_agent = ComplianceAgent()
cost_agent = CostAgent()

# Create agency with updated communication flows
agency = Agency(
    [
        prd_agent,  # PRD agent is the new entry point
        [prd_agent, tech_agent],  # PRD agent communicates with Technical agent
        [prd_agent, compliance_agent],  # PRD agent communicates with Compliance agent
        [prd_agent, cost_agent],  # PRD agent communicates with Cost agent
        [tech_agent, compliance_agent],  # Technical agent communicates with Compliance agent
        [tech_agent, cost_agent],  # Technical agent communicates with Cost agent
        [compliance_agent, cost_agent],  # Compliance agent communicates with Cost agent
        [prd_agent, doc_agent],  # PRD agent communicates with Document agent last
        [tech_agent, doc_agent],  # Technical agent can update documents
        [compliance_agent, doc_agent],  # Compliance agent can update documents
        [cost_agent, doc_agent],  # Cost agent can update documents
    ],
    shared_instructions="agency_manifesto.md",
    temperature=0.5,
    max_prompt_tokens=4000
)

if __name__ == "__main__":
    agency.run_demo()