module.exports = {
  roots: ['<rootDir>/tests'],
  verbose: true,
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  reporters: [
    'default',
    [
      './node_modules/jest-html-reporter',
      {
        pageTitle: 'Unit Test Report',
        outputPath: 'tests/reports/unit-test-report.html',
        includeFailureMsg: true,
      },
    ],
  ],

  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.ts'
  ],
  moduleFileExtensions: ["ts", "js", "json"],
  coverageDirectory: "./coverage",
  coverageReporters: [
    "json",
    "lcov",
    "text"
  ],
  coverageThreshold: {
    "global": {
      "branches": 60,
      "functions": 60,
      "lines": 60,
      "statements": 60
    }
  },
};
