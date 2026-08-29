/* ============================================================
   GOLLINHO WMS — Web Mobile
   Sessão (sessionStorage, sem persistir depois que a aba fecha),
   guardas de rota e componentes de UI reaproveitados nas telas.
   ============================================================ */

const Sessao = {
  salvarUsuario(usuario) {
    sessionStorage.setItem('gollinho_usuario', JSON.stringify(usuario));
  },
  obterUsuario() {
    const bruto = sessionStorage.getItem('gollinho_usuario');
    return bruto ? JSON.parse(bruto) : null;
  },
  salvarDoca(doca) {
    sessionStorage.setItem('gollinho_doca', JSON.stringify(doca));
  },
  obterDoca() {
    const bruto = sessionStorage.getItem('gollinho_doca');
    return bruto ? JSON.parse(bruto) : null;
  },
  salvarNotaId(id) {
    sessionStorage.setItem('gollinho_nota_id', String(id));
  },
  obterNotaId() {
    return sessionStorage.getItem('gollinho_nota_id');
  },
  salvarPaleteId(id) {
    sessionStorage.setItem('gollinho_palete_id', String(id));
  },
  obterPaleteId() {
    return sessionStorage.getItem('gollinho_palete_id');
  },
  encerrar() {
    sessionStorage.clear();
    window.location.href = 'index.html';
  },
};

function exigirLogin() {
  if (!Sessao.obterUsuario()) {
    window.location.href = 'index.html';
    return null;
  }
  return Sessao.obterUsuario();
}

function exigirDoca() {
  const doca = Sessao.obterDoca();
  if (!doca) {
    window.location.href = 'docas.html';
    return null;
  }
  return doca;
}

function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

/** Monta a barra superior fixa: nome do usuário, doca ativa (se houver) e sair. */
function montarTopbar({ titulo, voltarPara = null } = {}) {
  const alvo = document.getElementById('topbar');
  if (!alvo) return;
  const usuario = Sessao.obterUsuario();
  const doca = Sessao.obterDoca();

  alvo.innerHTML = `
    <div class="topbar-linha">
      ${voltarPara ? `<a href="${voltarPara}" class="topbar-voltar" aria-label="Voltar">←</a>` : '<span class="topbar-voltar-espaco"></span>'}
      <div class="topbar-titulos">
        <strong>${escaparHtml(titulo || 'Gollinho WMS')}</strong>
        ${doca ? `<span class="topbar-doca">${escaparHtml(doca.descricao)}</span>` : ''}
      </div>
      <button type="button" class="btn btn-sm btn-outline-light topbar-sair" onclick="Sessao.encerrar()">Sair</button>
    </div>
    ${usuario ? `<div class="topbar-usuario">Operador: <strong>${escaparHtml(usuario.nome)}</strong></div>` : ''}
  `;
}

function mostrarCarregando(mostrar) {
  const el = document.getElementById('carregando');
  if (el) el.classList.toggle('d-none', !mostrar);
}

function badgeStatusNota(status) {
  const mapa = {
    AGUARDANDO_CONFERENCIA: ['bg-secondary', 'Aguardando conferência'],
    CONFERIDA: ['bg-success', 'Conferida'],
    DIVERGENTE: ['bg-danger', 'Divergente'],
  };
  const [classe, rotulo] = mapa[status] || ['bg-secondary', status];
  return `<span class="badge ${classe}">${rotulo}</span>`;
}

/** Overlay cheio de tela — usado no sucesso/erro da armazenagem e da conferência.
 *  O 409 de posição ocupada tem que ser impossível de não notar. */
function mostrarAlertaCheio({ tipo = 'erro', titulo, mensagem, textoBotao = 'Entendi', aoFechar = null }) {
  const antigo = document.getElementById('alerta-cheio');
  if (antigo) antigo.remove();

  const classeTipo = tipo === 'sucesso' ? 'sucesso' : tipo === 'aviso' ? 'aviso' : 'erro';
  const icone = tipo === 'sucesso' ? '✓' : tipo === 'aviso' ? '△' : '⚠';

  const div = document.createElement('div');
  div.id = 'alerta-cheio';
  div.className = `overlay-alerta overlay-${classeTipo}`;
  div.innerHTML = `
    <div class="overlay-icone">${icone}</div>
    <h2>${escaparHtml(titulo)}</h2>
    <p>${escaparHtml(mensagem)}</p>
    <button type="button" class="btn btn-light btn-lg touch-btn overlay-botao">${escaparHtml(textoBotao)}</button>
  `;
  document.body.appendChild(div);
  div.querySelector('.overlay-botao').addEventListener('click', () => {
    div.remove();
    if (aoFechar) aoFechar();
  });
}

function mostrarErroInline(container, erro) {
  const alvo = typeof container === 'string' ? document.getElementById(container) : container;
  if (!alvo) return;
  const mensagem = erro?.mensagem || 'Ocorreu um erro inesperado.';
  alvo.innerHTML = `<div class="alert alert-danger" role="alert">${escaparHtml(mensagem)}</div>`;
  alvo.classList.remove('d-none');
}

function limparInline(container) {
  const alvo = typeof container === 'string' ? document.getElementById(container) : container;
  if (!alvo) return;
  alvo.innerHTML = '';
  alvo.classList.add('d-none');
}
