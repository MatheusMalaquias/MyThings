import { supabase } from './supabase-client.js';
import { carregarPerfil } from './perfil.js';

const N8N_CRIAR_USUARIO_URL = 'https://n8n-yvdu.srv1552695.hstgr.cloud/webhook/criar-usuario';

const perfil = await carregarPerfil();

// Guarda de acesso: só admin vê esta página.
// (Proteção real de dado é via RLS + verificação no n8n — isto aqui é só UX.)
if (!perfil || perfil.role !== 'admin') {
  window.location.href = 'dashboard.html';
}

const userLabel = document.getElementById('app-user-email');
if (userLabel && perfil) {
  userLabel.textContent = `${perfil.nome} · Administrador`;
}

// ---------- Lista de usuários do escritório ----------
async function carregarTabela() {
  const corpo = document.getElementById('tabela-usuarios-corpo');
  const { data, error } = await supabase
    .from('usuarios')
    .select('nome, email, role')
    .order('nome');

  if (error) {
    corpo.innerHTML = `<tr><td colspan="3">Não foi possível carregar os usuários.</td></tr>`;
    return;
  }

  if (!data.length) {
    corpo.innerHTML = `<tr><td colspan="3">Nenhum usuário encontrado.</td></tr>`;
    return;
  }

  corpo.innerHTML = data
    .map((usuario) => {
      const badgeClasse = usuario.role === 'admin' ? 'role-badge admin' : 'role-badge';
      const papel = usuario.role === 'admin' ? 'Administrador' : 'Advogado';
      return `
        <tr>
          <td>${usuario.nome}</td>
          <td>${usuario.email}</td>
          <td><span class="${badgeClasse}">${papel}</span></td>
        </tr>
      `;
    })
    .join('');
}

carregarTabela();

// ---------- Formulário: convidar novo usuário ----------
const form = document.getElementById('form-novo-usuario');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const feedback = document.getElementById('form-feedback');
  const btn = document.getElementById('novo-usuario-btn');

  const nome = document.getElementById('novo-nome').value.trim();
  const email = document.getElementById('novo-email').value.trim();
  const role = document.getElementById('novo-role').value;

  feedback.hidden = true;
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  try {
    const resposta = await fetch(N8N_CRIAR_USUARIO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ nome, email, role }),
    });

    if (!resposta.ok) {
      throw new Error('Falha ao criar usuário');
    }

    feedback.textContent = `Convite enviado para ${email}.`;
    feedback.className = 'form-feedback success';
    feedback.hidden = false;
    form.reset();
    carregarTabela();
  } catch (erro) {
    feedback.textContent = 'Não foi possível enviar o convite. Confirme se o workflow do n8n está ativo.';
    feedback.className = 'form-feedback error';
    feedback.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Convidar';
  }
});