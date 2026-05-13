# Plugin and Module System

## v1 plugin model

Plugins are local/build-time modules with manifests. No arbitrary runtime uploaded JavaScript.

## Manifest fields

- id
- name
- version
- compatibility
- permissions
- adminMenu
- blocks
- apiRoutes
- mcpTools
- settingsSchema
- migrations
- dependencies

## Safety

- validate manifest with Zod;
- register capabilities through controlled registries;
- block unknown permissions;
- audit activation/deactivation;
- keep marketplace signing for later phases.
