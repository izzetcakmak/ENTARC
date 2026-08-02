# Devpost submission — Build with Gemini XPRIZE + Circle Agentic Economy Prize

Copy-paste source for the submission form. Deadline: **17 August 2026, 1:00 pm PDT**.

---

## Project name

```
ENTARC — The Autonomous VC Agent
```

## Elevator pitch (200 chars)

```
The AI VC that writes its own checks: evaluates startups with Gemini and autonomously invests USDC via Circle agent wallets — within hard policy limits, no human in the loop.
```

## Built with (tags)

```
gemini, google-ai-studio, circle, usdc, arc, nextjs, typescript, prisma, postgresql, tailwind, vercel-ai, blockchain, agentic-payments, x402
```

## Links

| Field | Value |
|---|---|
| Try it out | https://entarc.xyz/agent-console |
| GitHub | https://github.com/izzetcakmak/ENTARC |
| Demo video | https://youtu.be/J1k3T85fZ-k |
| Agent wallet (block explorer) | https://testnet.arcscan.app/address/0xd8d42a355fe806545490758cf76e9c4b6ff535ad |
| Proof tx 1 | https://testnet.arcscan.app/tx/0xe1dcb261070726772e92a0fac76f6525a827c7aa9d6586a9b57c099aca3ec0df |
| Proof tx 2 | https://testnet.arcscan.app/tx/0x990ed73e3ee634c6ac8ad2c44ce5e802bed8006cc861db1cfdb89282b4166389 |

## Circle Agentic Economy Prize opt-in

> "Are you submitting for the Circle Agentic Economy Prize?" → **Yes**

---

## Project details (long description)

### Inspiration

Every agent demo ends the same way. The agent reasons, plans, picks the right tool — and then a human clicks "pay". That click is the whole gap between an AI agent and an AI agent that runs a business.

Venture capital is the sharpest version of the problem. The work of a seed investor is reading evidence and moving money against a thesis. The reading is already automatable. The moving is where everything stops: wire approvals, multisig signers, a partner on holiday. So we built the missing half — an agent whose *output is a payment*.

### What it does

ENTARC is an autonomous venture agent. Founders submit projects; the agent evaluates them and funds the ones that clear its bar, milestone by milestone, in USDC — with no human in the approval path.

The decision chain is three steps, visible live in the Agent Console:

1. **Due diligence (Gemini).** Gemini 3 Flash reads repo activity, milestone structure and category, then returns a 0–100 trust score with a written rationale. It runs at temperature 0: the same evidence must produce the same score when that score releases money.
2. **Spending policy.** The verdict passes through a policy gate: max $5 per transaction, a rolling $20 per 24 hours, and a minimum trust score of 70. There is deliberately no human-approval branch and no override flag — the policy *is* the approval path. A risk-monitor pause flips a flag the gate enforces.
3. **Settlement.** If the policy clears, the agent calls Circle's developer-controlled wallet API and USDC leaves its own wallet on Arc. The transaction is polled until the on-chain hash lands, then written back to the deal: proposal FUNDED, milestone RELEASED, hash stored.

Two runs from the demo, both real:

- **MoonVault** — "guaranteed 100x, anonymous team, no public code." Gemini scores it **0/100**, calling it a high-probability fraudulent scheme. The policy gate denies the release. No transaction is created.
- **A NEW ONE** — 340 commits, rug-proof architecture, live on testnet. Gemini scores it **88/100, STRONG_BUY**. The policy clears it and the agent sends **1.5 USDC**, then **0.9 USDC** for the second milestone. Confirmed on Arc in 0.51 seconds, for a fee of $0.0008.

The denial matters as much as the payment. It is the difference between an agent that is allowed to spend and an agent that is trusted to spend.

### How we built it

- **Reasoning:** Google Gemini 3 Flash via the Generative Language API, JSON-forced output, temperature 0.
- **Payments:** Circle Developer-Controlled Wallets. The agent provisions its own wallet on ARC-TESTNET (idempotent), reads its USDC balance by Circle token id, and settles with `createTransaction` plus polling until the hash appears.
- **Guardrails:** a standalone policy module every payment path must call. The 24-hour budget is computed from the on-chain-backed audit trail, so it cannot be gamed by drafts.
- **Idempotency:** the key is derived from (proposal, milestone, proposal version). A retry of one release can never double-spend; a genuinely new funding round gets a fresh key.
- **Stack:** Next.js 14 App Router, TypeScript, Prisma + PostgreSQL, Tailwind, NextAuth. Deployed on Abacus AI, live at entarc.xyz.
- **Network:** Arc, Circle's stablecoin L1, where USDC *is* the gas token — so fees and payouts are denominated in the same dollar.

### Challenges we ran into

**Making an LLM verdict safe to spend against.** Our first scoring pass gave the same project 88 one minute and 68 the next — a threshold of 70 turned into a coin flip. We moved analysis to temperature 0 and rewrote the system prompt to score on verifiable evidence rather than "conservatively", which removed the bias and made runs reproducible.

**Honest fixtures.** An early demo run scored a real project 12/100. Gemini was right: our seed data claimed "500+ commits" while the repo fields were left at zero, and it flagged the contradiction. We corrected the fixtures and added a genuinely weak project for the denial path, so the demo shows a deserved denial rather than a manufactured one.

**Arc is not a normal EVM chain.** USDC is the native token, so there is no ERC-20 contract to call for transfers, and the faucet rejects a `native: true` request outright. Transfers go through Circle's token id, not a token address.

**Replacing a simulation with real money.** The escrow endpoint used to return `Math.random()` transaction hashes. Cutting that out meant reconciling the schema (orphan `escrowTxHash` columns nothing ever wrote), the wallet layer, and the UI in one pass — and labelling the flows that are still previews, so nothing on screen implies more than it does.

### Accomplishments that we're proud of

- An agent that has actually moved money, twice, with hashes anyone can verify — not a video of an agent that would.
- Guardrails that are enforced in code and demonstrably deny a bad deal, which is the harder half of autonomy.
- A console that makes the whole chain legible in one screen: score, verdict, hash.

### What we learned

Agentic payments are not "add a wallet to the agent". The design work is in the guardrails: what can it spend, on what evidence, how often, and what stops it. Once those are explicit, removing the human from the approval path stops being reckless and starts being the point.

Card rails cannot serve this pattern — fixed per-transaction cost, multi-day settlement, chargeback windows and a human in the approval path. Sub-second, sub-cent, final settlement in a stablecoin is what makes machine-speed capital allocation possible at all.

### What's next for ENTARC

- Mainnet on Arc the day it opens (config change; the wallet layer is unchanged).
- Circle nanopayments for continuous milestone streaming instead of discrete tranches.
- Agent-to-agent negotiation: founders' agents proposing terms to ENTARC, both sides settling in USDC.
- Selling due-diligence reports through the Circle Agent Marketplace, so the agent both pays and gets paid.

---

## Demo video — upload notes

File: `demo/entarc-demo.mp4` (1m45s, 1920×1080, narrated).

**YouTube title**

```
ENTARC — an AI agent that runs due diligence with Gemini and pays in USDC by itself
```

**YouTube description**

```
ENTARC is an autonomous venture agent: it evaluates startups with Gemini, then invests real USDC from its own Circle wallet on Arc — with no human in the approval path.

In this demo:
0:00  Intro
0:09  The gap: agents reason and act, then a human clicks "pay"
0:23  The agent — Circle wallet, Gemini engine, spending policy
0:40  A bad deal is DENIED by the policy gate (Gemini: 0/100)
0:58  A good deal is FUNDED (Gemini: 88/100) — 1.5 USDC sent autonomously
1:17  On-chain proof: confirmed in 0.51s, fee $0.0008
1:28  Milestone tranches, each with its own transaction

Every screen and every transaction is real.

Agent wallet: https://testnet.arcscan.app/address/0xd8d42a355fe806545490758cf76e9c4b6ff535ad
Proof tx:     https://testnet.arcscan.app/tx/0xe1dcb261070726772e92a0fac76f6525a827c7aa9d6586a9b57c099aca3ec0df
Live app:     https://entarc.xyz/agent-console
Code:         https://github.com/izzetcakmak/ENTARC

Built for the Build with Gemini XPRIZE and the Circle Agentic Economy Prize.
#Gemini #Circle #USDC #Arc #AIagents
```

Set visibility to **Unlisted** or **Public** — never Private, or judges cannot open it.
