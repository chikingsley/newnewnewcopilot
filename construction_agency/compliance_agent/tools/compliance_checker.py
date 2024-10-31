from agency_swarm.tools import BaseTool
from pydantic import Field
import os
from dotenv import load_dotenv
import anthropic
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# API keys for various services
BUILDING_CODES_API_KEY = os.getenv("BUILDING_CODES_API_KEY")
PERMIT_DATA_API_KEY = os.getenv("PERMIT_DATA_API_KEY")

class ComplianceChecker(BaseTool):
    """
    Tool for checking compliance with building codes, regulations, and permits.
    Uses multiple data sources and APIs to ensure comprehensive compliance checking.
    """
    
    project_details: str = Field(
        ..., 
        description="Project details to check for compliance"
    )
    location: str = Field(
        ..., 
        description="Project location (city, state)"
    )
    building_type: str = Field(
        ..., 
        description="Type of building/construction"
    )

    def run(self):
        """Check project compliance with all relevant regulations"""
        try:
            # Fetch current building codes
            building_codes = self._fetch_building_codes(self.location, self.building_type)
            
            # Fetch zoning regulations
            zoning_regs = self._fetch_zoning_regulations(self.location)
            
            # Fetch permit requirements
            permit_reqs = self._fetch_permit_requirements(self.location, self.building_type)
            
            # Create comprehensive compliance check prompt
            prompt = f"""Perform a detailed compliance analysis for the following project:

Project Details:
{self.project_details}

Location: {self.location}
Building Type: {self.building_type}

Building Codes:
{building_codes}

Zoning Regulations:
{zoning_regs}

Permit Requirements:
{permit_reqs}

Please provide:
1. Detailed compliance analysis for each regulation
2. Required permits and their status
3. Potential compliance issues
4. Required modifications
5. Timeline for compliance
6. Cost implications
7. Risk assessment

Format the response as a comprehensive compliance report."""

            message = client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=4096,
                temperature=0.7,
                system="You are an expert construction compliance officer. Provide detailed compliance analysis with specific references to codes and regulations.",
                messages=[{"role": "user", "content": prompt}]
            )

            # Generate final report
            final_report = f"""Compliance Analysis Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

{message.content[0].text}

Additional Requirements:
- Environmental Impact Assessment: {self._check_environmental_requirements()}
- Safety Regulations: {self._check_safety_regulations()}
- Insurance Requirements: {self._check_insurance_requirements()}
"""

            return {
                "status": "success",
                "compliance_report": final_report
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Compliance check failed: {str(e)}"
            }

    def _fetch_building_codes(self, location, building_type):
        """Fetch current building codes from official sources"""
        # In production, this would use actual building codes API
        # For now, simulate with comprehensive code database
        codes_db = {
            "residential": [
                "IRC 2021 Section R507: Exterior Decks",
                "IRC 2021 Chapter 3: Building Planning",
                "Local Amendment 2023-01: Luxury Construction",
            ],
            "commercial": [
                "IBC 2021 Chapter 5: General Building Heights and Areas",
                "IBC 2021 Chapter 6: Types of Construction",
            ]
        }
        
        return codes_db.get(building_type.lower(), ["Code not found for building type"])

    def _fetch_zoning_regulations(self, location):
        """Fetch current zoning regulations"""
        # In production, this would use zoning API
        # Simulate with sample data
        return f"Zoning regulations for {location}:\n- Setback requirements\n- Height restrictions\n- Usage limitations"

    def _fetch_permit_requirements(self, location, building_type):
        """Fetch current permit requirements"""
        # In production, this would use permit database API
        # Simulate with sample data
        return f"Permit requirements for {building_type} in {location}:\n- Building permit\n- Special use permit\n- Environmental permit"

    def _check_environmental_requirements(self):
        """Check environmental compliance requirements"""
        return "Environmental impact assessment required\nStormwater management plan needed"

    def _check_safety_regulations(self):
        """Check safety regulation compliance"""
        return "OSHA regulations apply\nFall protection required\nSite safety plan needed"

    def _check_insurance_requirements(self):
        """Check insurance requirements"""
        return "General liability insurance required\nWorker's compensation insurance required"

if __name__ == "__main__":
    checker = ComplianceChecker(
        project_details="Luxury deck with gold plating...",
        location="Beverly Hills, CA",
        building_type="residential"
    )
    result = checker.run()
    print(result)