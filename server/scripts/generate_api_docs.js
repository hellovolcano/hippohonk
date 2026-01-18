const SwaggerParser = require("@apidevtools/swagger-parser");
const fs = require("fs-extra");
const path = require("path");

const SPEC_PATH = "openapi.yaml";
const OUT_DIR = path.join(process.cwd(), "../help/docs/api");

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

function renderJsonSchemaBlock(title, schemaObj, level=1) {
  if (!schemaObj) return "";

  const { isArray, schema } = schemaObj;
  const heading = `${"#".repeat(level)} ${title}`
  return [
    heading,
    isArray ? "_Returns an array_\n" : "",
    renderPropertiesTable(schema),
  ].join("\n");
}

function pickJsonContent(obj) {
  // prefer application/json, fall back to anything json-ish if you ever add it
  if (!obj?.content) return null;
  return (
    obj.content["application/json"] ||
    Object.entries(obj.content).find(([k]) => k.includes("json"))?.[1] ||
    null
  );
}

function renderRequestBody(operation) {
  const content = pickJsonContent(operation.requestBody);
  if (!content?.schema) return "";
  const schemaObj = normalizeSchema(content.schema);
  return renderJsonSchemaBlock("Request body fields", schemaObj);
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
    const filename = `${pathToFilename(apiPath)}.md`;
    const outPath = path.join(OUT_DIR, filename);

    const frontMatter = [
        "---",
        `sidebar_position: ${index}`,
        "---",
        "<!-- This file is auto-generated. Edits here will be overwritten. -->",
        "",
    ].join("\n");

    const sections = [
        frontMatter,
        `# \`${apiPath}\``,
        "",
    ];
    for (const [method, operation] of Object.entries(methods)) {
      sections.push(renderOperation(method, operation));
      sections.push("");
    }

    await fs.writeFile(outPath, sections.join("\n"));
    index++;
    indexLines.push(`- [\`${apiPath}\`](./api/${filename.split('.')[0]})`);
  }

  await fs.writeFile(path.join(process.cwd(), "../help", "docs","api", "index.md"), indexLines.join("\n"));
  console.log(`Wrote docs to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
