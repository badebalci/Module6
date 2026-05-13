import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  collectCoverageFrom: ["src/**/*.ts", "!src/app.ts"],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 75,
      functions: 75,
      statements: 80
    }
  }
};

export default config;
