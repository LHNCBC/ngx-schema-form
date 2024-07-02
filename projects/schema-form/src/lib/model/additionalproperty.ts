import {AtomicProperty} from './atomicproperty';
import {PropertyGroup} from './formproperty';
import {ValidatorRegistry} from './validatorregistry';
import {ExpressionCompilerFactory} from '../expression-compiler-factory';
import {LogService} from '../log.service';
import {SchemaValidatorFactory} from '../schemavalidatorfactory';
import {FieldType} from '../template-schema/field/field';

/**
 * A FormProperty to represent additional fields in the model. This instance is
 * intended to be used on the fields not defined in its parent schema and when
 * parent's schema has <code>additionalProperties: true</code>.
 */
export class AdditionalProperty extends AtomicProperty {

  /**
   * Read type of property value
   * @param value - Property value
   * @private
   * @returns - FieldType
   */
  private static getType(value: any): FieldType {
    let type;
    if (value === null) {
      type = FieldType.Null;
    } else if (Array.isArray(value)) {
      type = FieldType.Array;
    } else if (typeof value === 'object') {
      type = FieldType.Object;
    } else if (typeof value === 'string') {
      type = FieldType.String;
    } else if (typeof value === 'number') {
      type = FieldType.Number;
    } else if (typeof value === 'boolean') {
      type = FieldType.Boolean;
    }

    return type;
  }

  constructor(schemaValidatorFactory: SchemaValidatorFactory,
              validatorRegistry: ValidatorRegistry,
              expressionCompilerFactory: ExpressionCompilerFactory,
              parent: PropertyGroup,
              path: string,
              logger: LogService,
              value?: any) {
    const type = AdditionalProperty.getType(value);
    super(schemaValidatorFactory, validatorRegistry, expressionCompilerFactory, {type}, parent, path, logger);
    this.setValue(value);
  }

  fallbackValue() {
    return null;
  }
}
