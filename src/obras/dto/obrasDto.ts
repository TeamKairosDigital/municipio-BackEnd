export class CreateObrasDto {
    id?: number;
    nombre: string;
    descripcion: string;
    autor: string;
    nombreArchivo?: string;
    Activo?: boolean;
    fechaCreacion?: Date;
    municipality_id?: number;
    UsuarioCreacionId?: number;
    url?: string;
  }
  