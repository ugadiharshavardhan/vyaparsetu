import fs from "node:fs";
import path from "node:path";

const historyPath = "C:\\Users\\nanda\\AppData\\Roaming\\Code\\User\\History";

function printResources() {
  const dirs = fs.readdirSync(historyPath);
  for (const dir of dirs) {
    const dirPath = path.join(historyPath, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;

    const entriesJsonPath = path.join(dirPath, "entries.json");
    if (!fs.existsSync(entriesJsonPath)) continue;

    try {
      const metadata = JSON.parse(fs.readFileSync(entriesJsonPath, "utf8"));
      const resource = metadata.resource;
      console.log(`Folder: ${dir} | Resource: ${resource}`);
    } catch (e) {
      // ignore
    }
  }
}

printResources();
