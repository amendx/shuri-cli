/**
 * CLI Options Configuration
 * 
 * Defines all command options for the shuri-cli component generator.
 * Centralized configuration for better maintainability and consistency.
 * 
 * @module cli-options
 */

/**
 * Component creation command options
 */
const componentOptions = [
  {
    flag: "-r, --root <root>",
    description: "Nome da pasta do root do componente (default: mesmo que o componente)"
  },
  {
    flag: "--vue2",
    description: "Força template Vue 2.x"
  },
  {
    flag: "--vue3", 
    description: "Força template Vue 3.x (default)"
  },
  {
    flag: "--style-ext <ext>",
    description: "Extensão do estilo (css|scss|sass|less|styl)",
    defaultValue: "scss"
  },
  {
    flag: "--test-ext <ext>",
    description: "Extensão do arquivo de teste (.unit.js|.spec.js|.ts)",
    defaultValue: ".unit.js"
  },
  {
    flag: "--kebab",
    description: "Nomes em kebab-case (default: PascalCase)"
  },
  {
    flag: "--no-test",
    description: "Pula criação do arquivo de teste"
  },
  {
    flag: '--no-style',
    description: 'Pula criação do arquivo de estilo'
  },
  {
    flag: "-o, --out <path>",
    description: "Diretório de destino (default: src/components)"
  },
  {
    flag: "-f, --force",
    description: "Sobrescreve arquivos existentes"
  },
  {
    flag: "--dry-run",
    description: "Simula criação sem gerar arquivos"
  },
  {
    flag: "-v, --verbose",
    description: "Saída detalhada do processo"
  }
];

/**
 * Valid style extensions
 */
const validStyleExtensions = ['css', 'scss', 'sass', 'less', 'styl'];

/**
 * Valid component types
 */
const validComponentTypes = ['component'];

/**
 * Applies options to a command
 * @param {Object} command - Commander.js command object
 * @returns {Object} Command with options applied
 */
function applyOptionsToCommand(command) {
  componentOptions.forEach(option => {
    if (option.defaultValue) {
      command.option(option.flag, option.description, option.defaultValue);
    } else {
      command.option(option.flag, option.description);
    }
  });
  
  return command;
}

/**
 * Gets help text for valid style extensions
 * @returns {string} Help text
 */
function getValidStyleExtensionsText() {
  return validStyleExtensions.join(', ');
}

/**
 * Gets help text for valid component types  
 * @returns {string} Help text
 */
function getValidComponentTypesText() {
  return validComponentTypes.join(', ');
}

/**
 * Validates if style extension is valid
 * @param {string} ext - Style extension
 * @returns {boolean} Is valid
 */
function isValidStyleExtension(ext) {
  return validStyleExtensions.includes(ext);
}

/**
 * Validates if component type is valid
 * @param {string} type - Component type
 * @returns {boolean} Is valid
 */
function isValidComponentType(type) {
  return validComponentTypes.includes(type.toLowerCase());
}

module.exports = {
  componentOptions,
  validStyleExtensions,
  validComponentTypes,
  applyOptionsToCommand,
  getValidStyleExtensionsText,
  getValidComponentTypesText,
  isValidStyleExtension,
  isValidComponentType,
};