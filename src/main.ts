import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { AllExceptionsFilter } from './common/all-exceptions';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config();

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    // 'http://localhost:4200',
    // 'http://localhost:4300',
    'https://larrainzar-front-nhil2.ondigitalocean.app',
    'https://coral-app-jhokf.ondigitalocean.app',
    'https://municipiolarrainzar.gob.mx'
  ];

  // Habilitar CORS
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Registro global del filtro
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configuración de Swagger
  const config = new DocumentBuilder()
  .setTitle('Municipio API')
  .setDescription('Servicios API de municipios')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  
  await app.listen(parseInt(process.env.PORT) || 3000);
}

bootstrap();
