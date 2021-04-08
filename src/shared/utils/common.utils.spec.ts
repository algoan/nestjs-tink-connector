/* eslint-disable no-null/no-null,no-magic-numbers */
// tslint:disable: no-null-keyword
import { IsString } from 'class-validator';
import { assertsTypeValidation, convertNullToUndefined } from './common.utils';

describe('convertNullToUndefined', () => {
  it(`Should convert null to undefined on simple values`, () => {
    expect(convertNullToUndefined(null)).toEqual(undefined);
    expect(convertNullToUndefined(undefined)).toEqual(undefined);
    expect(convertNullToUndefined(0)).toEqual(0);
    expect(convertNullToUndefined(1)).toEqual(1);
    expect(convertNullToUndefined(-1)).toEqual(-1);
    expect(convertNullToUndefined(NaN)).toEqual(NaN);
    expect(convertNullToUndefined(Infinity)).toEqual(Infinity);
    expect(convertNullToUndefined('aaaa')).toEqual('aaaa');
    expect(convertNullToUndefined('')).toEqual('');
    expect(convertNullToUndefined({})).toEqual({});
    expect(convertNullToUndefined([])).toEqual([]);
  });

  it(`Should convert null to undefined on object field`, () => {
    // We have a field null
    const testNull: Record<string, unknown> = {
      field: null,
      field1: undefined,
      field2: 0,
      field3: null,
      field4: 'aaa',
    };
    // We convert to undefined
    const testUndefined: Record<string, unknown> = convertNullToUndefined(testNull);
    // The value should be undefined
    expect(testUndefined).toEqual({
      field: undefined,
      field1: undefined,
      field2: 0,
      field3: undefined,
      field4: 'aaa',
    });
  });

  it(`Should convert null to undefined in an array`, () => {
    // We have a null item
    const testNull: null[] = [null];
    // We convert to undefined
    const testUndefined: undefined[] = convertNullToUndefined(testNull);
    // The value should be undefined
    expect(testUndefined).toEqual([undefined]);

    // We have a multiple null item
    const testNull1: (null | number | undefined | string)[] = [null, 0, null, undefined, 'aaaa'];
    // We convert to undefined
    const testUndefined1: (number | undefined | string)[] = convertNullToUndefined(testNull1);
    // The value should be undefined
    expect(testUndefined1).toEqual([undefined, 0, undefined, undefined, 'aaaa']);
  });

  it(`Should convert null to undefined recursively in an object`, () => {
    // We have a field null
    const testNull: Record<string, unknown> = {
      field: null,
      field1: {
        field: null,
        field1: {
          field: 0,
          field1: undefined,
          field2: 'aaaaa',
          field3: null,
        },
      },
    };
    // We convert to undefined
    const testUndefined: Record<string, unknown> = convertNullToUndefined(testNull);
    // The value should be undefined
    expect(testUndefined).toEqual({
      field: undefined,
      field1: {
        field: undefined,
        field1: {
          field: 0,
          field1: undefined,
          field2: 'aaaaa',
          field3: undefined,
        },
      },
    });
  });

  it(`Should convert null to undefined recursively in an array`, () => {
    // We have a multiple null item recursively
    const testNull: unknown[] = [
      null,
      0,
      null,
      undefined,
      [null, '1', null, undefined, [[null, 2, null, undefined], 'aaaa', null, undefined]],
    ];
    // We convert to undefined
    const testUndefined: unknown[] = convertNullToUndefined(testNull);
    // The value should be undefined
    expect(testUndefined).toEqual([
      undefined,
      0,
      undefined,
      undefined,
      [undefined, '1', undefined, undefined, [[undefined, 2, undefined, undefined], 'aaaa', undefined, undefined]],
    ]);
  });

  it(`Should convert null to undefined recursively in an object and an array`, () => {
    // We have a field null
    const testNull: Record<string, unknown> = {
      field: null,
      field1: {
        field: [
          'aaaa',
          0,
          {
            field: 0,
            field1: [undefined, null, 'aaaa', 0, ['bbbb', null]],
          },
        ],
      },
    };
    // We convert to undefined
    const testUndefined: Record<string, unknown> = convertNullToUndefined(testNull);
    // The value should be undefined
    expect(testUndefined).toEqual({
      field: undefined,
      field1: {
        field: [
          'aaaa',
          0,
          {
            field: 0,
            field1: [undefined, undefined, 'aaaa', 0, ['bbbb', undefined]],
          },
        ],
      },
    });
  });
});

describe('assertsTypeValidation', () => {
  /**
   * Test Validation Class
   */
  class TestValidationClass {
    @IsString()
    public testField: string;
  }

  it(`should NOT throw an error if data is correct`, () => {
    expect(() => assertsTypeValidation(TestValidationClass, { testField: 'toto' })).not.toThrowError();
  });

  it(`should throw an error if data is NOT correct`, () => {
    expect(() => assertsTypeValidation(TestValidationClass, { testField: 5 })).toThrowError();
  });

  it(`should compile without error`, () => {
    const testValidation = (testData: { toto: number } | TestValidationClass): number => {
      assertsTypeValidation(TestValidationClass, testData);

      return testData.testField.length;
    };
  });
});
