import { FormProperty, PropertyGroup } from './formproperty';
import { SchemaValidatorFactory } from '../schemavalidatorfactory';
import { ValidatorRegistry } from './validatorregistry';
import { PropertyBindingRegistry } from '../property-binding-registry';
import { ExpressionCompilerFactory } from '../expression-compiler-factory';
import { PROPERTY_TYPE_MAPPING } from './typemapping';
import { ISchema, TSchemaPropertyType } from './ISchema';
import { LogService } from '../log.service';
import { TNullableFieldType, FieldType } from '../template-schema/field/field';
import { AdditionalProperty } from './additionalproperty';

export class FormPropertyFactory {

  constructor(private schemaValidatorFactory: SchemaValidatorFactory, private validatorRegistry: ValidatorRegistry,
              private propertyBindingRegistry: PropertyBindingRegistry,
              private expressionCompilerFactory: ExpressionCompilerFactory,
              private logger: LogService) {
  }

  /**
   * Create form property, based on schema, path, and value.
   * @param schema - Schema of the field to create the form property.
   * @param parent - FormProperty instance of the parent.
   * @param propertyId - Field name.
   * @param value - Value of the field.
   * @param additionalProperty - A flag to indicate additionalProperty. Defaults
   *   to false.
   * @return {FormProperty} - Created FormProperty instance.
   */
  createProperty(schema: ISchema, parent: PropertyGroup = null, propertyId: string = null, value?: any,
                 additionalProperty = false): FormProperty {
    let newProperty = null;
    let path = '';
    let _canonicalPath = '';
    if (parent) {
      path += parent.path;
      if (parent.parent !== null) {
        path += '/';
        _canonicalPath += '/';
      }
      if (parent.type === 'object') {
        path += propertyId;
        _canonicalPath += propertyId;
      } else if (parent.type === 'array') {
        path += '*';
        _canonicalPath += '*';
      } else {
        throw new Error('Instanciation of a FormProperty with an unknown parent type: ' + parent.type);
      }
      _canonicalPath = (parent._canonicalPath || parent.path) + _canonicalPath;
    } else {
      path = '/';
      _canonicalPath = '/';
    }

    if (additionalProperty) {
      newProperty = new AdditionalProperty(this.schemaValidatorFactory, this.validatorRegistry, this.expressionCompilerFactory,
        parent, path, this.logger, value);
    } else if (schema.$ref) {
      const refSchema = JSON.parse(JSON.stringify(this.schemaValidatorFactory.getSchema(parent.root.schema, schema.$ref)));

      ['title', 'description'].forEach((key) => {
        if (schema[key]) {
          refSchema[key] = schema[key];
        }
      })
      refSchema.widget = refSchema.widget || {id: 'hidden'};
      Object.assign(refSchema.widget, schema.widget); // Override ref widget with the widget of referencing schema.
      newProperty = this.createProperty(refSchema, parent, propertyId, value);
      return newProperty;
    } else {
      const type: FieldType = this.isUnionType(schema.type) && this.isValidNullableUnionType(schema.type as TNullableFieldType)
          ? this.extractTypeFromNullableUnionType(schema.type as TNullableFieldType)
          :  schema.type as FieldType;

      if (PROPERTY_TYPE_MAPPING[type]) {
        if (type === 'object' || type === 'array') {
          newProperty = PROPERTY_TYPE_MAPPING[type](
          this.schemaValidatorFactory, this.validatorRegistry, this.expressionCompilerFactory, schema, parent, path, this, this.logger,
            value);
        } else {
          newProperty = PROPERTY_TYPE_MAPPING[type](
          this.schemaValidatorFactory, this.validatorRegistry, this.expressionCompilerFactory, schema, parent, path, this.logger);
        }
      } else {
        throw new TypeError(`Undefined type ${type} (existing: ${Object.keys(PROPERTY_TYPE_MAPPING)})`);
      }
    }

    newProperty._propertyBindingRegistry = this.propertyBindingRegistry;
    newProperty._canonicalPath = _canonicalPath;

    if (newProperty instanceof PropertyGroup) {
      newProperty.reset(null, true);
      newProperty._bindVisibility();
    }

    return newProperty;
  }

  private isUnionType(unionType: TSchemaPropertyType): boolean {
    return Array.isArray(unionType) && unionType.length > 1;
  }

  private isValidNullableUnionType(unionType: TNullableFieldType): boolean {
    if (!unionType.some(subType => subType === FieldType.Null)) {
      throw new TypeError(`Unsupported union type ${unionType}. Supports only nullable union types, for example ["string", "null"]`);
    }

    if (unionType.length !== 2) {
      throw new TypeError(`Unsupported count of types in nullable union type ${unionType}. Supports only two types one of the which should be "null"`);
    }

    const type = this.extractTypeFromNullableUnionType(unionType);

    if (!type || [FieldType.Object, FieldType.Array].includes(type)) {
      throw new TypeError(`Unsupported second type ${type} for nullable union. Allowed types are "${FieldType.Number}", "${FieldType.Integer}", "${FieldType.Boolean}", "${FieldType.String}"`);
    }

    return true;
  }

  private extractTypeFromNullableUnionType(unionType: TNullableFieldType): FieldType | undefined {
    return unionType.filter(type => type !== 'null')?.[0] as FieldType | undefined;
  }
}
