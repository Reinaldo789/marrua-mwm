const navItems = document.querySelectorAll('.nav-item');
const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
const mainNav = document.getElementById('main-nav');
const overlay = document.getElementById('nav-overlay');
const toggleIcon = mobileToggleBtn.querySelector('i');

// 1. Abrir / Fechar o Menu Lateral (Gaveta)
function toggleMenu() {
  const isOpen = mainNav.classList.toggle('active');
  overlay.classList.toggle('active');
  
  // Bloqueia rolagem do fundo
  document.body.style.overflow = isOpen ? 'hidden' : '';

  // Troca o ícone (Hambúrguer <-> X)
  if (isOpen) {
    toggleIcon.classList.remove('fa-bars');
    toggleIcon.classList.add('fa-xmark');
  } else {
    toggleIcon.classList.remove('fa-xmark');
    toggleIcon.classList.add('fa-bars');
    // Fecha todos os submenus ao fechar a gaveta
    navItems.forEach(item => item.classList.remove('active'));
  }
}

mobileToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleMenu();
});

// Fecha ao clicar no fundo escuro
overlay.addEventListener('click', toggleMenu);

// 2. Lógica da Sanfona (Abrir/Fechar submenus)
navItems.forEach(item => {
  const btn = item.querySelector('.nav-btn');
  
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    
    const abrir = !item.classList.contains('active');
    
    // Fecha os outros (Sanfona)
    navItems.forEach(i => i.classList.remove('active'));
    
    // Abre o atual
    if (abrir) {
      item.classList.add('active');
      // Rola suavemente para o item não ficar escondido
      setTimeout(() => {
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  });
});

// 3. Ao clicar em um link do submenu, fecha a gaveta
document.querySelectorAll('.mega-menu a').forEach(a => {
  a.addEventListener('click', () => {
    if (mainNav.classList.contains('active')) {
      toggleMenu();
    }
  });
});
