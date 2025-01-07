import { MigrationInterface, QueryRunner } from "typeorm";

export class MigracionEntidades1736278224211 implements MigrationInterface {
    name = 'MigracionEntidades1736278224211'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`documentos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombreDocumento\` varchar(255) NOT NULL, \`ley\` varchar(255) NULL, \`categoria\` varchar(255) NULL, \`activo\` tinyint NOT NULL, \`fechaCreacion\` datetime NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`periodos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombrePeriodo\` varchar(255) NOT NULL, \`activo\` tinyint NOT NULL, \`fechaCreacion\` datetime NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`archivos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombreArchivo\` varchar(255) NOT NULL, \`documentoId\` int NOT NULL, \`periodoId\` int NOT NULL, \`anualidad\` varchar(255) NOT NULL, \`activo\` tinyint NOT NULL, \`fechaCreacion\` datetime NOT NULL, \`UsuarioCreacionId\` int NULL, \`municipality_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`aviso_privacidad_archivos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`NombreArchivo\` varchar(255) NOT NULL, \`uuid\` varchar(255) NOT NULL, \`Activo\` tinyint NOT NULL, \`fechaCreacion\` datetime NOT NULL, \`avisoPrivacidadId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`aviso_privacidad\` (\`id\` int NOT NULL AUTO_INCREMENT, \`Nombre\` varchar(255) NOT NULL, \`Activo\` tinyint NOT NULL, \`fechaCreacion\` datetime NOT NULL, \`UsuarioCreacionId\` int NOT NULL, \`municipality_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`Nombre\` varchar(255) NOT NULL, \`UserName\` varchar(255) NOT NULL, \`Pass\` varchar(255) NOT NULL, \`Municipio\` varchar(255) NOT NULL, \`activo\` tinyint NOT NULL, \`fechaCreacion\` datetime NOT NULL, \`municipality_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`filees_entity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fileName\` varchar(255) NOT NULL, \`url\` varchar(255) NOT NULL, \`municipality_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`municipality\` (\`id\` int NOT NULL AUTO_INCREMENT, \`NombreMunicipio\` varchar(255) NOT NULL, \`activo\` tinyint NOT NULL, \`fechaCreacion\` datetime NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`obras\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`descripcion\` text NOT NULL, \`nombreArchivo\` varchar(255) NOT NULL, \`Activo\` tinyint NOT NULL, \`fechaCreacion\` datetime NOT NULL, \`municipality_id\` int NULL, \`UsuarioCreacionId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`archivos\` ADD CONSTRAINT \`FK_ad92cde00f982273568c2bdfb67\` FOREIGN KEY (\`documentoId\`) REFERENCES \`documentos\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`archivos\` ADD CONSTRAINT \`FK_311e937e40ba5d3e9c052d0d777\` FOREIGN KEY (\`periodoId\`) REFERENCES \`periodos\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`archivos\` ADD CONSTRAINT \`FK_a1eae81f361e786b2d81fbe5bb5\` FOREIGN KEY (\`UsuarioCreacionId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`archivos\` ADD CONSTRAINT \`FK_9425842693dd38bc323ed2f9430\` FOREIGN KEY (\`municipality_id\`) REFERENCES \`municipality\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`aviso_privacidad_archivos\` ADD CONSTRAINT \`FK_91057704361713d8d3f960aafaf\` FOREIGN KEY (\`avisoPrivacidadId\`) REFERENCES \`aviso_privacidad\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`aviso_privacidad\` ADD CONSTRAINT \`FK_5781e54ca8147ef13a35a666d81\` FOREIGN KEY (\`UsuarioCreacionId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`aviso_privacidad\` ADD CONSTRAINT \`FK_ac4254b9f700994374bcd805fe7\` FOREIGN KEY (\`municipality_id\`) REFERENCES \`municipality\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_eda381454352c36551a7fb1947b\` FOREIGN KEY (\`municipality_id\`) REFERENCES \`municipality\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`filees_entity\` ADD CONSTRAINT \`FK_80b6a742484cb0f0d36cc4d220b\` FOREIGN KEY (\`municipality_id\`) REFERENCES \`municipality\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`obras\` ADD CONSTRAINT \`FK_49addd278407f925a50a5970a4a\` FOREIGN KEY (\`municipality_id\`) REFERENCES \`municipality\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`obras\` ADD CONSTRAINT \`FK_72e63a76a97e014fa46cb67cd25\` FOREIGN KEY (\`UsuarioCreacionId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`obras\` DROP FOREIGN KEY \`FK_72e63a76a97e014fa46cb67cd25\``);
        await queryRunner.query(`ALTER TABLE \`obras\` DROP FOREIGN KEY \`FK_49addd278407f925a50a5970a4a\``);
        await queryRunner.query(`ALTER TABLE \`filees_entity\` DROP FOREIGN KEY \`FK_80b6a742484cb0f0d36cc4d220b\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_eda381454352c36551a7fb1947b\``);
        await queryRunner.query(`ALTER TABLE \`aviso_privacidad\` DROP FOREIGN KEY \`FK_ac4254b9f700994374bcd805fe7\``);
        await queryRunner.query(`ALTER TABLE \`aviso_privacidad\` DROP FOREIGN KEY \`FK_5781e54ca8147ef13a35a666d81\``);
        await queryRunner.query(`ALTER TABLE \`aviso_privacidad_archivos\` DROP FOREIGN KEY \`FK_91057704361713d8d3f960aafaf\``);
        await queryRunner.query(`ALTER TABLE \`archivos\` DROP FOREIGN KEY \`FK_9425842693dd38bc323ed2f9430\``);
        await queryRunner.query(`ALTER TABLE \`archivos\` DROP FOREIGN KEY \`FK_a1eae81f361e786b2d81fbe5bb5\``);
        await queryRunner.query(`ALTER TABLE \`archivos\` DROP FOREIGN KEY \`FK_311e937e40ba5d3e9c052d0d777\``);
        await queryRunner.query(`ALTER TABLE \`archivos\` DROP FOREIGN KEY \`FK_ad92cde00f982273568c2bdfb67\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`obras\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`municipality\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`filees_entity\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`users\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`aviso_privacidad\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`aviso_privacidad_archivos\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`archivos\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`periodos\``);
        await queryRunner.query('DROP TABLE IF EXISTS documentos');
    }

}
