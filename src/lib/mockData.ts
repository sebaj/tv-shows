import type { MediaDetails, MediaItem, MediaType } from '@/types';
import { genresFor } from '@/lib/genres';

/**
 * Catálogo de demostración (títulos ficticios) usado únicamente cuando no hay
 * una VITE_TMDB_API_KEY configurada, para que la app sea navegable sin depender
 * de un servicio externo. Con una API key real, todo esto se reemplaza por el
 * catálogo real de TMDB.
 */
export type MockTag =
  | 'trendingDay'
  | 'trendingWeek'
  | 'popular'
  | 'topRated'
  | 'newRelease' // now playing / airing today
  | 'upcoming'; // upcoming / on the air

export interface MockItem extends MediaItem {
  tags: MockTag[];
  runtime: number | null;
  numberOfSeasons: number | null;
  numberOfEpisodes: number | null;
  status: string;
  tagline: string;
}

let uid = 1;
function next(mediaType: MediaType): number {
  return mediaType === 'movie' ? 100000 + uid++ : 200000 + uid++;
}

function movie(data: {
  title: string;
  overview: string;
  genreIds: number[];
  voteAverage: number;
  voteCount: number;
  popularity: number;
  releaseDate: string;
  runtime: number;
  tags: MockTag[];
  tagline?: string;
}): MockItem {
  return {
    id: next('movie'),
    mediaType: 'movie',
    title: data.title,
    overview: data.overview,
    posterPath: null,
    backdropPath: null,
    voteAverage: data.voteAverage,
    voteCount: data.voteCount,
    popularity: data.popularity,
    releaseDate: data.releaseDate,
    genreIds: data.genreIds,
    runtime: data.runtime,
    numberOfSeasons: null,
    numberOfEpisodes: null,
    status: 'Released',
    tagline: data.tagline ?? '',
    tags: data.tags,
  };
}

function tv(data: {
  title: string;
  overview: string;
  genreIds: number[];
  voteAverage: number;
  voteCount: number;
  popularity: number;
  releaseDate: string;
  seasons: number;
  episodes: number;
  tags: MockTag[];
  tagline?: string;
}): MockItem {
  return {
    id: next('tv'),
    mediaType: 'tv',
    title: data.title,
    overview: data.overview,
    posterPath: null,
    backdropPath: null,
    voteAverage: data.voteAverage,
    voteCount: data.voteCount,
    popularity: data.popularity,
    releaseDate: data.releaseDate,
    genreIds: data.genreIds,
    runtime: null,
    numberOfSeasons: data.seasons,
    numberOfEpisodes: data.episodes,
    status: 'Returning Series',
    tagline: data.tagline ?? '',
    tags: data.tags,
  };
}

export const MOCK_MOVIES: MockItem[] = [
  movie({
    title: 'Ecos del Mañana',
    overview: 'Una científica descubre que puede enviar mensajes 24 horas al pasado y debe usarlo para evitar una catástrofe global.',
    genreIds: [878, 53],
    voteAverage: 8.1,
    voteCount: 4210,
    popularity: 980,
    releaseDate: '2026-06-12',
    runtime: 128,
    tags: ['trendingDay', 'trendingWeek', 'popular', 'newRelease'],
    tagline: 'El tiempo no perdona dos veces.',
  }),
  movie({
    title: 'La Última Frontera',
    overview: 'Un grupo de exploradores queda varado en una estación espacial abandonada tras perder contacto con la Tierra.',
    genreIds: [878, 12],
    voteAverage: 7.6,
    voteCount: 3120,
    popularity: 820,
    releaseDate: '2026-05-01',
    runtime: 141,
    tags: ['trendingWeek', 'popular'],
  }),
  movie({
    title: 'Corazón de Neón',
    overview: 'En una ciudad dominada por carteles tecnológicos, un detective busca redención resolviendo el crimen que arruinó su vida.',
    genreIds: [80, 53],
    voteAverage: 7.9,
    voteCount: 2870,
    popularity: 760,
    releaseDate: '2026-04-18',
    runtime: 116,
    tags: ['popular', 'topRated'],
  }),
  movie({
    title: 'Risas en Cuarentena',
    overview: 'Cinco amigos encerrados en una cabaña durante una tormenta descubren que la convivencia es más peligrosa que el clima.',
    genreIds: [35],
    voteAverage: 6.8,
    voteCount: 1590,
    popularity: 410,
    releaseDate: '2026-03-22',
    runtime: 98,
    tags: ['popular'],
  }),
  movie({
    title: 'El Bosque Silente',
    overview: 'Una familia se muda a una casa rural donde el bosque cercano parece recordar cada palabra que dicen en voz alta.',
    genreIds: [27, 9648],
    voteAverage: 7.3,
    voteCount: 2210,
    popularity: 690,
    releaseDate: '2026-02-14',
    runtime: 104,
    tags: ['topRated', 'trendingWeek'],
  }),
  movie({
    title: 'Reino de Cenizas',
    overview: 'Tras la caída de su imperio, una joven heredera reúne un ejército improbable para reclamar el trono que le arrebataron.',
    genreIds: [14, 12, 18],
    voteAverage: 8.4,
    voteCount: 5310,
    popularity: 1120,
    releaseDate: '2026-01-30',
    runtime: 152,
    tags: ['topRated', 'popular', 'trendingWeek'],
  }),
  movie({
    title: 'Doble Filo',
    overview: 'Dos agentes de espionaje de bandos opuestos deben colaborar cuando descubren que su verdadero enemigo los usó a ambos.',
    genreIds: [28, 53],
    voteAverage: 7.1,
    voteCount: 1980,
    popularity: 640,
    releaseDate: '2026-07-24',
    runtime: 119,
    tags: ['upcoming'],
    tagline: 'Confiar es el primer error.',
  }),
  movie({
    title: 'Órbita Cero',
    overview: 'La primera misión tripulada a un exoplaneta se enfrenta a una anomalía que desafía las leyes de la física conocida.',
    genreIds: [878],
    voteAverage: 0,
    voteCount: 0,
    popularity: 300,
    releaseDate: '2026-08-14',
    runtime: 134,
    tags: ['upcoming'],
  }),
  movie({
    title: 'Fuego Cruzado',
    overview: 'Un ex militar retirado vuelve a la acción cuando su hija es tomada como rehén en un edificio corporativo.',
    genreIds: [28, 53],
    voteAverage: 6.5,
    voteCount: 980,
    popularity: 350,
    releaseDate: '2026-08-29',
    runtime: 108,
    tags: ['upcoming'],
  }),
  movie({
    title: 'Melodía Rota',
    overview: 'La biografía no autorizada de una compositora que revolucionó la música electrónica desde un garaje en los años 90.',
    genreIds: [10402, 18],
    voteAverage: 7.7,
    voteCount: 1340,
    popularity: 410,
    releaseDate: '2025-11-05',
    runtime: 121,
    tags: ['topRated'],
  }),
  movie({
    title: 'El Peso del Silencio',
    overview: 'Un intérprete judicial se ve envuelto en un caso de corrupción que amenaza con exponer secretos de todo un gobierno.',
    genreIds: [18, 53],
    voteAverage: 8.0,
    voteCount: 2650,
    popularity: 580,
    releaseDate: '2025-10-10',
    runtime: 126,
    tags: ['topRated'],
  }),
  movie({
    title: 'Carrera Salvaje',
    overview: 'Un piloto novato debe ganar el campeonato clandestino más peligroso del continente para salvar el taller de su familia.',
    genreIds: [28],
    voteAverage: 6.2,
    voteCount: 890,
    popularity: 300,
    releaseDate: '2025-09-19',
    runtime: 102,
    tags: [],
  }),
];

export const MOCK_TV: MockItem[] = [
  tv({
    title: 'Umbral',
    overview: 'Cuando aparecen portales aleatorios por todo el mundo, un grupo de científicos y militares intenta entender quién los controla.',
    genreIds: [10765, 18],
    voteAverage: 8.5,
    voteCount: 6210,
    popularity: 1340,
    releaseDate: '2026-06-01',
    seasons: 2,
    episodes: 16,
    tags: ['trendingDay', 'trendingWeek', 'popular', 'newRelease'],
    tagline: 'Nada vuelve igual.',
  }),
  tv({
    title: 'Casa de Naipes: Legado',
    overview: 'La nueva generación de una familia política hereda tanto el poder como los enemigos que su patriarca dejó atrás.',
    genreIds: [18, 10768],
    voteAverage: 7.8,
    voteCount: 3980,
    popularity: 910,
    releaseDate: '2026-05-15',
    seasons: 1,
    episodes: 8,
    tags: ['trendingWeek', 'popular', 'newRelease'],
  }),
  tv({
    title: 'Vecinos Extraordinarios',
    overview: 'En un edificio de apartamentos aparentemente normal, cada vecino esconde una habilidad que preferiría mantener en secreto.',
    genreIds: [35, 10765],
    voteAverage: 7.4,
    voteCount: 2450,
    popularity: 700,
    releaseDate: '2026-04-02',
    seasons: 3,
    episodes: 30,
    tags: ['popular'],
  }),
  tv({
    title: 'Código Rojo',
    overview: 'Un equipo de respuesta a crisis médicas globales corre contra el reloj en cada brote, desde selvas remotas hasta capitales.',
    genreIds: [18, 10759],
    voteAverage: 8.0,
    voteCount: 3020,
    popularity: 780,
    releaseDate: '2026-03-10',
    seasons: 2,
    episodes: 20,
    tags: ['topRated', 'popular'],
  }),
  tv({
    title: 'Archivo Nocturno',
    overview: 'Una periodista de investigación descubre que los casos sin resolver de su ciudad están conectados por un patrón imposible.',
    genreIds: [9648, 80],
    voteAverage: 8.2,
    voteCount: 4110,
    popularity: 860,
    releaseDate: '2026-01-20',
    seasons: 1,
    episodes: 10,
    tags: ['topRated', 'trendingWeek'],
  }),
  tv({
    title: 'Reinas del Absurdo',
    overview: 'Cuatro comediantes compiten y colaboran a la vez mientras intentan sostener su propio programa de sketches en crisis.',
    genreIds: [35],
    voteAverage: 6.9,
    voteCount: 1200,
    popularity: 380,
    releaseDate: '2025-12-01',
    seasons: 4,
    episodes: 48,
    tags: ['popular'],
  }),
  tv({
    title: 'El Último Reino Helado',
    overview: 'En un mundo post-glacial, distintos clanes luchan por el control de las últimas tierras fértiles del planeta.',
    genreIds: [10759, 10765],
    voteAverage: 7.6,
    voteCount: 2670,
    popularity: 640,
    releaseDate: '2026-07-18',
    seasons: 1,
    episodes: 8,
    tags: ['upcoming'],
    tagline: 'El hielo no olvida.',
  }),
  tv({
    title: 'Consultorio 9',
    overview: 'Las historias entrelazadas del personal y los pacientes de una clínica comunitaria en un barrio en transformación.',
    genreIds: [18],
    voteAverage: 0,
    voteCount: 0,
    popularity: 260,
    releaseDate: '2026-08-05',
    seasons: 1,
    episodes: 10,
    tags: ['upcoming'],
  }),
  tv({
    title: 'Doble Identidad',
    overview: 'Una agente encubierta debe mantener dos vidas separadas sin que ninguna de sus dos familias descubra la verdad.',
    genreIds: [10759, 35],
    voteAverage: 7.0,
    voteCount: 1450,
    popularity: 420,
    releaseDate: '2026-08-21',
    seasons: 1,
    episodes: 12,
    tags: ['upcoming'],
  }),
  tv({
    title: 'Crónicas del Puerto',
    overview: 'Tres generaciones de una familia de pescadores enfrentan el cambio de una ciudad costera que ya no los necesita.',
    genreIds: [18],
    voteAverage: 8.3,
    voteCount: 1870,
    popularity: 500,
    releaseDate: '2025-08-14',
    seasons: 2,
    episodes: 16,
    tags: ['topRated'],
  }),
  tv({
    title: 'Aula Cero',
    overview: 'En un instituto experimental de altas capacidades, la competencia académica esconde una red de manipulación entre alumnos.',
    genreIds: [18, 9648],
    voteAverage: 7.5,
    voteCount: 2100,
    popularity: 560,
    releaseDate: '2025-07-01',
    seasons: 1,
    episodes: 10,
    tags: ['topRated'],
  }),
  tv({
    title: 'Ruta Nocturna',
    overview: 'Un conductor de reparto nocturno se convierte, sin quererlo, en testigo de todos los secretos de su ciudad.',
    genreIds: [80, 18],
    voteAverage: 6.4,
    voteCount: 640,
    popularity: 240,
    releaseDate: '2025-05-22',
    seasons: 1,
    episodes: 8,
    tags: [],
  }),
];

export const ALL_MOCK: Record<MediaType, MockItem[]> = {
  movie: MOCK_MOVIES,
  tv: MOCK_TV,
};

export function toMediaDetails(item: MockItem): MediaDetails {
  const { tags: _tags, ...rest } = item;
  const genres = genresFor(item.mediaType).filter((g) => item.genreIds.includes(g.id));
  return {
    ...rest,
    genres,
    seasons: [],
    nextEpisode: null,
  };
}
