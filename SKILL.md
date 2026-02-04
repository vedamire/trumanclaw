# Solana Development Skill (framework-kit-first)

## Overview
This playbook provides guidance for Solana development as of January 2026, emphasizing the Solana Foundation's framework-kit (`@solana/client` + `@solana/react-hooks`) for React/Next.js projects. It recommends `@solana/kit` for new client code and reserves web3.js for legacy compatibility via `@solana/web3-compat`.

## Primary Use Cases
Apply this skill when addressing:
- dApp interfaces using React or Next.js
- Wallet integration and transaction signing
- On-chain program development (Anchor or Pinocchio approaches)
- Typed client generation via Codama
- Testing workflows (LiteSVM, Mollusk, Surfpool)
- Security assessments and hardening

## Core Technology Preferences

**Frontend**: Use `@solana/client` + `@solana/react-hooks` with wallet-standard discovery patterns.

**SDK Layer**: Prioritize Kit abstractions (`Address`, `Signer`) and `@solana-program/*` builders rather than manual instruction construction.

**Backward Compatibility**: Reserve web3.js for third-party libraries that require legacy types, isolating these adapters at module boundaries.

**Smart Contracts**: Anchor for rapid iteration; Pinocchio for compute-unit optimization and minimal dependencies.

**Testing Stack**: Use LiteSVM/Mollusk for unit tests; Surfpool for integration scenarios.

## Implementation Workflow

1. Identify the task layer (UI, SDK, program, testing, or infrastructure)
2. Select appropriate building blocks per the preferences above
3. Ensure correctness around cluster configuration, fee payers, compute budgets, and account ownership
4. Add test coverage aligned with the testing strategy
5. Document file changes, build commands, and risk considerations

## Additional Resources
The playbook references supplementary guides covering frontend patterns, interoperability, program frameworks, testing, IDL generation, payments, and security practices.
