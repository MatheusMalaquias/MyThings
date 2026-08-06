import { supabase } from './supabase-client.js';

// Traduz os erros mais comuns do Supabase Auth para o usuário final
function traduzErro(mensagem) {
  const mapa = {
    'Invalid login credentials': 'E-mail ou senha incorretos.',
    'Email not confirmed': 'Este e-mail ainda não foi confirmado.',
  };
  return mapa[mensagem] || 'Não foi possível entrar. Tente novamente.';
}

// ---------- Página de login (index.html) ----------
const loginForm = document.getElementById('login-form');

if (loginForm) {
  // Se já existe uma sessão ativa, pula direto pro dashboard
  supabase.auth.getSession().then(({ data }) => {
    if (data.session) {
      window.location.href = 'dashboard.html';
    }
  });

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const errorBox = document.getElementById('auth-error');
    const submitBtn = document.getElementById('submit-btn');

    errorBox.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Entrando...';

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      errorBox.textContent = traduzErro(error.message);
      errorBox.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Entrar';
      return;
    }

    window.location.href = 'dashboard.html';
  });
}

// ---------- Páginas internas (dashboard.html e demais) ----------
const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
  // Exige sessão ativa para ver a página; se não houver, volta pro login
  supabase.auth.getSession().then(({ data }) => {
    if (!data.session) {
      window.location.href = 'index.html';
      return;
    }
    const userLabel = document.getElementById('app-user-email');
    if (userLabel) {
      userLabel.textContent = data.session.user.email;
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
  });
}