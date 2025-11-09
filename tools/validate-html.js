#!/usr/bin/env node

/**
 * ============================================
 * VALIDATE-HTML.JS
 * ============================================
 * 
 * Valida HTML e verifica conformidade com
 * padrões de acessibilidade WCAG
 * 
 * Uso: node tools/validate-html.js [caminho]
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// ============================================
// CONFIGURAÇÃO
// ============================================

const CONFIG = {
    encoding: 'utf8',
    ignorePatterns: [
        'node_modules',
        '.git',
        'reports',
        'tools'
    ],
    extensions: ['.html'],
    verbose: process.argv.includes('--verbose') || process.argv.includes('-v')
};

// ============================================
// REGRAS DE VALIDAÇÃO
// ============================================

const REGRAS = {
    // Estrutura HTML
    estrutura: [
        {
            id: 'DOCTYPE',
            nome: 'DOCTYPE declarado',
            severidade: 'erro',
            validar: (html) => html.trim().toLowerCase().startsWith('<!doctype html')
        },
        {
            id: 'HTML_LANG',
            nome: 'Atributo lang no <html>',
            severidade: 'erro',
            validar: (dom) => {
                const html = dom.window.document.documentElement;
                return html.hasAttribute('lang') && html.getAttribute('lang').length > 0;
            }
        },
        {
            id: 'CHARSET',
            nome: 'Charset UTF-8 declarado',
            severidade: 'erro',
            validar: (dom) => {
                const meta = dom.window.document.querySelector('meta[charset]');
                return meta && meta.getAttribute('charset').toLowerCase() === 'utf-8';
            }
        },
        {
            id: 'VIEWPORT',
            nome: 'Meta viewport presente',
            severidade: 'aviso',
            validar: (dom) => {
                return dom.window.document.querySelector('meta[name="viewport"]') !== null;
            }
        },
        {
            id: 'TITLE',
            nome: 'Título da página presente',
            severidade: 'erro',
            validar: (dom) => {
                const title = dom.window.document.querySelector('title');
                return title && title.textContent.trim().length > 0;
            }
        }
    ],

    // Semântica HTML5
    semantica: [
        {
            id: 'MAIN',
            nome: 'Elemento <main> presente',
            severidade: 'erro',
            validar: (dom) => {
                return dom.window.document.querySelector('main') !== null;
            }
        },
        {
            id: 'HEADINGS',
            nome: 'Hierarquia de headings (h1-h6)',
            severidade: 'aviso',
            validar: (dom) => {
                const headings = Array.from(dom.window.document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
                if (headings.length === 0) return false;

                const levels = headings.map(h => parseInt(h.tagName.charAt(1)));

                // Verificar se começa com h1
                if (levels[0] !== 1) return false;

                // Verificar saltos maiores que 1
                for (let i = 1; i < levels.length; i++) {
                    if (levels[i] - levels[i - 1] > 1) return false;
                }

                return true;
            }
        },
        {
            id: 'LANDMARKS',
            nome: 'Landmarks ARIA ou elementos semânticos',
            severidade: 'aviso',
            validar: (dom) => {
                const landmarks = dom.window.document.querySelectorAll(
                    'header, nav, main, footer, aside, section[aria-label], section[aria-labelledby], [role="banner"], [role="navigation"], [role="main"], [role="contentinfo"]'
                );
                return landmarks.length >= 3; // Pelo menos header, main, footer
            }
        }
    ],

    // Acessibilidade
    acessibilidade: [
        {
            id: 'IMG_ALT',
            nome: 'Imagens com texto alternativo',
            severidade: 'erro',
            validar: (dom) => {
                const images = Array.from(dom.window.document.querySelectorAll('img'));
                const semAlt = images.filter(img => !img.hasAttribute('alt'));

                if (semAlt.length > 0) {
                    return {
                        valido: false,
                        detalhes: `${semAlt.length} imagem(ns) sem atributo alt`
                    };
                }
                return { valido: true };
            }
        },
        {
            id: 'FORM_LABELS',
            nome: 'Inputs com labels associados',
            severidade: 'erro',
            validar: (dom) => {
                const inputs = Array.from(dom.window.document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'));
                const semLabel = inputs.filter(input => {
                    const id = input.getAttribute('id');
                    if (!id) return true;

                    const label = dom.window.document.querySelector(`label[for="${id}"]`);
                    const ariaLabel = input.getAttribute('aria-label');
                    const ariaLabelledby = input.getAttribute('aria-labelledby');

                    return !label && !ariaLabel && !ariaLabelledby;
                });

                if (semLabel.length > 0) {
                    return {
                        valido: false,
                        detalhes: `${semLabel.length} input(s) sem label associado`
                    };
                }
                return { valido: true };
            }
        },
        {
            id: 'LINKS_TEXT',
            nome: 'Links com texto descritivo',
            severidade: 'aviso',
            validar: (dom) => {
                const links = Array.from(dom.window.document.querySelectorAll('a[href]'));
                const textoVazio = links.filter(link => {
                    const texto = link.textContent.trim();
                    const ariaLabel = link.getAttribute('aria-label');
                    const title = link.getAttribute('title');

                    return !texto && !ariaLabel && !title;
                });

                if (textoVazio.length > 0) {
                    return {
                        valido: false,
                        detalhes: `${textoVazio.length} link(s) sem texto descritivo`
                    };
                }
                return { valido: true };
            }
        },
        {
            id: 'SKIP_LINKS',
            nome: 'Links de pular navegação',
            severidade: 'aviso',
            validar: (dom) => {
                const skipLinks = dom.window.document.querySelectorAll('a[href^="#"]');
                return skipLinks.length > 0;
            }
        },
        {
            id: 'BUTTON_TEXT',
            nome: 'Botões com texto ou aria-label',
            severidade: 'erro',
            validar: (dom) => {
                const buttons = Array.from(dom.window.document.querySelectorAll('button'));
                const semTexto = buttons.filter(btn => {
                    const texto = btn.textContent.trim();
                    const ariaLabel = btn.getAttribute('aria-label');

                    return !texto && !ariaLabel;
                });

                if (semTexto.length > 0) {
                    return {
                        valido: false,
                        detalhes: `${semTexto.length} botão(ões) sem texto ou aria-label`
                    };
                }
                return { valido: true };
            }
        },
        {
            id: 'TABINDEX',
            nome: 'Uso correto de tabindex',
            severidade: 'aviso',
            validar: (dom) => {
                const tabindexPositivo = Array.from(dom.window.document.querySelectorAll('[tabindex]'))
                    .filter(el => {
                        const value = parseInt(el.getAttribute('tabindex'));
                        return value > 0;
                    });

                if (tabindexPositivo.length > 0) {
                    return {
                        valido: false,
                        detalhes: `${tabindexPositivo.length} elemento(s) com tabindex positivo (não recomendado)`
                    };
                }
                return { valido: true };
            }
        }
    ],

    // ARIA
    aria: [
        {
            id: 'ARIA_ROLES',
            nome: 'Roles ARIA válidos',
            severidade: 'erro',
            validar: (dom) => {
                const rolesValidos = [
                    'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
                    'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo',
                    'definition', 'dialog', 'directory', 'document', 'form', 'grid',
                    'gridcell', 'group', 'heading', 'img', 'link', 'list', 'listbox',
                    'listitem', 'log', 'main', 'marquee', 'math', 'menu', 'menubar',
                    'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'note',
                    'option', 'presentation', 'progressbar', 'radio', 'radiogroup',
                    'region', 'row', 'rowgroup', 'rowheader', 'scrollbar', 'search',
                    'separator', 'slider', 'spinbutton', 'status', 'tab', 'tablist',
                    'tabpanel', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree',
                    'treegrid', 'treeitem'
                ];

                const elements = Array.from(dom.window.document.querySelectorAll('[role]'));
                const rolesInvalidos = elements.filter(el => {
                    const role = el.getAttribute('role');
                    return !rolesValidos.includes(role);
                });

                if (rolesInvalidos.length > 0) {
                    return {
                        valido: false,
                        detalhes: `${rolesInvalidos.length} elemento(s) com role ARIA inválido`
                    };
                }
                return { valido: true };
            }
        },
        {
            id: 'ARIA_LIVE',
            nome: 'Regiões ARIA live para anúncios',
            severidade: 'info',
            validar: (dom) => {
                const liveRegions = dom.window.document.querySelectorAll('[aria-live], [role="status"], [role="alert"]');
                return liveRegions.length > 0;
            }
        }
    ],

    // Performance
    performance: [
        {
            id: 'LAZY_LOADING',
            nome: 'Imagens com lazy loading',
            severidade: 'info',
            validar: (dom) => {
                const images = Array.from(dom.window.document.querySelectorAll('img'));
                const lazyImages = images.filter(img => img.getAttribute('loading') === 'lazy');

                return {
                    valido: true,
                    detalhes: `${lazyImages.length}/${images.length} imagens com lazy loading`
                };
            }
        },
        {
            id: 'IMG_DIMENSIONS',
            nome: 'Imagens com width e height',
            severidade: 'info',
            validar: (dom) => {
                const images = Array.from(dom.window.document.querySelectorAll('img'));
                const comDimensoes = images.filter(img =>
                    img.hasAttribute('width') && img.hasAttribute('height')
                );

                return {
                    valido: true,
                    detalhes: `${comDimensoes.length}/${images.length} imagens com dimensões`
                };
            }
        }
    ]
};

// ============================================
// CLASSES
// ============================================

class ValidadorHTML {
    constructor() {
        this.resultados = {
            arquivos: 0,
            erros: 0,
            avisos: 0,
            infos: 0,
            detalhes: []
        };
    }

    validarArquivo(caminhoArquivo) {
        console.log(`\n📄 Validando: ${caminhoArquivo}`);

        try {
            const html = fs.readFileSync(caminhoArquivo, CONFIG.encoding);
            const dom = new JSDOM(html);

            const resultado = {
                arquivo: caminhoArquivo,
                erros: [],
                avisos: [],
                infos: [],
                sucesso: []
            };

            // Validar cada categoria
            for (const [categoria, regras] of Object.entries(REGRAS)) {
                if (CONFIG.verbose) {
                    console.log(`\n  🔍 Categoria: ${categoria}`);
                }

                for (const regra of regras) {
                    let validacao;

                    if (regra.id === 'DOCTYPE') {
                        validacao = regra.validar(html);
                    } else {
                        validacao = regra.validar(dom);
                    }

                    // Processar resultado
                    const valido = typeof validacao === 'boolean' ? validacao : validacao.valido;
                    const detalhes = typeof validacao === 'object' ? validacao.detalhes : null;

                    const item = {
                        id: regra.id,
                        nome: regra.nome,
                        detalhes: detalhes
                    };

                    if (valido) {
                        resultado.sucesso.push(item);
                        if (CONFIG.verbose) {
                            console.log(`    ✅ ${regra.nome}`);
                            if (detalhes) console.log(`       ${detalhes}`);
                        }
                    } else {
                        if (regra.severidade === 'erro') {
                            resultado.erros.push(item);
                            console.log(`    ❌ ${regra.nome}`);
                            if (detalhes) console.log(`       ${detalhes}`);
                        } else if (regra.severidade === 'aviso') {
                            resultado.avisos.push(item);
                            console.log(`    ⚠️  ${regra.nome}`);
                            if (detalhes) console.log(`       ${detalhes}`);
                        } else if (regra.severidade === 'info') {
                            resultado.infos.push(item);
                            if (CONFIG.verbose) {
                                console.log(`    ℹ️  ${regra.nome}`);
                                if (detalhes) console.log(`       ${detalhes}`);
                            }
                        }
                    }
                }
            }

            // Atualizar contadores globais
            this.resultados.arquivos++;
            this.resultados.erros += resultado.erros.length;
            this.resultados.avisos += resultado.avisos.length;
            this.resultados.infos += resultado.infos.length;
            this.resultados.detalhes.push(resultado);

            return resultado;

        } catch (erro) {
            console.error(`\n❌ Erro ao processar arquivo: ${erro.message}`);
            return null;
        }
    }

    buscarArquivosHTML(diretorio) {
        const arquivos = [];

        const lerDiretorio = (dir) => {
            const items = fs.readdirSync(dir);

            for (const item of items) {
                const caminhoCompleto = path.join(dir, item);
                const stats = fs.statSync(caminhoCompleto);

                // Ignorar diretórios da lista
                if (stats.isDirectory()) {
                    const nomeDir = path.basename(caminhoCompleto);
                    if (!CONFIG.ignorePatterns.includes(nomeDir)) {
                        lerDiretorio(caminhoCompleto);
                    }
                } else if (stats.isFile()) {
                    const ext = path.extname(caminhoCompleto);
                    if (CONFIG.extensions.includes(ext)) {
                        arquivos.push(caminhoCompleto);
                    }
                }
            }
        };

        lerDiretorio(diretorio);
        return arquivos;
    }

    gerarRelatorio() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 RELATÓRIO DE VALIDAÇÃO');
        console.log('='.repeat(60));

        console.log(`\n📁 Arquivos analisados: ${this.resultados.arquivos}`);
        console.log(`❌ Erros: ${this.resultados.erros}`);
        console.log(`⚠️  Avisos: ${this.resultados.avisos}`);
        console.log(`ℹ️  Informações: ${this.resultados.infos}`);

        // Resumo por arquivo
        console.log('\n📋 Resumo por arquivo:');
        for (const detalhe of this.resultados.detalhes) {
            const status = detalhe.erros.length === 0 ? '✅' : '❌';
            console.log(`  ${status} ${path.basename(detalhe.arquivo)}`);
            console.log(`     Erros: ${detalhe.erros.length} | Avisos: ${detalhe.avisos.length} | OK: ${detalhe.sucesso.length}`);
        }

        // Status final
        console.log('\n' + '='.repeat(60));
        if (this.resultados.erros === 0) {
            console.log('✅ VALIDAÇÃO CONCLUÍDA COM SUCESSO!');
        } else {
            console.log('❌ VALIDAÇÃO FALHOU - CORRIGIR ERROS');
        }
        console.log('='.repeat(60) + '\n');

        return this.resultados.erros === 0;
    }

    executar(caminho) {
        console.log('🚀 Iniciando validação de HTML...\n');

        const stats = fs.statSync(caminho);

        if (stats.isFile()) {
            // Validar arquivo único
            this.validarArquivo(caminho);
        } else if (stats.isDirectory()) {
            // Validar todos os arquivos do diretório
            const arquivos = this.buscarArquivosHTML(caminho);
            console.log(`📂 Encontrados ${arquivos.length} arquivo(s) HTML\n`);

            for (const arquivo of arquivos) {
                this.validarArquivo(arquivo);
            }
        }

        return this.gerarRelatorio();
    }
}

// ============================================
// EXECUÇÃO
// ============================================

function main() {
    const args = process.argv.slice(2).filter(arg => !arg.startsWith('-'));
    const caminho = args[0] || '.';

    if (!fs.existsSync(caminho)) {
        console.error(`❌ Erro: Caminho não encontrado: ${caminho}`);
        process.exit(1);
    }

    const validador = new ValidadorHTML();
    const sucesso = validador.executar(caminho);

    process.exit(sucesso ? 0 : 1);
}

// Executar se for script principal
if (require.main === module) {
    main();
}

module.exports = { ValidadorHTML, REGRAS };