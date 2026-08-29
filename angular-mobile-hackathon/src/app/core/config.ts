/** Trocar por IP na hora da demo: 'http://192.168.x.x:8080/api' */
export const API_URL = 'http://localhost:8080/api';

/** true = dados falsos locais. false = backend real. Unica mudanca na integracao. */
export const USAR_MOCK = true;

/** ===== Regras de negocio do galpao Gollinho ===== */
export const RUAS = 6;
export const ANDARES = 4;
export const POSICOES_POR_ANDAR = 8;
export const POSICOES_POR_RUA = ANDARES * POSICOES_POR_ANDAR; // 32
export const TOTAL_POSICOES = RUAS * POSICOES_POR_RUA; // 192

export const FARDOS_POR_PALETE = 100;
export const GARRAFAS_POR_FARDO = 6;
export const LITROS_POR_GARRAFA = 2;
export const GARRAFAS_POR_PALETE = FARDOS_POR_PALETE * GARRAFAS_POR_FARDO; // 600
export const LITROS_POR_PALETE = GARRAFAS_POR_PALETE * LITROS_POR_GARRAFA; // 1200

export const TOTAL_DOCAS = 4;

/** R01-A03-P05 */
export function formatarEndereco(rua: number, andar: number, posicao: number): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `R${p(rua)}-A${p(andar)}-P${p(posicao)}`;
}

/** ISO (2026-09-02) para pt-BR sem passar pelo fuso do Date */
export function formatarData(iso: string | null | undefined): string {
  if (!iso) return '-';
  const [ano, mes, dia] = iso.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Quantos paletes uma quantidade de fardos gera (arredonda pra cima) */
export function paletesDeFardos(fardos: number): number {
  if (!fardos || fardos <= 0) return 0;
  return Math.ceil(fardos / FARDOS_POR_PALETE);
}
