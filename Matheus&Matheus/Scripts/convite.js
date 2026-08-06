import { supabase } from './supabase-client.js';

const errorBox = document.getElementById('convite-error');
const sucessoBox = document.getElementById('convite-sucesso');
const sub = document.getElementById('convite-sub');
const form = document.getElementById('form-convite');
const btn = document.getElementById('convite-btn');

let sessaoPronta = false;

function mostrarErroLinkInvalido() {
  form.hidden = true;
  sub.textContent = 'Este link de convite não é válido ou já expirou.';
  errorBox.textContent = 'Peça pro administrador enviar um novo convite.';
  errorBox.hidden = false;
}

// O Supabase lê o token que vem na URL do e-mail automaticamente e,
// se for válido, dispara esse evento com uma sessão temporária.
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    sessaoPronta = true;
    if (session.user?.email) {
      sub.textContent = `Escolha uma senha de acesso para ${session.user.email}.`;
    }
  }
});

// Dá um tempo pro Supabase processar o link antes de decidir que é inválido
setTimeout(async () => {
  if (sessaoPronta) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    mostrarErroLinkInvalido();
  }
}, 1500);

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const senha = document.getElementById('senha').value;
  const senhaConfirma = document.getElementById('senha-confirma').value;

  errorBox.hidden = true;

  if (senha !== senhaConfirma) {
    errorBox.textContent = 'As senhas não coincidem.';
    errorBox.hidden = false;
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Criando...';

  const { error } = await supabase.auth.updateUser({ password: senha });

  if (error) {
    errorBox.textContent = 'Não foi possível criar a senha. Tente pedir um novo convite.';
    errorBox.hidden = false;
    btn.disabled = false;
    btn.textContent = 'Criar senha e entrar';
    return;
  }

  form.hidden = true;
  sucessoBox.textContent = 'Senha criada! Redirecionando...';
  sucessoBox.hidden = false;

  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1200);
});