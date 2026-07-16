import fs from "node:fs";

const logPath = "C:\\Users\\nanda\\.gemini\\antigravity-ide\\brain\\78cd280e-89ee-439c-b294-889e2462532f\\.system_generated\\logs\\transcript_full.jsonl";
const content = fs.readFileSync(logPath, "utf8");
const lines = content.split("\n");

// Print the last 10 lines to understand the format
console.log("=== Last 10 lines ===");
for (let i = Math.max(0, lines.length - 15); i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    console.log(`Index: ${obj.step_index} | Source: ${obj.source} | Type: ${obj.type} | Status: ${obj.status}`);
    if (obj.tool_calls) {
      console.log("  Tool calls:", obj.tool_calls.map(tc => tc.name));
    }
    // Print keys of obj
    console.log("  Keys:", Object.keys(obj));
    if (obj.content && obj.content.length > 100) {
      console.log("  Content preview:", obj.content.substring(0, 100).replace(/\n/g, " "));
    }
  } catch (e) {
    console.log(`Line ${i} parse error:`, e.message);
  }
}
