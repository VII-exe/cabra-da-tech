#!/usr/bin/env node

/**
 * ============================================
 * VALIDATE-I18N.JS
 * ============================================
 * 
 * Valida traduções i18n:
 * - Chaves faltantes em idiomas
 * - Chaves órfãs (não usadas)
 * - Placeholders inconsistentes
 * - Completude das traduções
 * 
 * Uso: node tools/validate-i18n.js [--fix]
 */

const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURAÇÃO
// ============================================

const CONFIG = {
    localesDir: './v4-global-i18n/locales',
    baseLocale: 'pt-BR',
    requiredLocales: ['pt-BR', 'en', 'es', 'ar', 'hi', 'ja', 'ru'],
    encoding: 'utf8',
    fix: process.argv.includes('--fix'),
    verbose: process.argv.includes('--verbose') || process.argv.includes('-v')
};

// ============================================
// CLASSES
// ============================================

class ValidadorI18n {
    constructor() {
        this.locales = {};
        this.erros = [];
        this.avisos = [];
        this.infos = [];
        this.stats = {
            totalChaves: 0,
            localesCarregados: 0,
            chavesFaltantes: 0,
            chavesOrfas: 0,
            placeholdersInconsistentes: 0
        };
    }

    /**
     * Carregar todos os arquivos de locale
     */
    carregarLocales() {
        console.log('📂 Carregando arquivos de locale...\n');

        for (const locale of CONFIG.requiredLocales) {
            const caminhoArquivo = path.join(CONFIG.localesDir, `${locale}.json`);

            try {
                if (!fs.existsSync(caminhoArquivo)) {
                    this.erros.push({
                        tipo: 'ARQUIVO_FALTANTE',
                        locale: locale,
                        mensagem: `Arquivo de locale não encontrado: ${caminhoArquivo}`
                    });
                    console.log(`  ❌ ${locale}.json - NÃO ENCONTRADO`);
                    continue;
                }

                const conteudo = fs.readFileSync(caminhoArquivo, CONFIG.encoding);
                const dados = JSON.parse(conteudo);

                this.locales[locale] = dados;
                this.stats.localesCarregados++;

                console.log(`  ✅ ${locale}.json - ${Object.keys(dados.translations || {}).length} chaves principais`);

            } catch (erro) {
                this.erros.push({
                    tipo: 'ERRO_PARSING',
                    locale: locale,
                    mensagem: `Erro ao processar ${locale}.json: ${erro.message}`
                });
                console.log(`  ❌ ${locale}.json - ERRO: ${erro.message}`);
            }
        }

        console.log(`\n✅ ${this.stats.localesCarregados}/${CONFIG.requiredLocales.length} locales carregados\n`);
    }

    /**
     * Extrair todas as chaves de um objeto (recursivo)
     */
    extrairChaves(obj, prefixo = '') {
        const chaves = [];

        for (const [key, value] of Object.entries(obj)) {
            const chaveFull = prefixo ? `${prefixo}.${key}` : key;

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                chaves.push(...this.extrairChaves(value, chaveFull));
            } else {
                chaves.push(chaveFull);
            }
        }

        return chaves;
    }

    /**
     * Obter valor de uma chave aninhada
     */
    obterValor(obj, chave) {
        const partes = chave.split('.');
        let valor = obj;

        for (const parte of partes) {
            if (valor && typeof valor === 'object' && parte in valor) {
                valor = valor[parte];
            } else {
                return undefined;
            }
        }

        return valor;
    }

    /**
     * Extrair placeholders de uma string
     */
    extrairPlaceholders(texto) {
        if (typeof texto !== 'string') return [];

        const regex = /\{\{(\w+)\}\}/g;
        const placeholders = [];
        let match;

        while ((match = regex.exec(texto)) !== null) {
            placeholders.push(match[1]);
        }

        return placeholders;
    }

    /**
     * Validar completude das traduções
     */
    validarCompletude() {
        console.log('🔍 Validando completude das traduções...\n');

        const baseLocale = this.locales[CONFIG.baseLocale];
        if (!baseLocale) {
            this.erros.push({
                tipo: 'BASE_LOCALE_AUSENTE',
                mensagem: `Locale base (${CONFIG.baseLocale}) não encontrado`
            });
            return;
        }

        // Extrair todas as chaves do locale base
        const chavesBase = this.extrairChaves(baseLocale.translations);
        this.stats.totalChaves = chavesBase.length;

        console.log(`📋 Total de chaves no locale base (${CONFIG.baseLocale}): ${chavesBase.length}\n`);

        // Verificar cada locale
        for (const locale of CONFIG.requiredLocales) {
            if (locale === CONFIG.baseLocale) continue;
            if (!this.locales[locale]) continue;

            console.log(`🌍 Validando: ${locale}`);

            const chavesLocale = this.extrairChaves(this.locales[locale].translations);
            const chavesFaltantes = chavesBase.filter(chave => !chavesLocale.includes(chave));
            const chavesExtras = chavesLocale.filter(chave => !chavesBase.includes(chave));

            // Chaves faltantes
            if (chavesFaltantes.length > 0) {
                this.erros.push({
                    tipo: 'CHAVES_FALTANTES',
                    locale: locale,
                    chaves: chavesFaltantes,
                    mensagem: `${chavesFaltantes.length} chave(s) faltante(s)`
                });
                this.stats.chavesFaltantes += chavesFaltantes.length;

                console.log(`  ❌ ${chavesFaltantes.length} chave(s) faltante(s)`);

                if (CONFIG.verbose) {
                    chavesFaltantes.slice(0, 5).forEach(chave => {
                        console.log(`     - ${chave}`);
                    });
                    if (chavesFaltantes.length > 5) {
                        console.log(`     ... e mais ${chavesFaltantes.length - 5}`);
                    }
                }
            }

            // Chaves extras (órfãs)
            if (chavesExtras.length > 0) {
                this.avisos.push({
                    tipo: 'CHAVES_EXTRAS',
                    locale: locale,
                    chaves: chavesExtras,
                    mensagem: `${chavesExtras.length} chave(s) extra(s) não presente(s) no locale base`
                });
                this.stats.chavesOrfas += chavesExtras.length;

                console.log(`  ⚠️  ${chavesExtras.length} chave(s) órfã(s)`);

                if (CONFIG.verbose) {
                    chavesExtras.slice(0, 3).forEach(chave => {
                        console.log(`     - ${chave}`);
                    });
                }
            }

            // Calcular percentual de completude
            const completude = Math.round((chavesLocale.length / chavesBase.length) * 100);
            const status = completude === 100 ? '✅' : completude >= 90 ? '⚠️ ' : '❌';
            console.log(`  ${status} Completude: ${completude}% (${chavesLocale.length}/${chavesBase.length})`);

            console.log('');
        }
    }

    /**
     * Validar placeholders
     */
    validarPlaceholders() {
        console.log('🔍 Validando placeholders...\n');

        const baseLocale = this.locales[CONFIG.baseLocale];
        if (!baseLocale) return;

        const chavesBase = this.extrairChaves(baseLocale.translations);

        for (const chave of chavesBase) {
            const valorBase = this.obterValor(baseLocale.translations, chave);
            const placeholdersBase = this.extrairPlaceholders(valorBase);

            if (placeholdersBase.length === 0) continue;

            // Verificar em cada locale
            for (const locale of CONFIG.requiredLocales) {
                if (locale === CONFIG.baseLocale) continue;
                if (!this.locales[locale]) continue;

                const valorLocale = this.obterValor(this.locales[locale].translations, chave);
                const placeholdersLocale = this.extrairPlaceholders(valorLocale);

                // Comparar placeholders
                const faltando = placeholdersBase.filter(p => !placeholdersLocale.includes(p));
                const extras = placeholdersLocale.filter(p => !placeholdersBase.includes(p));

                if (faltando.length > 0 || extras.length > 0) {
                    this.erros.push({
                        tipo: 'PLACEHOLDERS_INCONSISTENTES',
                        locale: locale,
                        chave: chave,
                        mensagem: `Placeholders inconsistentes em "${chave}"`,
                        base: placeholdersBase,
                        locale: placeholdersLocale,
                        faltando: faltando,
                        extras: extras
                    });
                    this.stats.placeholdersInconsistentes++;

                    console.log(`  ❌ ${locale}: ${chave}`);
                    console.log(`     Base: [${placeholdersBase.join(', ')}]`);
                    console.log(`     ${locale}: [${placeholdersLocale.join(', ')}]`);
                    if (faltando.length > 0) {
                        console.log(`     Faltando: [${faltando.join(', ')}]`);
                    }
                    if (extras.length > 0) {
                        console.log(`     Extras: [${extras.join(', ')}]`);
                    }
                    console.log('');
                }
            }
        }

        if (this.stats.placeholdersInconsistentes === 0) {
            console.log('  ✅ Todos os placeholders estão consistentes\n');
        }
    }

    /**
     * Validar metadados
     */
    validarMetadados() {
        console.log('🔍 Validando metadados...\n');

        const camposObrigatorios = ['locale', 'language', 'nativeName', 'direction', 'version'];

        for (const locale of CONFIG.requiredLocales) {
            if (!this.locales[locale]) continue;

            const dados = this.locales[locale];

            for (const campo of camposObrigatorios) {
                if (!dados[campo]) {
                    this.erros.push({
                        tipo: 'METADADO_FALTANTE',
                        locale: locale,
                        campo: campo,
                        mensagem: `Campo obrigatório "${campo}" ausente em ${locale}.json`
                    });
                    console.log(`  ❌ ${locale}: campo "${campo}" ausente`);
                }
            }

            // Validar direção
            if (dados.direction && !['ltr', 'rtl'].includes(dados.direction)) {
                this.erros.push({
                    tipo: 'DIRECTION_INVALIDO',
                    locale: locale,
                    valor: dados.direction,
                    mensagem: `Valor inválido para "direction": ${dados.direction}`
                });
                console.log(`  ❌ ${locale}: direction inválido "${dados.direction}"`);
            }

            // Validar code do locale
            if (dados.locale !== locale) {
                this.avisos.push({
                    tipo: 'LOCALE_CODE_MISMATCH',
                    locale: locale,
                    valor: dados.locale,
                    mensagem: `Nome do arquivo (${locale}) não corresponde ao campo "locale" (${dados.locale})`
                });
                console.log(`  ⚠️  ${locale}: mismatch entre nome do arquivo e campo "locale"`);
            }
        }

        console.log('');
    }

    /**
     * Verificar traduções vazias
     */
    validarTraducoesVazias() {
        console.log('🔍 Validando traduções vazias...\n');

        for (const locale of CONFIG.requiredLocales) {
            if (!this.locales[locale]) continue;

            const chaves = this.extrairChaves(this.locales[locale].translations);
            const vazias = chaves.filter(chave => {
                const valor = this.obterValor(this.locales[locale].translations, chave);
                return typeof valor === 'string' && valor.trim() === '';
            });

            if (vazias.length > 0) {
                this.avisos.push({
                    tipo: 'TRADUCOES_VAZIAS',
                    locale: locale,
                    chaves: vazias,
                    mensagem: `${vazias.length} tradução(ões) vazia(s)`
                });

                console.log(`  ⚠️  ${locale}: ${vazias.length} tradução(ões) vazia(s)`);

                if (CONFIG.verbose) {
                    vazias.slice(0, 3).forEach(chave => {
                        console.log(`     - ${chave}`);
                    });
                }
            }
        }

        console.log('');
    }

    /**
     * Gerar relatório final
     */
    gerarRelatorio() {
        console.log('\n' + '='.repeat(70));
        console.log('📊 RELATÓRIO DE VALIDAÇÃO i18n');
        console.log('='.repeat(70));

        console.log('\n📈 Estatísticas:');
        console.log(`  📁 Locales carregados: ${this.stats.localesCarregados}/${CONFIG.requiredLocales.length}`);
        console.log(`  🔑 Total de chaves: ${this.stats.totalChaves}`);
        console.log(`  ❌ Chaves faltantes: ${this.stats.chavesFaltantes}`);
        console.log(`  ⚠️  Chaves órfãs: ${this.stats.chavesOrfas}`);
        console.log(`  🔤 Placeholders inconsistentes: ${this.stats.placeholdersInconsistentes}`);

        console.log('\n📋 Resumo:');
        console.log(`  ❌ Erros: ${this.erros.length}`);
        console.log(`  ⚠️  Avisos: ${this.avisos.length}`);
        console.log(`  ℹ️  Informações: ${this.infos.length}`);

        // Mostrar erros críticos
        if (this.erros.length > 0 && !CONFIG.verbose) {
            console.log('\n❌ Erros Críticos (use --verbose para mais detalhes):');
            const errosPorTipo = {};

            this.erros.forEach(erro => {
                errosPorTipo[erro.tipo] = (errosPorTipo[erro.tipo] || 0) + 1;
            });

            for (const [tipo, count] of Object.entries(errosPorTipo)) {
                console.log(`  - ${tipo}: ${count}`);
            }
        }

        // Status final
        console.log('\n' + '='.repeat(70));
        if (this.erros.length === 0) {
            console.log('✅ VALIDAÇÃO CONCLUÍDA COM SUCESSO!');
            console.log('   Todas as traduções estão completas e consistentes.');
        } else {
            console.log('❌ VALIDAÇÃO FALHOU');
            console.log(`   ${this.erros.length} erro(s) encontrado(s) - Corrija antes de prosseguir.`);
        }
        console.log('='.repeat(70) + '\n');

        return this.erros.length === 0;
    }

    /**
     * Executar validação completa
     */
    executar() {
        console.log('🚀 Iniciando validação de i18n...\n');
        console.log(`📂 Diretório: ${CONFIG.localesDir}`);
        console.log(`🌍 Locale base: ${CONFIG.baseLocale}`);
        console.log(`🗣️  Locales esperados: ${CONFIG.requiredLocales.join(', ')}\n`);

        this.carregarLocales();

        if (this.stats.localesCarregados === 0) {
            console.error('\n❌ Nenhum locale foi carregado. Abortando validação.');
            return false;
        }

        this.validarMetadados();
        this.validarCompletude();
        this.validarPlaceholders();
        this.validarTraducoesVazias();

        return this.gerarRelatorio();
    }
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

function salvarRelatorioJSON(validador) {
    const relatorio = {
        timestamp: new Date().toISOString(),
        config: CONFIG,
        stats: validador.stats,
        erros: validador.erros,
        avisos: validador.avisos,
        infos: validador.infos
    };

    const outputDir = './reports';
    const outputFile = path.join(outputDir, 'i18n-validation.json');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(relatorio, null, 2), CONFIG.encoding);
    console.log(`📄 Relatório JSON salvo: ${outputFile}\n`);
}

// ============================================
// EXECUÇÃO
// ============================================

function main() {
    // Verificar se diretório existe
    if (!fs.existsSync(CONFIG.localesDir)) {
        console.error(`❌ Erro: Diretório não encontrado: ${CONFIG.localesDir}`);
        process.exit(1);
    }

    const validador = new ValidadorI18n();
    const sucesso = validador.executar();

    // Salvar relatório JSON
    salvarRelatorioJSON(validador);

    process.exit(sucesso ? 0 : 1);
}

// Executar se for script principal
if (require.main === module) {
    main();
}

module.exports = { ValidadorI18n, CONFIG };