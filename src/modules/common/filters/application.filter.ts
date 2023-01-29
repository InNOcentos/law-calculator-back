import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, UnprocessableEntityException, ValidationError } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ApplicationExceptionFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: unknown, host: ArgumentsHost): unknown {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    /* HTTP validation exception */
    if (ApplicationExceptionFilter.assertValidationException(exception)) {
      const exceptionDto = this.convertValidationErrorToDTO(exception as any);
      return response.status(HttpStatus.UNPROCESSABLE_ENTITY).send(exceptionDto);
    }

    /* HTTP exception case */
    if (ApplicationExceptionFilter.assertHttpException(exception)) {
      return response.status(HttpStatus.SERVICE_UNAVAILABLE).send({ dateTime: new Date().toISOString(), errors: [{ message: exception.message }] });
    }

    console.error(JSON.stringify(exception));

    return response.status(HttpStatus.SERVICE_UNAVAILABLE).send({ dateTime: new Date().toISOString(), errors: [{ message: 'Неизвестная ошибка' }] });
  }

  private convertValidationErrorToDTO(exception: any): any {
    const validationErrors = [];
    for (const error of exception.response['message']) {
      this.serializeValidationError(error, validationErrors);
    }
    return {
      dateTime: new Date().toISOString(),
      errors: validationErrors,
    };
  }

  private serializeValidationError(error: ValidationError, errorStore: any[] = [], parentName = ''): void {
    if (error.children && error.children.length) {
      for (const errorChildren of error.children) {
        this.serializeValidationError(errorChildren, errorStore, `${parentName}${errorChildren.property}.`);
      }
    }

    if (error && error.constraints) {
      const constraints = Object.keys(error.constraints);
      if (constraints && constraints.length) {
        for (const constraint of constraints) {
          errorStore.push({
            fieldName: parentName + error?.property,
            message: error.constraints[constraint],
          });
        }
      }
    }
  }

  private static assertHttpException(exception: unknown): exception is HttpException {
    return Object.getPrototypeOf(exception.constructor).name === 'HttpException' || exception.constructor.name === 'HttpException';
  }

  private static assertValidationException(exception: unknown): exception is UnprocessableEntityException {
    return exception.constructor.name === 'UnprocessableEntityException';
  }
}
