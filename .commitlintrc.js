// This file is automatically added by @npmcli/template-oss. Do not edit.

module.exports = {
  extends: ['@commitlint/config-conventional'],
  // If you change rules be sure to also update release-please.yml
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'chore', 'deps']],
    'header-max-length': [2, 'always', 80],
    'subject-case': [0, 'always', ['lower-case', 'sentence-case', 'start-case']],
  },
}
