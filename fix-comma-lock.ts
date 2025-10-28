import fs from "fs";

const removeTrailingCommas = (json: string) => {
  // Remove trailing commas after the last property of objects or elements in arrays
  return (
    json
      // Remove trailing commas in objects (e.g., {"key": "value",})
      .replace(/,(\s*[\]}])/g, "$1")
      // Remove trailing commas in arrays (e.g., [1, 2, 3,])
      .replace(/,(\s*[\]])/g, "$1")
  );
};

const bunLock = "./bun.lock";
const content = fs.readFileSync(bunLock, "utf8");
const validJSON = removeTrailingCommas(content);

fs.writeFileSync(bunLock, validJSON);
