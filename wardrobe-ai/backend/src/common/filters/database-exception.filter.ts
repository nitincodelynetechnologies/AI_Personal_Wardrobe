import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { DatabaseError } from 'pg';

@Catch(DatabaseError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: DatabaseError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    this.logger.error(
      `Database error [${exception.code ?? 'UNKNOWN'}]: ${exception.message}`,
      exception.stack,
    );

    if (exception.detail) {
      this.logger.error(`PostgreSQL detail: ${exception.detail}`);
    }

    if (exception.hint) {
      this.logger.error(`PostgreSQL hint: ${exception.hint}`);
    }

    console.error('[DatabaseExceptionFilter]', {
      code: exception.code,
      message: exception.message,
      detail: exception.detail,
      hint: exception.hint,
      table: exception.table,
      schema: exception.schema,
      column: exception.column,
    });

    response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'Database service is temporarily unavailable',
      error: 'Service Unavailable',
    });
  }
}
