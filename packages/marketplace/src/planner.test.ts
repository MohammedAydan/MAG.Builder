import { describe, expect, it } from 'vitest';
import { defaultMarketplaceCatalog } from './local-catalog';
import { createMarketplacePlan } from './planner';

describe('marketplace planner', () => {
  it('plans a safe plugin install as dry-run only', () => {
    const plan = createMarketplacePlan(defaultMarketplaceCatalog, {
      action: 'install',
      packageId: 'plugin-seo-pack',
    });

    expect(plan.dryRun).toBe(true);
    expect(plan.status).toBe('ready');
    expect(plan.targetVersion).toBe('0.1.0');
    expect(plan.steps.join(' ')).toContain('No files');
  });

  it('plans a stable update when a newer local version exists', () => {
    const plan = createMarketplacePlan(defaultMarketplaceCatalog, {
      action: 'update',
      installedPackages: [
        {
          enabled: true,
          packageId: 'plugin-blog-pack',
          packageType: 'plugin',
          version: '0.1.0',
        },
      ],
      packageId: 'plugin-blog-pack',
    });

    expect(plan.status).toBe('ready');
    expect(plan.targetVersion).toBe('0.1.1');
  });

  it('blocks enable planning when the package is not installed', () => {
    const plan = createMarketplacePlan(defaultMarketplaceCatalog, {
      action: 'enable',
      packageId: 'plugin-forms-pack',
    });

    expect(plan.status).toBe('blocked');
    expect(plan.errors.join(' ')).toContain('must be installed before it can be enabled');
  });

  it('blocks installs when dependency constraints are not met', () => {
    const plan = createMarketplacePlan(defaultMarketplaceCatalog, {
      action: 'install',
      installedPackages: [
        {
          packageId: 'plugin-forms-pack',
          packageType: 'plugin',
          version: '0.0.1',
        },
      ],
      packageId: 'plugin-membership-pack',
    });

    expect(plan.status).toBe('blocked');
    expect(plan.errors.join(' ')).toContain('does not satisfy');
  });

  it('noops update planning when no newer version exists', () => {
    const plan = createMarketplacePlan(defaultMarketplaceCatalog, {
      action: 'update',
      installedPackages: [
        {
          packageId: 'template-starter-site',
          packageType: 'template',
          version: '0.1.0',
        },
      ],
      packageId: 'template-starter-site',
    });

    expect(plan.status).toBe('noop');
  });
});
