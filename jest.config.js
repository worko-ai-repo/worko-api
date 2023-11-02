// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePaths: ["<rootDir>"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};
