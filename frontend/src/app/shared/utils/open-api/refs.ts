const resolveRef = (ref: any, openApi: any) => {
  if (typeof ref !== "string") {
    return undefined;
  }
  const refPaths = ref.split("/").slice(1);
  let varible = openApi;
  refPaths.forEach((refPath, index) => {
    varible = varible?.[refPath];
  });
  return varible;
};

const resolveDeepRef = (ref: any, prohibitedRefs: string[], openApi: any): any => {
  const refValue = resolveRef(ref, openApi);
  if (refValue) {
    //should always be an object
    return resolveDeepRefHelper(refValue, prohibitedRefs, openApi);
  }
};

const resolveDeepRefHelper = (object: any, prohibitedRefs: string[], openApi: any): any => {
  if (Array.isArray(object)) {
    return object.map((value) => resolveDeepRefHelper(value, prohibitedRefs, openApi));
  }
  if (object instanceof Object) {
    const keys = Object.keys(object);
    if (!keys.includes("$ref")) {
      return Object.fromEntries(
        Object.entries(object).map(([key, entry]) => {
          return [key, resolveDeepRefHelper(entry, prohibitedRefs, openApi)];
        }),
      );
    }
    // @ts-ignore
    if (prohibitedRefs.includes(object["$ref"])) {
      return object;
    }
    return resolveDeepRef(object["$ref"], [...prohibitedRefs, object["$ref"]], openApi);
  }
  return object;
};

export { resolveDeepRef, resolveDeepRefHelper, resolveRef };
