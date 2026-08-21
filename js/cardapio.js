let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// ==========================================
// CONFIGURAÇÃO DINÂMICA VIA HTML (APENAS PIZZAS)
// ==========================================
let cardapioPizzas = {};

// Função que lê o HTML para descobrir os sabores e preços reais do cardápio
function mapearCardapioDoHTML() {
    cardapioPizzas = {}; // Reseta o objeto
    
    // Seleciona apenas os articles que NÃO estão dentro da seção de bebidas
    const itens = document.querySelectorAll('section:not(#bebidas) article.item');
    
    itens.forEach(item => {
        // Validação extra por atributo de categoria
        const categoria = item.getAttribute('data-categoria') || 'pizza';
        if (categoria.toLowerCase() === 'bebida' || categoria.toLowerCase() === 'bebidas') {
            return; // Pula o item se ele for categorizado como bebida
        }

        const nomeElement = item.querySelector('strong') || item.querySelector('h4');
        const selectPreco = item.querySelector('.select-preco');
        
        // Verifica se o item possui nome e opções de preço
        if (nomeElement && selectPreco) {
            const nomeSabor = nomeElement.innerText.trim();
            cardapioPizzas[nomeSabor] = {};
            
            // Varre as opções do select (Média, Grande, etc) para capturar os preços
            Array.from(selectPreco.options).forEach(opcao => {
                const valorPreco = parseFloat(opcao.value);
                const textoOpcao = opcao.text.toLowerCase();
                
                if (textoOpcao.includes('grand')) {
                    cardapioPizzas[nomeSabor]['Grande'] = valorPreco;
                } else if (textoOpcao.includes('méd') || textoOpcao.includes('med')) {
                    cardapioPizzas[nomeSabor]['Média'] = valorPreco;
                }
            });
        }
    });
}

// Função para preencher os selects da pizza meio a meio baseando-se no que foi lido do HTML
function atualizarSaboresDisponiveis() {
    // Primeiro, mapeia o cardápio atualizado do HTML
    mapearCardapioDoHTML();

    const sabor1Select = document.getElementById('pizza-sabor1');
    const sabor2Select = document.getElementById('pizza-sabor2');
    
    if (!sabor1Select || !sabor2Select) return;

    const valorSelecionadoSabor1 = sabor1Select.value;
    const valorSelecionadoSabor2 = sabor2Select.value;

    // Reseta ambos os seletores limpando textos padrões/opções vazias
    sabor1Select.innerHTML = '';
    sabor2Select.innerHTML = '';

    // Insere nos dois selects apenas os sabores mapeados do HTML (sem opções de "Inteira")
    for (const sabor in cardapioPizzas) {
        sabor1Select.innerHTML += `<option value="${sabor}">${sabor}</option>`;
        sabor2Select.innerHTML += `<option value="${sabor}">${sabor}</option>`;
    }

    if (valorSelecionadoSabor1 && cardapioPizzas[valorSelecionadoSabor1]) sabor1Select.value = valorSelecionadoSabor1;
    if (valorSelecionadoSabor2 && cardapioPizzas[valorSelecionadoSabor2]) sabor2Select.value = valorSelecionadoSabor2;
}

// Vincula o evento para rodar a leitura assim que a página abrir
document.addEventListener('DOMContentLoaded', atualizarSaboresDisponiveis);


// ==========================================
// 1. Adicionar Item Tradicional (Inteiras / Bebidas)
// ==========================================
function adicionarAoCarrinho(botao) {
    const itemElement = botao.closest('.item');
    const categoria = itemElement.getAttribute('data-categoria') || 'pizza';
    const nomeBase = (itemElement.querySelector('strong') || itemElement.querySelector('h4')).innerText;
    const select = itemElement.querySelector('.select-preco');
    const preco = parseFloat(select.value);
    const opcaoTexto = select.options[select.selectedIndex].text;

    const detalheOpcao = opcaoTexto.split(/ - R\$/i)[0].trim();
    const nomeFinal = `${nomeBase} (${detalheOpcao})`;

    const existente = carrinho.find(p => p.nome === nomeFinal);

    if (existente) {
        existente.quantidade += 1;
    } else {
        carrinho.push({
            nome: nomeFinal,
            preco: preco,
            quantidade: 1,
            categoria: categoria,
            borda: "Nenhuma"
        });
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    
    // Atualiza a lista visual se a função do carrinho estiver disponível na página
    if (typeof exibirCarrinho === 'function') exibirCarrinho();
    
    alert(`✅ ${nomeFinal} adicionado ao carrinho!`);
}

// ==========================================
// 2. Adicionar Pizza Meio a Meio (Valor Real Proporcional das Metades)
// ==========================================
function adicionarPizzaMeioAMeio() {
    const tamanho = document.getElementById('pizza-tamanho').value;
    const sabor1 = document.getElementById('pizza-sabor1').value;
    const sabor2 = document.getElementById('pizza-sabor2').value;

    // Bloqueia caso o usuário tente colocar sabores idênticos
    if (sabor1 === sabor2) {
        return alert("❌ Para pizzas Meio a Meio, selecione dois sabores diferentes! Se deseja apenas este sabor, adicione-o diretamente pelo cardápio abaixo.");
    }

    if (!sabor1 || !sabor2) {
        return alert("❌ Por favor, selecione ambos os sabores para montar sua pizza!");
    }

    // Captura o preço de cada sabor baseado no tamanho mapeado do HTML
    const precoSabor1 = cardapioPizzas[sabor1]?.[tamanho] || 0;
    const precoSabor2 = cardapioPizzas[sabor2]?.[tamanho] || 0;
    
    // MATEMÁTICA: Média real (Soma dos valores divididos por 2)
    const precoFinal = (precoSabor1 + precoSabor2) / 2;
    const nomeFinal = `Pizza ${tamanho} (½ ${sabor1} / ½ ${sabor2})`;

    const existente = carrinho.find(p => p.nome === nomeFinal);

    if (existente) {
        existente.quantidade += 1;
    } else {
        carrinho.push({
            nome: nomeFinal,
            preco: precoFinal,
            quantidade: 1,
            categoria: 'pizza',
            borda: "Nenhuma"
        });
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    
    // Atualiza a lista visual se a função do carrinho estiver disponível na página
    if (typeof exibirCarrinho === 'function') exibirCarrinho();
    
    alert(`✅ ${nomeFinal} adicionada ao carrinho!`);
}

// ==========================================
// Script do botão "Voltar ao Topo"
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const backToTopBtn = document.getElementById("back-to-top-btn");

    window.onscroll = function() {
        if (backToTopBtn) {
            scrollFunction();
        }
    };

    function scrollFunction() {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            backToTopBtn.style.display = "block";
        } else {
            backToTopBtn.style.display = "none";
        }
    }
});

function voltarAoTopo() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}