# Product_Evidence

Evidence that ENTARC runs in production, submitted for the Build with Gemini XPRIZE and the Circle
Agentic Economy Prize.

| File | What it shows |
|---|---|
| `ENTARC-product-evidence.pdf` | The full evidence pack: Gemini model/endpoint/configuration, every Gemini call with its verdict and policy outcome, the on-chain payments that followed, and screenshots of the funded run, the refused run and the block explorer. |
| `agent-execution-log.json` | Machine-readable export of the same records, taken from the application database. |
| `01-agent-funded-run.png` | Gemini scores *A NEW ONE* 88/100 → policy clears → the agent sends 1.5 USDC. |
| `02-agent-denied-run.png` | Gemini scores *MoonVault* 0/100 → policy denies → **no transaction is created**. |
| `03-onchain-proof.png` | The funded transaction on the public Arc explorer: 1.5 USDC, 0.51 s, $0.0008 fee. |
| `04-milestone-tranches.png` | Two tranches released ($1.50, then $0.90), each with its own hash. |

## Verify independently

- Agent wallet: https://testnet.arcscan.app/address/0xd8d42a355fe806545490758cf76e9c4b6ff535ad
- Payment 1: https://testnet.arcscan.app/tx/0xe1dcb261070726772e92a0fac76f6525a827c7aa9d6586a9b57c099aca3ec0df
- Payment 2: https://testnet.arcscan.app/tx/0x990ed73e3ee634c6ac8ad2c44ce5e802bed8006cc861db1cfdb89282b4166389
- Live app: https://entarc.xyz/agent-console · Demo video: https://youtu.be/J1k3T85fZ-k

## Billing

All Gemini usage ran on the **Google AI Studio free tier**, so the billed amount for the competition
period is **$0.00** and no paid Google Cloud invoice exists. Circle's developer sandbox and Arc Testnet
are likewise free; the agent's own on-chain fees total roughly $0.0016 in valueless testnet USDC.
