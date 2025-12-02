/**
 * Components Index Manager
 * 
 * Manages the src/components/index.js file by adding imports and exports
 * for new components in a simplified and reliable way.
 * 
 * @module components-index
 */

const fs = require("fs").promises;

/**
 * Creates a backup of a file if shouldBackup is true
 */
async function createBackup(filePath) {
  try {
    await fs.access(filePath);
    const bak = `${filePath}.bak`;
    await fs.copyFile(filePath, bak);
    return bak;
  } catch (e) {
    return null;
  }
}

/**
 * Adds import and export for a component to the index file
 * Simplified approach: always adds to the end, checks for duplicates simply
 * 
 * @param {string} indexPath - Path to the index.js file
 * @param {string} importPath - Import path (kebab-case component name)
 * @param {string} importName - Import name (PascalCase component name)
 * @param {boolean} shouldBackup - Whether to create backup
 * @returns {Promise<boolean>} Success status
 */

async function addToComponentsIndex(indexPath, importPath, importName, shouldBackup = false) {
  try {
    await fs.access(indexPath);
  } catch (e) {
    throw new Error(`Arquivo de índice de componentes não encontrado em ${indexPath}`);
  }

  let content = await fs.readFile(indexPath, "utf8");
  const original = content;

  // Check if already imported
  const importLine = `import ${importName} from './${importPath}';`;
  if (content.includes(importLine)) {
    return true;
  }

  // Add import at the end of imports section or at the beginning
  const lines = content.split('\n');
  let importInsertIndex = 0;
  
  // Find the last import line
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ') && lines[i].includes('from')) {
      importInsertIndex = i + 1;
    }
  }

  // Insert the import
  lines.splice(importInsertIndex, 0, importLine);

  // Handle exports - look for existing export patterns
  let hasExport = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Handle export { ... } pattern
    if (line.startsWith('export {') && line.includes('}')) {
      // Single line export
      if (!line.includes(importName)) {
        const exportContent = line.match(/export\s*\{\s*(.*?)\s*\}/)?.[1] || '';
        const components = exportContent.split(',').map(c => c.trim()).filter(Boolean);
        components.push(importName);
        lines[i] = `export { ${components.join(', ')} };`;
      }
      hasExport = true;
      break;
    } else if (line.startsWith('export {')) {
      // Multi-line export - find closing brace
      let j = i + 1;
      let exportLines = [line];
      
      while (j < lines.length && !lines[j].includes('}')) {
        exportLines.push(lines[j]);
        j++;
      }
      
      if (j < lines.length) {
        exportLines.push(lines[j]); // Add closing brace line
        
        // Parse all components from multi-line export
        const fullExport = exportLines.join(' ');
        if (!fullExport.includes(importName)) {
          // Insert before closing brace
          lines.splice(j, 0, `  ${importName},`);
        }
        hasExport = true;
        break;
      }
    }
  }

  // If no export found, add one at the end
  if (!hasExport) {
    lines.push('');
    lines.push(`export { ${importName} };`);
  }

  const newContent = lines.join('\n');
  
  if (newContent !== original) {
    if (shouldBackup) {
      await createBackup(indexPath);
    }
    await fs.writeFile(indexPath, newContent, "utf8");
  }

  return true;
}

module.exports = {
  addToComponentsIndex
};