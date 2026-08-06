import { supabase } from './supabase-client.js';
import { carregarPerfil } from './perfil.js';

const perfil = await carregarPerfil();

async function carregarTabela() {
  const corpo = document.getElementById('tabela-clientes-corpo');
  const { data, error } = await supabase
    .from('clientes')
    .select('nome, tipo, cpf_cnpj, contato')
    .order('nome');

  if (error) {
    corpo.innerHTML = `<tr><td colspan="4">Não foi possível carregar os clientes.</td></tr>`;
    return;
  }

  if (!data.length) {
    corpo.innerHTML = `<tr><td colspan="4">Nenhum cliente cadastrado ainda.</td></tr>`;
    return;
  }

  corpo.innerHTML = data
    .map(
      (c) => `
        <tr>
          <td>${c.nome}</td>
          <td>${c.tipo}</td>
          <td>${c.cpf_cnpj}</td>
          <td>${c.contato || '—'}</td>
        </tr>
      `
    )
    .join('');
}

carregarTabela();

const form = document.getElementById('form-novo-cliente');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const feedback = document.getElementById('form-feedback');
  const btn = document.getElementById('novo-cliente-btn');

  const tipo = document.getElementById('novo-tipo').value;
  const nome = document.getElementById('novo-nome').value.trim();
  const cpf_cnpj = document.getElementById('novo-doc').value.trim();
  const contato = document.getElementById('novo-contato').value.trim();

  feedback.hidden = true;
  btn.disabled = true;
  btn.textContent = 'Adicionando...';

  const { error } = await supabase.from('clientes').insert({
    escritorio_id: perfil.escritorio_id,
    tipo,
    nome,
    cpf_cnpj,
    contato: contato || null,
  });

  if (error) {
    feedback.textContent = 'Não foi possível adicionar o cliente.';
    feedback.className = 'form-feedback error';
    feedback.hidden = false;
  } else {
    form.reset();
    carregarTabela();
  }

  btn.disabled = false;
  btn.textContent = 'Adicionar';
});