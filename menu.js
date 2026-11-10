(() => {
  "use strict";

  // ==========================================
  // 1. CONTROLE BÁSICO DO MENU LATERAL (MOBILE)
  // ==========================================
  const menu = document.getElementById("menuLateral");
  const abrir = document.getElementById("menuToggle");
  const fechar = document.getElementById("fecharMenu");
  const fundo = document.getElementById("fundoMenu");

  function definirMenu(aberto) {
    if (!menu || !abrir || !fundo) return;
    menu.classList.toggle("aberto", aberto);
    fundo.classList.toggle("visivel", aberto);
    abrir.setAttribute("aria-expanded", String(aberto));
    abrir.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = aberto ? "hidden" : "";
  }
  abrir?.addEventListener("click", () => definirMenu(!menu.classList.contains("aberto")));
  fechar?.addEventListener("click", () => definirMenu(false));
  fundo?.addEventListener("click", () => definirMenu(false));

  document.querySelectorAll(".menu-lateral a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 700px)").matches) definirMenu(false);
    });
  });

  document.getElementById("voltarTopo")?.addEventListener("click", () => window.scrollTo({top:0,behavior:"smooth"}));

  // ==========================================
  // 2. INJETAR OS NOVOS MENUS NA LATERAL
  // ==========================================
  const nav = document.querySelector(".menu-lateral nav");
  
  if (nav && !document.getElementById("grupoEletrico")) {
    // HTML com a estrutura completa (Sistemas -> Assuntos)
    const novosMenusHTML = `
      <div class="separador-menu"></div>
      <div class="titulo-menu-extra">Sistemas do Veículo</div>

      <button class="grupo-menu" aria-expanded="false" aria-controls="grupoEletrico">⚡ Sistema Elétrico <span>⌄</span></button>
      <div class="sub-menu" id="grupoEletrico">
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-eletrico/fusiveis-e-lampadas">Fusíveis e Lâmpadas</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-eletrico/luz-de-farol-e-posicao">Luz de Farol e Posição</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-eletrico/luz-de-seta-e-alerta">Luz de Seta e Alerta</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-eletrico/luz-e-pressao-de-oleo">Luz e Pressão de Óleo</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-eletrico/luzes-de-injecao">Luzes de Injeção</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-eletrico/agua-no-combustivel">Água no Combustível</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-eletrico/agua-de-arrefecimento">Água de Arrefecimento</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-eletrico/diagramas-eletrico">Diagrama Elétrico</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-eletrico/bateria-e-alternador">Bateria e Alternador</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-eletrico/motor-de-partida">Motor de Partida</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-eletrico/limpador-de-para-brisa">Limpador de Para-brisa</a>
      </div>

      <button class="grupo-menu" aria-expanded="false" aria-controls="grupoCombustivel">⛽ Alimentação <span>⌄</span></button>
      <div class="sub-menu" id="grupoCombustivel">
        <a href="https://reinaldo789.github.io/metiradosanha2/#alimentacao-de-combustivel/tanque-filtro-mang">Tanque, Filtro, Mangueiras</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#alimentacao-de-combustivel/bomba-eletrica">Bomba Elétrica</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#alimentacao-de-combustivel/bomba-engrenagem">Bomba de Engrenagem</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#alimentacao-de-combustivel/valvula-kuv">Válvula KUV</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#alimentacao-de-combustivel/bomba-alta-pressao">Bomba de Alta Pressão</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#alimentacao-de-combustivel/tubo-rail">Tubo Rail</a>
      </div>

      <button class="grupo-menu" aria-expanded="false" aria-controls="grupoInjecao">🔧 Injeção <span>⌄</span></button>
      <div class="sub-menu" id="grupoInjecao">
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-de-injecao/sensor-rotacao">Sensor de Rotação</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-de-injecao/sensor-fase">Sensor de Fase</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-de-injecao/sensor-pres-adm">Sensor de Pressão de Admissão</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-de-injecao/sensor-temp-ecm">Sensor de Temperatura ECM</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-de-injecao/sensor-pres-rail">Sensor de Pressão do Rail</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-de-injecao/valvula-mprop">Válvula MProp</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-de-injecao/pedal-acelerador">Pedal do Acelerador</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-de-injecao/modulador-turbina">Modulador da Turbina</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-de-injecao/bicos-injetores">Bicos Injetores</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#sistema-de-injecao/lampada-painel">Lâmpada do Painel</a>
      </div>

      <button class="grupo-menu" aria-expanded="false" aria-controls="grupoMotorChassi">🚗 Motor e Chassi <span>⌄</span></button>
      <div class="sub-menu" id="grupoMotorChassi">
        <a href="https://reinaldo789.github.io/metiradosanha2/#motor-e-chassi/dados-do-motor">Dados do Motor</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#motor-e-chassi/lubrificacao">Lubrificação e Revisão</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#motor-e-chassi/estudo-viscosidade-oleos">Tipos e Classificação do Óleo</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#motor-e-chassi/tabela-de-torque">Tabela de Torque (Nm)</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#motor-e-chassi/correia-e-ventoinha">Correia e Ventoinha</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#motor-e-chassi/bomba-de-agua">Bomba de Água</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#motor-e-chassi/trocador-de-calor">Trocador de Calor</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#motor-e-chassi/valvula-termostatica">Válvula Termostática</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#motor-e-chassi/bomba-de-direcao">Bomba de Direção</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#motor-e-chassi/caixa-de-direcao">Caixa de Direção</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#motor-e-chassi/eixo-dianteiro">Eixo Dianteiro</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#motor-e-chassi/bomba-de-vacuo">Bomba de Vácuo</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#motor-e-chassi/cilindro-de-freio">Cilindro de Freio</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#motor-e-chassi/oleo-de-freio">Óleo de Freio</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#motor-e-chassi/pincas-de-freio">Pinças de Freio</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#motor-e-chassi/regulagem-freio-de-mao">Regulagem Freio de Mão</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#motor-e-chassi/caixa-de-mudancas">Caixa de Mudanças</a>
      </div>

      <button class="grupo-menu" aria-expanded="false" aria-controls="grupoDiagInterativo">🔍 Diagnósticos <span>⌄</span></button>
      <div class="sub-menu" id="grupoDiagInterativo">
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/sensor-rotacao">Sensor de Rotação</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/sensor-fase">Sensor de Fase</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/sensor-pres-rail">Sensor de Pressão do Rail</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/sensor-pres-adm">Sensor de Pressão de Admissão</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/sensor-temp-ecm">Sensor de Temperatura Líquido</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/valvula-mprop">Válvula MProp</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/modulador-turbina">Modulador do Turbo</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/bicos-injetores">Bicos Injetores</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/rele-bomba-combustivel">Relé Bomba Combustível</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/rele-principal">Relé Principal K15</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/lampada-painel">Lâmpada do Painel</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/tensao-bateria">Tensão da Bateria</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/tensao-sensores">Tensão dos Sensores</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/sensor-pedal-freio">Interruptor Pedal Freio</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/sensor-pedal-embreagem">Interruptor Pedal Embreagem</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/motor-nao-pega">Motor Não Pega</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/limitacao-rotacao">Limitação de Rotação</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/fumaca-preta">Fumaça Preta</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/falha-acelerador">Falha do Acelerador</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/superaquecimento">Superaquecimento</a>
        <a href="https://reinaldo789.github.io/metiradosanha2/#diagnostico/baixa-pressao-oleo">Baixa Pressão de Óleo</a>
      </div>
    `;
    
    // Insere no final do menu lateral
    nav.insertAdjacentHTML("beforeend", novosMenusHTML);
  }

  // ==========================================
  // 3. LÓGICA DE ACORDEÃO E MEMÓRIA
  // ==========================================
  // Pega os menus que estavam abertos na página anterior
  let menusAbertos = JSON.parse(localStorage.getItem("menuAbertoSalvo") || "[]");

  // Aplica a lógica em todos os botões do menu
  document.querySelectorAll(".grupo-menu").forEach((botao) => {
    const subId = botao.getAttribute("aria-controls");
    const alvo = document.getElementById(subId);

    // Se o usuário tinha aberto este menu na outra página, mantém aberto
    if (alvo && menusAbertos.includes(subId)) {
      alvo.classList.add("aberto");
      botao.setAttribute("aria-expanded", "true");
    }

    // Clique para abrir/fechar
    botao.addEventListener("click", () => {
      if (!alvo) return;
      
      const vaiAbrir = !alvo.classList.contains("aberto");
      
      // Fecha todos os outros menus
      document.querySelectorAll(".sub-menu").forEach((sub) => sub.classList.remove("aberto"));
      document.querySelectorAll(".grupo-menu").forEach((b) => b.setAttribute("aria-expanded", "false"));
      
      if (vaiAbrir) {
        alvo.classList.add("aberto");
        botao.setAttribute("aria-expanded", "true");
        // Salva no navegador que este menu está aberto
        localStorage.setItem("menuAbertoSalvo", JSON.stringify([subId]));
      } else {
        // Se fechou, limpa a memória
        localStorage.setItem("menuAbertoSalvo", JSON.stringify([]));
      }
    });
  });
})();
