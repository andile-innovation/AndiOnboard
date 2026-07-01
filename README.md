# AndiOnboard

# Background and Context
Andile Solutions currently faces challenges with onboarding consistency, where new hires often struggle to bridge the gap between their current skills and project-specific requirements, leading to slower time-to-productivity. This project, AndiOnboard, aims to resolve these inefficiencies by developing an AI-driven platform that aggregates project, role, and individual skills data. By automating the generation of personalized ramp-up roadmaps, this system will provide new joiners with a structured, clear development path, ensuring an accelerated and consistent onboarding experience across all teams.

# Problem Statement

New hires at Andile solutions lack structured role or skills development path because there is no system that combines role, project, and individual skills baseline to automatically generate a personalized ramp-up plan, resulting in inconsistent onboarding quality and slower time to productivity across teams.

# Functional Requirement

The system must allow users to upload text describing their current skills.
The system must generate a personalized roadmap using the AI model.
The frontend must display the generated roadmap clearly to the user.
The system should allow the user to clear their input to start a new analysis.
The system could allow the user to export the roadmap as a simple text file.
The system could include a link to where new hires can see where to get lunch or the area to eat lunch.

# Solution Overview

AndiOnboard uses a Retrieval Augmented Generation(RAG) approach, when a new hire submits their skill profile, the system does not simply guess a roadmap; instead, it queries the Pinecone Vector Database, which contains pre-indexed documentation about Andile’s projects and roles. These retrieved documents act as “context” for the LLM, which then synthesizes a personalized ramp-up plan based on both the user’s current skills and the project’s specific requirements.


