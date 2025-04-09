import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-console': 0,
    'unused-imports/no-unused-imports': 0,
    'antfu/if-newline': 0,
    'ts/switch-exhaustiveness-check': 0,
  },
  ignores: ['pnpm-lock.yaml', 'node_modules', 'assets', '.eslintignore'],
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
})
