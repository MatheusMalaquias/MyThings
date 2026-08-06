import { supabase } from './supabase-client.js';
import { carregarPerfil } from './perfil.js';

await carregarPerfil();

function formatarDataHora(iso) {
  const data = new Date(iso);
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

async function carregarAlertas() {
  const container = document.getElementById('alertas-container');
  const { data, error } = await supabase
    .from('alertas')
    .select('id, tipo, lido, criado_em')
    .order('criado_em', { ascending: false });

  if (error || !data.length) {
    return; // mantém o empty-state que já está no HTML
  }

  container.innerHTML = `
    <div class="panel">
      <table class="table" id="tabela-alertas">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Quando</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  `;

  const corpo = container.querySelector('tbody');

  corpo.innerHTML = data
    .map((alerta) => {
      const badgeClasse = alerta.lido ? 'role-badge' : 'role-badge admin';
      const statusTexto = alerta.lido ? 'Lido' : 'Não lido';
      const acao = alerta.lido
        ? ''
        : `<button class="btn-small" data-marcar-lido="${alerta.id}">Marcar como lido</button>`;

      return `
        <tr>
          <td>${alerta.tipo}</td>
          <td>${formatarDataHora(alerta.criado_em)}</td>
          <td><span class="${badgeClasse}">${statusTexto}</span></td>
          <td>${acao}</td>
        </tr>
      `;
    })
    .join('');

  corpo.querySelectorAll('[data-marcar-lido]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await supabase.from('alertas').update({ lido: true }).eq('id', btn.dataset.marcarLido);
      carregarAlertas();
    });
  });
}

carregarAlertas();