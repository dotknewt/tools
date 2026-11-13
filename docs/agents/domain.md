# Domain docs

## Layout

This repository uses a single-context layout:

- `GLOSSARY.md`: shared domain terminology.
- `docs/adr/`: architecture decision records.

## Consumer rules

Before exploring the codebase, read the glossary and ADRs relevant
to the area being explored.

If these files are absent, proceed silently. Create them lazily through
the domain-modeling skill when terms or decisions are resolved.

Use glossary terms in issues, proposals, hypotheses, and tests.
If a concept is missing, reconsider the terminology or note the gap
for domain-modeling.

If a proposal contradicts an ADR, identify the ADR and explain why
the decision should be revisited.
