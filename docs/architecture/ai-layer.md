# AI Layer Architecture

## 1. Overview
The "ns3-ai" nomenclature reflects the core mission of this platform: augmenting traditional network management with Artificial Intelligence. The AI Layer acts as a highly privileged, read-intensive consumer of the platform's data.

## 2. Capabilities & Use Cases
- **Natural Language Queries**: Translating questions like "Which sites have the most packet loss today?" into SQL/PromQL queries, executing them, and summarizing the results.
- **Root Cause Analysis (RCA)**: When an alert fires (e.g., "BGP Neighbor Down"), the AI layer can automatically trigger diagnostic polling tasks (ping, traceroute, log scraping), aggregate the context, and append an AI-generated summary to the alert ticket.
- **Anomaly Detection**: Periodically scanning historical TSDB metrics to flag statistical deviations before hard-coded threshold alerts trigger.
- **Configuration Generation**: Assisting users in generating complex network configurations or CLI commands based on intent.

## 3. Architecture & Integration
1. **AI Service Agent**: A dedicated microservice (or internal module) that interacts with an LLM backend (e.g., OpenAI, Anthropic, or a locally hosted model).
2. **Context Hydration**: The AI has strict, read-only access to the GraphQL/REST APIs to fetch topology (Tenant -> Organization -> Site -> Device) and live metrics to hydrate its context window.
3. **Action Execution (Safe Mode)**: If the AI determines a change is necessary, it generates an `ActionProposal` that MUST be approved by a human Tenant Admin before execution. No autonomous write operations to network devices are permitted.

## 4. Multi-Tenant Privacy Boundaries
- **Strict Isolation**: The AI layer must enforce RAG (Retrieval-Augmented Generation) boundaries. Context passed to the LLM must only include data belonging to the Tenant initiating the query.
- **Stateless LLM**: The LLM provider must not use the provided network data for training. All prompts are ephemeral.
