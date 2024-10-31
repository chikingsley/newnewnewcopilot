from agency_swarm import Agent
from .tools.requirements_analyzer import RequirementsAnalyzer
from .tools.scope_manager import ScopeManager
from .tools.documentation_planner import DocumentationPlanner

class PRDAgent(Agent):
    def __init__(self):
        super().__init__(
            name="PRD Agent",
            description="Specialized in gathering and documenting project requirements",
            instructions="./instructions.md",
            tools=[
                RequirementsAnalyzer,
                ScopeManager,
                DocumentationPlanner
            ],
            temperature=0.7,
            max_prompt_tokens=4000
        )