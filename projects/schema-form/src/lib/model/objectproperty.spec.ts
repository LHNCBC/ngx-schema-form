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

    for (const propertyId in THE_OBJECT_SCHEMA.properties) {
      if (THE_OBJECT_SCHEMA.properties.hasOwnProperty(propertyId)) {
        const property = objProperty.getProperty(propertyId);
        expect(property).toBeDefined();
      }
    }
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
    for (const propertyId in THE_OBJECT_SCHEMA.properties) {
      if (THE_OBJECT_SCHEMA.properties.hasOwnProperty(propertyId)) {
        const property = objProperty.getProperty(propertyId);
        expect(property).toBeDefined();
      }
    }
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
      for (const propertyId in THE_OBJECT_SCHEMA.properties) {
        if (THE_OBJECT_SCHEMA.properties.hasOwnProperty(propertyId)) {
          const property = objProperty.getProperty(propertyId);
          if (value.hasOwnProperty(propertyId)) {
            expect(property).toBeDefined();
          } else {
            expect(property).toBeUndefined();
          }
        }
      }
    });
  });

});
