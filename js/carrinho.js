let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
const lista = document.getElementById('lista-pedidos');
const totalElemento = document.getElementById('total-carrinho');
const foneWhatsapp = "5514998897292";

function exibirCarrinho() {
    if (!lista) return;

    lista.innerHTML = '';
    let total = 0;

    if (!carrinho.length) {
        lista.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">Carrinho vazio.</p>';
        if (totalElemento) totalElemento.innerText = "R$ 0,00";
        return;
    }

    carrinho.forEach((item, index) => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;

        lista.innerHTML += `
            <div class="item-pedido">
                <div class="info-item">
                    <strong>${item.quantidade}x ${item.nome}</strong>
                </div>
                <div class="controles-item" style="text-align:right;">
                    <div class="preco-subtotal">
                        R$ ${subtotal.toFixed(2).replace('.', ',')}
                    </div>
                    <div class="btn-group">
                        <button onclick="alterarQuantidade(${index},-1)">-</button>
                        <span>${item.quantidade}</span>
                        <button onclick="alterarQuantidade(${index},1)">+</button>
                    </div>
                    <button class="btn-remover" onclick="removerItem(${index})">remover</button>
                </div>
            </div>`;
    });

    if (totalElemento)
        totalElemento.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;

    gerenciarPagamento();
}

function adicionarAoCarrinho(botao) {
    const item = botao.closest('.item');
    if (!item) return;

    const nomeElemento =
        item.querySelector('strong') || item.querySelector('h4');

    const select = item.querySelector('.select-preco');

    if (!nomeElemento || !select)
        return alert("Não foi possível identificar o produto.");

    const nome = nomeElemento.innerText;
    const preco = parseFloat(select.value);

    if (isNaN(preco))
        return alert("Preço do produto inválido.");

    const opcao = select.options[select.selectedIndex].text
        .split(/ - R\$/i)[0]
        .trim();

    const nomeFinal = `${nome} (${opcao})`;
    const existente = carrinho.find(i => i.nome === nomeFinal);

    if (existente) {
        existente.quantidade++;
    } else {
        carrinho.push({
            nome: nomeFinal,
            preco,
            quantidade: 1,
            categoria: item.getAttribute('data-categoria') || 'esfirra'
        });
    }

    salvar();
    alert(`✅ ${nomeFinal} adicionada ao carrinho!`);
}

function obterInputValorPorMetodo(metodo) {
    const ids = {
        "Cartão de Crédito": "valor-cartao-de-credito",
        "Cartão de Débito": "valor-cartao-de-debito",
        "Dinheiro": "valor-dinheiro"
    };

    if (metodo.toUpperCase() === "PIX") {
        return document.getElementById("valor-pix") ||
               document.getElementById("valor-PIX") ||
               document.getElementById("valor-Pix");
    }

    return document.getElementById(ids[metodo]) ||
           document.getElementById(
               'valor-' +
               metodo.toLowerCase()
                   .replace(/[áéíóúâêîôûàèìòùãõç]/gi, '')
                   .replace(/\s+/g, '-')
           );
}

function converterStringParaFloat(valor) {
    if (!valor) return 0;

    return parseFloat(
        valor.replace('R$', '')
            .replace(/\s/g, '')
            .replace(/\./g, '')
            .replace(',', '.')
    ) || 0;
}

function gerenciarPagamento() {
    const checkboxes = document.querySelectorAll('input[name="metodo"]');
    const selecionados = [...checkboxes].filter(c => c.checked);

    const total = converterStringParaFloat(
        totalElemento?.innerText || "R$ 0,00"
    );

    if (selecionados.length > 2) {
        alert("Você pode selecionar no máximo 2 formas de pagamento!");
        if (typeof event !== 'undefined' && event.target)
            event.target.checked = false;
        return;
    }

    checkboxes.forEach(cb => {
        const input = obterInputValorPorMetodo(cb.value);
        if (!input) return;

        if (cb.checked) {
            input.style.display = 'block';

            if (selecionados.length === 1)
                input.value = `R$ ${total.toFixed(2).replace('.', ',')}`;
            else if (input.value === `R$ ${total.toFixed(2).replace('.', ',')}`)
                input.value = '';
        } else {
            input.style.display = 'none';
            input.value = '';
        }
    });

    const dinheiro = obterInputValorPorMetodo("Dinheiro");
    const boxTroco = document.getElementById('box-troco');

    if (dinheiro && boxTroco) {
        const temDinheiro =
            selecionados.some(c => c.value === "Dinheiro");

        const valorDinheiro =
            converterStringParaFloat(dinheiro.value);

        if (temDinheiro && valorDinheiro > total) {
            boxTroco.style.display = 'block';
        } else {
            boxTroco.style.display = 'none';
            const troco = document.getElementById('troco');
            if (troco) troco.value = '';
        }
    }
}

function mascaraValor(input) {
    let v = input.value.replace(/\D/g, '');
    v = (v / 100).toFixed(2).replace('.', ',');
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    input.value = v ? 'R$ ' + v : '';
}

function finalizarPedido() {
    const endereco = document.getElementById('endereco').value;
    const telefone = document.getElementById('telefone').value;
    const nome = document.getElementById('nome').value;
    const selecionados = document.querySelectorAll('input[name="metodo"]:checked');
    const troco = document.getElementById('troco')?.value || '';
    const obs = document.getElementById('obs')?.value || '';

    if (!carrinho.length)
        return alert("Carrinho vazio!");

    if (!endereco || !telefone || !nome)
        return alert("Por favor, preencha nome, endereço e telefone.");

    if (!selecionados.length)
        return alert("Escolha uma forma de pagamento.");

    const total = carrinho.reduce(
        (soma, item) => soma + item.preco * item.quantidade,
        0
    );

    let somaPagamentos = 0;
    let pagamentos = [];
    let temDinheiro = false;

    for (const cb of selecionados) {
        const input = obterInputValorPorMetodo(cb.value);
        const valor = converterStringParaFloat(input?.value);

        if (valor <= 0)
            return alert(`Por favor, insira um valor válido para: ${cb.value}`);

        somaPagamentos += valor;
        pagamentos.push(
            `${cb.value} (R$ ${valor.toFixed(2).replace('.', ',')})`
        );

        if (cb.value === "Dinheiro")
            temDinheiro = true;
    }

    if (somaPagamentos < total - 0.01) {
        const falta = total - somaPagamentos;

        return alert(
            `O valor informado é INSUFICIENTE!\n\n` +
            `Total: R$ ${total.toFixed(2).replace('.', ',')}\n` +
            `Informado: R$ ${somaPagamentos.toFixed(2).replace('.', ',')}\n` +
            `Faltam: R$ ${falta.toFixed(2).replace('.', ',')}`
        );
    }

    if (!temDinheiro && somaPagamentos > total + 0.01) {
        return alert(
            `O valor informado está ACIMA do total!\n\n` +
            `Total: R$ ${total.toFixed(2).replace('.', ',')}\n` +
            `Informado: R$ ${somaPagamentos.toFixed(2).replace('.', ',')}`
        );
    }

    let message = "*NOVO PEDIDO - ESFIRRAS PALACE*%0A%0A";

    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;

        message +=
            `*${item.quantidade}x ${item.nome}*%0A` +
            `Sub: R$ ${subtotal.toFixed(2).replace('.', ',')}%0A%0A`;
    });

    message +=
        `*TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*%0A%0A` +
        `*Cliente:* ${nome}%0A` +
        `*Endereço:* ${endereco}%0A` +
        `*Contato:* ${telefone}%0A` +
        `*Pagamento:* ${pagamentos.join(" + ")}%0A`;

    if (temDinheiro && troco)
        message += `*Troco para:* R$ ${troco}%0A`;

    if (obs)
        message += `*Obs:* ${obs}`;

    localStorage.removeItem('carrinho');

    window.open(
        `https://wa.me/${foneWhatsapp}?text=${message}`,
        '_blank'
    );

    location.reload();
}

function alterarQuantidade(index, mudanca) {
    carrinho[index].quantidade += mudanca;

    if (carrinho[index].quantidade <= 0)
        carrinho.splice(index, 1);

    salvar();
}

function removerItem(index) {
    carrinho.splice(index, 1);
    salvar();
}

function salvar() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    exibirCarrinho();
}

function removerTodos() {
    if (confirm("Deseja realmente esvaziar o seu carrinho?")) {
        carrinho = [];
        salvar();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    exibirCarrinho();

    window.gerenciarPagamento = gerenciarPagamento;
    window.mascaraValor = mascaraValor;
    window.adicionarAoCarrinho = adicionarAoCarrinho;
    window.finalizarPedido = finalizarPedido;
    window.alterarQuantidade = alterarQuantidade;
    window.removerItem = removerItem;
    window.removerTodos = removerTodos;
});