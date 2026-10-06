# IBM Quantum token — 3-step setup (owner action)

Everything in this directory is **token-gated and opt-in**. Without a token,
the code refuses loudly (it prints this file's instructions and exits) —
it NEVER silently falls back and calls the output "quantum".

**What the free tier is (IBM Quantum "Open Plan", verified 2026-10-06):**
- 10 minutes of real QPU time per 28-day rolling window. Forever free.
- Meant for learning/R&D/experimentation — NOT production workloads.
- Beyond that: pay-as-you-go (~$1.60/runtime-second). We will never spend
  money without your explicit go-ahead.
- One Hadamard-sampling batch (our use) costs seconds of QPU time; the free
  tier covers occasional batch-seed pulls for years.

**The 3 steps:**

1. **Create the free account.** Go to https://quantum.ibm.com/ → sign up
   (email + IBMid). This is the one step only you can do — it needs your
   email and signup, so no agent does this for you.

2. **Copy your API token.** Log in at https://quantum.ibm.com/ → open your
   account/profile → API token → "Generate" (or copy the existing one).

3. **Paste it into the environment.** Do NOT commit it to any repo (a
   committed token was already revoked once — SECURITY 3/4). Run:
   ```bash
   export IBM_QUANTUM_TOKEN="paste-your-token-here"
   /tmp/qvenv/bin/python tools/qrng/ibm_batch_seeds.py --batches 4 --bytes 64
   ```
   To make it permanent, add the export line to `~/.bashrc` (or wherever
   your shell reads env). The Secure Vault flow also works if you prefer.

**Verify it worked:** the batch script prints `ibm-quantum: REAL
superconducting quantum hardware (Qiskit Runtime, backend=<name>)` and saves
`tools/qrng/proof/ibm_batch_<date>.json` with per-batch provenance. No
token → exit code 2 with these exact instructions printed.

**Cost guardrail:** the batch script hard-caps total shots per run
(--max-shots, default 4096). Staying inside the 10 free minutes/month is
your responsibility — check usage at https://quantum.ibm.com/ under
your account.
