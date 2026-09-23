/**
 * Admin.js — cadastro, edição e remoção de produtos, restrito a quem está
 * na tabela `admins` do Supabase. Requer ./Scripts/Supabaseconfig.js
 * carregado antes.
 */

const form = document.getElementById('admin-produto-form');
const lista = document.getElementById('admin-lista-produtos');
const botaoSubmit = document.getElementById('admin-submit-btn');
const botaoCancelar = document.getElementById('admin-cancelar-btn');

let editandoId = null;
let editandoImagemAtual = null;

function mostrarFeedback(mensagem, tipo) {
  const el = document.getElementById('admin-feedback');
  el.textContent = mensagem;
  el.className = `form-feedback ${tipo}`;
}

function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function carregarLista() {
  lista.innerHTML = '<p class="carrinho-vazio">Carregando...</p>';

  const { data: produtos, error } = await supabaseClient
    .from('produtos')
    .select('*')
    .order('criado_em', { ascending: false });

  if (error) {
    lista.innerHTML = `<p class="carrinho-vazio">Erro ao carregar: ${error.message}</p>`;
    return;
  }
  if (!produtos || produtos.length === 0) {
    lista.innerHTML = '<p class="carrinho-vazio">Nenhuma peça cadastrada ainda.</p>';
    return;
  }

  lista.innerHTML = produtos
    .map(
      p => `
      <div class="admin-produto-item" data-id="${p.id}">
        <img src="${p.imagem_url || './Images/placeholder.png'}" alt="${p.nome}" />
        <div class="admin-produto-info">
          <strong>${p.nome}</strong>
          <span>${formatarPreco(p.preco)} · ${p.genero}</span>
        </div>
        <div class="admin-produto-acoes">
          <button type="button" class="admin-editar-btn" data-id="${p.id}">Editar</button>
          <button type="button" class="admin-remover-btn" data-id="${p.id}">Remover</button>
        </div>
      </div>`
    )
    .join('');

  lista.querySelectorAll('.admin-remover-btn').forEach(btn => {
    btn.addEventListener('click', () => removerProduto(btn.dataset.id));
  });

  lista.querySelectorAll('.admin-editar-btn').forEach(btn => {
    const produto = produtos.find(p => String(p.id) === btn.dataset.id);
    btn.addEventListener('click', () => iniciarEdicao(produto));
  });
}

function iniciarEdicao(produto) {
  editandoId = produto.id;
  editandoImagemAtual = produto.imagem_url || null;

  document.getElementById('admin-nome').value = produto.nome || '';
  document.getElementById('admin-preco').value = produto.preco || '';
  document.getElementById('admin-genero').value = produto.genero || 'Masculino';
  document.getElementById('admin-descricao').value = produto.descricao || '';
  document.getElementById('admin-imagem').value = '';

  botaoSubmit.textContent = 'Salvar alterações';
  botaoCancelar.style.display = 'inline-block';
  mostrarFeedback(`Editando "${produto.nome}" — escolha uma nova imagem só se quiser trocá-la.`, 'info');

  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelarEdicao() {
  editandoId = null;
  editandoImagemAtual = null;
  form.reset();
  botaoSubmit.textContent = 'Cadastrar peça';
  botaoCancelar.style.display = 'none';
  mostrarFeedback('', '');
}

botaoCancelar.addEventListener('click', cancelarEdicao);

async function removerProduto(id) {
  if (!confirm('Remover essa peça do catálogo?')) return;

  const { error } = await supabaseClient.from('produtos').delete().eq('id', id);
  if (error) {
    alert('Erro ao remover: ' + error.message);
    return;
  }
  if (editandoId === id) cancelarEdicao();
  carregarLista();
}

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const nome = document.getElementById('admin-nome').value.trim();
  const preco = parseFloat(document.getElementById('admin-preco').value);
  const genero = document.getElementById('admin-genero').value;
  const descricao = document.getElementById('admin-descricao').value.trim();
  const arquivo = document.getElementById('admin-imagem').files[0];

  botaoSubmit.disabled = true;
  botaoSubmit.textContent = editandoId ? 'Salvando...' : 'Cadastrando...';

  try {
    let imagemUrl = editandoId ? editandoImagemAtual : null;

    if (arquivo) {
      const nomeArquivo = `${Date.now()}-${arquivo.name}`;
      const { error: erroUpload } = await supabaseClient.storage
        .from('produtos-imagens')
        .upload(nomeArquivo, arquivo);

      if (erroUpload) throw erroUpload;

      const { data: urlData } = supabaseClient.storage
        .from('produtos-imagens')
        .getPublicUrl(nomeArquivo);

      imagemUrl = urlData.publicUrl;
    }

    const payload = {
      nome,
      preco,
      genero,
      descricao: descricao || null,
      imagem_url: imagemUrl
    };

    if (editandoId) {
      const { error: erroUpdate } = await supabaseClient
        .from('produtos')
        .update(payload)
        .eq('id', editandoId);

      if (erroUpdate) throw erroUpdate;

      mostrarFeedback('Peça atualizada com sucesso!', 'sucesso');
      cancelarEdicao();
    } else {
      const { error: erroInsert } = await supabaseClient.from('produtos').insert(payload);
      if (erroInsert) throw erroInsert;

      mostrarFeedback('Peça cadastrada com sucesso!', 'sucesso');
      form.reset();
    }

    carregarLista();
  } catch (err) {
    mostrarFeedback('Erro ao salvar: ' + err.message, 'erro');
  } finally {
    botaoSubmit.disabled = false;
    botaoSubmit.textContent = editandoId ? 'Salvar alterações' : 'Cadastrar peça';
  }
});

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'Index.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'Index.html';
    return;
  }

  const { data: admin } = await supabaseClient
    .from('admins')
    .select('usuario_id')
    .eq('usuario_id', session.user.id)
    .maybeSingle();

  if (!admin) {
    alert('Essa página é restrita a administradores.');
    window.location.href = 'Products.html';
    return;
  }

  carregarLista();
});