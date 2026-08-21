let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// ==========================================
// CONFIGURAÇÃO DO CARDÁPIO DE ESFIRRAS
// ==========================================

let cardapioEsfirras = {};

function mapearCardapioDoHTML() {
    cardapioEsfirras = {};

    const itens = document.querySelectorAll(
        'section:not(#bebidas) article.item'
    );

    itens.forEach(item => {
        const categoria =
            item.getAttribute('data-categoria') || 'esfirra';

        if (
            categoria.toLowerCase() === 'bebida' ||
            categoria.toLowerCase() === 'bebidas'
        ) {
            return;
        }

        const nomeElement =
            item.querySelector('strong') ||
            item.querySelector('h4');

        const selectPreco =
            item.querySelector('.select-preco');

        if (nomeElement && selectPreco) {
            const nomeEsfirra =
                nomeElement.innerText.trim();

            cardapioEsfirras[nomeEsfirra] = {};

            Array.from(selectPreco.options).forEach(opcao => {
                const valorPreco =
                    parseFloat(opcao.value);

                const textoOpcao =
                    opcao.text.toLowerCase();

                if (
                    !isNaN(valorPreco)
                ) {
                    cardapioEsfirras[nomeEsfirra][opcao.text] =
                        valorPreco;
                }
            });
        }
    });
}

document.addEventListener(
    'DOMContentLoaded',
    mapearCardapioDoHTML
);


// ==========================================
// ADICIONAR ESFIRRA OU BEBIDA
// ==========================================

function adicionarAoCarrinho(botao) {

    const itemElement =
        botao.closest('.item');

    if (!itemElement) return;

    const categoria =
        itemElement.getAttribute('data-categoria') ||
        'esfirra';

    const nomeElement =
        itemElement.querySelector('strong') ||
        itemElement.querySelector('h4');

    const select =
        itemElement.querySelector('.select-preco');

    if (!nomeElement || !select) {
        return alert(
            "Não foi possível identificar o produto."
        );
    }

    const nomeBase =
        nomeElement.innerText;

    const preco =
        parseFloat(select.value);

    if (isNaN(preco)) {
        return alert(
            "Preço do produto inválido."
        );
    }

    const opcaoTexto =
        select.options[
            select.selectedIndex
        ].text;

    const detalheOpcao =
        opcaoTexto
            .split(/ - R\$/i)[0]
            .trim();

    const nomeFinal =
        `${nomeBase} (${detalheOpcao})`;

    const existente =
        carrinho.find(
            p => p.nome === nomeFinal
        );

    if (existente) {
        existente.quantidade += 1;
    } else {
        carrinho.push({
            nome: nomeFinal,
            preco: preco,
            quantidade: 1,
            categoria: categoria
        });
    }

    localStorage.setItem(
        'carrinho',
        JSON.stringify(carrinho)
    );

    if (
        typeof exibirCarrinho === 'function'
    ) {
        exibirCarrinho();
    }

    alert(
        `✅ ${nomeFinal} adicionado ao carrinho!`
    );
}


// ==========================================
// BOTÃO "VOLTAR AO TOPO"
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const backToTopBtn =
            document.getElementById(
                "back-to-top-btn"
            );

        window.onscroll = function() {

            if (backToTopBtn) {
                scrollFunction();
            }
        };

        function scrollFunction() {

            if (
                document.body.scrollTop > 300 ||
                document.documentElement.scrollTop > 300
            ) {
                backToTopBtn.style.display =
                    "block";
            } else {
                backToTopBtn.style.display =
                    "none";
            }
        }
    }
);


function voltarAoTopo() {

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}