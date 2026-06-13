/**
 * 🧪 validate-assets.js
 * Deterministic pipeline validator for tracking image registries and style compliance.
 */
import fs from "fs";
import path from "path";

const forbidWarmTones = (promptText) => {
  const bannedTones = ["warm", "cozy", "sunset", "neon", "vibrant", "amber"];
  const violations = bannedTones.filter(tone => promptText.toLowerCase().includes(tone));
  
  if (violations.length > 0) {
    console.error(`❌ Aesthetic Drift Detected: Prompt uses forbidden warm terms: ${violations.join(", ")}`);
    return false;
  }
  return true;
};

const verifyRegistryPaths = (registryPath) => {
  try {
    const content = fs.readFileSync(path.resolve(registryPath), "utf-8");
    
    if (content.includes("\\")) {
      console.error("❌ Path Error: Found illegal Windows-style backslashes inside asset indexes.");
      return false;
    }
    
    console.log("=== Registry path validation successful. Forward slashes confirmed. ===");
    return true;
  } catch (error) {
    console.error(`❌ Failed to read registry mapping: ${error.message}`);
    return false;
  }
};

// Execution handler for automated gate checks
const args = process.argv.slice(2);
if (args[0] && args[1]) {
  const isPromptValid = forbidWarmTones(args[0]);
  const isRegistryValid = verifyRegistryPaths(args[1]);
  
  process.exit(isPromptValid && isRegistryValid ? 0 : 1);
}

export { forbidWarmTones, verifyRegistryPaths };
