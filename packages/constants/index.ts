export const ATOMIC_TAG = "__atomic_generated";
export const ATOMIC_REGEX = new RegExp(
  `/\\*\\s*${ATOMIC_TAG}:([^*]+)\\s*\\*/`,
  "g"
);

export const OUTPUT_DIR = "./.atomic-variants";
export const OUTPUT_FILE_DIR = `${OUTPUT_DIR}/.atomic`;
