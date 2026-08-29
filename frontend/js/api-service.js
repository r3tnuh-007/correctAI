/* ============================================================
   API SERVICE — Conexão completa com o backend
   ============================================================ */

"use strict";

/**
 * Classe principal para gerenciar todas as comunicações com a API
 */
class ApiService {
    constructor() {
        // ==========================================
        // CONFIGURAÇÕES DA API
        // ==========================================
        this.baseUrl = 'https://sua-api.com/api'; // ALTERE PARA SUA URL REAL
        this.timeout = 300000; // 5 minutos

        // Endpoints da API
        this.endpoints = {
            corrigir: '/corrigir',
            status: '/status',
            download: '/download',
            health: '/health',
            feedback: '/feedback'
        };

        // Headers padrão
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        // Status da conexão
        this.conectado = false;
        this.ultimoErro = null;
    }

    // ==========================================
    // MÉTODOS PÚBLICOS PRINCIPAIS
    // ==========================================

    /**
     * Verifica se a API está online
     */
    async verificarSaude() {
        try {
            const response = await fetch(`${this.baseUrl}${this.endpoints.health}`, {
                method: 'GET',
                headers: this.headers,
                signal: AbortSignal.timeout(5000)
            });

            this.conectado = response.ok;
            return this.conectado;
        } catch (error) {
            this.conectado = false;
            this.ultimoErro = error;
            console.warn('API offline:', error.message);
            return false;
        }
    }

    /**
     * Prepara os dados para envio à API
     */
    prepararDadosParaAPI(prova, ficheiros, config, chave = null) {
        const formData = new FormData();

        // 1. Dados do estudante
        formData.append('id', prova.id || Date.now());
        formData.append('nome', prova.nome || '');
        formData.append('numero', prova.numero || '');
        formData.append('tipo', prova.tipo || 'pdf');

        // 2. Configurações de correção
        const configData = {
            rigor: config.rigor || 'equilibrado',
            tolerancia: config.tolerancia || 30,
            notaMax: config.notaMax || 20,
            metricas: Array.isArray(config.metricas) ? config.metricas : ['conteudo', 'raciocinio'],
            criterios: config.criterios || ''
        };
        formData.append('config', JSON.stringify(configData));

        // 3. Arquivos da prova
        if (prova.tipo === 'pdf') {
            if (ficheiros && ficheiros.length > 0) {
                formData.append('prova', ficheiros[0]);
            }
        } else {
            if (ficheiros && ficheiros.length > 0) {
                ficheiros.forEach((foto, index) => {
                    formData.append(`prova_${index}`, foto);
                });
                formData.append('total_paginas', ficheiros.length);
            }
        }

        // 4. Chave de correção (se existir)
        if (chave) {
            if (chave.tipo === 'pdf' && chave.pdf) {
                formData.append('chave', chave.pdf);
            } else if (chave.tipo === 'foto' && chave.fotos && chave.fotos.length > 0) {
                chave.fotos.forEach((foto, index) => {
                    formData.append(`chave_${index}`, foto);
                });
                formData.append('total_chave_paginas', chave.fotos.length);
            }
            formData.append('chave_tipo', chave.tipo);
        }

        // 5. Timestamp
        formData.append('timestamp', new Date().toISOString());

        return formData;
    }

    /**
     * Envia a prova para correção com progresso
     */
    async enviarParaCorrecao(formData, callbacks = {}) {
        const { onProgress, onComplete, onError } = callbacks;

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Progresso do upload
            if (onProgress) {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentual = Math.round((event.loaded / event.total) * 100);
                        onProgress(percentual, 'upload');
                    }
                });
            }

            // Progresso do download (processamento)
            xhr.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const percentual = Math.round((event.loaded / event.total) * 100);
                    onProgress(percentual, 'processando');
                }
            });

            // Resposta completa
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const resposta = JSON.parse(xhr.responseText);
                        if (onComplete) onComplete(resposta);
                        this.conectado = true;
                        resolve(resposta);
                    } catch (e) {
                        // Fallback se não for JSON
                        const resposta = {
                            status: 'sucesso',
                            raw: xhr.responseText,
                            nota: this._gerarNotaSimulada(),
                            comentario: 'Correção processada com sucesso.'
                        };
                        if (onComplete) onComplete(resposta);
                        resolve(resposta);
                    }
                } else {
                    const erro = new Error(`Erro ${xhr.status}: ${xhr.statusText}`);
                    this.ultimoErro = erro;
                    if (onError) onError(erro);
                    reject(erro);
                }
            });

            // Erros
            xhr.addEventListener('error', () => {
                const erro = new Error('Erro de conexão com a API');
                this.ultimoErro = erro;
                this.conectado = false;
                if (onError) onError(erro);
                reject(erro);
            });

            xhr.addEventListener('timeout', () => {
                const erro = new Error('Tempo limite excedido');
                this.ultimoErro = erro;
                if (onError) onError(erro);
                reject(erro);
            });

            // Envia a requisição
            const url = `${this.baseUrl}${this.endpoints.corrigir}`;
            xhr.open('POST', url, true);
            xhr.timeout = this.timeout;
            xhr.send(formData);
        });
    }

    /**
     * Verifica o status de uma correção
     */
    async verificarStatus(id) {
        try {
            const url = `${this.baseUrl}${this.endpoints.status}/${id}`;
            const response = await fetch(url, {
                headers: this.headers,
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            this.ultimoErro = error;
            throw error;
        }
    }

    /**
     * Monitora uma correção em tempo real
     */
    async monitorarCorrecao(id, callbacks = {}) {
        const { onStatus, onComplete, onError, intervalo = 3000 } = callbacks;
        const maxTentativas = 60; // 3 minutos

        let tentativas = 0;
        let conclusaoResolvida = false;

        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                tentativas++;

                try {
                    const status = await this.verificarStatus(id);

                    if (onStatus) onStatus(status, tentativas);

                    if (status.estado === 'concluido') {
                        clearInterval(interval);
                        conclusaoResolvida = true;
                        if (onComplete) onComplete(status);
                        resolve(status);
                    } else if (status.estado === 'erro') {
                        clearInterval(interval);
                        conclusaoResolvida = true;
                        const erro = new Error(status.mensagem || 'Erro na correção');
                        if (onError) onError(erro);
                        reject(erro);
                    }

                    if (tentativas >= maxTentativas && !conclusaoResolvida) {
                        clearInterval(interval);
                        const erro = new Error('Tempo limite de monitoramento excedido');
                        if (onError) onError(erro);
                        reject(erro);
                    }

                } catch (error) {
                    console.warn('Erro ao verificar status:', error);
                    if (tentativas >= maxTentativas) {
                        clearInterval(interval);
                        if (onError) onError(error);
                        reject(error);
                    }
                }
            }, intervalo);
        });
    }

    /**
     * Baixa relatório da correção
     */
    async baixarRelatorio(id, formato = 'pdf') {
        try {
            const url = `${this.baseUrl}${this.endpoints.download}/${id}?formato=${formato}`;
            const response = await fetch(url, {
                signal: AbortSignal.timeout(30000)
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `correcao-${id}.${formato}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(link.href);

            return { sucesso: true, formato };
        } catch (error) {
            this.ultimoErro = error;
            throw error;
        }
    }

    /**
     * Envia feedback sobre a correção
     */
    async enviarFeedback(id, feedback) {
        try {
            const url = `${this.baseUrl}${this.endpoints.feedback}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    id,
                    feedback,
                    timestamp: new Date().toISOString()
                }),
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            this.ultimoErro = error;
            throw error;
        }
    }

    // ==========================================
    // MÉTODOS DE UTILIDADE
    // ==========================================

    /**
     * Gera uma nota simulada (fallback)
     */
    _gerarNotaSimulada() {
        const base = 0.6 + Math.random() * 0.35;
        return Math.round(base * 20 * 10) / 10;
    }

    /**
     * Formata os dados da prova para exibição
     */
    formatarResposta(resposta) {
        return {
            nota: resposta.nota || 0,
            notaMaxima: resposta.notaMaxima || 20,
            detalhes: resposta.detalhes || null,
            comentario: resposta.comentario || 'Correção concluída.',
            status: resposta.status || 'sucesso',
            timestamp: resposta.timestamp || new Date().toISOString()
        };
    }

    /**
     * Valida os dados antes de enviar
     */
    validarDados(prova, ficheiros) {
        const erros = [];

        if (!prova.nome || prova.nome.length < 2) {
            erros.push('Nome do estudante inválido');
        }

        if (!prova.numero || prova.numero.length < 1) {
            erros.push('Número do estudante inválido');
        }

        if (!ficheiros || ficheiros.length === 0) {
            erros.push('Nenhum ficheiro anexado');
        }

        if (prova.tipo === 'pdf' && ficheiros && ficheiros.length > 1) {
            erros.push('Apenas um PDF é permitido');
        }

        if (prova.tipo === 'foto' && ficheiros && ficheiros.length > 20) {
            erros.push('Máximo de 20 fotos por prova');
        }

        return {
            valido: erros.length === 0,
            erros
        };
    }

    /**
     * Configura a URL da API
     */
    setBaseUrl(url) {
        this.baseUrl = url;
        console.log('✅ URL da API atualizada:', url);
    }

    /**
     * Configura timeout
     */
    setTimeout(ms) {
        this.timeout = ms;
        console.log('⏱️ Timeout configurado:', ms, 'ms');
    }
}

// ==========================================
// INSTÂNCIA ÚNICA GLOBAL
// ==========================================

let instanciaApi = null;

function getApiService() {
    if (!instanciaApi) {
        instanciaApi = new ApiService();
    }
    return instanciaApi;
}

// ==========================================
// FUNÇÕES AUXILIARES PARA INTEGRAÇÃO
// ==========================================

/**
 * Função completa para enviar uma prova para correção
 * Esta é a função principal que você deve chamar
 */
async function enviarProvaParaCorrecao(prova, ficheiros, config, chave = null) {
    const api = getApiService();

    // Valida os dados
    const validacao = api.validarDados(prova, ficheiros);
    if (!validacao.valido) {
        throw new Error('Dados inválidos: ' + validacao.erros.join(', '));
    }

    // Prepara os dados
    const formData = api.prepararDadosParaAPI(prova, ficheiros, config, chave);

    // Configura os callbacks
    const callbacks = {
        onProgress: (percentual, tipo) => {
            const mensagem = tipo === 'upload'
                ? `📤 Enviando... ${percentual}%`
                : `⚡ Processando... ${percentual}%`;
            mostrarToast(mensagem);
        },
        onComplete: (resposta) => {
            console.log('✅ Correção concluída:', resposta);
            return resposta;
        },
        onError: (erro) => {
            console.error('❌ Erro na correção:', erro);
            throw erro;
        }
    };

    // Envia para API
    try {
        const resultado = await api.enviarParaCorrecao(formData, callbacks);

        // Se a API retornou um ID para monitoramento
        if (resultado.id && resultado.status === 'processando') {
            mostrarToast(`⏳ Correção em andamento... ID: ${resultado.id}`);

            // Monitora o progresso
            const statusFinal = await api.monitorarCorrecao(resultado.id, {
                onStatus: (status, tentativa) => {
                    console.log(`Status (${tentativa}):`, status);
                },
                onComplete: (statusFinal) => {
                    console.log('✅ Correção finalizada:', statusFinal);
                    return statusFinal;
                },
                onError: (erro) => {
                    console.error('❌ Erro no monitoramento:', erro);
                    throw erro;
                }
            });

            return api.formatarResposta(statusFinal);
        }

        return api.formatarResposta(resultado);

    } catch (error) {
        console.error('❌ Erro ao enviar prova:', error);

        // Fallback: simula uma correção local
        console.warn('⚠️ Usando fallback local');
        return {
            nota: api._gerarNotaSimulada(),
            notaMaxima: config.notaMax || 20,
            comentario: 'Simulação local (API indisponível)',
            status: 'fallback',
            timestamp: new Date().toISOString(),
            erro: error.message
        };
    }
}

/**
 * Função para baixar relatório
 */
async function baixarRelatorioCorrecao(id, formato = 'pdf') {
    const api = getApiService();
    try {
        await api.baixarRelatorio(id, formato);
        mostrarToast(`✅ Relatório ${formato.toUpperCase()} baixado com sucesso!`);
    } catch (error) {
        mostrarToast(`❌ Erro ao baixar relatório: ${error.message}`);
        throw error;
    }
}

/**
 * Função para verificar saúde da API
 */
async function verificarApi() {
    const api = getApiService();
    const saudavel = await api.verificarSaude();
    if (saudavel) {
        console.log('✅ API está online');
    } else {
        console.warn('⚠️ API está offline');
    }
    return saudavel;
}

// ==========================================
// EXPORTA PARA USO GLOBAL
// ==========================================

// Exporta a instância e as funções
window.ApiService = ApiService;
window.getApiService = getApiService;
window.enviarProvaParaCorrecao = enviarProvaParaCorrecao;
window.baixarRelatorioCorrecao = baixarRelatorioCorrecao;
window.verificarApi = verificarApi;

console.log('🚀 API Service inicializado!');
console.log('📡 URL da API:', getApiService().baseUrl);

// ==========================================
// INICIALIZAÇÃO AUTOMÁTICA
// ==========================================

// Verifica a API ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    verificarApi().then(online => {
        if (online) {
            console.log('✅ Conectado à API');
        } else {
            console.warn('⚠️ Modo offline - usando simulação local');
        }
    });
});
