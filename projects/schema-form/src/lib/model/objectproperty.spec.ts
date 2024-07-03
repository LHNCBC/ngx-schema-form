import { ObjectProperty } from './objectproperty';
import { FormPropertyFactory } from './formpropertyfactory';

import {
  ZSchemaValidatorFactory
} from '../schemavalidatorfactory';

import { ValidatorRegistry } from './validatorregistry';
import {PropertyBindingRegistry} from '../property-binding-registry';
import { JEXLExpressionCompilerFactory } from '../expression-compiler-factory';
import {ISchema} from './ISchema';
import { DefaultLogService, LogLevel } from '../log.service';

describe('ObjectProperty', () => {

  const A_VALIDATOR_REGISTRY = new ValidatorRegistry();
  const A_SCHEMA_VALIDATOR_FACTORY = new ZSchemaValidatorFactory();
  const A_PROPERTY_BINDING_REGISTRY = new PropertyBindingRegistry();
  const A_EXPRESSION_COMPILER_FACTORY = new JEXLExpressionCompilerFactory();
  const A_LOGGER = new DefaultLogService(LogLevel.off);
  const A_FORM_PROPERTY_FACTORY = new FormPropertyFactory(A_SCHEMA_VALIDATOR_FACTORY, A_VALIDATOR_REGISTRY, A_PROPERTY_BINDING_REGISTRY,
    A_EXPRESSION_COMPILER_FACTORY, A_LOGGER);


  const THE_OBJECT_SCHEMA: ISchema = {
    type: 'object',
    properties: {
      FOO: {type: 'integer'},
      BAR: {type: 'integer'},
      BAZ: {type: 'object'}
    }
  };

  let objProperty: ObjectProperty;
  let value: any = null;


  beforeEach(() => {
    objProperty = new ObjectProperty(
      A_FORM_PROPERTY_FACTORY,
      A_SCHEMA_VALIDATOR_FACTORY,
      A_VALIDATOR_REGISTRY,
      A_EXPRESSION_COMPILER_FACTORY,
      THE_OBJECT_SCHEMA,
      null,
      '',
      A_LOGGER,
      value
    );
  });

  it('should create same properties as in the schema', () => {

    // Should create all properties defined in the schema.
    expect(objProperty.getProperty('FOO')).toBeDefined();
    expect(objProperty.getProperty('BAR')).toBeDefined();
    expect(objProperty.getProperty('BAZ')).toBeDefined();
  });

  it('should create same properties as in schema with arbitrary parent path', () => {
    value = {FOO: 1};
    objProperty = new ObjectProperty(
      A_FORM_PROPERTY_FACTORY,
      A_SCHEMA_VALIDATOR_FACTORY,
      A_VALIDATOR_REGISTRY,
      A_EXPRESSION_COMPILER_FACTORY,
      THE_OBJECT_SCHEMA,
      null,
      '/abc/def/*',
      A_LOGGER,
      value
    );

    expect(objProperty.path).toBe('/abc/def/*');
    // Should create all properties defined in the schema.
    expect(objProperty.getProperty('FOO')).toBeDefined();
    expect(objProperty.getProperty('BAR')).toBeDefined();
    expect(objProperty.getProperty('BAZ')).toBeDefined();
  });

  ['extension', 'modifierExtension'].forEach((field) => {
    it('Special handling for ' + field + ': should create same properties as in value', () => {
      value = {FOO: 1};
      objProperty = new ObjectProperty(
        A_FORM_PROPERTY_FACTORY,
        A_SCHEMA_VALIDATOR_FACTORY,
        A_VALIDATOR_REGISTRY,
        A_EXPRESSION_COMPILER_FACTORY,
        THE_OBJECT_SCHEMA,
        null,
        '/abc/' + field + '/*',
        A_LOGGER,
        value
      );

      // In extensions, should create the only ones in the value.
      expect(objProperty.getProperty('FOO')).toBeDefined();
      expect(objProperty.getProperty('BAR')).toBeUndefined();
      expect(objProperty.getProperty('BAZ')).toBeUndefined();
    });
  });

  describe('Additional properties', () => {
    beforeAll(() => {
      THE_OBJECT_SCHEMA.additionalProperties = true;
    });
    afterAll(() => {
      delete THE_OBJECT_SCHEMA.additionalProperties;
    });

    it('should support unspecified object, array fields', () => {
      THE_OBJECT_SCHEMA.properties.BAZ.additionalProperties = true;
      objProperty = new ObjectProperty(
        A_FORM_PROPERTY_FACTORY,
        A_SCHEMA_VALIDATOR_FACTORY,
        A_VALIDATOR_REGISTRY,
        A_EXPRESSION_COMPILER_FACTORY,
        THE_OBJECT_SCHEMA,
        null,
        '/abc/def/*',
        A_LOGGER,
        value
      );

      objProperty.reset({FOO: 1, BAZ: {a: 11}, num: 1.1, bool: true, str: 'A string', obj: {b: 22, c: {d: 33}}});

      expect(objProperty.getProperty('FOO').value).toBe(1);
      expect(objProperty.getProperty('BAR').value).toBeNull();
      expect(objProperty.getProperty('BAZ').value).toEqual({a: 11});
      expect(objProperty.getProperty('num').value).toBe(1.1);
      expect(objProperty.getProperty('bool').value).toBe(true);
      expect(objProperty.getProperty('str').value).toBe('A string');
      expect(objProperty.getProperty('obj').value).toEqual({b: 22, c: {d: 33}});
    });
  });
});
