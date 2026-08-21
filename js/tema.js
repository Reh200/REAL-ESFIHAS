const themeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;
const icon = themeToggle.querySelector('.icon');

// 1. Verifica se o usuário já tem uma preferência salva
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
  body.classList.add('dark-mode');
  icon.innerText = '☀️'; // Ícone de sol para voltar ao claro
}

// 2. Evento de clique para trocar o tema
themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  
  const isDark = body.classList.contains('dark-mode');
  
  // Salva a escolha no localStorage
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  
  // Troca o ícone
  icon.innerText = isDark ? '☀️' : '🌙';
});