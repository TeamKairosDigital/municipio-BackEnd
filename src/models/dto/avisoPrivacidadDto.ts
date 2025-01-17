export class AvisoArchivoDto {
    id: number;
    nombreArchivo: string;
    uuid: string;
    activo: boolean;
    fechaCreacion: string;
}
  
export class AvisoPrivacidadDto {
    id: number;
    nombre: string;
    activo: boolean;
    fechaCreacion: string;
    archivos: AvisoArchivoDto[];
}
  