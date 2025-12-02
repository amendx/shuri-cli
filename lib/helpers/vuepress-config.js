/**
 * VuePress Config Manager
 * 
 * Manages VuePress config.js file by adding sidebar entries
 * for component documentation in a simplified way.
 * 
 * @module vuepress-config
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
 * Adds a new page to VuePress sidebar config
 * Simplified approach: works with common sidebar structures
 * 
 * @param {string} configPath - Path to the config.js file
 * @param {string} newChildPath - Path to add (e.g., 'components/my-component.md')
 * @param {boolean} shouldBackup - Whether to create backup
 * @returns {Promise<boolean>} Success status
 */
async function addToVuepressConfig(configPath, newChildPath, shouldBackup = false) {
  try {
    await fs.access(configPath);
  } catch (e) {
    throw new Error(`Arquivo de configuração VuePress não encontrado em ${configPath}`);
  }

  let content = await fs.readFile(configPath, "utf8");
  const original = content;

  // Check if already exists
  if (content.includes(`'${newChildPath}'`) || content.includes(`"${newChildPath}"`)) {
    return true; // Already exists
  }

  const lines = content.split('\n');
  let inserted = false;

  // Strategy 1: Look for Components section in sidebar (handles both structures)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for children array in Components section
    if (line.includes('children:') && !inserted) {
      
      // Check if this is within a Components section (look back for title)
      let isComponentsSection = false;
      for (let back = Math.max(0, i - 5); back < i; back++) {
        if (lines[back].includes('title:') && 
            (lines[back].includes('Components') || lines[back].includes('Componentes'))) {
          isComponentsSection = true;
          break;
        }
      }
      
      if (isComponentsSection) {
        // Find where to insert in the children array
        let j = i + 1;
        while (j < lines.length) {
          const currentLine = lines[j];
          
          // Look for closing bracket of children array
          if (currentLine.includes(']') && !currentLine.includes('[')) {
            // Insert before the closing bracket
            const indent = currentLine.match(/^(\s*)/)?.[1] || '          ';
            const newEntry = newChildPath.startsWith('/') ? `'${newChildPath}',` : `'${newChildPath}',`;
            lines.splice(j, 0, `${indent}${newEntry}`);
            inserted = true;
            break;
          }
          j++;
        }
      }
      
      if (inserted) break;
    }
  }

  // Strategy 2: Look for sidebar array and add Components section
  if (!inserted) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('sidebar:') && line.includes('[')) {
        // Look for existing Components section first
        let foundComponents = false;
        for (let k = i + 1; k < lines.length; k++) {
          if (lines[k].includes('title:') && lines[k].includes('Components')) {
            foundComponents = true;
            break;
          }
          if (lines[k].includes(']') && !lines[k].includes('[')) {
            break; // End of sidebar array
          }
        }
        
        if (!foundComponents) {
          let j = i;
          // Find the end of the sidebar array
          let bracketCount = 0;
          let foundStart = false;
          
          while (j < lines.length) {
            if (lines[j].includes('[')) {
              bracketCount += (lines[j].match(/\[/g) || []).length;
              foundStart = true;
            }
            if (lines[j].includes(']')) {
              bracketCount -= (lines[j].match(/\]/g) || []).length;
            }
            
            if (foundStart && bracketCount === 0) {
              // Insert Components section before closing bracket
              const indent = lines[j].match(/^(\s*)/)?.[1] || '    ';
              const componentSection = [
                `${indent}{`,
                `${indent}  title: 'Components',`,
                `${indent}  children: ['${newChildPath}']`,
                `${indent}},`
              ];
              lines.splice(j, 0, ...componentSection);
              inserted = true;
              break;
            }
            j++;
          }
        }
        break;
      }
    }
  }

  // Strategy 3: Add basic sidebar if none exists
  if (!inserted) {
    // Check if themeConfig already exists
    const hasThemeConfig = content.includes('themeConfig');
    
    if (!hasThemeConfig) {
      // Look for module.exports or export default
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if ((line.includes('module.exports') && line.includes('{')) ||
            (line.includes('export default') && line.includes('{'))) {
          
          // Find the closing brace
          let j = i + 1;
          let braceCount = 1;
          
          while (j < lines.length && braceCount > 0) {
            if (lines[j].includes('{')) braceCount++;
            if (lines[j].includes('}')) braceCount--;
            j++;
          }
          
          if (braceCount === 0) {
            // Insert themeConfig before closing brace
            const indent = '  ';
            const themeConfigSection = [
              `${indent}themeConfig: {`,
              `${indent}  sidebar: [`,
              `${indent}    {`,
              `${indent}      title: 'Components',`,
              `${indent}      children: ['${newChildPath}']`,
              `${indent}    }`,
              `${indent}  ]`,
              `${indent}},`
            ];
            lines.splice(j - 1, 0, ...themeConfigSection);
            inserted = true;
            break;
          }
        }
      }
    }
  }

  if (!inserted) {
    throw new Error("Não foi possível adicionar entrada ao sidebar. Estrutura de configuração não reconhecida.");
  }

  const newContent = lines.join('\n');
  
  if (newContent !== original) {
    if (shouldBackup) {
      await createBackup(configPath);
    }
    await fs.writeFile(configPath, newContent, "utf8");
  }

  return true;
}

module.exports = {
  addToVuepressConfig
};