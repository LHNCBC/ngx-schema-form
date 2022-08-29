import { PROPERTY_TYPE_MAPPING } from './typemapping';
import {PropertyGroup} from './formproperty';
import {FormPropertyFactory} from './formpropertyfactory';
import {SchemaValidatorFactory} from '../schemavalidatorfactory';
import {ValidatorRegistry} from './validatorregistry';
import { ExpressionCompilerFactory } from '../expression-compiler-factory';
import {ISchema} from './ISchema';
import { LogService } from '../log.service';

export class ObjectProperty extends PropertyGroup {

  private propertiesId: string[] = [];

  constructor(private formPropertyFactory: FormPropertyFactory,
              schemaValidatorFactory: SchemaValidatorFactory,
              validatorRegistry: ValidatorRegistry,
              expressionCompilerFactory: ExpressionCompilerFactory,
              schema: ISchema,
              parent: PropertyGroup,
              path: string,
              logger: LogService,
              value?: any) {
    super(schemaValidatorFactory, validatorRegistry, expressionCompilerFactory, schema, parent, path, logger);
    if (path.match(/\/(extension|modifiedExtension)\/\*$/)) {
      // Special handling for extension schema.
      this.createPropertiesExtension(value);
    } else {
      this.createProperties();
    }
  }

  setValue(value: any, onlySelf: boolean) {
    for (const propertyId in value) {
      if (value.hasOwnProperty(propertyId)) {
        if (!this.properties[propertyId]) {
          const propertySchema = this.schema.properties[propertyId];
          this.properties[propertyId] = this.formPropertyFactory.createProperty(propertySchema, this, propertyId, value[propertyId]);
          this.propertiesId.push(propertyId);
        }
        this.properties[propertyId].setValue(value[propertyId], true);
      }
    }
    this.updateValueAndValidity(onlySelf, true);
  }

  reset(value: any, onlySelf = true) {
    value = value || this.schema.default || {};
    this.resetProperties(value);
    this.updateValueAndValidity(onlySelf, true);
  }

  resetProperties(value: any) {
    for (const propertyId in this.schema.properties) {
      if (this.properties[propertyId] && this.schema.properties.hasOwnProperty(propertyId)) {
        this.properties[propertyId].reset(value[propertyId], true);
      }
    }
  }

  createProperties() {
    this.properties = {};
    this.propertiesId = [];
    for (const propertyId in this.schema.properties) {
      if (this.schema.properties.hasOwnProperty(propertyId)) {
        const propertySchema = this.schema.properties[propertyId];
        this.properties[propertyId] = this.formPropertyFactory.createProperty(propertySchema, this, propertyId);
        this.propertiesId.push(propertyId);
      }
    }
  }

  /**
   * For some FHIR schemas, such as Extension, we need information from the url to limit creating associated value[x] fields.
   * Enumerating all possible extension urls is kind of impossible task. The next best thing is to look for them in the value parameter.
   * If value is null, create all possible value[x] as a fallback.
   *
   * @param value - Value of extension
   */
  createPropertiesExtension(value: any) {
    this.properties = {};
    this.propertiesId = [];
    const propList: string[] = value ? Object.keys(value) : this.schema.properties ? Object.keys(this.schema.properties) : [];
    for (const propertyId of propList) {
      if (this.schema.properties.hasOwnProperty(propertyId)) {
        const propertySchema = this.schema.properties[propertyId];
        if (propertySchema) {
          this.properties[propertyId] = this.formPropertyFactory.createProperty(propertySchema, this, propertyId,
            value ? value[propertyId] : null);
            this.propertiesId.push(propertyId);
        }
      }
    }
  }

  public _hasValue(): boolean {
    return !!Object.keys(this.value).length;
  }

  public _updateValue() {
    this.reduceValue();
  }

  public _runValidation() {
    super._runValidation();

    if (this._errors) {
      this._errors.forEach(error => {
        const prop = this.searchProperty(error.path.slice(1));
        if (prop) {
          prop.extendErrors(error);
        }
      });
    }
  }

  private reduceValue(): void {
    const value = {};
    this.forEachChild((property, propertyId: string) => {
      if (property.visible && property._hasValue()) {
        value[propertyId] = property.value;
      }
    });
    this._value = value;
  }
}

PROPERTY_TYPE_MAPPING.object = (
    schemaValidatorFactory: SchemaValidatorFactory,
    validatorRegistry: ValidatorRegistry,
    expressionCompilerFactory: ExpressionCompilerFactory,
    schema: ISchema,
    parent: PropertyGroup,
    path: string,
    formPropertyFactory: FormPropertyFactory,
    logger: LogService,
    value?: any
) => {
    return new ObjectProperty(
        formPropertyFactory, schemaValidatorFactory, validatorRegistry, expressionCompilerFactory, schema, parent, path, logger, value);
};
