/* ============================================================
   GOLLINHO WMS — Web Mobile
   Constantes e regras de negócio (espelha o core/config.ts do Angular)
   ============================================================ */

/** Trocar por IP da rede na hora da demo: 'http://192.168.x.x:9999/api' */
const API_URL = 'http://localhost:9999/api';

/** true = dados falsos locais (funciona sem o backend). false = backend real.
 *  Única mudança necessária na hora da integração. */
const USAR_MOCK = false;

/* ===== Regras de negócio do galpão Gollinho ===== */
const RUAS = 6;
const ANDARES = 4;
const POSICOES_POR_ANDAR = 8;
const POSICOES_POR_RUA = ANDARES * POSICOES_POR_ANDAR; // 32
const TOTAL_POSICOES = RUAS * POSICOES_POR_RUA; // 192

const FARDOS_POR_PALETE = 100;
const GARRAFAS_POR_FARDO = 6;
const LITROS_POR_GARRAFA = 2;
const GARRAFAS_POR_PALETE = FARDOS_POR_PALETE * GARRAFAS_POR_FARDO; // 600
const LITROS_POR_PALETE = GARRAFAS_POR_PALETE * LITROS_POR_GARRAFA; // 1200

const TOTAL_DOCAS = 4;

/** R01-A03-P05 */
function formatarEndereco(rua, andar, posicao) {
  const p = (n) => String(n).padStart(2, '0');
  return `R${p(rua)}-A${p(andar)}-P${p(posicao)}`;
}

/** Quantos paletes uma quantidade de fardos gera (arredonda pra cima) */
function paletesDeFardos(fardos) {
  if (!fardos || fardos <= 0) return 0;
  return Math.ceil(fardos / FARDOS_POR_PALETE);
}

/** ISO (2026-09-02) para pt-BR sem passar pelo fuso do Date */
function formatarData(iso) {
  if (!iso) return '-';
  const [ano, mes, dia] = String(iso).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}
