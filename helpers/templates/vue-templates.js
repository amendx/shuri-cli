/**
 * Generates a Vue 2 template for a component.
 *
 * @param {string} componentName - The name of the component.
 * @param {string} styleFile - The associated style file.
 * @returns {string} - The component template.
 */

const { kebabCase } = require("../string-utils.js");

function vue2Template(componentName, styleFile) {
  return `<template>
  <div class="${kebabCase(componentName)}">
    <!-- Component content goes here -->
  </div>
</template>

<script>
export default {
  name: '${componentName}',
  props: {}
};
</script>

${styleFile ? `<style src="./${styleFile}" scoped></style>` : `<style scoped>
/* styles */
</style>`}
`;
}

function vue3Template(componentName, styleFile) {
  return `<template>
  <div class="${kebabCase(componentName)}">
    <!-- Component content goes here -->
  </div>
</template>

<script setup>
// props: defineProps({})
</script>

${styleFile ? `<style src="./${styleFile}" scoped></style>` : `<style scoped>
/* styles */
</style>`}
`;
}

module.exports = {
  vue2Template,
  vue3Template
};