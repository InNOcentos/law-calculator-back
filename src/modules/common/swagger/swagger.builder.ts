import { INestApplication, LoggerService } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { getDocumentationFolderPath, getPackageVersion, rewriteDocument } from './swagger.utils';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

export const SwaggerBuilder = (application: INestApplication, config: ConfigService, logger: LoggerService): void => {
  if (config.get('NODE_ENV') === 'production') return;

  let serverUrl: string;
  if (config.get('NODE_ENV') === 'local') {
    serverUrl = `http://${config.get('app.httpHost')}:${config.get('app.httpPort')}${config.get('app.httpPrefix')}`;
  } else {
    serverUrl = `https://${config.get('app.httpHost')}${config.get('app.httpPrefix')}`;
  }

  const documentationBuilder = new DocumentBuilder()
    .setTitle(`${config.get('app.serviceName')} ${getPackageVersion()}`)
    .setDescription('REST API Documentation')
    .setVersion(`${config.get('app.httpVersion')}`)
    .addServer(serverUrl)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(application, documentationBuilder);
  rewriteDocument(document);

  (application as NestExpressApplication).useStaticAssets(getDocumentationFolderPath(), { prefix: config.get('app.httpPrefix') });
  SwaggerModule.setup(`${config.get('app.httpPrefix')}/docs`, application, document);

  if (logger) {
    logger.log(`Documentation: ${serverUrl}/docs`, {
      context: 'NestApplication',
    });
  }
};
