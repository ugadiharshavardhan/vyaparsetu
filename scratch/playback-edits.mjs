import fs from "node:fs";
import path from "node:path";

const projectRoot = "c:\\Users\\nanda\\Downloads\\vyaparsetu";

// Chronological step numbers found in logs
const steps = [165, 170, 176, 196, 205, 230, 236, 240, 248, 260, 407, 502, 508, 693];

function applyEdits() {
  // Let's first restore the files to HEAD (clean state) to ensure we start from the baseline
  console.log("Ensuring files are at clean HEAD state...");
  
  // We'll read the baseline files as they are currently (which are clean because we just ran git restore)
  // Let's verify: yes, git status showed they are clean.
  
  // We will cache the files in memory as strings during playback
  const fileContents = {
    "supplier.products.index.tsx": fs.readFileSync(path.join(projectRoot, "src/routes/_authenticated/supplier.products.index.tsx"), "utf8"),
    "DataTable.tsx": fs.readFileSync(path.join(projectRoot, "src/components/supplier/DataTable.tsx"), "utf8"),
    "Pill.tsx": fs.readFileSync(path.join(projectRoot, "src/components/supplier/Pill.tsx"), "utf8")
  };

  for (const step of steps) {
    const argsPath = `scratch/step-${step}-tool-args.json`;
    if (!fs.existsSync(argsPath)) {
      console.log(`Warning: ${argsPath} does not exist.`);
      continue;
    }

    const args = JSON.parse(fs.readFileSync(argsPath, "utf8"));
    const filename = path.basename(args.TargetFile);
    
    console.log(`\n=== Playback Step ${step} for ${filename} ===`);
    let content = fileContents[filename];
    
    if (args.TargetContent !== undefined && args.ReplacementContent !== undefined) {
      // Single replacement
      const target = args.TargetContent;
      const replacement = args.ReplacementContent;
      
      if (!content.includes(target)) {
        console.error(`ERROR: TargetContent not found in ${filename} at Step ${step}!`);
        // Let's print a small segment to check what it looked like
        console.log("Target Content starts with:", JSON.stringify(target.substring(0, 100)));
        continue;
      }
      
      content = content.replace(target, replacement);
      console.log("Applied single replacement.");
    } else if (args.ReplacementChunks) {
      // Multi replacement
      console.log(`Applying ${args.ReplacementChunks.length} chunks...`);
      for (let i = 0; i < args.ReplacementChunks.length; i++) {
        const chunk = args.ReplacementChunks[i];
        const target = chunk.TargetContent;
        const replacement = chunk.ReplacementContent;
        
        if (!content.includes(target)) {
          console.error(`ERROR: Chunk ${i} TargetContent not found in ${filename} at Step ${step}!`);
          continue;
        }
        
        content = content.replace(target, replacement);
        console.log(`  Applied chunk ${i}.`);
      }
    } else {
      console.log("No known replacement format found.");
    }
    
    fileContents[filename] = content;
  }

  // Write files back to project
  console.log("\nWriting recovered contents back to files...");
  fs.writeFileSync(path.join(projectRoot, "src/routes/_authenticated/supplier.products.index.tsx"), fileContents["supplier.products.index.tsx"]);
  console.log("Wrote src/routes/_authenticated/supplier.products.index.tsx");
  
  fs.writeFileSync(path.join(projectRoot, "src/components/supplier/DataTable.tsx"), fileContents["DataTable.tsx"]);
  console.log("Wrote src/components/supplier/DataTable.tsx");
  
  fs.writeFileSync(path.join(projectRoot, "src/components/supplier/Pill.tsx"), fileContents["Pill.tsx"]);
  console.log("Wrote src/components/supplier/Pill.tsx");
}

applyEdits();
