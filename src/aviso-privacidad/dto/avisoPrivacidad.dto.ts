export class AvisoArchivoDto {
    id: number;
    nombreArchivo: string;
    nombre: string;
    tipo?: number;
    activo?: boolean;
    fechaCreacion: string;
    usuarioCreacion?: string;
}
  
export class AvisoPrivacidadDto {
    id: number;
    nombre: string;
    activo: boolean;
    fechaCreacion: string;
    archivos: AvisoArchivoDto[];
}
  