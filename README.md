# 🌟 Shuri CLI 🌟

Vue.js component generator for design systems. Scaffolds complete component structures with Vue 2/3 templates, styles, and tests.

[![npm version](https://badge.fury.io/js/shuri-cli.svg)](https://badge.fury.io/js/shuri-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎉 Features

- 🚀 **Fast Component Generation**: Instant Vue component scaffolding with complete structure
- 🎯 **Vue 2/3 Support**: Auto-detects version from package.json or force specific syntax  
- 📁 **Complete Structure**: Creates component, index, style, and test files with proper organization
- ⚡ **Dual Interface**: CLI commands and programmatic JavaScript API for automation
- 🛡️ **Safe Operations**: Dry-run preview, force overwrite, and existence checking
- 🔧 **Highly Customizable**: Custom directories, naming conventions, file extensions, and templates
- 🔍 **Clean Output**: Professional CLI interface with hierarchical progress indicators

> **Current Scope**: Vue component generation with complete structure. Future versions will support services, stores, pages, and more scaffold types.


## 💻 Installation

### 🌐 Global (recommended)
```bash
# npm
npm install -g shuri-cli

# yarn
yarn global add shuri-cli
```

### 🏡 Local project
```bash
# npm
npm install --save-dev shuri-cli

# yarn  
yarn add --dev shuri-cli
```

## 🚴 Quick Start

```bash
# Create a basic Vue component
shuri-cli new MyButton

# Create component with SCSS styles (style included by default)
shuri-cli new MyButton --style-ext scss

# Create component with all options
shuri-cli new MyButton --style-ext scss --out ./src/ui --verbose
```

### 📁 **Output Structure**
Creates a complete component structure with all necessary files:

```
src/components/MyButton/
├── index.js              # Export file for easy imports
├── MyButton.vue          # Vue component file
├── MyButton.scss         # Stylesheet (css/scss/sass/less/styl)
└── MyButton.unit.js      # Unit test file (.unit.js/.spec.js)
```

## ⚡ CLI Usage

### 👉 Basic Command
```bash
shuri-cli new <name> [options]
```

> **Note**: Currently only supports **component** generation. Future versions may include other scaffold types. 


### 💬 Options

| Option | Description | Default | Details |
|--------|-------------|---------|---------|
| `--vue2` | Use Vue 2 template | Vue 3 | Forces Vue 2 syntax (options API) |
| `--vue3` | Use Vue 3 template | ✓ | Forces Vue 3 syntax (composition API) |
| `--style-ext <ext>` | Style extension | `scss` | `css`, `scss`, `sass`, `less`, `styl` |
| `--test-ext <ext>` | Test extension | `.unit.js` | `.unit.js`, `.spec.js`, `.ts` |
| `--kebab` | Use kebab-case naming | PascalCase | Changes file/folder naming convention |
| `--no-style` | Skip style file | includes style | Won't create style file |
| `--no-test` | Skip test file | includes test | Won't create test file |
| `-o, --out <path>` | Output directory | `src/components` | Custom output path (relative or absolute) |
| `-f, --force` | Overwrite existing | `false` | Overwrites existing files without prompt |
| `--dry-run` | Preview without creating | `false` | Shows what would be created |
| `-v, --verbose` | Detailed output | `false` | Shows detailed creation process |

### 🏷️ **Component Names**
Shuri CLI is flexible with **component** naming and automatically converts between formats:

| Input Format | Example | Output Directory | Output Files |
|-------------|---------|------------------|--------------|
| **PascalCase** | `UserButton` | `UserButton/` | `UserButton.vue` |
| **camelCase** | `userButton` | `UserButton/` | `UserButton.vue` |
| **kebab-case** | `user-button` | `UserButton/` | `UserButton.vue` |
| **snake_case** | `user_button` | `UserButton/` | `UserButton.vue` |
| **space separated** | `"user button"` | `UserButton/` | `UserButton.vue` |

> Use `--kebab` flag to output kebab-case files: `user-button/user-button.vue`


#### Automatic Detection
- **Vue Version**: Auto-detects from `package.json` dependencies
- **Project Structure**: Adapts to your existing folder structure  
- **Smart Defaults**: Uses sensible defaults based on your project

## 💡 Examples

### Component Naming Flexibility
```bash
# All these create the same component structure
shuri-cli new UserCard        # PascalCase
shuri-cli new userCard        # camelCase  
shuri-cli new user-card       # kebab-case
shuri-cli new user_button     # snake_case
shuri-cli new "user card"     # space separated
```

### 💁‍♀️ Basic Component
```bash
shuri-cli new UserCard
```
➡️ **Creates**:
```
src/components/UserCard/

├── index.js
├── UserCard.vue
├── UserCard.scss
└── UserCard.unit.js


```

### 👩‍🎨 Component with Styles
```bash
# Supports multiple preprocessors

shuri-cli new UserCard --style-ext styl
```
➡️ **Creates**:
```
src/components/UserCard/
├── index.js
├── UserCard.vue
├── UserCard.styl
└── UserCard.unit.js
```

### 👩‍💻 Custom Output Directories
```bash
# Relative paths
shuri-cli new UserCard --out components/ui
shuri-cli new UserCard --out src/shared/components

# Absolute paths  
shuri-cli new UserCard --out /path/to/components

# Nested structures
shuri-cli new UserCard --out src/features/user/components
```

### 🧙‍♀️ Kebab-case Output & Naming
```bash
shuri-cli new UserCard --kebab --no-style
```
➡️ **Creates**:
```
src/components/user-card/
├── index.js
├── user-card.vue
└── user-card.unit.js
```

### ↪ Vue Version Specific
```bash
# Force Vue 2 syntax (Options API)
shuri-cli new UserCard --vue2 --style-ext scss

# Force Vue 3 syntax (Composition API)  
shuri-cli new UserCard --vue3 --style-ext scss
```

### 🧩 Advanced Examples
```bash
# Preview without creating files
shuri-cli new "Navigation Menu" --style-ext scss --dry-run --verbose

# Component without test file
shuri-cli new UserCard --style-ext scss --no-test

# Component without style file
shuri-cli new UserCard --no-style

# Complex example with all options
shuri-cli new "Shopping Cart Item" \
  --style-ext scss \
  --test-ext .spec.js \
  --kebab \
  --out src/features/shopping/components \
  --vue3 \
  --verbose \
  --force
```

## 🔧 Programmatic Usage

```javascript
const shuri = require('shuri-cli');

// Create component programmatically
const result = await shuri.run(['new', 'MyButton'], {
  out: './src/components',
  styleExt: 'scss',
  testExt: '.spec.js',
  force: true
});

console.log(result);
// { created: true, path: './src/components/MyButton' }
```

### 🎯 Programmatic Options

```javascript
await shuri.run(['new', 'ComponentName'], {
  out: './custom/path',        // Output directory
  styleExt: 'scss',           // Style extension (default: 'scss')
  testExt: '.spec.js',        // Test extension (default: '.unit.js')
  noStyle: false,             // Skip style file
  noTest: false,              // Skip test file
  force: true,                // Overwrite existing
  dryRun: false,              // Preview mode
  kebab: false,               // Use kebab-case
  vue2: false,                // Use Vue 2 template
  vue3: true                  // Use Vue 3 template
});
```

## 🚧 Templates

### 🔥 Vue 3 (Default)
```vue
<template>
  <div class="component-name">
    <!-- Component content goes here -->
  </div>
</template>

<script setup>
// props: defineProps({})
</script>

<style scoped>
/* styles */
</style>
```

### 🎈 Vue 2
```vue
<template>
  <div class="component-name">
    <!-- Component content goes here -->
  </div>
</template>

<script>
export default {
  name: 'ComponentName',
  props: {}
};
</script>

<style scoped>
/* styles */
</style>
```

## ⚡ Auto-Detection

- **Vue Version**: Automatically detects from `package.json`
- **Smart Naming**: Converts between PascalCase and kebab-case
- **File Structure**: Creates organized component directories

## 🏠 Development

```bash
# Clone repository
git clone https://github.com/amendx/shuri-cli.git
cd shuri-cli

# Install dependencies
npm install

# Link for local development
npm link

# Run tests
npm test
```

## 🔸 License

MIT © [amendx](https://github.com/amendx)

---

**Made with ❤️ for Vue.js developers**