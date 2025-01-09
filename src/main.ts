import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { AllExceptionsFilter } from './common/all-exceptions';

dotenv.config();

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:4200',
    'https://larrainzar-front-nhil2.ondigitalocean.app',
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
  
  await app.listen(3000);
}

bootstrap();
