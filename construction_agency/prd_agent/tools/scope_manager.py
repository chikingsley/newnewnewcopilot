from agency_swarm.tools import BaseTool
from pydantic import Field
import os
from dotenv import load_dotenv
import anthropic

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class ScopeManager(BaseTool):
    """
    Tool for defining and managing project scope based on requirements.
    Creates detailed scope documents and identifies deliverables.
    """
    
    requirements: str = Field(
        ..., 
        description="Analyzed requirements from RequirementsAnalyzer"
    )
    
    def run(self):
        """Define project scope and deliverables"""
        try:
            prompt = f"""Based on the following requirements, create a detailed project scope document:

Requirements:
{self.requirements}

Please provide:
1. Project Boundaries
2. Deliverables List
3. Exclusions
4. Milestones
5. Risk Assessment
6. Dependencies

Format the response as a structured scope document with clear sections."""

            message = client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=4096,
                temperature=0.7,
                system="You are an expert project scope manager specializing in construction projects. Generate detailed, actionable scope documents.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            return {
                "status": "success",
                "scope": message.content[0].text
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to define scope: {str(e)}"
            }

if __name__ == "__main__":
    scope_manager = ScopeManager(
        requirements="Sample requirements for luxury deck project..."
    )
    result = scope_manager.run()
    print(result)