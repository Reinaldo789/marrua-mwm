'use strict';

/* ==========================================================
   GUIA TÉCNICO MARRUA MWM 2.8 — menu.js
   1 Utilidades · 2 Menu · 3 Rolagem · 4 Páginas (conteudo/)
   5 Busca da home · 6 Artigos · 7 Filtro de diagnóstico
   ========================================================== */

/* ---------- 1. UTILIDADES ---------- */
const $  = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const esc  = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// true = cada título h2 vira uma aba (e o índice "Neste artigo" some)
// false = mantém o índice "Neste artigo" e a página rola normalmente
const USAR_ABAS = false;

const header     = $('.site-header');
const nav        = $('#main-nav');
const toggle     = $('#mobile-toggle-btn');
const toggleIcon = $('i', toggle);
const toggleTexto = $('.toggle-label', toggle);
const navItems   = $$('.nav-item');
const btnTop     = $('#btn-top');
const home       = $('#home-box');
const card       = $('#page-card');
const celular    = matchMedia('(max-width: 960px)');

/* ---------- 2. MENU ---------- */
function abrirMenu(aberto) {
  nav.classList.toggle('active', aberto);
  document.body.style.overflow = aberto ? 'hidden' : '';   // trava a rolagem do fundo
  toggle.setAttribute('aria-expanded', aberto);
  toggleIcon.classList.toggle('fa-bars', !aberto);
  toggleIcon.classList.toggle('fa-xmark', aberto);
  toggleTexto.textContent = aberto ? 'Fechar Menu' : 'Menu';
  if (!aberto) marcarItem(null);
}

// sanfona: só um item aberto por vez (celular)
function marcarItem(aberto) {
  navItems.forEach(item => {
    const ativo = item === aberto;
    item.classList.toggle('active', ativo);
    $('.nav-btn', item).setAttribute('aria-expanded', ativo);
  });
}

toggle.addEventListener('click', () => abrirMenu(!nav.classList.contains('active')));
celular.addEventListener('change', e => { if (!e.matches) abrirMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('active')) abrirMenu(false); });

nav.addEventListener('click', e => {
  const btn = e.target.closest('.nav-btn');
  if (btn) {
    if (!celular.matches) return;                     // no computador o menu abre ao passar o mouse
    const item = btn.closest('.nav-item');
    const abrir = !item.classList.contains('active');
    marcarItem(abrir ? item : null);
    if (abrir) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }
  const link = e.target.closest('.mega-menu a');
  if (!link) return;
  if (celular.matches) {
    abrirMenu(false);                                 // celular: fecha o painel
  } else {                                            // computador: fecha o suspenso até o mouse sair
    const item = link.closest('.nav-item');
    item.classList.add('closed');
    item.addEventListener('mouseleave', () => item.classList.remove('closed'), { once: true });
  }
});

/* ---------- 3. ROLAGEM ---------- */
let rolando = false;
function aoRolar() {
  rolando = false;
  header.classList.toggle('scrolled', scrollY > 20);
  btnTop.classList.toggle('visible', scrollY > 150);
}
addEventListener('scroll', () => {
  if (!rolando) { rolando = true; requestAnimationFrame(aoRolar); }
}, { passive: true });
aoRolar();
btnTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------- 4. PÁGINAS: conteudo/<menu>/<item>.html ---------- */
async function abrirPagina() {
  const path = decodeURIComponent(location.hash.slice(1)).replace(/^\/+/, '');
  $$('.mega-link-item.active').forEach(a => a.classList.remove('active'));
  $$('.nav-btn.atual').forEach(b => b.classList.remove('atual'));

  // sem rota válida = Home
  if (!/^[a-z0-9-]+\/[a-z0-9-]+$/.test(path)) {
    card.hidden = true; home.hidden = false;
    return;
  }

  // o mesmo endereço pode existir em mais de um menu: marca todos
  const links = $$(`a[href="#${path}"]`);
  links.filter(a => a.classList.contains('mega-link-item')).forEach(a => {
    a.classList.add('active');
    $('.nav-btn', a.closest('.nav-item')).classList.add('atual');
  });

  const link  = links.find(a => a.closest('.nav-item')) || links[0];   // prefere o link do menu
  const menu  = link?.closest('.nav-item')?.querySelector('.nav-btn span').textContent.trim() ?? '';
  const titulo = !link ? '' :
    link.classList.contains('explore-link')
      ? link.closest('.mega-explore-side').querySelector('h5').textContent.trim()
      : link.textContent.trim();

  home.hidden = true; card.hidden = false;
  card.innerHTML = '<p class="page-loading">Carregando...</p>';
  scrollTo({ top: 0 });

  try {
    const resp = await fetch(`conteudo/${path}.html`);
    if (!resp.ok) throw new Error(`Página não encontrada (${resp.status})`);
    const corpo = await resp.text();
    if (decodeURIComponent(location.hash.slice(1)) !== path) return;   // o usuário já foi para outra página
    card.innerHTML = `<div class="page-crumb"><a href="#">Início</a>${menu ? ' › ' + menu : ''}</div><h1>${titulo}</h1>${corpo}`;
    melhorarArtigo();
  } catch (err) {
    card.innerHTML = `<h1>Erro</h1><p>${err.message}. Se estiver abrindo o arquivo direto no computador, use um servidor (GitHub Pages ou <code>python -m http.server</code>).</p>`;
  }
}
addEventListener('hashchange', abrirPagina);

/* ---------- 5. BUSCA DA PÁGINA INICIAL ----------
   Procura nos títulos do menu e, se existir busca.json (gerado por
   gerar_busca.py), também no texto das páginas e nos códigos de falha. */
const busca = $('#home-search');
const resultados = $('#home-results');
if (busca) {
  const itens = $$('.mega-link-item').map(a => ({
    nome: a.textContent.trim(),
    href: a.getAttribute('href'),
    menu: $('.nav-btn span', a.closest('.nav-item')).textContent.trim()
  }));
  const porHref = new Map(itens.map(i => [i.href, i]));
  const bonito  = s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  let indice = null;   // busca.json é opcional: sem ele a busca fica só nos títulos
  const carregarIndice = () => indice ? Promise.resolve(indice) :
    fetch('busca.json').then(r => r.ok ? r.json() : []).catch(() => []).then(j => (indice = j));
  busca.addEventListener('focus', carregarIndice, { once: true });

  let rodada = 0;
  busca.addEventListener('input', async () => {
    const q = norm(busca.value.trim());
    const minha = ++rodada;
    if (!q) { resultados.hidden = true; return; }

    const achados = new Map();   // href -> { nome, menu, href, n, cod }
    itens.forEach(i => { if (norm(i.nome).includes(q)) achados.set(i.href, { ...i, n: 100 }); });

    if (q.length >= 3) {
      const dados = await carregarIndice();
      if (minha !== rodada) return;          // o usuário já digitou outra coisa
      dados.forEach(p => {
        const exato   = p.codigos.find(c => c.toLowerCase() === q);
        const parcial = exato || p.codigos.find(c => c.toLowerCase().includes(q));
        let n = exato ? 90 : parcial ? 60 : 0;
        if (p.texto.includes(q)) n += 10;
        if (!n) return;
        const base   = porHref.get(p.url) || { nome: p.titulo, href: p.url, menu: bonito(p.menu) };
        const antigo = achados.get(p.url);
        achados.set(p.url, { ...base, n: (antigo ? antigo.n : 0) + n, cod: exato || parcial || antigo?.cod });
      });
    }

    const achou = [...achados.values()].sort((a, b) => b.n - a.n).slice(0, 8);
    resultados.innerHTML = achou.length
      ? achou.map(i => `<a href="${i.href}">${esc(i.nome)}<small>${i.cod ? 'Código ' + i.cod + ' · ' : ''}${esc(i.menu)}</small></a>`).join('')
      : '<p>Nada encontrado.</p>';
    resultados.hidden = false;
  });
  resultados.addEventListener('click', () => { resultados.hidden = true; busca.value = ''; });
  document.addEventListener('click', e => { if (!e.target.closest('.home-search')) resultados.hidden = true; });
}

/* ---------- 6. ARTIGOS: abas, acordeão, imagens e caixa de diálogo ---------- */
const lb = document.createElement('dialog');
lb.className = 'lightbox';
lb.innerHTML = '<button type="button" class="lb-close" aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button><img alt=""><p></p>';
document.body.append(lb);
const lbImg = $('img', lb);
const lbTxt = $('p', lb);

function abrirImagem(src, legenda) {
  lbImg.hidden = false;
  lbImg.classList.remove('zoom');
  lbImg.src = src;
  lbImg.alt = legenda;
  lbTxt.textContent = legenda;
  lb.showModal();
}
lbImg.addEventListener('error', () => {
  lbImg.hidden = true;
  lbTxt.textContent = 'Imagem ainda não adicionada: ' + lbTxt.textContent;
});
lbImg.addEventListener('click', () => lbImg.classList.toggle('zoom'));
lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('.lb-close')) lb.close(); });

const rolarPara = el => el.scrollIntoView({ behavior: 'smooth', block: 'start' });

function mostrarPasso(f, id, rolar = true) {
  $$('.passo', f).forEach(p => p.classList.toggle('on', p.id === id));
  if (rolar) f.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function ativarAba(bar, panels, i) {
  [...bar.children].forEach((b, j) => b.classList.toggle('on', j === i));
  panels.forEach((p, j) => p.classList.toggle('on', j === i));
}

// monta (ou refaz) o índice "Neste artigo" a partir dos títulos h2 e h3,
// então não é preciso editar o índice à mão em cada arquivo de conteudo/
const slugTitulo = s => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'secao';

function montarIndice() {
  // h3 dentro de um bloco .componente usa o id do bloco
  const alvoDe = h => (h.tagName === 'H3' && h.parentElement.classList.contains('componente') && h.parentElement.id) || h.id;
  const titulos = $$(':scope > h2, :scope > h3, :scope > .componente > h3', card);
  if (!titulos.length) return;

  const usados = new Set($$('[id]', card).map(e => e.id));
  titulos.forEach(h => {          // título sem id ganha um
    if (alvoDe(h)) return;
    const base = slugTitulo(h.textContent);
    let id = base, n = 2;
    while (usados.has(id)) id = base + '-' + n++;
    h.id = id; usados.add(id);
  });

  let toc = $('.toc', card);
  if (!toc) {                     // página antiga sem índice: cria se tiver 2 ou mais seções
    if (titulos.filter(h => h.tagName === 'H2').length < 2) return;
    toc = document.createElement('nav');
    toc.className = 'toc';
    toc.setAttribute('aria-label', 'Neste artigo');
    const ref = $('.art-head', card) || $(':scope > h1', card);
    if (ref) ref.after(toc); else card.prepend(toc);
  }

  let html = '<strong>Neste artigo</strong><ul>', aberto = false, sub = false;
  titulos.forEach(h => {
    const a = `<a href="#" data-goto="${alvoDe(h)}">${esc(h.textContent.trim())}</a>`;
    if (h.tagName === 'H2') {
      if (sub) html += '</ul>';
      if (aberto) html += '</li>';
      html += `<li>${a}`; aberto = true; sub = false;
    } else {
      if (!aberto) { html += '<li>'; aberto = true; }
      if (!sub) { html += '<ul>'; sub = true; }
      html += `<li>${a}</li>`;
    }
  });
  if (sub) html += '</ul>';
  if (aberto) html += '</li>';
  toc.innerHTML = html + '</ul>';
}

function melhorarArtigo() {
  if ($('.art-head', card)) $(':scope > h1', card)?.remove();   // o artigo já traz o próprio título
  montarIndice();

  // imagem que não existe vira uma caixa com a legenda
  $$('img', card).forEach(img => {
    img.addEventListener('error', () => {
      const d = document.createElement('div');
      d.className = 'img-falta';
      d.innerHTML = '<i class="fa-regular fa-image"></i><span></span>';
      $('span', d).textContent = img.alt || 'Imagem';
      img.replaceWith(d);
    }, { once: true });
  });

  // blocos de 2-3 colunas viram mini abas
  $$('.trio', card).forEach(trio => {
    const cols = [...trio.children];
    const bar = document.createElement('div');
    bar.className = 'mini-tabs';
    cols.forEach(c => {
      const h = $('h4', c);
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = h.textContent;
      bar.append(b);
      c.classList.add('mini-panel');
      h.hidden = true;
    });
    trio.prepend(bar);
    trio.classList.add('enh');
    ativarAba(bar, cols, 0);
  });

  // fluxogramas de diagnóstico (Sim / Não)
  $$('.fluxo', card).forEach(f => {
    f._hist = [];
    $$('.passo', f).forEach(p => {
      const navegacao = document.createElement('div');
      navegacao.className = 'fluxo-nav';
      navegacao.innerHTML = '<button type="button" data-voltar>← Voltar</button><button type="button" data-reiniciar>↺ Recomeçar</button>';
      p.append(navegacao);
    });
    mostrarPasso(f, $('.passo', f).id, false);
  });

  // códigos de falha em acordeão
  $$('.codigos', card).forEach(c => c.classList.add('enh'));

  // cada título h2 vira uma aba
  const h2s = $$(':scope > h2', card);
  if (!USAR_ABAS || h2s.length < 3) return;

  const bar = document.createElement('div');
  bar.className = 'art-tabs';
  bar.setAttribute('role', 'tablist');
  const panels = h2s.map((h, i) => {
    const sec = document.createElement('section');
    sec.className = 'art-panel';
    h.before(sec);
    let n = h;
    do { const prox = n.nextElementSibling; sec.append(n); n = prox; } while (n && !n.matches('h2'));
    const b = document.createElement('button');
    b.type = 'button';
    const num = document.createElement('em');
    num.textContent = i + 1;
    b.append(num, h.textContent);
    bar.append(b);
    return sec;
  });
  panels.forEach((p, i) => {
    const navegacao = document.createElement('div');
    navegacao.className = 'aba-nav';
    navegacao.innerHTML =
      (i > 0 ? `<button type="button" data-aba="${i - 1}">← ${esc(h2s[i - 1].textContent)}</button>` : '<span></span>') +
      '<button type="button" data-indice>↑ Índice</button>' +
      (i < panels.length - 1 ? `<button type="button" data-aba="${i + 1}">${esc(h2s[i + 1].textContent)} →</button>` : '<span></span>');
    p.append(navegacao);
  });
  const rotulo = document.createElement('p');
  rotulo.className = 'art-index-title';
  rotulo.textContent = 'Neste artigo — toque numa seção';
  panels[0].before(rotulo, bar);
  $('.toc', card)?.remove();
  ativarAba(bar, panels, 0);
}

// um único ouvinte de cliques para tudo que existe dentro do artigo
card.addEventListener('click', e => {
  const alvo = e.target;

  const goto = alvo.closest('[data-goto]');              // índice interno
  if (goto) {
    e.preventDefault();
    const el = document.getElementById(goto.dataset.goto);
    if (el) rolarPara(el);
    return;
  }

  const fl = alvo.closest('.fluxo');                     // fluxograma
  if (fl) {
    const ir = alvo.closest('[data-ir]');
    if (ir) { fl._hist.push(ir.closest('.passo').id); mostrarPasso(fl, ir.dataset.ir); return; }
    if (alvo.closest('[data-voltar]')) { const id = fl._hist.pop(); if (id) mostrarPasso(fl, id); return; }
    if (alvo.closest('[data-reiniciar]')) { fl._hist = []; mostrarPasso(fl, $('.passo', fl).id); return; }
  }

  const aba = alvo.closest('.mini-tabs button, .art-tabs button');   // abas
  if (aba) {
    const bar = aba.parentElement;
    const principal = bar.classList.contains('art-tabs');
    const panels = $$(principal ? ':scope > .art-panel' : ':scope > .mini-panel', bar.parentElement);
    const idx = [...bar.children].indexOf(aba);
    ativarAba(bar, panels, idx);
    if (principal) rolarPara(celular.matches ? panels[idx] : bar);
    return;
  }

  const irAba = alvo.closest('[data-aba]');
  if (irAba) {
    const panels = $$(':scope > .art-panel', card);
    ativarAba($('.art-tabs', card), panels, +irAba.dataset.aba);
    rolarPara(panels[+irAba.dataset.aba]);
    return;
  }
  if (alvo.closest('[data-indice]')) { rolarPara($('.art-index-title', card)); return; }

  const cod = alvo.closest('.codigos.enh .codigo');      // códigos de falha
  if (cod && !alvo.closest('a')) { cod.classList.toggle('open'); return; }

  const linkImg = alvo.closest('a.img-link');            // imagens
  if (linkImg) { e.preventDefault(); abrirImagem(linkImg.href, linkImg.textContent.trim()); return; }
  const img = alvo.closest('img');
  if (img) abrirImagem(img.currentSrc || img.src, img.alt);
});

/* ---------- 7. FILTRO DO GUIA DE DIAGNÓSTICO (campo .filtro-diag) ----------
   Esconde os grupos (data-grp) que não contêm o texto digitado */
card.addEventListener('input', e => {
  const campo = e.target.closest('.filtro-diag');
  if (!campo) return;
  const q = norm(campo.value.trim());
  const grupos = new Map();
  $$('[data-grp]', card).forEach(el => {
    if (!grupos.has(el.dataset.grp)) grupos.set(el.dataset.grp, []);
    grupos.get(el.dataset.grp).push(el);
  });
  let achou = 0;
  grupos.forEach(els => {
    const cab = els.find(el => el.dataset.busca !== undefined);
    const ok = !q || (cab && cab.dataset.busca.includes(q));
    els.forEach(el => { el.hidden = !ok; });
    if (ok) achou++;
  });
  const info = $('.filtro-info', card);
  if (info) info.textContent = q ? (achou ? `${achou} de ${grupos.size} grupos` : 'Nada encontrado') : '';
});

/* ---------- INÍCIO ---------- */
abrirPagina();
