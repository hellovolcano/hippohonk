const SwaggerParser = require("@apidevtools/swagger-parser");
const fs = require("fs-extra");
const path = require("path");

const SPEC_PATH = "openapi.yaml";
const OUT_DIR = path.join(process.cwd(), "../help/docs/api");

function getBaseUrl(api) {
  if (!Array.isArray(api.servers) || api.servers.length === 0) {
    return null;
  }
  return api.servers[0].url;
}

function pathToFilename(apiPath) {
  return apiPath
    .replace(/^\//, "")
    .replace(/[{}]/g, "")
    .replace(/\//g, "-")
    .replace(/[^a-zA-Z0-9\-_.]/g, "");
}

function normalizeSchema(schema) {
  if (!schema) return null;

  // unwrap nullable oneOf: [<schema>, null]
  if (schema.oneOf && schema.nullable) {
    const nonNull = schema.oneOf.find((s) => s.type !== "null");
    if (nonNull) schema = nonNull;
  }

  // arrays
  if (schema.type === "array" && schema.items) {
    return { isArray: true, schema: schema.items };
  }

  return { isArray: false, schema };
}

function mdEscape(text) {
  return String(text ?? "").replace(/\|/g, "\\|").trim();
}

function schemaTypeString(prop) {
  if (!prop) return "—";
  if (prop.type) return prop.format ? `${prop.type} (${prop.format})` : prop.type;
  if (prop.oneOf) return "oneOf";
  if (prop.anyOf) return "anyOf";
  if (prop.allOf) return "allOf";
  if (prop.$ref) return "ref";
  return "object";
}

function renderPropertiesTable(schema) {
  if (!schema) return "_No schema._\n";
  if (!schema.properties) return "_No structured properties defined._\n";

  const required = new Set(schema.required || []);
  const rows = Object.entries(schema.properties).map(([field, prop]) => {
    const type = schemaTypeString(prop);
    const req = required.has(field) ? "*" : "";
    const nullable = prop.nullable ? "yes" : "no";
    const desc = mdEscape(prop.description || "");

    // property-level example(s)
    const example =
      prop.example !== undefined
        ? `\`${mdEscape(JSON.stringify(prop.example))}\``
        : Array.isArray(prop.examples)
          ? `\`${mdEscape(JSON.stringify(prop.examples[0]))}\``
          : "";

    return `| \`${field}\` ${req} | ${mdEscape(type)} | ${desc} | ${example} |`;
  });

  return [
    "",
    "| Field (*) | Type | Description | Example |",
    "|------|------|---------------|-----------------|",
    ...rows,
    "",
    "(*) Required field",
  ].join("\n");
}

function renderJsonSchemaBlock(title, schemaObj, level = 1) {
  if (!schemaObj) return "";
  const { isArray, schema } = schemaObj;
  const heading = `${"#".repeat(level)} ${title}`;
  return [
    heading,
    isArray ? "_Returns an array_\n" : "",
    renderPropertiesTable(schema),
  ].join("\n");
}

function pickJsonContent(obj) {
  if (!obj?.content) return null;
  return (
    obj.content["application/json"] ||
    Object.entries(obj.content).find(([k]) => k.toLowerCase().includes("json"))?.[1] ||
    null
  );
}

/**
 * Extract operation-level examples from an OpenAPI Media Type Object.
 * Supports:
 *  - media.example
 *  - media.examples.<name>.value
 * Returns: [{ name, summary, value }]
 */
function extractMediaExamples(media) {
  if (!media) return [];

  const out = [];

  // Single example
  if (media.example !== undefined) {
    out.push({ name: "example", summary: "", value: media.example });
  }

  // Named examples
  if (media.examples && typeof media.examples === "object") {
    for (const [name, ex] of Object.entries(media.examples)) {
      if (!ex) continue;
      // OpenAPI Example Object can be { value } or { externalValue }.
      // We only render inline values here.
      if (ex.value !== undefined) {
        out.push({ name, summary: ex.summary || "", value: ex.value });
      }
    }
  }

  return out;
}

function isPlainObject(x) {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}

function prettyJson(value) {
  try {
    // If it's already a string that looks like JSON, keep it readable
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function mapCodeFenceLang(lang) {
  const l = String(lang || "").toLowerCase().trim();
  // common mappings for nicer highlighting in MD
  if (l === "curl" || l === "bash" || l === "sh" || l === "shell") return "bash";
  if (l === "javascript" || l === "js" || l === "node") return "javascript";
  if (l === "typescript" || l === "ts") return "typescript";
  if (l === "python" || l === "py") return "python";
  if (l === "http") return "http";
  if (l === "json") return "json";
  if (l === "yaml" || l === "yml") return "yaml";
  return ""; // no language fence if unknown
}

function normalizeCodeSamples(operation) {
  const samples = operation?.["x-codeSamples"];
  if (!Array.isArray(samples)) return [];
  return samples
    .filter((s) => s && (s.source || s.code || s.value))
    .map((s) => ({
      lang: s.lang || s.language || s.label || "sample",
      label: s.label || s.title || "",
      // different tooling sometimes uses different keys
      source: s.source || s.code || s.value || "",
    }))
    .filter((s) => String(s.source).trim().length > 0);
}

function slugifyForValue(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeMdxAttr(text) {
  // Minimal escaping for MDX attribute strings
  return String(text || "").replace(/"/g, "&quot;");
}

function renderCodeSamples(operation, headingLevel = 3) {
  const samples = normalizeCodeSamples(operation);
  if (samples.length === 0) return "";

  const h = `${"#".repeat(headingLevel)} Code samples`;

  // If there is only one sample, don’t bother with tabs—just render normally.
  if (samples.length === 1) {
    const s = samples[0];
    const fenceLang = mapCodeFenceLang(s.lang);
    const trimmed = String(s.source).replace(/\s+$/g, "");

    return [
      h,
      "",
      `#### ${mdEscape([s.lang, s.label].filter(Boolean).join(" — "))}`,
      "",
      "```" + (fenceLang || ""),
      trimmed,
      "```",
    ].join("\n");
  }

  // Multiple samples => Tabs
  const tabItems = samples.map((s) => {
    const label = [s.lang, s.label].filter(Boolean).join(" — ") || "Sample";
    const value = slugifyForValue(s.lang || label) || "sample";
    const fenceLang = mapCodeFenceLang(s.lang);
    const trimmed = String(s.source).replace(/\s+$/g, "");

    return [
      `<TabItem value="${escapeMdxAttr(value)}" label="${escapeMdxAttr(label)}">`,
      "",
      "```" + (fenceLang || ""),
      trimmed,
      "```",
      "",
      `</TabItem>`,
    ].join("\n");
  });

  return [
    h,
    "",
    `<Tabs groupId="codeSamples">`,
    "",
    ...tabItems,
    "",
    `</Tabs>`,
  ].join("\n");
}


function renderExamplesSection(title, examples, headingLevel = 3) {
  if (!examples || examples.length === 0) return "";

  const h = `${"#".repeat(headingLevel)} ${title}`;
  const blocks = examples.map((ex) => {
    const label = `**${mdEscape(ex.summary)}**\n`;
    const body = prettyJson(ex.value);

    // Heuristic: if it's a primitive, show inline; otherwise fenced json
    if (!isPlainObject(ex.value) && !Array.isArray(ex.value)) {
      return `${label}\`${mdEscape(body)}\``;
    }

    return `${label}\n\`\`\`json\n${body}\n\`\`\``;
  });

  return [h, ...blocks].join("\n\n");
}

function renderRequestBody(operation) {
  const content = pickJsonContent(operation.requestBody);
  if (!content?.schema) return "";

  const schemaObj = normalizeSchema(content.schema);
  const examples = extractMediaExamples(content);

  return [
    renderJsonSchemaBlock("Request body fields", schemaObj),
    renderExamplesSection("Example request(s)", examples, 3),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function renderResponses(operation) {
  const responses = operation.responses || {};
  const parts = [];

  for (const [status, resp] of Object.entries(responses)) {
    const content = pickJsonContent(resp);

    parts.push(`#### Response ${status}`);
    if (resp.description) parts.push(resp.description);

    if (content?.schema) {
      const schemaObj = normalizeSchema(content.schema);
      parts.push(renderJsonSchemaBlock(`Response fields`, schemaObj, 4));
    } else {
      parts.push("_No JSON response body._\n");
    }

    // Response examples (status-specific)
    const examples = extractMediaExamples(content);
    const examplesSection = renderExamplesSection("Example response(s)", examples, 4);
    if (examplesSection) parts.push(examplesSection);
  }

  return parts.join("\n\n");
}

function renderOperation(method, operation) {
  const title = `${method.toUpperCase()}`;
  const summary = operation.summary ? `**Summary:** ${operation.summary}\n` : "";
  const description = operation.description ? `${operation.description}\n` : "";

  return [
    `## ${title}`,
    summary,
    description,
    renderCodeSamples(operation, 3),
    renderRequestBody(operation),
    "### Responses",
    renderResponses(operation),
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function main() {
  // parse + dereference so $ref schemas are expanded
  const api = await SwaggerParser.dereference(SPEC_PATH);
  const baseUrl = getBaseUrl(api);
  let index = 4;
  await fs.ensureDir(OUT_DIR);

  const indexFrontMatter = [
    "---",
    `title: API Reference`,
    `slug: /reference`,
    "---",
    "",
  ].join("\n");

  const indexLines = [`${indexFrontMatter}`, "# API Reference", ""];

  for (const [apiPath, methods] of Object.entries(api.paths || {})) {
    const filename = `${pathToFilename(apiPath)}.mdx`;
    const outPath = path.join(OUT_DIR, filename);

    const frontMatter = [
      "---",
      `sidebar_position: ${index}`,
      "---",
      "<!-- This file is auto-generated. Edits here will be overwritten. -->",
      "",
      "import Tabs from '@theme/Tabs';",
      "import TabItem from '@theme/TabItem';",
      "",
    ].join("\n");

    const sections = [
      frontMatter,
      `# \`${apiPath}\``,
      "",
      baseUrl ? `**Base URL:** \`${baseUrl}\`` : "",
      "",
    ];

    for (const [method, operation] of Object.entries(methods)) {
      sections.push(renderOperation(method, operation));
      sections.push("");
    }

    await fs.writeFile(outPath, sections.join("\n"));
    index++;
    indexLines.push(`- [\`${apiPath}\`](./api/${filename.split(".")[0]})`);
  }

  await fs.writeFile(
    path.join(process.cwd(), "../help", "docs", "api", "index.md"),
    indexLines.join("\n")
  );

  console.log(`Wrote docs to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
