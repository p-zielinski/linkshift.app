import { Box } from "@mui/material";
import { resolveRef } from "@shared/mappers/refs";
import camelToFlat from "@shared/utils/camelToFlat";
import {
  camelCase,
  intersection,
  isArray,
  isBoolean,
  isNil,
  isNumber,
  isString,
  merge,
  omit,
  omitBy,
  toString,
  uniq,
} from "lodash";

export type Mode = "READ_ONLY" | "WRITE_ONLY" | undefined;

class SchemaToTree {
  #openApiFile: any;

  constructor(openApiFile: any) {
    this.#openApiFile = openApiFile;
  }

  getIsNullable = (data: any): boolean => {
    return !!(data.nullable || data.type?.includes?.("null") || false);
  };

  mapElementAllOf = ({
    name,
    data,
    mode,
    required,
    isArray,
    useSchemaTitleOrIndex,
    key,
    noColor,
    skipRootTypeIfObject,
  }: {
    name: string;
    data: any;
    mode: Mode;
    required?: boolean;
    isArray?: {
      minItems?: number;
      maxItems?: number;
      uniqueItems?: boolean;
      isNullable?: boolean;
    };
    useSchemaTitleOrIndex?: number;
    key: string;
    noColor?: boolean;
    skipRootTypeIfObject?: boolean;
  }) => {
    const requiredProperties = data.required || [];
    let types = intersection(this.getTypes(data), ["object", "null"]);
    if (types.length === 0) {
      types = ["object"];
    }
    const allAdditionalProperties: any[] = [];
    const allProperties: Map<string, any[]> = new Map();
    data.allOf.forEach((item: any) => {
      let object;
      if (typeof item?.$ref === "string") {
        object = resolveRef(item?.$ref, this.#openApiFile);
      } else {
        object = item;
      }
      if (this.getIsNullable(object) && !types.includes("null")) {
        types.push("null");
      }
      if (object.required) {
        requiredProperties.push(...object.required);
      }
      if (object.properties) {
        Object.entries(object.properties).forEach(([key, value]) => {
          if (allProperties.has(key)) {
            allProperties.get(key)?.push(value);
          } else {
            allProperties.set(key, [value]);
          }
        });
      }
      if (object.additionalProperties) {
        allAdditionalProperties.push(object.additionalProperties);
      }
    });

    const preparedProperties: Record<string, any> = {};
    allProperties.forEach((value, key) => {
      if (value.length < 1) {
        return;
      }
      if (value.length === 1) {
        preparedProperties[key] = value[0];
        return;
      }
      const uniqProperties = uniq(value);
      if (uniqProperties.length === 1) {
        preparedProperties[key] = uniqProperties[0];
      } else {
        preparedProperties[key] = {
          oneOf: uniqProperties,
        };
      }
    });
    const preparedAdditionalProperties = allAdditionalProperties.length
      ? allAdditionalProperties.length === 1
        ? allAdditionalProperties[0]
        : { oneOf: allAdditionalProperties }
      : undefined;

    return this.objectToTree({
      name,
      data: omitBy(
        merge(omit(data, ["allOf", "type", "required"]), {
          type: types,
          properties: preparedProperties,
          additionalProperties: preparedAdditionalProperties,
          required: requiredProperties,
        }),
        isNil,
      ),
      mode,
      required,
      isArray,
      useSchemaTitleOrIndex,
      key,
      noColor,
      skipRootTypeIfObject,
    });
  };

  getTypes = (data: any) => {
    const _types = uniq(
      Array.isArray(data?.type)
        ? data.type.map((type: any) => toString(type))
        : [data?.type || "unknown"],
    );
    if (data?.nullable) {
      _types.push("null");
    }
    return uniq(_types);
  };

  mapElement = ({
    name,
    data,
    mode,
    required,
    isArray,
    useSchemaTitleOrIndex,
    key = "main",
    noColor,
    skipRootTypeIfObject,
  }: {
    name: string;
    data: any;
    mode: Mode;
    required?: boolean;
    isArray?: {
      minItems?: number;
      maxItems?: number;
      uniqueItems?: boolean;
      isNullable?: boolean;
    };
    useSchemaTitleOrIndex?: number;
    key?: string;
    noColor?: boolean;
    skipRootTypeIfObject?: boolean;
  }): any => {
    if (!data) {
      return undefined;
    }

    if (data.allOf?.length > 0) {
      if (data.allOf.length === 1) {
        return this.mapElement({
          name,
          data: merge(omit(data, ["allOf"]), data.allOf[0], {
            type: data.type ? data.type : ["object"],
          }),
          mode,
          isArray,
          useSchemaTitleOrIndex,
          key,
          required,
          noColor,
          skipRootTypeIfObject,
        });
      }
      return this.mapElementAllOf({
        name,
        data,
        mode,
        isArray,
        useSchemaTitleOrIndex,
        key,
        required,
        noColor,
        skipRootTypeIfObject,
      });
    }
    if (data.anyOf?.length > 0) {
      if (data.anyOf.length === 1) {
        return this.mapElement({
          name,
          data: merge(omit(data, ["anyOf"]), data.allOf[0]),
          mode,
          isArray,
          useSchemaTitleOrIndex,
          key,
          required,
          noColor,
          skipRootTypeIfObject,
        });
      }
      return this.mapElementAnyOf({
        name,
        data,
        mode,
        isArray,
        useSchemaTitleOrIndex,
        key,
        required,
        noColor,
      });
    }
    if (data.oneOf?.length > 0) {
      if (data.oneOf.length === 1) {
        return this.mapElement({
          name,
          data: merge(omit(data, ["oneOf"]), data.allOf[0]),
          mode,
          isArray,
          useSchemaTitleOrIndex,
          key,
          required,
          noColor,
          skipRootTypeIfObject,
        });
      }
      return this.mapElementOneOf({
        name,
        data,
        mode,
        isArray,
        useSchemaTitleOrIndex,
        key,
        required,
        noColor,
      });
    }

    const _types = this.getTypes(data);
    const models = [
      intersection(_types, ["object"]),
      intersection(_types, ["array"]),
      intersection(_types, ["string"]),
      intersection(_types, ["number", "integer"]),
      intersection(_types, ["boolean"]),
    ].filter((e) => e.length > 0);

    if (models.length > 1) {
      return this.mapElementOneOf({
        name,
        data: {
          oneOf: models.map((types) => {
            return { ...data, type: types, nullable: undefined };
          }),
        },
        mode,
        isArray,
        useSchemaTitleOrIndex,
        key,
        required,
        noColor,
      });
    }

    if (models[0]?.includes("array")) {
      return this.arrayToTree({
        name,
        data,
        mode,
        required,
        isArray,
        useSchemaTitleOrIndex,
        key,
        noColor,
      });
    }
    if (models[0]?.includes("boolean")) {
      return this.booleanToTreeLeaf({
        name,
        data,
        required,
        isArray,
        useSchemaTitleOrIndex,
        key,
        noColor,
      });
    }
    if (models[0]?.includes("string")) {
      return this.stringToTreeLeaf({
        name,
        data,
        required,
        isArray,
        useSchemaTitleOrIndex,
        key,
        noColor,
      });
    }

    if (models[0]?.find((type) => ["number", "integer"].includes(type as string))) {
      return this.numberToTreeLeaf({
        name,
        data,
        required,
        isArray,
        useSchemaTitleOrIndex,
        key,
        noColor,
      });
    }

    if (!data?.type) {
      data.type = ["object"];
    }
    return this.objectToTree({
      name,
      data,
      mode,
      required,
      isArray,
      useSchemaTitleOrIndex,
      key,
      noColor,
      skipRootTypeIfObject,
    });
  };

  mapElementAnyOf = ({
    name,
    data,
    mode,
    required,
    isArray,
    useSchemaTitleOrIndex,
    key,
    noColor,
  }: {
    key: string;
    name: string;
    data: any;
    mode: Mode;
    required?: boolean;
    isArray?: {
      minItems?: number;
      maxItems?: number;
      uniqueItems?: boolean;
      isNullable?: boolean;
    };
    useSchemaTitleOrIndex?: number;
    noColor?: boolean;
  }) => {
    return {
      key: `${key}-*anyOf*`,
      title: this.getTitle({
        name,
        data,
        required,
        isArray,
        importantProperties: [],
        useSchemaTitleOrIndex,
        noColor,
      }),
      children: data.anyOf.map((data: any, index: number) => {
        return this.mapElement({
          key: `${key}-*anyOf[${index}]*`,
          name,
          data,
          mode,
          useSchemaTitleOrIndex: index + 1,
          noColor,
        });
      }),
    };
  };

  mapElementOneOf = ({
    name,
    data,
    mode,
    required,
    isArray,
    useSchemaTitleOrIndex,
    key,
    noColor,
  }: {
    name: string;
    data: any;
    mode: Mode;
    required?: boolean;
    isArray?: {
      minItems?: number;
      maxItems?: number;
      uniqueItems?: boolean;
      isNullable?: boolean;
    };
    useSchemaTitleOrIndex?: number;
    key: string;
    noColor?: boolean;
  }) => {
    return {
      key: `${key}-*oneOf*`,
      title: this.getTitle({
        name,
        data,
        required,
        isArray,
        importantProperties: [],
        useSchemaTitleOrIndex,
        noColor,
      }),
      children: data.oneOf.map((data: any, index: number) => {
        return this.mapElement({
          key: `${key}-*oneOf[${index}]*`,
          name,
          data,
          mode,
          useSchemaTitleOrIndex: index + 1,
          noColor,
        });
      }),
    };
  };

  booleanToTreeLeaf = ({
    name,
    data,
    required,
    isArray,
    useSchemaTitleOrIndex,
    key,
    noColor,
  }: {
    name: string;
    data: any;
    required?: boolean;
    isArray?: {
      minItems?: number;
      maxItems?: number;
      uniqueItems?: boolean;
      isNullable?: boolean;
    };
    useSchemaTitleOrIndex?: number;
    key: string;
    noColor?: boolean;
  }) => {
    return {
      key: `${key}-${name}`,
      title: this.getTitle({
        name,
        data,
        required,
        isArray,
        importantProperties: [],
        useSchemaTitleOrIndex,
        noColor,
      }),
    };
  };

  renderImportantProperties = ({
    data,
    importantProperties,
  }: {
    data: any;
    importantProperties: string[];
  }) => {
    importantProperties.push("default");
    const values = Object.entries(data)
      .map(([key, value]) => {
        if (importantProperties.includes(key)) {
          const isValid = (value: any): boolean =>
            isString(value) || isNumber(value) || isBoolean(value) || isNil(value);
          const _value = isArray(value)
            ? value
                .map((_value) => (isValid(_value) ? toString(_value) : undefined))
                .filter((e) => e)
                .join(", ")
            : isValid(value)
              ? toString(value)
              : undefined;
          if (!_value) {
            return undefined;
          }
          return {
            name: camelCase(key),
            value: isArray(value)
              ? value.map((_value) => toString(_value)).join(", ")
              : toString(value),
          };
        }
        return undefined;
      })
      .filter((e) => e);
    return importantProperties
      .map((property) => values.find((value) => value?.name === property))
      .filter((e) => e)
      .map((element: any) => {
        return `${element.name}: ${element.value}`;
      });
  };

  getTitle = ({
    name,
    data,
    required,
    isArray,
    importantProperties,
    useSchemaTitleOrIndex,
    noColor,
    skipRootTypeIfObject,
  }: {
    name: string;
    data: any;
    required?: boolean;
    isArray?: {
      minItems?: number;
      maxItems?: number;
      uniqueItems?: boolean;
      isNullable?: boolean;
    };
    importantProperties?: string[];
    useSchemaTitleOrIndex?: number;
    noColor?: boolean;
    skipRootTypeIfObject?: boolean;
  }) => {
    const types =
      data.oneOf?.length || data.anyOf?.length
        ? [
            data.oneOf?.length ? "oneOf" : undefined,
            data.anyOf?.length ? "anyOf" : undefined,
            this.getIsNullable(data) ? "null" : undefined,
          ].filter((e) => e)
        : this.getTypes(data);
    const arrayPropertiesInText = isArray
      ? Object.entries(isArray)
          .map(([key, value]) =>
            key === "isNullable" ? undefined : value ? `${camelToFlat(key)}: ${value}` : undefined,
          )
          .filter((e) => e)
          .join(", ")
      : undefined;
    const title = useSchemaTitleOrIndex
      ? data.title && typeof data.title === "string"
        ? data.title
        : `option ${useSchemaTitleOrIndex}.`
      : name;
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          userSelect: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {name ? (
            <Box
              component={"b"}
              sx={(theme) => ({
                color: noColor
                  ? undefined
                  : useSchemaTitleOrIndex && typeof data.title === "string" && data.title
                    ? `${theme.palette.info.darker}`
                    : undefined,
              })}
            >
              {title}
            </Box>
          ) : undefined}
          <Box
            component="span"
            sx={(theme) => ({
              color: noColor
                ? undefined
                : `${data.oneOf?.length || data.anyOf?.length ? theme.palette.info.darker : theme.palette.text.secondary}`,
              fontStyle: "italic",
            })}
          >
            {isArray
              ? `array ${arrayPropertiesInText ? `(${arrayPropertiesInText}) ` : ""}of <`
              : undefined}
            {skipRootTypeIfObject ? undefined : types.join(" | ")}
            {isArray ? ">" : undefined}
            {isArray?.isNullable ? " | null" : undefined}
          </Box>
          {required ? (
            <Box
              component="span"
              sx={(theme) => ({
                color: noColor ? undefined : `${theme.palette.error.darker}`,
              })}
            >
              required
            </Box>
          ) : undefined}
          {data.deprecated ? (
            <Box
              component="span"
              sx={(theme) => ({
                color: noColor ? undefined : `${theme.palette.error.darker}`,
              })}
            >
              deprecated
            </Box>
          ) : undefined}
        </Box>
        {data.description ? <Box>{data.description}</Box> : undefined}
        {importantProperties
          ? this.renderImportantProperties({ data, importantProperties })?.map((element) => (
              <Box
                sx={(theme) => ({
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  color: noColor ? undefined : theme.palette.secondary.darker,
                })}
              >
                {element}
              </Box>
            ))
          : undefined}
      </Box>
    );
  };

  stringToTreeLeaf = ({
    name,
    data,
    required,
    isArray,
    useSchemaTitleOrIndex,
    key,
    noColor,
    importantProperties = ["format", "pattern", "enum", "minLength", "maxLength"],
  }: {
    name: string;
    data: any;
    required?: boolean;
    isArray?: {
      minItems?: number;
      maxItems?: number;
      uniqueItems?: boolean;
      isNullable?: boolean;
    };
    useSchemaTitleOrIndex?: number;
    key: string;
    noColor?: boolean;
    importantProperties?: string[];
  }) => {
    return {
      key: `${key}-${name}`,
      title: this.getTitle({
        name,
        data,
        required,
        isArray,
        importantProperties,
        useSchemaTitleOrIndex,
        noColor,
      }),
    };
  };

  numberToTreeLeaf = ({
    name,
    data,
    required,
    isArray,
    useSchemaTitleOrIndex,
    key,
    noColor,
  }: {
    name: string;
    data: any;
    required?: boolean;
    isArray?: {
      minItems?: number;
      maxItems?: number;
      uniqueItems?: boolean;
      isNullable?: boolean;
    };
    useSchemaTitleOrIndex?: number;
    key: string;
    noColor?: boolean;
  }) => {
    return {
      key: `${key}-${name}`,
      title: this.getTitle({
        name,
        data,
        required,
        isArray,
        importantProperties: [
          "minimum",
          "exclusiveMinimum",
          "maximum",
          "exclusiveMaximum",
          "multipleOf",
        ],
        useSchemaTitleOrIndex,
        noColor,
      }),
    };
  };

  arrayToTree = ({
    name,
    data,
    mode,
    required,
    isArray,
    useSchemaTitleOrIndex,
    key,
    noColor,
  }: {
    name: string;
    data: any;
    mode: Mode;
    required?: boolean;
    isArray?: {
      minItems?: number;
      maxItems?: number;
      uniqueItems?: boolean;
      isNullable?: boolean;
    };
    useSchemaTitleOrIndex?: number;
    key: string;
    noColor?: boolean;
  }) => {
    this.getIsNullable(data);
    if (isArray) {
      return {
        key: `${key}-${name}-*array*`,
        title: this.getTitle({
          name,
          data,
          required,
          isArray,
          useSchemaTitleOrIndex,
          noColor,
        }),
        children: [
          this.mapElement({
            key: `${key}-${name}-*array[0]*`,
            name: "",
            data: data.items,
            mode,
            required,
            isArray: {
              minItems: data.minItems,
              maxItems: data.maxItems,
              uniqueItems: data.uniqueItems,
              isNullable: this.getIsNullable(data),
            },
            noColor,
          }),
        ],
      };
    }
    return this.mapElement({
      key: `${key}-*array*`,
      name,
      data: data.items,
      mode,
      required,
      isArray: {
        minItems: data.minItems,
        maxItems: data.maxItems,
        uniqueItems: data.uniqueItems,
        isNullable: this.getIsNullable(data),
      },
      useSchemaTitleOrIndex,
      noColor,
    });
  };

  objectToTree = ({
    name,
    data,
    mode,
    required,
    isArray,
    useSchemaTitleOrIndex,
    key,
    noColor,
    skipRootTypeIfObject,
  }: {
    name: string;
    data: any;
    mode: Mode;
    required?: boolean;
    isArray?: {
      minItems?: number;
      maxItems?: number;
      uniqueItems?: boolean;
      isNullable?: boolean;
    };
    useSchemaTitleOrIndex?: number;
    key: string;
    noColor?: boolean;
    skipRootTypeIfObject?: boolean;
  }) => {
    const requiredProperties = data.required || [];
    const children = Object.entries(data.properties || {})
      .filter(([_key, data]) => {
        if (mode) {
          if (data instanceof Object && "readOnly" in data && data.readOnly) {
            return mode === "READ_ONLY";
          }
          if (data instanceof Object && "writeOnly" in data && data.writeOnly) {
            return mode === "WRITE_ONLY";
          }
        }
        return true;
      })
      .map(([_key, data]) =>
        this.mapElement({
          key: `${key}-${name}-*object*-${_key}`,
          name: _key,
          data,
          mode,
          required: requiredProperties.includes(_key),
          noColor,
        }),
      );

    if (data.additionalProperties) {
      children.push(
        this.mapElement({
          name: camelToFlat("[unknownKeys]"),
          data: data.additionalProperties,
          mode,
          key: `${key}-${name}-*object*-*additionalProperties*`,
          noColor,
        }),
      );
    }

    return omitBy(
      {
        key: `${key}-${name}`,
        title: this.getTitle({
          name,
          data,
          required,
          isArray,
          importantProperties: ["minProperties", "maxProperties"],
          useSchemaTitleOrIndex,
          noColor,
          skipRootTypeIfObject,
        }),
        children: children.length ? children : undefined,
        $ref: data.$ref,
        name,
      },
      isNil,
    );
  };
}

export default SchemaToTree;
