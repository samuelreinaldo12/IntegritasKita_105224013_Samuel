import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const securityDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(securityDirectory, '..');
const lock = JSON.parse(await readFile(resolve(repositoryRoot, 'package-lock.json'), 'utf8'));
const packageEntries = Object.entries(lock.packages ?? {}).filter(
  ([path, entry]) => path.startsWith('node_modules/') && entry.version && !entry.link,
);
const referenceByPath = new Map(
  packageEntries.map(([path]) => [path, `urn:integritaskita:package:${encodeURIComponent(path)}`]),
);

function packageUrl(name, version) {
  const encodedName = encodeURIComponent(name).replace(/%2F/gi, '/');
  return `pkg:npm/${encodedName}@${encodeURIComponent(version)}`;
}

function resolveDependency(fromPath, dependencyName) {
  let directory = fromPath;

  while (directory) {
    const candidate = `${directory}/node_modules/${dependencyName}`;
    if (referenceByPath.has(candidate)) return referenceByPath.get(candidate);
    const parentIndex = directory.lastIndexOf('/node_modules/');
    if (parentIndex === -1) break;
    directory = directory.slice(0, parentIndex);
  }

  const rootCandidate = `node_modules/${dependencyName}`;
  return referenceByPath.get(rootCandidate);
}

const rootReference = `urn:integritaskita:application:${lock.packages?.['']?.version ?? '0.0.0'}`;
const components = packageEntries.map(([path, entry]) => ({
  'bom-ref': referenceByPath.get(path),
  type: 'library',
  name: entry.name ?? path.slice(path.lastIndexOf('node_modules/') + 'node_modules/'.length),
  version: entry.version,
  purl: packageUrl(
    entry.name ?? path.slice(path.lastIndexOf('node_modules/') + 'node_modules/'.length),
    entry.version,
  ),
  properties: [{ name: 'npm:lockfile-path', value: path }],
}));
const dependencies = [
  {
    ref: rootReference,
    dependsOn: [
      ...new Set(
        Object.keys(lock.packages?.['']?.dependencies ?? {})
          .concat(Object.keys(lock.packages?.['']?.devDependencies ?? {}))
          .concat(Object.keys(lock.packages?.['']?.optionalDependencies ?? {}))
          .map((name) => resolveDependency('', name))
          .filter(Boolean),
      ),
    ],
  },
  ...packageEntries.map(([path, entry]) => ({
    ref: referenceByPath.get(path),
    dependsOn: [
      ...new Set(
        Object.keys(entry.dependencies ?? {})
          .concat(Object.keys(entry.optionalDependencies ?? {}))
          .map((name) => resolveDependency(path, name))
          .filter(Boolean),
      ),
    ],
  })),
];
const bom = {
  bomFormat: 'CycloneDX',
  specVersion: '1.5',
  serialNumber: `urn:uuid:${randomUUID()}`,
  version: 1,
  metadata: {
    timestamp: new Date().toISOString(),
    component: {
      'bom-ref': rootReference,
      type: 'application',
      name: lock.packages?.['']?.name ?? 'IntegritasKita',
      version: lock.packages?.['']?.version ?? '0.0.0',
    },
    properties: [{ name: 'security:sec-0.2:source', value: 'package-lock.json' }],
  },
  components,
  dependencies,
};

const knownReferences = new Set([rootReference, ...components.map((component) => component['bom-ref'])]);
if (dependencies.some((item) => item.dependsOn.some((reference) => !knownReferences.has(reference)))) {
  throw new Error('Generated SBOM has an unresolved dependency reference.');
}

await writeFile(resolve(securityDirectory, 'sbom.cdx.json'), `${JSON.stringify(bom, null, 2)}\n`, 'utf8');
console.log(`Generated CycloneDX application SBOM with ${components.length} locked packages.`);
