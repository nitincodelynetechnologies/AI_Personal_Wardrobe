const {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} = require('@nestjs/common');
const { DatabaseError } = require('pg');

@Catch(DatabaseError)
class DatabaseExceptionFilter {
  constructor() {
    this.logger = new Logger(DatabaseExceptionFilter.name);
  }

  catch(exception, host) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    this.logger.error(`Database error [${exception.code}]: ${exception.message}`);

    response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'Database service is temporarily unavailable',
      error: 'Service Unavailable',
    });
  }
}

module.exports = { DatabaseExceptionFilter };
