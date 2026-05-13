# NexPress Builder Architecture

## Source of truth

`packages/builder-core` owns the builder schema.

## Editor adapter

Puck is used to create a modern visual editor, but Puck data must map to NexPress builder documents.

## Builder document

A builder document includes:

- schema version;
- page metadata;
- root block tree;
- reusable/global section references;
- responsive style objects;
- data binding definitions;
- permissions/visibility rules;
- migration metadata.

## Renderer rule

Public renderer accepts only validated builder documents. Unknown blocks render safe fallbacks, not crashes.
