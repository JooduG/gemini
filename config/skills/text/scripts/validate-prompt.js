/**
 * 🧪 validate-prompt.js
 * Deterministic prompt structure validator for the ai-text-generation pipeline.
 */
import fs from "fs";
import path from "path";

const validatePromptStructure = (content) => {
  const mandatoryTags = ["<INSTRUCTION>", "<CONTEXT>", "<STATE>"];
  const missingTags = [];

  mandatoryTags.forEach(tag => {
    if (!content.includes(tag)) {
      missingTags.push(tag);
    }
  });

  if (missingTags.length > 0) {
    console.error(`❌ Validation Failure: Missing mandatory structural XML anchors: ${missingTags.join(", ")}`);
    return false;
  }

  // Check for prohibited user-agent actions (third-person limited violations)
  const violationPatterns = [
    /i decided to/i,
    /as a user/i,
    /you control/i
  ];

  for (const pattern of violationPatterns) {
    if (pattern.test(content)) {
      console.error("❌ Validation Failure: Found phrasing that violates third-person limited boundaries.");
      return false;
    }
  }

  console.log("=== Prompt validation successful. Dense formatting bounds confirmed. ===");
  return true;
};

// Auto-run if executed directly via terminal command gates
const args = process.argv.slice(2);
if (args[0]) {
  try {
    const fileContent = fs.readFileSync(path.resolve(args[0]), "utf-8");
    const success = validatePromptStructure(fileContent);
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(`❌ Unable to read target prompt file: ${error.message}`);
    process.exit(1);
  }
}

export { validatePromptStructure };
