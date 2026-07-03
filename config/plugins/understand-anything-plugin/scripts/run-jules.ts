import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function run() {
  const workspaceRoot = process.cwd();
  const intermediateDir = path.join(workspaceRoot, '.understand-anything', 'intermediate');
  const batchesFile = path.join(intermediateDir, 'batches.json');

  if (!fs.existsSync(batchesFile)) {
    console.error(`Batches file not found at ${batchesFile}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(batchesFile, 'utf8'));
  const batches = data.batches;
  console.log(`Found ${batches.length} batches. Dispatching Jules agents...`);

  const analyzerDefPath = path.join(
    os.homedir(),
    '.gemini',
    'config',
    'plugins',
    'understand-anything-plugin',
    'agents',
    'file-analyzer.md'
  );

  let analyzerDef = 'Analyze the files and extract structures.';
  if (fs.existsSync(analyzerDefPath)) {
    analyzerDef = fs.readFileSync(analyzerDefPath, 'utf8');
  }

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const fileList = batch.files.map((f: any) => f.path).join('\n');
    
    // We construct a specific prompt for the Jules CLI
    const prompt = `Analyze the following files for the Understand-Anything pipeline.\n\nFiles:\n${fileList}\n\nInstructions:\n${analyzerDef}`;
    
    const promptFile = path.join(intermediateDir, `batch_${batch.batchIndex}_prompt.txt`);
    fs.writeFileSync(promptFile, prompt, 'utf8');

    console.log(`Dispatching batch ${batch.batchIndex}...`);
    
    try {
      // Using jules CLI installed via @google/jules
      const cmd = `npx jules new "Please read the instructions in .understand-anything/intermediate/batch_${batch.batchIndex}_prompt.txt and output the analysis to .understand-anything/intermediate/analysis_${batch.batchIndex}.json"`;
      
      console.log(`Running: ${cmd}`);
      const { stdout, stderr } = await execAsync(cmd);
      console.log(`Batch ${batch.batchIndex} dispatched. Session info: ${stdout.trim()}`);
    } catch (err) {
      console.error(`Error dispatching batch ${batch.batchIndex}:`, err);
    }
  }

  console.log('All batches dispatched to Jules! Monitor the dashboard or use `jules remote list` to see progress.');
}

run().catch(console.error);
