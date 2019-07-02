import { Categoria } from './categoria';

export interface Jogo {
    nome: string;
    categorias: Categoria[] | string[];
    desenvolvedora: string;
    nota: number;
    _id?: string;
}
