/**
 * Personalizar.js — upload/drag/resize da estampa + gravação do pedido de
 * personalização no Supabase (Storage para a imagem, tabela `personalizacoes`
 * para os dados). Requer ./Scripts/supabaseConfig.js carregado antes.
 */

const overlay = document.getElementById('overlay');
const imageUpload = document.getElementById('imageUpload');
const tipoPeca = document.getElementById('tipo-peca');
const ladoPeca = document.getElementById('lado-peca');
const shirtImage = document.getElementById('shirtImage');
const pedidoForm = document.getElementById('pedido-form');

const atualizarImagem = () => {
  const tipo = tipoPeca.value;
  const lado = ladoPeca.value;
  shirtImage.src = `./Images/${tipo}-${lado}.png`;
};

tipoPeca.addEventListener('change', atualizarImagem);
ladoPeca.addEventListener('change', atualizarImagem);

imageUpload.addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      overlay.style.backgroundImage = `url(${e.target.result})`;
      overlay.style.backgroundSize = 'contain';
      overlay.style.backgroundRepeat = 'no-repeat';
      overlay.style.backgroundPosition = 'center';
    };
    reader.readAsDataURL(file);
  }
});

interact('#overlay')
  .draggable({
    listeners: {
      move(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      }
    }
  })
  .resizable({
    edges: { left: true, right: true, bottom: true, top: true },
    listeners: {
      move(event) {
        let { x, y } = event.target.dataset;
        x = parseFloat(x) || 0;
        y = parseFloat(y) || 0;

        event.target.style.width = `${event.rect.width}px`;
        event.target.style.height = `${event.rect.height}px`;

        x += event.deltaRect.left;
        y += event.deltaRect.top;

        event.target.style.transform = `translate(${x}px, ${y}px)`;
        event.target.dataset.x = x;
        event.target.dataset.y = y;
      }
    },
    modifiers: [
      interact.modifiers.restrictSize({
        min: { width: 50, height: 50 },
        max: { width: 300, height: 300 }
      })
    ],
    inertia: true
  });

function mostrarFeedback(elId, mensagem, tipo) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = mensagem;
  el.className = `form-feedback ${tipo}`;
}

// ===== Envio do pedido de personalização (Supabase Storage + tabela) =====
if (pedidoForm) {
  pedidoForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const file = imageUpload.files[0];
    if (!file) {
      mostrarFeedback('pedido-feedback', 'Envie uma imagem antes de enviar o pedido.', 'erro');
      return;
    }

    const botao = pedidoForm.querySelector('button[type="submit"]');
    botao.disabled = true;
    botao.textContent = 'Enviando...';

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();

      // 1. Sobe a imagem pro Storage (bucket "personalizacoes")
      const nomeArquivo = `${Date.now()}-${file.name}`;
      const { error: erroUpload } = await supabaseClient.storage
        .from('personalizacoes')
        .upload(nomeArquivo, file);

      if (erroUpload) throw erroUpload;

      const { data: urlData } = supabaseClient.storage
        .from('personalizacoes')
        .getPublicUrl(nomeArquivo);

      // 2. Grava os dados do pedido na tabela
      const { error: erroInsert } = await supabaseClient.from('personalizacoes').insert({
        usuario_id: session?.user?.id || null,
        nome: pedidoForm.nome.value,
        email: pedidoForm.email.value,
        tipo_peca: pedidoForm.tipo_peca.value,
        lado_peca: pedidoForm.lado_peca.value,
        genero: pedidoForm.genero.value,
        tamanho: pedidoForm.tamanho.value,
        tecido: pedidoForm.tecido.value,
        cor: pedidoForm.cor.value,
        mensagem: pedidoForm.mensagem.value,
        imagem_url: urlData.publicUrl
      });

      if (erroInsert) throw erroInsert;

      mostrarFeedback('pedido-feedback', 'Pedido enviado! Entraremos em contato em breve.', 'sucesso');
      pedidoForm.reset();
      overlay.style.backgroundImage = '';
    } catch (err) {
      mostrarFeedback('pedido-feedback', 'Não foi possível enviar o pedido: ' + err.message, 'erro');
    } finally {
      botao.disabled = false;
      botao.textContent = 'Enviar Pedido';
    }
  });
}