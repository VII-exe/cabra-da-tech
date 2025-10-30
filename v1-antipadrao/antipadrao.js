/* ============================================
   JAVASCRIPT ANTI-PADRÃO - V1
   Demonstração de PÉSSIMAS práticas de JavaScript
   ============================================ */

// ❌ Sem "use strict"
// ❌ Sem módulos (tudo no escopo global)
// ❌ Variáveis globais poluindo namespace

// ❌ Variáveis globais sem const/let
var siteName = "Cabra da Tech";
var menuAberto = false;
var contador = 0;
var dados;
var x, y, z; // ❌ Nomes não descritivos

// ❌ Função no escopo global
function iniciar() {
    console.log("Site iniciado"); // ❌ Console.log em produção
    carregarDados();
    setupEventos();
}

// ❌ Callback hell
function carregarDados() {
    setTimeout(function() {
        console.log("Carregando dados...");
        setTimeout(function() {
            console.log("Processando...");
            setTimeout(function() {
                console.log("Dados carregados!");
                dados = {
                    noticias: ["noticia1", "noticia2", "noticia3"]
                };
                // ❌ Lógica espalhada
                mostrarNoticias();
            }, 1000);
        }, 1000);
    }, 1000);
}

// ❌ Function declarations desordenadas
function mostrarNoticias() {
    // ❌ querySelector sem verificação de null
    var container = document.querySelector('.noticias-grid');
    
    // ❌ Loop com var (não tem escopo de bloco)
    for(var i = 0; i < dados.noticias.length; i++) {
        // ❌ Criação de HTML com string concatenation
        var html = '<div class="card" onclick="abrirNoticia(' + i + ')">';
        html += '<h3>' + dados.noticias[i] + '</h3>';
        html += '</div>';
        
        // ❌ innerHTML acumulativo (lento)
        container.innerHTML += html;
    }
    
    console.log(i); // ❌ Vazamento de variável (var)
}

// ❌ Função sem parâmetros claros
function abrirNoticia(id) {
    alert("Abrindo notícia: " + id); // ❌ Alert bloqueante
    window.location = "#noticia" + id; // ❌ Manipulação direta de location
}

// ❌ Event listeners inline e repetitivos
function setupEventos() {
    // ❌ querySelectorAll sem verificação
    var cards = document.querySelectorAll('.card');
    
    // ❌ Loop com var e addEventListener inline
    for(var i = 0; i < cards.length; i++) {
        cards[i].onclick = function() {
            // ❌ This sem bind/arrow function
            this.style.transform = "scale(1.1)"; // ❌ Estilo inline via JS
        };
        
        cards[i].onmouseover = function() {
            this.style.background = "#f0f0f0";
        };
        
        cards[i].onmouseout = function() {
            this.style.background = "#fff";
        };
    }
    
    // ❌ Event listener sem removeEventListener
    document.querySelector('.menu-toggle').onclick = toggleMenu;
    
    // ❌ Submit sem preventDefault adequado
    document.querySelector('form').onsubmit = function() {
        enviarFormulario();
        return false; // ❌ Método antigo
    };
}

// ❌ Toggle sem ARIA ou gestão de estado adequada
function toggleMenu() {
    menuAberto = !menuAberto; // ❌ Variável global
    
    // ❌ Sem verificação de null
    var menu = document.querySelector('.menu-list');
    
    if(menuAberto) {
        menu.style.display = "block"; // ❌ Manipulação direta de style
    } else {
        menu.style.display = "none";
    }
    
    console.log("Menu aberto:", menuAberto);
}

// ❌ Validação de formulário ruim
function enviarFormulario() {
    // ❌ Sem querySelector adequado
    var nome = document.querySelector('input').value;
    var email = document.querySelectorAll('input')[1].value;
    
    // ❌ Validação fraca
    if(nome == "") { // ❌ Comparação com == ao invés de ===
        alert("Preencha o nome!"); // ❌ Alert
        return false;
    }
    
    if(email == "") {
        alert("Preencha o email!");
        return false;
    }
    
    // ❌ Validação de email regex fraca
    if(!email.includes("@")) {
        alert("Email inválido!");
        return false;
    }
    
    // ❌ Simular envio com timeout
    setTimeout(function() {
        alert("Comentário enviado!"); // ❌ Alert ao invés de UI feedback
        // ❌ Limpar formulário manipulando DOM diretamente
        document.querySelector('input').value = "";
        document.querySelectorAll('input')[1].value = "";
        document.querySelector('textarea').value = "";
    }, 2000);
}

// ❌ Função com muitas responsabilidades
function buscar(termo) {
    console.log("Buscando:", termo);
    
    // ❌ Simulação ruim de busca
    var resultados = [];
    
    // ❌ Loop ineficiente
    for(var i = 0; i < dados.noticias.length; i++) {
        if(dados.noticias[i].indexOf(termo) != -1) { // ❌ indexOf ao invés de includes
            resultados.push(dados.noticias[i]);
        }
    }
    
    // ❌ Manipulação de DOM dentro de lógica
    var container = document.querySelector('.resultados');
    container.innerHTML = ""; // ❌ Limpar HTML diretamente
    
    for(var i = 0; i < resultados.length; i++) {
        var div = document.createElement('div');
        div.innerHTML = resultados[i];
        div.onclick = function() {
            alert(resultados[i]); // ❌ Closure problem - i será sempre o último valor
        };
        container.appendChild(div);
    }
    
    if(resultados.length == 0) {
        alert("Nenhum resultado encontrado!");
    }
}

// ❌ Funções utilitárias mal implementadas
function getById(id) {
    return document.getElementById(id); // ❌ Wrapper desnecessário
}

function getByClass(className) {
    return document.getElementsByClassName(className); // ❌ Retorna HTMLCollection, não Array
}

// ❌ AJAX com XMLHttpRequest (método antigo)
function carregarNoticiasDoServidor() {
    var xhr = new XMLHttpRequest(); // ❌ XMLHttpRequest ao invés de fetch
    
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) { // ❌ Sem verificar status
            console.log(xhr.responseText);
            
            // ❌ JSON.parse sem try-catch
            var data = JSON.parse(xhr.responseText);
            dados = data;
        }
    };
    
    xhr.open("GET", "../data/noticias.json", true);
    xhr.send();
}

// ❌ Debounce mal implementado
var debounceTimer; // ❌ Global
function debounce(func, delay) {
    return function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(func, delay); // ❌ Não passa argumentos
    };
}

// ❌ Throttle inexistente (nem tentou implementar)

// ❌ Scroll handler sem otimização
window.onscroll = function() {
    // ❌ Cálculos pesados a cada scroll
    var scrollTop = document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight;
    var winHeight = window.innerHeight;
    var scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
    
    console.log("Scroll:", scrollPercent + "%"); // ❌ Console.log em loop
    
    // ❌ Manipulação de estilo direta
    if(scrollTop > 100) {
        document.querySelector('.topo').style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
    } else {
        document.querySelector('.topo').style.boxShadow = "none";
    }
};

// ❌ Resize handler sem debounce
window.onresize = function() {
    console.log("Redimensionado:", window.innerWidth); // ❌ Console.log
    
    // ❌ Lógica complexa sem otimização
    if(window.innerWidth < 768) {
        document.querySelector('.menu-list').style.display = "none";
    } else {
        document.querySelector('.menu-list').style.display = "flex";
    }
};

// ❌ Animação com setTimeout (deveria usar requestAnimationFrame)
function animar(elemento) {
    var pos = 0;
    var id = setInterval(function() {
        if(pos >= 100) {
            clearInterval(id);
        } else {
            pos++;
            elemento.style.left = pos + "px"; // ❌ Manipulação direta
        }
    }, 10);
}

// ❌ Cookies sem biblioteca adequada
function setCookie(name, value) {
    document.cookie = name + "=" + value; // ❌ Sem expiração, path, secure
}

function getCookie(name) {
    // ❌ Lógica complexa e bugada
    var cookies = document.cookie.split(';');
    for(var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if(cookie.startsWith(name + "=")) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

// ❌ LocalStorage sem try-catch
function salvarPreferencias(preferencias) {
    localStorage.setItem('preferencias', JSON.stringify(preferencias));
    // ❌ Sem verificar se localStorage está disponível
    // ❌ Sem tratar exceções (QuotaExceededError)
}

function carregarPreferencias() {
    var prefs = localStorage.getItem('preferencias');
    return JSON.parse(prefs); // ❌ Sem try-catch (pode retornar null)
}

// ❌ Date handling sem biblioteca
function formatarData(data) {
    // ❌ Lógica manual de formatação
    var dia = data.getDate();
    var mes = data.getMonth() + 1;
    var ano = data.getFullYear();
    
    // ❌ Concatenação de string sem padding
    return dia + "/" + mes + "/" + ano;
}

// ❌ Número aleatório sem crypto
function gerarId() {
    return Math.random().toString(36).substr(2, 9); // ❌ Não é seguro
}

// ❌ Deep clone mal feito
function clonar(obj) {
    return JSON.parse(JSON.stringify(obj)); // ❌ Perde funções, Date, etc
}

// ❌ Comparação de objetos ingênua
function objetosIguais(obj1, obj2) {
    return JSON.stringify(obj1) == JSON.stringify(obj2); // ❌ Não confiável
}

// ❌ Array methods mal usados
function filtrarNoticias(categoria) {
    var resultado = [];
    
    // ❌ Loop manual ao invés de filter()
    for(var i = 0; i < dados.noticias.length; i++) {
        if(dados.noticias[i].categoria == categoria) {
            resultado.push(dados.noticias[i]);
        }
    }
    
    return resultado;
}

// ❌ String manipulation insegura
function criarHTML(texto) {
    return "<div>" + texto + "</div>"; // ❌ XSS vulnerability
}

// ❌ Promises mal usadas (nem usa)
// ❌ Async/await inexistente

// ❌ Error handling inexistente
function funcaoPerigosa() {
    // ❌ Sem try-catch
    var resultado = JSON.parse("{ invalid json }");
    return resultado.propriedade.naoExiste;
}

// ❌ Memory leaks
var cache = {}; // ❌ Nunca limpa
function cachear(chave, valor) {
    cache[chave] = valor; // ❌ Cresce indefinidamente
}

// ❌ Event listeners não removidos
function adicionarListeners() {
    // ❌ Adiciona listeners repetidamente sem remover
    document.body.addEventListener('click', function() {
        console.log('Click');
    });
}

// ❌ Timers não limpos
var intervalId = setInterval(function() {
    console.log("Tick");
}, 1000);
// ❌ Nunca chama clearInterval

// ❌ Mixing concerns (DOM + lógica + dados)
function processarEMostrar(dados) {
    // ❌ Tudo junto
    var processado = dados.map(function(item) {
        return item.toUpperCase();
    });
    
    var container = document.querySelector('.container');
    container.innerHTML = processado.join(', ');
    
    localStorage.setItem('ultimo', processado[0]);
    
    return processado;
}

// ❌ Nomes de função não descritivos
function fazer() {
    // ❌ O que essa função faz?
    x++;
    y = x * 2;
    z = y / 3;
    return z;
}

function processar(a, b, c) {
    // ❌ Parâmetros não descritivos
    return a + b - c;
}

// ❌ Funções muito longas (god function)
function fazerTudo() {
    // ❌ 100+ linhas fazendo tudo
    var dados = carregarDados();
    var processado = processarDados(dados);
    validarDados(processado);
    salvarDados(processado);
    mostrarDados(processado);
    enviarParaServidor(processado);
    logarEstatisticas(processado);
    atualizarUI();
    // ... etc
}

// ❌ Magic numbers
function calcular(valor) {
    if(valor > 42) { // ❌ O que é 42?
        return valor * 3.14159; // ❌ O que é 3.14159?
    }
    return valor / 2.71828; // ❌ O que é 2.71828?
}

// ❌ Comentários inúteis
// Função que soma
function somar(a, b) {
    // Retorna a soma de a e b
    return a + b; // Soma a e b
}

// ❌ Código comentado (não deletar)
// function antigaFuncao() {
//     console.log("não usar");
// }

// function outraFuncaoAntiga() {
//     return "deprecated";
// }

// ❌ console.log em produção
console.log("======================================");
console.log("CABRA DA TECH V1 - ANTI-PADRÃO");
console.log("Este código tem MUITOS problemas!");
console.log("======================================");
console.log("Variáveis globais:", window);
console.log("Dados:", dados);
console.log("Menu aberto:", menuAberto);

// ❌ Código de debug não removido
var DEBUG = true;
if(DEBUG) {
    console.log("Modo debug ativado");
    window.debug = {
        dados: dados,
        menuAberto: menuAberto,
        contador: contador
    };
}

// ❌ Polyfills desnecessários ou mal feitos
if(!Array.prototype.includes) {
    Array.prototype.includes = function(elemento) {
        // ❌ Implementação incompleta
        return this.indexOf(elemento) !== -1;
    };
}

// ❌ Sobrescrever métodos nativos (NUNCA fazer)
Array.prototype.push = function(elemento) {
    console.log("Pushing:", elemento); // ❌ MUITO RUIM
    // ❌ Chama método original, mas adiciona log
    return Array.prototype.push.call(this, elemento);
};

// ❌ Eval (extremamente perigoso)
function executarCodigo(codigo) {
    eval(codigo); // ❌ NUNCA usar eval!
}

// ❌ with statement (deprecated)
function usarWith(obj) {
    with(obj) { // ❌ Deprecated e confuso
        console.log(propriedade);
    }
}

// ❌ Loops aninhados profundamente
function buscarNasNoticias(termo) {
    for(var i = 0; i < dados.noticias.length; i++) {
        for(var j = 0; j < dados.noticias[i].tags.length; j++) {
            for(var k = 0; k < termo.length; k++) {
                // ❌ Complexidade O(n³)
                if(dados.noticias[i].tags[j].charAt(k) == termo.charAt(k)) {
                    console.log("Match!");
                }
            }
        }
    }
}

// ❌ Recursão sem base case adequada
function recursiva(n) {
    console.log(n);
    return recursiva(n + 1); // ❌ Stack overflow garantido
}

// ❌ Ternários aninhados (ilegível)
var resultado = condicao1 ? valor1 : condicao2 ? valor2 : condicao3 ? valor3 : condicao4 ? valor4 : valor5;

// ❌ Type coercion implícita
var soma = "5" + 3; // "53"
var subtracao = "5" - 3; // 2
var multiplicacao = "5" * "3"; // 15
console.log(soma, subtracao, multiplicacao); // ❌ Confuso

// ❌ Comparações fracas
if("0" == 0) { // true (❌ deveria usar ===)
    console.log("Iguais!");
}

if([] == false) { // true (❌ WTF)
    console.log("Array vazio é false?");
}

// ❌ NaN checking errado
if(isNaN("abc")) { // ❌ Usar Number.isNaN()
    console.log("Não é número");
}

// ❌ Null/undefined checking inadequado
function processar(valor) {
    if(valor != null) { // ❌ Pega null E undefined
        console.log(valor);
    }
}

// ❌ Inicialização na execução (side effects)
iniciar(); // ❌ Executa automaticamente ao carregar o script

// ❌ Exportação inexistente (não é módulo)
// Sem exports, tudo no global

// ❌ Dependências não gerenciadas
// Sem package.json, npm, ou module bundler

// ❌ Sem testes
// Sem Jest, Mocha, ou qualquer framework de teste

// ❌ Sem documentação
// Sem JSDoc ou comentários úteis

// ❌ Sem linting
// Sem ESLint ou Prettier

// ❌ Sem TypeScript
// Sem type safety

/* ============================================
   FIM DO JAVASCRIPT ANTI-PADRÃO
   Total: ~500 linhas de JS problemático
   ============================================ */

// ❌ Última linha sem ponto e vírgula
console.log("Fim do arquivo")