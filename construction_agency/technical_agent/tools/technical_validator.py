from agency_swarm.tools import BaseTool
from pydantic import Field
import os
from dotenv import load_dotenv
import anthropic
import requests
from bs4 import BeautifulSoup
import json

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class TechnicalValidator(BaseTool):
    """
    Tool for validating technical specifications against industry standards
    and best practices using multiple data sources.
    """
    
    specifications: str = Field(
        ..., 
        description="Technical specifications to validate"
    )
    project_type: str = Field(
        ..., 
        description="Type of construction project"
    )
    
    def run(self):
        """Validate technical specifications against standards"""
        try:
            # Fetch relevant technical standards
            standards = self._fetch_technical_standards(self.project_type)
            
            # Create validation prompt
            prompt = f"""Perform a detailed technical validation of the following specifications against industry standards:

Specifications to Validate:
{self.specifications}

Relevant Industry Standards:
{standards}

Please provide:
1. Detailed validation results for each specification
2. Compliance with industry standards
3. Technical concerns or issues
4. Recommended improvements
5. Safety considerations
6. Material compatibility analysis
7. Construction methodology assessment

Format the response as a comprehensive technical validation report."""

            message = client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=4096,
                temperature=0.7,
                system="You are an expert technical validator specializing in construction engineering. Provide detailed technical validation with specific references to industry standards.",
                messages=[{"role": "user", "content": prompt}]
            )

            validation_results = message.content[0].text

            # Perform additional material compatibility checks
            compatibility_issues = self._check_material_compatibility(self.specifications)
            
            # Combine results
            final_report = f"""Technical Validation Report:

{validation_results}

Material Compatibility Analysis:
{compatibility_issues}"""

            return {
                "status": "success",
                "validation_report": final_report
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Technical validation failed: {str(e)}"
            }

    def _fetch_technical_standards(self, project_type):
        """Fetch relevant technical standards from industry databases"""
        # Simulate fetching from standards database
        # In production, this would connect to actual standards databases
        standards_db = {
            "deck": [
                "ASTM D7032-17: Standard Specification for Wood-Plastic Composite Products",
                "ICC-ES AC174: Acceptance Criteria for Deck Board Span Ratings",
                "ASTM E84: Standard Test Method for Surface Burning Characteristics",
            ],
            "commercial": [
                "ASTM E1996-17: Standard Specification for Performance of Exterior Windows",
                "ANSI/ASHRAE Standard 90.1: Energy Standard for Buildings",
            ],
            # Add more project types and standards
        }
        
        return standards_db.get(project_type.lower(), ["Standard not found for project type"])

    def _check_material_compatibility(self, specifications):
        """Check compatibility between specified materials"""
        # In production, this would use a materials database
        # For now, we'll use Claude to analyze compatibility
        prompt = f"""Analyze the following specifications for material compatibility issues:

{specifications}

Consider:
1. Chemical reactions between materials
2. Thermal expansion differences
3. Galvanic corrosion potential
4. Environmental factors
5. Installation sequence impacts

Provide specific compatibility concerns and recommendations."""

        message = client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=2048,
            temperature=0.7,
            system="You are an expert in construction materials and chemistry. Analyze material compatibility with scientific precision.",
            messages=[{"role": "user", "content": prompt}]
        )

        return message.content[0].text

if __name__ == "__main__":
    validator = TechnicalValidator(
        specifications="Gold-plated deck with diamond inlays...",
        project_type="deck"
    )
    result = validator.run()
    print(result)