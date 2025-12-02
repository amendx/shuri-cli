/**
 * Generates a Vue 2 template for a component.
 *
 * @param {string} componentName - The name of the component.
 * @param {string} vueVersion - The Vue version (2 or 3).
 * @returns {string} - The component template.
 */

const { kebabCase } = require("../string-utils.js");

function vue2Template(componentName) {
  return `<template>
  <div class="${kebabCase(componentName)}">
  </div>
</template>

<script>
export default {
  name: '${componentName}',
  props: {}
};
</script>`;
}

function vue3Template(componentName) {
  return `<template>
  <div class="${kebabCase(componentName)}">
  </div>
</template>

<script setup>
defineOptions({
  name: "${componentName}"
})
props: defineProps({})
</script>
`;
}

function getVueTemplate(componentName, vueVersion) {
  const generators = {
    2: vue2Template,
    3: vue3Template,
  };

  return (generators[vueVersion] ?? vue2Template)(componentName);
}

module.exports = {
  getVueTemplate
};
