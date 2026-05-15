type ComparatorOperator = '<' | '<=' | '=' | '>' | '>=';

type ParsedVersion = {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
};

type Comparator = {
  operator: ComparatorOperator;
  version: ParsedVersion;
};

const versionPattern = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;
const comparatorPattern = /^(<=|>=|<|>|=)?\s*(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;

function parseVersion(value: string): ParsedVersion | null {
  const match = value.trim().match(versionPattern);

  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    ...(match[4] ? { prerelease: match[4] } : {}),
  };
}

export function compareVersions(left: string, right: string) {
  const parsedLeft = parseVersion(left);
  const parsedRight = parseVersion(right);

  if (!parsedLeft || !parsedRight) {
    throw new Error(`Invalid semver comparison: "${left}" vs "${right}".`);
  }

  for (const field of ['major', 'minor', 'patch'] as const) {
    if (parsedLeft[field] > parsedRight[field]) {
      return 1;
    }

    if (parsedLeft[field] < parsedRight[field]) {
      return -1;
    }
  }

  if (!parsedLeft.prerelease && parsedRight.prerelease) {
    return 1;
  }

  if (parsedLeft.prerelease && !parsedRight.prerelease) {
    return -1;
  }

  if (parsedLeft.prerelease && parsedRight.prerelease) {
    return parsedLeft.prerelease.localeCompare(parsedRight.prerelease);
  }

  return 0;
}

function parseComparators(range: string) {
  const comparators = range
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => {
      const match = part.match(comparatorPattern);
      const version = match?.[2];

      if (!match || !version) {
        return null;
      }

      return {
        operator: (match[1] ?? '=') as ComparatorOperator,
        version: parseVersion(version),
      } satisfies { operator: ComparatorOperator; version: ParsedVersion | null };
    });

  if (comparators.length === 0 || comparators.some((entry) => !entry?.version)) {
    return null;
  }

  return comparators as Comparator[];
}

export function isValidVersion(value: string) {
  return parseVersion(value) !== null;
}

export function satisfiesVersionRange(version: string, range: string | undefined) {
  if (!range) {
    return true;
  }

  const comparators = parseComparators(range);

  if (!comparators) {
    return false;
  }

  return comparators.every((comparator) => {
    const comparison = compareVersions(version, `${comparator.version.major}.${comparator.version.minor}.${comparator.version.patch}${comparator.version.prerelease ? `-${comparator.version.prerelease}` : ''}`);

    switch (comparator.operator) {
      case '<':
        return comparison < 0;
      case '<=':
        return comparison <= 0;
      case '=':
        return comparison === 0;
      case '>':
        return comparison > 0;
      case '>=':
        return comparison >= 0;
      default:
        return false;
    }
  });
}
