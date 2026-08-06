import { supabase } from './supabase-client.js';
import { carregarPerfil } from './perfil.js';

const perfil = await carregarPerfil();

// ---------- Popula o <select> de processos (pode estar vazio) ----------
async function carregarProcessos() {
  const select = document.getElementById('novo-processo');
  const { data, error } = await supabase
    .from('processos')
    .select('id, numero_cnj')
    .order('criado_em', { ascending: false });

  if (error || !data.length) {
    return;
  }

  data.forEach((processo) => {
    const opcao = document.createElement('option');
    opcao.value = processo.id;
    opcao.textContent = processo.numero_cnj;
    select.appendChild(opcao);
  });
}

// ---------- Lista de prazos ----------
function formatarData(dataIso) {
  const [ano, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}/${ano}`;
}

async function carregarTabela() {
  const corpo = document.getElementById('tabela-prazos-corpo');
  const { data, error } = await supabase
    .from('prazos')
    .select('id, descricao, data_limite, status, processos ( numero_cnj )')
    .order('data_limite');

  if (error) {
    corpo.innerHTML = `<tr><td colspan="5">Não foi possível carregar os prazos.</td></tr>`;
    return;
  }

  if (!data.length) {
    corpo.innerHTML = `<tr><td colspan="5">Nenhum prazo cadastrado ainda.</td></tr>`;
    return;
  }

  corpo.innerHTML = data
    .map((prazo) => {
      const processo = prazo.processos ? prazo.processos.numero_cnj : '—';
      const badgeClasse = prazo.status === 'concluido' ? 'role-badge admin' : 'role-badge';
      const acao =
        prazo.status === 'concluido'
          ? ''
          : `<button class="btn-small" data-concluir="${prazo.id}">Marcar concluído</button>`;

      return `
        <tr>
          <td>${prazo.descricao}</td>
          <td>${formatarData(prazo.data_limite)}</td>
          <td>${processo}</td>
          <td><span class="${badgeClasse}">${prazo.status}</span></td>
          <td>${acao}</td>
        </tr>
      `;
    })
    .join('');

  corpo.querySelectorAll('[data-concluir]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await supabase
        .from('prazos')
        .update({ status: 'concluido' })
        .eq('id', btn.dataset.concluir);
      carregarTabela();
    });
  });
}

carregarProcessos();
carregarTabela();

// ---------- Formulário: novo prazo ----------
const form = document.getElementById('form-novo-prazo');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const feedback = document.getElementById('form-feedback');
  const btn = document.getElementById('novo-prazo-btn');

  const descricao = document.getElementById('novo-descricao').value.trim();
  const data_limite = document.getElementById('novo-data').value;
  const processoId = document.getElementById('novo-processo').value || null;

  feedback.hidden = true;
  btn.disabled = true;
  btn.textContent = 'Adicionando...';

  const { error } = await supabase.from('prazos').insert({
    escritorio_id: perfil.escritorio_id,
    processo_id: processoId,
    descricao,
    data_limite,
    origem: 'manual',
    status: 'pendente',
  });

  if (error) {
    feedback.textContent = 'Não foi possível adicionar o prazo.';
    feedback.className = 'form-feedback error';
    feedback.hidden = false;
  } else {
    form.reset();
    carregarTabela();
  }

  btn.disabled = false;
  btn.textContent = 'Adicionar';
});