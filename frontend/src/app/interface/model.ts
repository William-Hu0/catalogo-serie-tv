export interface Media {
  id_media?: number;
  titolo: string;
  trama?: string;
  anno_uscita?: number;
  lingua_orig?: string;
  voto_medio?: number;
  id_genere?: number;
  tipo?: 'Film' | 'SerieTV' | 'Inconsueto';
  nome_regista?: string;
  id_regista?: number;
  durata_minuti?: number;
  stato?: string;
  network?: string;
  piattaforme?: any[];
  cast?: any[];
  recensioni?: any[];
  stagioni?: any[];
}

export interface Attore {
  id_attore?: number;
  nome: string;
  cognome: string;
  data_nascita?: string; // Formato YYYY-MM-DD da SQL
  nazionalita?: string;
  bio?: string;
}

export interface Regista {
  id_regista?: number;
  nome: string;
  cognome: string;
  data_nascita?: string;
  nazionalita?: string;
  bio?: string;
}