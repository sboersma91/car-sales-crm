import fs from "node:fs";

function parseEnv(contents) {
  const result = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;

    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

const dotenv = {
  config({ path = ".env" } = {}) {
    if (!fs.existsSync(path)) {
      return { parsed: {} };
    }

    const parsed = parseEnv(fs.readFileSync(path, "utf8"));

    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }

    return { parsed };
  },
};

export default dotenv;
