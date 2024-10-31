from agency_swarm.tools import BaseTool
from pydantic import Field
import os
from dotenv import load_dotenv
import anthropic

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class RequirementsAnalyzer(BaseTool):
    """
    Tool for analyzing and documenting project requirements using Claude AI.
    Generates comprehensive requirement specifications based on project input.
    """
    
    project_input: str = Field(
        ..., 
        description="Initial project request or description"
    )
    
    def run(self):
        """Analyze project requirements and generate detailed specifications"""
        try:
            prompt = f"""Analyze the following project request and generate a detailed requirements specification:

Project Input:
{self.project_input}

Please provide:
1. Functional Requirements
2. Technical Requirements
3. Project Constraints
4. Assumptions and Dependencies
5. Key Stakeholders
6. Success Criteria

Format the response as a structured document with clear sections and bullet points."""

            message = client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=4096,
                temperature=0.7,
                system="You are an expert requirements analyst specializing in construction projects. Generate detailed, actionable requirements specifications.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            return {
                "status": "success",
                "requirements": message.content[0].text
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to analyze requirements: {str(e)}"
            }

if __name__ == "__main__":
    analyzer = RequirementsAnalyzer(
        project_input="Build a luxury deck with gold plating and diamond inlays"
    )
    result = analyzer.run()
    print(result)