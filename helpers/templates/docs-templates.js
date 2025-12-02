/**
 * Documentation Templates
 *
 * Templates for generating VuePress documentation files
 */

/**
 * Generates markdown documentation template
 */
function docsMdTemplate(componentName, kebabName) {
  let capitalWord = kebabName.charAt(0).toUpperCase() + kebabName.slice(1);
  if (capitalWord.includes("-")) {
    let word = capitalWord;
    if (word.includes("-") || word.includes(",") || word.includes(" ")) {
      word = word.split(/[-, ]+/).join(" ");
    }
    capitalWord = word;
  }
  return `
# ${capitalWord}

\`${componentName}\` é um componente

<doc-example title="Exemplo" file="${kebabName}/${kebabName}-example" />


`;
}

/**
 * Generates Vue example template
 */
function docsVueTemplate(componentName, kebabName) {
  return `<template>
  <div>
    <${componentName} />
  </div>
</template>

<script>

export default {
  name: '${componentName}Example'
};
</script>

<style scoped>
/* estilos do exemplo */
</style>
`;
}

/**
 * Generates API documentation template
 */
function docsApiTemplate(componentName) {
  return `
  module.exports = {
  attributes: {
    data: [
      {
        prop: "",
        description: "",
        type: "",
        defaultValue: "",
        acceptedValues: "",
      },
    ],

    events: {
      columns: [
        { name: "name", label: "Nome do evento", truncate: false },
        { name: "description", label: "Descrição", truncate: false },
        { name: "payload", label: "Payload" },
      ],
      data: [
        {
          name: "",
          description: "",
          payload: "",
        },
      ],
    },
  },
};

  `;
}

module.exports = {
  docsMdTemplate,
  docsVueTemplate,
  docsApiTemplate,
};
