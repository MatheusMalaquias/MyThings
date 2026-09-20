/**
 * Cart.js — catálogo carregado do Supabase + carrinho (localStorage até o
 * checkout) + pedido gravado nas tabelas `pedidos` e `itens_pedido`.
 * Requer ./Scripts/supabaseConfig.js carregado antes.
 */

const CART_KEY = 'js_carrinho';

function getCarrinho() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function salvarCarrinho(carrinho) {
  localStorage.setItem(CART_KEY, JSON.stringify(carrinho));
}

function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function adicionarAoCarrinho(id, nome, preco) {
  const carrinho = getCarrinho();
  const item = carrinho.find(i => i.id === id);
  if (item) {
    item.qtd += 1;
  } else {
    carrinho.push({ id, nome, preco, qtd: 1 });
  }
  salvarCarrinho(carrinho);
  atualizarContador();
  renderizarPainel();
}

function removerDoCarrinho(id) {
  let carrinho = getCarrinho();
  carrinho = carrinho.filter(i => i.id !== id);
  salvarCarrinho(carrinho);
  atualizarContador();
  renderizarPainel();
}

function atualizarContador() {
  const total = getCarrinho().reduce((soma, i) => soma + i.qtd, 0);
  const contadorEl = document.getElementById('carrinho-contador');
  if (contadorEl) contadorEl.textContent = total;
}

function renderizarPainel() {
  const painel = document.getElementById('carrinho-lista');
  const totalEl = document.getElementById('carrinho-total-valor');
  const checkoutBtn = document.getElementById('finalizar-pedido');
  if (!painel) return;

  const carrinho = getCarrinho();

  if (carrinho.length === 0) {
    painel.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
    if (totalEl) totalEl.textContent = formatarPreco(0);
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  painel.innerHTML = carrinho
    .map(
      item => `
      <div class="carrinho-item">
        <span>${item.qtd}x ${item.nome}</span>
        <span>${formatarPreco(item.preco * item.qtd)}
          <button type="button" aria-label="Remover ${item.nome}" data-id="${item.id}">✕</button>
        </span>
      </div>`
    )
    .join('');

  painel.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => removerDoCarrinho(btn.dataset.id));
  });

  const total = carrinho.reduce((soma, i) => soma + i.preco * i.qtd, 0);
  if (totalEl) totalEl.textContent = formatarPreco(total);
  if (checkoutBtn) checkoutBtn.disabled = false;
}

// ===== Catálogo (tabela `produtos` no Supabase) =====
let TODOS_PRODUTOS = [];
let FILTRO_ATUAL = 'Todos';

async function carregarProdutos() {
  const lista = document.getElementById('produto-lista');
  lista.innerHTML = '<p class="carrinho-vazio">Carregando produtos...</p>';

  const { data: produtos, error } = await supabaseClient
    .from('produtos')
    .select('*')
    .order('criado_em', { ascending: true });

  if (error) {
    lista.innerHTML = `<p class="carrinho-vazio">Erro ao carregar produtos: ${error.message}</p>`;
    return;
  }

  TODOS_PRODUTOS = produtos || [];
  renderizarProdutos();
}

function renderizarProdutos() {
  const lista = document.getElementById('produto-lista');

  const produtosFiltrados =
    FILTRO_ATUAL === 'Todos'
      ? TODOS_PRODUTOS
      : TODOS_PRODUTOS.filter(p => p.genero === FILTRO_ATUAL || p.genero === 'Unissex');

  if (produtosFiltrados.length === 0) {
    lista.innerHTML = '<p class="carrinho-vazio">Nenhuma peça encontrada nessa categoria.</p>';
    return;
  }

  lista.innerHTML = produtosFiltrados
    .map(
      p => `
      <article class="produto-card" data-id="${p.id}" data-nome="${p.nome}" data-preco="${p.preco}">
        <img src="${p.imagem_url || './Images/placeholder.png'}" alt="${p.nome}" />
        <h3>${p.nome}</h3>
        <p class="produto-preco">${formatarPreco(p.preco)}</p>
        <button type="button" class="ver-mais-btn" aria-expanded="false">Ver mais ▾</button>
        <div class="produto-detalhes">
          <p>${p.descricao ? p.descricao : 'Sem descrição adicional pra essa peça ainda.'}</p>
        </div>
        <button class="comprar" aria-label="Comprar ${p.nome}">Comprar</button>
      </article>`
    )
    .join('');

  lista.querySelectorAll('.ver-mais-btn').forEach(botao => {
    botao.addEventListener('click', () => {
      const detalhes = botao.nextElementSibling;
      const aberto = detalhes.classList.toggle('aberto');
      botao.textContent = aberto ? 'Ver menos ▴' : 'Ver mais ▾';
      botao.setAttribute('aria-expanded', String(aberto));
    });
  });

  lista.querySelectorAll('.comprar').forEach(botao => {
    botao.addEventListener('click', () => {
      const card = botao.closest('.produto-card');
      adicionarAoCarrinho(card.dataset.id, card.dataset.nome, parseFloat(card.dataset.preco));

      botao.textContent = 'Adicionado!';
      botao.disabled = true;
      setTimeout(() => {
        botao.textContent = 'Comprar';
        botao.disabled = false;
      }, 1200);
    });
  });
}

// ===== Checkout (grava em `pedidos` + `itens_pedido`) =====
async function finalizarPedido(session) {
  const carrinho = getCarrinho();
  if (carrinho.length === 0) return;

  const checkoutBtn = document.getElementById('finalizar-pedido');
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = 'Enviando...';

  const total = carrinho.reduce((soma, i) => soma + i.preco * i.qtd, 0);

  const { data: pedido, error: erroPedido } = await supabaseClient
    .from('pedidos')
    .insert({ usuario_id: session.user.id, total })
    .select()
    .single();

  if (erroPedido) {
    alert('Erro ao criar o pedido: ' + erroPedido.message);
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = 'Finalizar pedido';
    return;
  }

  const itens = carrinho.map(i => ({
    pedido_id: pedido.id,
    produto_id: i.id,
    nome_produto: i.nome,
    preco_unitario: i.preco,
    quantidade: i.qtd
  }));

  const { error: erroItens } = await supabaseClient.from('itens_pedido').insert(itens);

  checkoutBtn.disabled = false;
  checkoutBtn.textContent = 'Finalizar pedido';

  if (erroItens) {
    alert('Pedido criado, mas houve um erro ao salvar os itens: ' + erroItens.message);
    return;
  }

  localStorage.removeItem(CART_KEY);
  atualizarContador();
  renderizarPainel();
  document.querySelector('.carrinho-painel')?.classList.remove('aberto');
  alert('Pedido realizado com sucesso! Obrigado pela compra.');
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

// Delegação de evento: funciona mesmo se algo mais na página falhar,
// porque não depende de rodar dentro do DOMContentLoaded abaixo.
document.addEventListener('click', e => {
  if (e.target.closest('.logout')) {
    logout();
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    alert('Faça login para acessar os produtos.');
    window.location.href = 'index.html';
    return;
  }

  await carregarProdutos();
  atualizarContador();
  renderizarPainel();

  const carrinhoBtn = document.querySelector('.carrinho-btn');
  const painel = document.querySelector('.carrinho-painel');
  if (carrinhoBtn && painel) {
    carrinhoBtn.addEventListener('click', e => {
      e.stopPropagation();
      painel.classList.toggle('aberto');
    });
    document.addEventListener('click', e => {
      if (!painel.contains(e.target) && e.target !== carrinhoBtn) {
        painel.classList.remove('aberto');
      }
    });
  }

  const checkoutBtn = document.getElementById('finalizar-pedido');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => finalizarPedido(session));
  }

  document.querySelectorAll('.aba-genero').forEach(aba => {
    aba.addEventListener('click', () => {
      document.querySelectorAll('.aba-genero').forEach(a => {
        a.classList.remove('ativa');
        a.setAttribute('aria-selected', 'false');
      });
      aba.classList.add('ativa');
      aba.setAttribute('aria-selected', 'true');
      FILTRO_ATUAL = aba.dataset.genero;
      renderizarProdutos();
    });
  });

});