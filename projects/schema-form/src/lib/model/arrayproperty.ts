import {FormProperty, PropertyGroup} from './formproperty';
import {FormPropertyFactory} from './formpropertyfactory';
import { PROPERTY_TYPE_MAPPING } from './typemapping';
import {SchemaValidatorFactory} from '../schemavalidatorfactory';
import {ValidatorRegistry} from './validatorregistry';
import { ExpressionCompilerFactory } from '../expression-compiler-factory';
import {ISchema} from './ISchema';
import { LogService } from '../log.service';

export class ArrayProperty extends PropertyGroup {

  constructor(private formPropertyFactory: FormPropertyFactory,
              schemaValidatorFactory: SchemaValidatorFactory,
              validatorRegistry: ValidatorRegistry,
              expressionCompilerFactory: ExpressionCompilerFactory,
              schema: ISchema,
              parent: PropertyGroup,
              path: string,
              logger: LogService) {
    super(schemaValidatorFactory, validatorRegistry, expressionCompilerFactory, schema, parent, path, logger);
  }

  addItem(value: any = null): FormProperty {
    return this.addProperty(value);
  }

  /**
   * For some FHIR schemas, such as Extension, we need information from the url to limit the associated value[x] fields.
   * @param value
   * @private
   */
  private addProperty(value) {
    let itemSchema = this.schema.items;
    if (Array.isArray(this.schema.items)) {
      const itemSchemas = this.schema.items as object[];
      if (itemSchemas.length > (<FormProperty[]>this.properties).length) {
        itemSchema = itemSchema[(<FormProperty[]>this.properties).length];
      } else if (this.schema.additionalItems) {
        itemSchema = this.schema.additionalItems;
      } else {
        // shouldn't add new items since schema is undefined for the item at its position
        return null;
      }
    }
    const newProperty = this.formPropertyFactory.createProperty(itemSchema, this, null, value);
    (<FormProperty[]>this.properties).push(newProperty);
    newProperty.reset(value, false);
    return newProperty;
  }

  removeItem(item: FormProperty) {
    this.properties = (<FormProperty[]>this.properties).filter(i => i !== item);
    this.updateValueAndValidity(false, true);
  }

  setValue(value: any, onlySelf: boolean) {
    this.createProperties();
    this.resetProperties(value);
    this.updateValueAndValidity(onlySelf, true);
  }

  public _hasValue(): boolean {
    return true;
  }

  public _updateValue() {
    this.reduceValue();
  }

  private reduceValue(): void {
    const value = [];
    this.forEachChild((property, _) => {
      if (property.visible && property._hasValue()) {
        value.push(property.value);
      }
    });
    this._value = value;
  }

  reset(value: any, onlySelf = true) {
    value = value || this.schema.default || [];
    this.properties = [];
    this.resetProperties(value);
    this.updateValueAndValidity(onlySelf, true);
  }

  private createProperties() {
    this.properties = [];
  }


  private resetProperties(value: any) {
    for (const idx in value) {
      if (value.hasOwnProperty(idx)) {
        const property = this.addProperty(value[idx]);
        property.reset(value[idx], true);
      }
    }
  }
}

PROPERTY_TYPE_MAPPING.array = (
    schemaValidatorFactory: SchemaValidatorFactory,
    validatorRegistry: ValidatorRegistry,
    expressionCompilerFactory: ExpressionCompilerFactory,
    schema: ISchema,
    parent: PropertyGroup,
    path: string,
    formPropertyFactory: FormPropertyFactory,
    logger: LogService
) => {
    return new ArrayProperty(
        formPropertyFactory, schemaValidatorFactory, validatorRegistry, expressionCompilerFactory, schema, parent, path, logger);
};
