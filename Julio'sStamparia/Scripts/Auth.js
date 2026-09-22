/**
 * Auth.js — autenticação real via Supabase Auth.
 * Requer que ./Scripts/supabaseConfig.js seja carregado ANTES deste arquivo.
 */

function mostrarFeedback(elId, mensagem, tipo) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = mensagem;
  el.className = `form-feedback ${tipo}`;
}

function traduzirErro(msg) {
  const mapa = {
    'Invalid login credentials': 'E-mail ou senha incorretos.',
    'User already registered': 'Esse e-mail já está cadastrado.',
    'Password should be at least 6 characters': 'A senha precisa ter pelo menos 6 caracteres.',
    'Email not confirmed': 'Confirme seu e-mail antes de entrar (verifique sua caixa de entrada).'
  };
  return mapa[msg] || msg;
}

// ===== Login =====
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const botao = loginForm.querySelector('button[type="submit"]');

    botao.disabled = true;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    botao.disabled = false;

    if (error) {
      mostrarFeedback('login-feedback', traduzirErro(error.message), 'erro');
      return;
    }

    window.location.href = 'Products.html';
  });
}

// ===== Registro =====
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const nome = document.getElementById('register-nome').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const botao = registerForm.querySelector('button[type="submit"]');

    if (password.length < 6) {
      mostrarFeedback('register-feedback', 'A senha precisa ter pelo menos 6 caracteres.', 'erro');
      return;
    }

    botao.disabled = true;
    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { nome } }
    });
    botao.disabled = false;

    if (error) {
      mostrarFeedback('register-feedback', traduzirErro(error.message), 'erro');
      return;
    }

    mostrarFeedback(
      'register-feedback',
      'Conta criada! Se a confirmação por e-mail estiver ativada no seu projeto, verifique sua caixa de entrada antes de entrar.',
      'sucesso'
    );
    setTimeout(() => { window.location.href = 'Index.html'; }, 2800);
  });
}

// ===== Logout (usado em Products.html) =====
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'Index.html';
}