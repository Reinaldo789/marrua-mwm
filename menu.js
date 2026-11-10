const navItems = document.querySelectorAll('.nav-item');
const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
const mainNav = document.getElementById('main-nav');
const toggleIcon = mobileToggleBtn.querySelector('i');

// ==========================================
// LÓGICA DO MENU MOBILE (SEM SANFONA)
// Cada item abre/fecha independentemente
// ==========================================
navItems.forEach(item => {
  const btn = item.querySelector('.nav-btn');
  
  btn.addEventListener('click', (e) => {
    if (window.innerWidth <= 960) {
      e.preventDefault();
      
      // Sanfona: ao abrir um item, fecha os outros
      const abrir = !item.classList.contains('active');
      navItems.forEach(i => i.classList.remove('active'));
      if (abrir) {
        item.classList.add('active');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  });
});

// Toggle Menu Hamburguer Mobile
mobileToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = mainNav.classList.toggle('active');
  
  // Bloqueia a rolagem do fundo do site quando o menu está aberto no celular
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }

  if (isOpen) {
    toggleIcon.classList.remove('fa-bars');
    toggleIcon.classList.add('fa-xmark');
  } else {
    toggleIcon.classList.remove('fa-xmark');
    toggleIcon.classList.add('fa-bars');
    // Fecha todos os itens ao fechar o menu hambúrguer
    navItems.forEach(item => item.classList.remove('active'));
  }
});

// ==========================================
// BOTÃO VOLTAR AO TOPO
// ==========================================
const btnTop = document.getElementById('btn-top');
const cabecalho = document.querySelector('.site-wrapper > header');
window.addEventListener('scroll', () => {
  cabecalho.classList.toggle('scrolled', window.scrollY > 20);
  if (window.scrollY > 150) {
    btnTop.classList.add('visible');
  } else {
    btnTop.classList.remove('visible');
  }
});

btnTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ==========================================
// CARREGAR PÁGINAS DE conteudo/<menu>/<item>.html
// ==========================================
const home = document.getElementById('home-box');
const card = document.getElementById('page-card');

async function abrirPagina() {
  const path = decodeURIComponent(location.hash.slice(1)).replace(/^\/+/, '');
  document.querySelectorAll('.mega-link-item.active').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('.nav-btn.atual').forEach(b => b.classList.remove('atual'));

  // sem rota válida = Home
  if (!/^[a-z0-9-]+\/[a-z0-9-]+$/.test(path)) {
    card.hidden = true; home.hidden = false;
    return;
  }

  // o mesmo endereço pode existir em mais de um menu: marca todos
  const links = document.querySelectorAll(`a[href="#${path}"]`);
  const link = links[0];
  links.forEach(a => {
    if (a.classList.contains('mega-link-item')) {
      a.classList.add('active');
      a.closest('.nav-item')?.querySelector('.nav-btn')?.classList.add('atual');
    }
  });
  const menu = link ? link.closest('.nav-item').querySelector('.nav-btn span').textContent.trim() : '';
  const titulo = !link ? '' :
    link.classList.contains('explore-link')
      ? link.closest('.mega-explore-side').querySelector('h5').textContent.trim()
      : link.textContent.trim();

  home.hidden = true; card.hidden = false;
  card.innerHTML = '<p class="page-loading">Carregando...</p>';
  window.scrollTo({ top: 0 });

  try {
    const resp = await fetch(`conteudo/${path}.html`);
    if (!resp.ok) throw new Error(`Página não encontrada (${resp.status})`);
    const corpo = await resp.text();
    if (decodeURIComponent(location.hash.slice(1)) !== path) return;
    card.innerHTML = `<div class="page-crumb"><a href="#">Início</a> › ${menu}</div><h1>${titulo}</h1>${corpo}`;
    melhorarArtigo();
  } catch (err) {
    card.innerHTML = `<h1>Erro</h1><p>${err.message}. Se estiver abrindo o arquivo direto no computador, use um servidor (GitHub Pages ou <code>python -m http.server</code>).</p>`;
  }
}

// clicou num item: fecha o menu (celular) ou o painel (desktop)
document.querySelectorAll('.mega-menu a').forEach(a => {
  a.addEventListener('click', () => {
    if (window.innerWidth <= 960) {
      if (mainNav.classList.contains('active')) mobileToggleBtn.click();
    } else {
      const item = a.closest('.nav-item');
      item.classList.add('closed');
      item.addEventListener('mouseleave', () => item.classList.remove('closed'), { once: true });
    }
  });
});

window.addEventListener('hashchange', abrirPagina);
abrirPagina();

// índice interno dos artigos: <a data-goto="id"> rola até o título
card.addEventListener('click', (e) => {
  const alvo = e.target.closest('[data-goto]');
  if (!alvo) return;
  e.preventDefault();
  const el = document.getElementById(alvo.dataset.goto);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ==========================================
// BUSCA DA PÁGINA INICIAL
// Procura nos títulos do menu e, se existir busca.json
// (gerado por gerar_busca.py), também no texto das páginas
// e nos códigos de falha (P0652, P0087...).
// ==========================================
const busca = document.getElementById('home-search');
const resultados = document.getElementById('home-results');
if (busca) {
  const itens = [...document.querySelectorAll('.mega-link-item')].map(a => ({
    nome: a.textContent.trim(),
    href: a.getAttribute('href'),
    menu: a.closest('.nav-item').querySelector('.nav-btn span').textContent.trim()
  }));
  const porHref = new Map(itens.map(i => [i.href, i]));
  const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const bonito = s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // busca.json é opcional: sem ele a busca continua só nos títulos
  let indice = null;
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
        const exato = p.codigos.find(c => c.toLowerCase() === q);
        const parcial = exato || p.codigos.find(c => c.toLowerCase().includes(q));
        let n = exato ? 90 : parcial ? 60 : 0;
        if (p.texto.includes(q)) n += 10;
        if (!n) return;
        const base = porHref.get(p.url) || { nome: p.titulo, href: p.url, menu: bonito(p.menu) };
        const antigo = achados.get(p.url);
        achados.set(p.url, { ...base, n: (antigo ? antigo.n : 0) + n, cod: exato || parcial || (antigo && antigo.cod) });
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

// ==========================================
// ARTIGOS: abas, acordeão, imagens e caixa de diálogo
// ==========================================
const lb = document.createElement('dialog');
lb.className = 'lightbox';
lb.innerHTML = '<button type="button" class="lb-close" aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button><img alt=""><p></p>';
document.body.append(lb);
const lbImg = lb.querySelector('img');
const lbTxt = lb.querySelector('p');

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
lb.addEventListener('click', e => {
  if (e.target === lb || e.target.closest('.lb-close')) lb.close();
});

function rolarPara(el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

function mostrarPasso(f, id, rolar = true) {
  f.querySelectorAll('.passo').forEach(p => p.classList.toggle('on', p.id === id));
  if (rolar) f.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function ativarAba(bar, panels, i) {
  [...bar.children].forEach((b, j) => b.classList.toggle('on', j === i));
  panels.forEach((p, j) => p.classList.toggle('on', j === i));
}

// monta (ou refaz) o índice "Neste artigo" a partir dos títulos h2 e h3 da página,
// então não é preciso editar o índice à mão em cada arquivo de conteudo/
function slugTitulo(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'secao';
}
function montarIndice() {
  // h3 que está dentro de um bloco .componente usa o id do bloco
  const alvoDe = h => (h.tagName === 'H3' && h.parentElement.classList.contains('componente') && h.parentElement.id) || h.id;
  const titulos = [...card.querySelectorAll(':scope > h2, :scope > h3, :scope > .componente > h3')];
  if (!titulos.length) return;
  const usados = new Set([...card.querySelectorAll('[id]')].map(e => e.id));
  titulos.forEach(h => {          // título sem id ganha um
    if (alvoDe(h)) return;
    const base = slugTitulo(h.textContent);
    let id = base, n = 2;
    while (usados.has(id)) id = base + '-' + n++;
    h.id = id; usados.add(id);
  });
  let toc = card.querySelector('.toc');
  if (!toc) {                     // página antiga sem índice: cria se tiver 2 ou mais seções
    if (titulos.filter(h => h.tagName === 'H2').length < 2) return;
    toc = document.createElement('nav');
    toc.className = 'toc';
    toc.setAttribute('aria-label', 'Neste artigo');
    const ref = card.querySelector('.art-head') || card.querySelector(':scope > h1');
    if (ref) ref.after(toc); else card.prepend(toc);
  }
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

// true = cada título h2 vira uma aba (e o índice "Neste artigo" some)
// false = mantém o índice "Neste artigo" com sub-itens e a página rola normalmente
const USAR_ABAS = false;

function melhorarArtigo() {
  // o artigo já traz o próprio título
  if (card.querySelector('.art-head')) card.querySelector(':scope > h1')?.remove();

  montarIndice();

  // imagem que não existe vira uma caixa com a legenda
  card.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      const d = document.createElement('div');
      d.className = 'img-falta';
      d.innerHTML = '<i class="fa-regular fa-image"></i><span></span>';
      d.querySelector('span').textContent = img.alt || 'Imagem';
      img.replaceWith(d);
    }, { once: true });
  });

  // blocos de 2-3 colunas viram mini abas
  card.querySelectorAll('.trio').forEach(trio => {
    const cols = [...trio.children];
    const bar = document.createElement('div');
    bar.className = 'mini-tabs';
    cols.forEach(c => {
      const h = c.querySelector('h4');
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
  card.querySelectorAll('.fluxo').forEach(f => {
    f._hist = [];
    f.querySelectorAll('.passo').forEach(p => {
      const nav = document.createElement('div');
      nav.className = 'fluxo-nav';
      nav.innerHTML = '<button type="button" data-voltar>← Voltar</button><button type="button" data-reiniciar>↺ Recomeçar</button>';
      p.append(nav);
    });
    mostrarPasso(f, f.querySelector('.passo').id, false);
  });

  // códigos de falha em acordeão
  card.querySelectorAll('.codigos').forEach(c => c.classList.add('enh'));

  // cada título h2 vira uma aba
  const h2s = [...card.querySelectorAll(':scope > h2')];
  if (USAR_ABAS && h2s.length >= 3) {
    const bar = document.createElement('div');
    bar.className = 'art-tabs';
    bar.setAttribute('role', 'tablist');
    const panels = h2s.map((h, i) => {
      const sec = document.createElement('section');
      sec.className = 'art-panel';
      h.before(sec);
      let n = h;
      do { const nx = n.nextElementSibling; sec.append(n); n = nx; } while (n && !n.matches('h2'));
      const b = document.createElement('button');
      b.type = 'button';
      const num = document.createElement('em');
      num.textContent = i + 1;
      b.append(num, h.textContent);
      bar.append(b);
      return sec;
    });
    panels.forEach((p, i) => {
      const nav = document.createElement('div');
      nav.className = 'aba-nav';
      nav.innerHTML =
        (i > 0 ? `<button type="button" data-aba="${i - 1}">← ${h2s[i - 1].textContent}</button>` : '<span></span>') +
        '<button type="button" data-indice>↑ Índice</button>' +
        (i < panels.length - 1 ? `<button type="button" data-aba="${i + 1}">${h2s[i + 1].textContent} →</button>` : '<span></span>');
      p.append(nav);
    });
    const lab = document.createElement('p');
    lab.className = 'art-index-title';
    lab.textContent = 'Neste artigo — toque numa seção';
    panels[0].before(lab, bar);
    card.querySelector('.toc')?.remove();
    ativarAba(bar, panels, 0);
  }
}

card.addEventListener('click', e => {
  const fl = e.target.closest('.fluxo');
  if (fl) {
    const ir = e.target.closest('[data-ir]');
    if (ir) { fl._hist.push(ir.closest('.passo').id); mostrarPasso(fl, ir.dataset.ir); return; }
    if (e.target.closest('[data-voltar]')) { const id = fl._hist.pop(); if (id) mostrarPasso(fl, id); return; }
    if (e.target.closest('[data-reiniciar]')) { fl._hist = []; mostrarPasso(fl, fl.querySelector('.passo').id); return; }
  }
  const tab = e.target.closest('.mini-tabs button, .art-tabs button');
  if (tab) {
    const bar = tab.parentElement;
    const principal = bar.classList.contains('art-tabs');
    const panels = [...bar.parentElement.querySelectorAll(principal ? ':scope > .art-panel' : ':scope > .mini-panel')];
    const idx = [...bar.children].indexOf(tab);
    ativarAba(bar, panels, idx);
    if (principal) rolarPara(window.innerWidth <= 960 ? panels[idx] : bar);
    return;
  }
  const nav = e.target.closest('[data-aba]');
  if (nav) {
    const bar = card.querySelector('.art-tabs');
    const panels = [...card.querySelectorAll(':scope > .art-panel')];
    ativarAba(bar, panels, +nav.dataset.aba);
    rolarPara(panels[+nav.dataset.aba]);
    return;
  }
  if (e.target.closest('[data-indice]')) { rolarPara(card.querySelector('.art-index-title')); return; }
  const cod = e.target.closest('.codigos.enh .codigo');
  if (cod && !e.target.closest('a')) { cod.classList.toggle('open'); return; }
  const link = e.target.closest('a.img-link');
  if (link) { e.preventDefault(); abrirImagem(link.href, link.textContent.trim()); return; }
  const im = e.target.closest('img');
  if (im) abrirImagem(im.currentSrc || im.src, im.alt);
});

cabecalho.classList.toggle('scrolled', window.scrollY > 20);

lbImg.addEventListener('click', () => lbImg.classList.toggle('zoom'));

// ==========================================
// FILTRO DO GUIA DE DIAGNÓSTICO (campo .filtro-diag)
// Esconde os grupos (data-grp) que não contêm o texto digitado
// ==========================================
const semAcento = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
card.addEventListener('input', e => {
  const campo = e.target.closest('.filtro-diag');
  if (!campo) return;
  const q = semAcento(campo.value.trim());
  const grupos = new Map();
  card.querySelectorAll('[data-grp]').forEach(el => {
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
  const info = card.querySelector('.filtro-info');
  if (info) info.textContent = q ? (achou ? achou + ' de ' + grupos.size + ' grupos' : 'Nada encontrado') : '';
});
