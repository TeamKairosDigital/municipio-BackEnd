import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config(); // Carga las variables de entorno desde el archivo .env

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'], // Ubicación de tus entidades
  migrations: [__dirname + '/migrations/*{.ts,.js}'], // Ubicación de tus migraciones
  synchronize: false, // Desactivar en producción
  logging: true,
});
