const common = {
  requireModule: ['ts-node/register', 'tsconfig-paths/register'],
  require: ['features/support/**/*.ts', 'step-definitions/**/*.ts'],
  format: [
    'progress-bar',
    'html:test-results/cucumber-report.html',
    'json:test-results/cucumber-report.json',
  ],
  formatOptions: { snippetInterface: 'async-await' },
  parallel: 1,
}

module.exports = {
  default: {
    ...common,
    paths: ['features/**/*.feature'],
    tags: 'not @wip and not @skip',
  },
  smoke: {
    ...common,
    paths: ['features/**/*.feature'],
    tags: '@smoke',
  },
  auth: {
    ...common,
    paths: ['features/auth/**/*.feature'],
  },
  tools: {
    ...common,
    paths: ['features/tools/**/*.feature'],
  },
}
