import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // new feature
        "fix", // bug fix
        "perf", // performance improvement
        "refactor", // refactoring
        "docs", // documentation
        "test", // tests
        "chore", // config, build
        "ci", // CI/CD
        "revert", // revert commit
      ],
    ],
    "subject-case": [0],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 72],
    "body-leading-blank": [1, "always"],
    "footer-leading-blank": [1, "always"],
  },
};

export default config;
