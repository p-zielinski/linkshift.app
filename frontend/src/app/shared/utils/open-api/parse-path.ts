export type ParsedPath = { value: string; type: "parameter" | "string" }[];

const parsePath = (input: string): ParsedPath => {
  if (!input) {
    return [];
  }

  const result: { value: string; type: "parameter" | "string" }[] = [];
  let buffer = "";

  for (let i = 0; i < input.length; i++) {
    if (input[i] === "{") {
      if (buffer) {
        result.push({ value: buffer, type: "string" });
        buffer = "";
      }

      let endIndex = input.indexOf("}", i);
      if (endIndex === -1) {
        input += "}";
        endIndex = input.indexOf("}", i);
      }

      const param = input.slice(i + 1, endIndex);
      result.push({ value: param, type: "parameter" });

      i = endIndex;
    } else {
      buffer += input[i];
    }
  }

  if (buffer) {
    result.push({ value: buffer, type: "string" });
  }

  return result;
};

export default parsePath;
