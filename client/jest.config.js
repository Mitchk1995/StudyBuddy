module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/src/fileMock.js",
    "\\.(css|less|sass|scss)$": "<rootDir>/src/fileMock.js",
    "\\.(gif|ttf|eot|svg)$": "<rootDir>/src/fileMock.js"
  }
};