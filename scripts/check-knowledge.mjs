/**
 * Validate repository knowledge without dependencies, network access or writes.
 * Run from any directory: node scripts/check-knowledge.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failures = []
const warnings = []
const read = name => fs.readFileSync(path.join(root, name), 'utf8')
const config = JSON.parse(read('docs/knowledge-checks.json'))
const pkg = JSON.parse(read('package.json'))
function requireScripts(name, manifest, names) {
  for (const key of names) {
    if (typeof manifest.scripts?.[key] !== 'string')
      failures.push(`${name}: missing script ${key}`)
  }
}
requireScripts('package.json', pkg, config.rootScripts)
for (const [name, names] of Object.entries(config.packageScripts)) {
  if (!fs.existsSync(path.join(root, name))) failures.push(`Missing manifest: ${name}`)
  else requireScripts(name, JSON.parse(read(name)), names)
}
for (const name of config.requiredPaths) {
  if (!fs.existsSync(path.join(root, name))) failures.push(`Missing source path: ${name}`)
}
for (const [name, expected] of Object.entries(config.externalPackages)) {
  const value = pkg.dependencies?.[name]
  if (value !== expected) failures.push(`${name}: documented link changed (${value})`)
  if (value?.startsWith('link:') && !fs.existsSync(path.resolve(root, value.slice(5))))
    warnings.push(`Optional sibling checkout unavailable: ${name}`)
}
function markdowns(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const full = path.join(dir, e.name)
    return e.isDirectory() ? markdowns(full) : e.isFile() && e.name.endsWith('.md') ? [full] : []
  })
}
const documents = [path.join(root, 'AGENTS.md'), ...markdowns(path.join(root, 'docs')), ...(config.ruleFiles ?? []).map(name => path.join(root, name))]
let links = 0
for (const file of documents) {
  const text = fs.readFileSync(file, 'utf8')
  const relative = path.relative(root, file)
  // This knowledge base uses inline Markdown links, without reference-style links.
  // Fenced examples are not documentation links. Anchors are not validated here.
  const content = text.replace(/```[^\n]*\n[\s\S]*?```/g, '')
  for (const match of content.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const raw = match[1].trim().replace(/^<|>$/g, '')
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(raw)) continue
    const local = raw.split(/[?#]/, 1)[0]
    let target
    try { target = path.resolve(path.dirname(file), decodeURIComponent(local)) }
    catch { failures.push(`${relative}: malformed link ${raw}`); continue }
    if (!fs.existsSync(target)) failures.push(`${relative}: broken link ${raw}`)
    links++
  }
}
// Enforce the human-readable book order without pretending to lint business code.
const contents = read('docs/README.md')
for (const [index, chapter] of (config.chapters ?? []).entries()) {
  const full = path.join(root, 'docs', chapter)
  if (!fs.existsSync(full)) {
    failures.push(`Missing book chapter ${index + 1}: ${chapter}`)
    continue
  }
  const heading = fs.readFileSync(full, 'utf8').split(/\r?\n/, 1)[0]
  if (!heading.startsWith(`# 第${index + 1}章`))
    failures.push(`Wrong chapter heading: ${chapter}: ${heading}`)
  if (!contents.includes(`](${chapter})`))
    failures.push(`Chapter missing from main table of contents: ${chapter}`)
}
console.log(`Book check: ${(config.chapters ?? []).length} ordered chapters; tool adapters included in link checks.`)

// Check migration ledger completeness, not source-code conformance to the rules.
if (config.ruleMigration) {
  const migration = config.ruleMigration
  const ledger = read(migration.document)
  const found = [...ledger.matchAll(/^\| (L\d{2}) \/ /gm)].map(match => match[1])
  for (const id of migration.clauseIds) {
    if (found.filter(value => value === id).length !== 1)
      failures.push(`Migration clause missing or duplicated: ${id}`)
  }
  if (found.length !== migration.clauseIds.length)
    failures.push('Unexpected migration clause count; update the ledger and manifest together')
  for (const section of migration.requiredSections) {
    if (!read(section.document).includes(section.heading))
      failures.push(`Missing specific standard section: ${section.document}: ${section.heading}`)
  }
  console.log(`Rule migration check: ${found.length} reference clauses; package layers and main API sections present.`)
}

const agentLines = read('AGENTS.md').trimEnd().split(/\r?\n/).length
if (agentLines > 150) failures.push(`AGENTS.md has ${agentLines} lines, limit 150`)
for (const w of warnings) console.warn(`WARN: ${w}`)
for (const f of failures) console.error(`FAIL: ${f}`)
console.log(`Checked ${documents.length} Markdown/rule files, ${links} local links, ${config.requiredPaths.length} source paths; AGENTS.md ${agentLines} lines.`)
console.log('Script names/link targets only: no business, compiler, test, external URL or semantic verification performed.')
process.exitCode = failures.length ? 1 : 0
