import fs from "node:fs";
import path from "node:path";

const logsDir = "C:\\Users\\nanda\\.gemini\\antigravity-ide\\brain\\78cd280e-89ee-439c-b294-889e2462532f\\.system_generated\\logs";
const content = fs.readFileSync(path.join(logsDir, "transcript_full.jsonl"), "utf8");
const lines = content.split("\n");

console.log("Searching for replacement tool calls (without default_api prefix)...");

const targetFiles = [
  "supplier.products.index.tsx",
  "DataTable.tsx",
  "Pill.tsx"
];

for (let idx = 0; idx < lines.length; idx++) {
  const line = lines[idx];
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    
    if (obj.tool_calls) {
      for (const call of obj.tool_calls) {
        const name = call.name || "";
        if (name.includes("replace_file_content") || name.includes("multi_replace_file_content") || name.includes("write_to_file")) {
          const target = call.args?.TargetFile || "";
          const filename = path.basename(target);
          
          if (targetFiles.includes(filename)) {
            console.log(`\n--- Step ${obj.step_index} | Tool: ${name} | Target: ${filename} ---`);
            
            // Save the tool call args
            fs.writeFileSync(`scratch/step-${obj.step_index}-tool-args.json`, JSON.stringify(call.args, null, 2));
            console.log(`  Saved to scratch/step-${obj.step_index}-tool-args.json`);
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }
}
