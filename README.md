# AndiOnboard

## Background and Context
Andile Solutions currently faces challenges with onboarding consistency, where new hires often struggle to bridge the gap between their current skills and project-specific requirements, leading to slower time-to-productivity. This project, AndiOnboard, aims to resolve these inefficiencies by developing an AI-driven platform that aggregates project, role, and individual skills data. By automating the generation of personalized ramp-up roadmaps, this system will provide new joiners with a structured, clear development path, ensuring an accelerated and consistent onboarding experience across all teams.

## Problem Statement

New hires at Andile solutions lack structured role or skills development path because there is no system that combines role, project, and individual skills baseline to automatically generate a personalized ramp-up plan, resulting in inconsistent onboarding quality and slower time to productivity across teams.

## Functional Requirement

The system must allow users to upload text describing their current skills.
The system must generate a personalized roadmap using the AI model.
The frontend must display the generated roadmap clearly to the user.
The system should allow the user to clear their input to start a new analysis.
The system could allow the user to export the roadmap as a simple text file.
The system could include a link to where new hires can see where to get lunch or the area to eat lunch.

## Solution Overview

AndiOnboard uses a Retrieval Augmented Generation(RAG) approach, when a new hire submits their skill profile, the system does not simply guess a roadmap; instead, it queries the Pinecone Vector Database, which contains pre-indexed documentation about Andile’s projects and roles. These retrieved documents act as “context” for the LLM, which then synthesizes a personalized ramp-up plan based on both the user’s current skills and the project’s specific requirements.

## How to run the front-end and deploy the front-end

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).



First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
### Modules used
Open package.json to see all modules required for the front-end.


