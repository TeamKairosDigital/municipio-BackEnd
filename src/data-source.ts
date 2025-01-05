// // src/data-source.ts
// import { DataSource } from 'typeorm';

// export const AppDataSource = new DataSource({
//   type: 'mysql',
//   host: process.env.DB_HOST,
//   port: +process.env.DB_PORT,
//   username: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   entities: [__dirname + '/**/*.entity{.ts,.js}'],
//   synchronize: false,
//   migrations: ['./src/migrations/*.ts'], // Ruta de las migraciones
// });


import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config(); // Carga las variables de entorno desde el archivo .env

export const AppDataSource = new DataSource({
  type: 'mysql', // Cambiar si usas otro tipo de base de datos, como 'postgres'
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'], // Asegúrate de que apunta correctamente a las entidades
  migrations: [__dirname + '/migrations/*{.ts,.js}'], // Ruta donde estarán las migraciones
  synchronize: false, // IMPORTANTE: Desactiva esto en producción
  logging: true,
});

