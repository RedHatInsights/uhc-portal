module.exports = {
  meta: {
    name: 'eslint-plugin-custom-rules',
    version: '1.0.2',
  },
  rules: {
    'restrict-react-router-imports': {
      meta: {
        type: 'problem',
        docs: {
          description: "Restrict certain imports from 'react-router-dom' to use project wrappers",
        },
        schema: [],
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            const { source, specifiers } = node;

            if (source.value === 'react-router-dom') {
              specifiers.forEach((specifier) => {
                // Check for both direct imports and aliased imports
                if (
                  specifier.type === 'ImportSpecifier' &&
                  ['Link', 'Navigate', 'useNavigate'].includes(specifier.imported.name)
                ) {
                  context.report({
                    node: specifier,
                    message:
                      "Import '{{name}}' from '~/common/routing' instead of 'react-router-dom'.",
                    data: {
                      name: specifier.imported.name,
                    },
                  });
                }
              });
            }
          },
        };
      },
    },
  },
};
