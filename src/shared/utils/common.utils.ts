/**
 * Convert null values in the given value to undefined
 */
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function convertNullToUndefined<InputType, ReturnType>(value: InputType): ReturnType {

  const innerConvert = (innerValue: unknown): unknown => {
    // eslint-disable-next-line no-null/no-null
    if (innerValue === null) {
      return undefined;
    }

    if (innerValue instanceof Array) {
      return innerValue.map(convertNullToUndefined);
    }

    if (typeof innerValue === 'object') {
      return Object
        .keys(innerValue ?? {})
        .reduce(
          (objU: Record<string, unknown>, key: string): unknown => {
            objU[key] = convertNullToUndefined((innerValue ?? {})[key]);

            return objU;
          },
          {},
        );
    }

    return innerValue;
  }

  return innerConvert(value) as ReturnType;
}
