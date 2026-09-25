import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: [".next/**", ".npm-cache/**", "db/migrations/**", "scripts/*.cjs"] },
  ...nextVitals,
  ...nextTypescript,
];

export default eslintConfig;
