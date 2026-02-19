import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import standaloneCode from 'ajv/dist/standalone/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Paths
const schemasDir = path.resolve(__dirname, '../src/schemas');
const outDir = path.resolve(__dirname, '../src/lib/validators');

// Ensure output directory exists
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

// Get all schemas
const schemaFiles = fs.readdirSync(schemasDir).filter(f => f.endsWith('.json'));

if (schemaFiles.length === 0) {
    console.log('No schemas found to compile.');
    process.exit(0);
}

// Initialize Ajv with secure settings (code generation)
const ajv = new Ajv({
    code: {
        source: true,
        esm: true,
        lines: true
    },
    allErrors: true,
    useDefaults: true
});

addFormats(ajv);

for (const file of schemaFiles) {
    try {
        const schemaPath = path.join(schemasDir, file);
        const outFile = path.join(outDir, file.replace('-schema.json', '-validator.js').replace('.json', '-validator.js'));

        // Load Schema
        const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
        const schema = JSON.parse(schemaContent);

        // Compile
        const validate = ajv.compile(schema);
        let moduleCode = standaloneCode(ajv, validate);

        // Patch: Replace CommonJS require with ESM imports for Vite compatibility
        moduleCode = moduleCode.replace(
            /const (\w+) = require\("ajv-formats\/dist\/formats"\).fullFormats.date;/g,
            'import { fullFormats } from "ajv-formats/dist/formats.js"; const $1 = fullFormats.date;'
        );

        moduleCode = moduleCode.replace(
            /const (\w+) = require\("ajv\/dist\/runtime\/ucs2length"\).default;/g,
            'import ucs2length from "ajv/dist/runtime/ucs2length.js"; const $1 = ucs2length;'
        );

        moduleCode = moduleCode.replace(
            /const (\w+) = require\("([^"]+)"\).default;/g,
            'import $1_pkg from "$2.js"; const $1 = $1_pkg;'
        );

        // Write to file
        fs.writeFileSync(outFile, moduleCode);
        console.log(`✅ ${file} compiled to ${outFile}`);
    } catch (e) {
        console.error(`❌ Failed to compile ${file}:`, e.message);
    }
}
