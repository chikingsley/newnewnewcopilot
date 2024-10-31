from agency_swarm.tools import BaseTool
from pydantic import Field
import os
from dotenv import load_dotenv
import anthropic

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class DocumentationPlanner(BaseTool):
    """
    Tool for planning and organizing project documentation.
    Creates documentation roadmap and defines document requirements.
    """
    
    scope: str = Field(
        ..., 
        description="Project scope from ScopeManager"
    )
    
    def run(self):
        """Create documentation plan"""
        try:
            prompt = f"""Based on the following project scope, create a comprehensive documentation plan:

Project Scope:
{self.scope}

Please provide:
1. Required Document Types
2. Document Priority Order
3. Review Cycles
4. Approval Process
5. Version Control Strategy
6. Documentation Timeline

Format the response as a structured plan with clear sections and priorities."""

            message = client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=4096,
                temperature=0.7,
                system="You are an expert documentation planner specializing in construction projects. Generate detailed, actionable documentation plans.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            return {
                "status": "success",
                "plan": message.content[0].text
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to create documentation plan: {str(e)}"
            }

if __name__ == "__main__":
    planner = DocumentationPlanner(
        scope="Sample scope for luxury deck project..."
    )
    result = planner.run()
    print(result)