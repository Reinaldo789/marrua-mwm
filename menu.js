// Selecionando os elementos da Sidebar
const sidebar = document.querySelector(".sidebar");
const sidebarOpenBtn = document.querySelector("#sidebar-open");
const sidebarCloseBtn = document.querySelector("#sidebar-close");

// Função para abrir/fechar a sidebar no Desktop (Empurrando o conteúdo)
const toggleSidebarDesktop = () => {
  sidebar.classList.toggle("close");
  // Adiciona/remove a classe no body para ajustar a margem do site
  document.body.classList.toggle("sidebar-closed");
};

// Função para abrir/fechar a sidebar no Celular (Deslizando por cima)
const toggleSidebarMobile = () => {
  sidebar.classList.toggle("open-mobile");
};

// --- EVENTOS ---

// 1. Clicar na setinha dentro da sidebar (Desktop)
sidebarCloseBtn.addEventListener("click", () => {
  if (window.innerWidth > 960) {
    toggleSidebarDesktop();
  } else {
    toggleSidebarMobile(); // No mobile a setinha fecha, mas ela está escondida
  }
});

// 2. Clicar no ícone de Hambúrguer (Abre no Mobile ou Desktop)
sidebarOpenBtn.addEventListener("click", () => {
  if (window.innerWidth <= 960) {
    toggleSidebarMobile();
  } else {
    // Se estiver no desktop e clicar (caso o botão apareça), abre normal
    if (sidebar.classList.contains("close")) {
      toggleSidebarDesktop();
    }
  }
});

// 3. Fechar sidebar mobile se clicar fora dela (opcional)
document.addEventListener("click", (e) => {
  if (window.innerWidth <= 960) {
    // Se a sidebar está aberta no mobile, e o clique NÃO foi nela nem no botão de abrir
    if (
      sidebar.classList.contains("open-mobile") &&
      !sidebar.contains(e.target) &&
      !sidebarOpenBtn.contains(e.target)
    ) {
      toggleSidebarMobile();
    }
  }
});

// --- CONTROLE DE TAMANHO DE TELA ---

// Verifica o tamanho ao carregar a página
if (window.innerWidth < 960) {
  sidebar.classList.add("close"); // Começa fechada no mobile
  document.body.classList.remove("sidebar-closed");
} else {
  sidebar.classList.remove("close"); // Começa aberta no desktop
  document.body.classList.remove("sidebar-closed");
}

// Se o usuário redimensionar a janela, limpa as classes para não bugar
window.addEventListener("resize", () => {
  if (window.innerWidth > 960) {
    // Mudou para Desktop
    sidebar.classList.remove("open-mobile");
    sidebar.classList.remove("close");
    document.body.classList.remove("sidebar-closed");
  } else {
    // Mudou para Mobile
    sidebar.classList.add("close");
    sidebar.classList.remove("open-mobile");
    document.body.classList.remove("sidebar-closed");
  }
});

// --- SEU OUTRO SCRIPT ORIGINAL CONTINUA AQUI EMBAIXO ---
/* 
  Cole aqui o restante do seu script original (mega menu, load de páginas, etc)
  que não foi incluído neste arquivo de exemplo.
*/
