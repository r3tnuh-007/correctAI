/* ============================================================
   API SERVICE — Conexão com o backend
   SEM FALLBACK LOCAL - Apenas sucesso ou erro
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
        this.baseUrl = 'https://sua-api.com/api'; // ALTERE PARA SUA URL
        this.timeout = 300000; // 5 minutos

        // Endpoints
        this.endpoints = {
            corrigir: '/corrigir',
            status: '/status',
            download: '/download',
            health: '/health'
        };

        // Headers
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        // ==========================================
        // ESTADO DA CONEXÃO
        // ==========================================
        this.conectado = false;
        this.ultimoErro = null;
        this.verificandoConexao = false;
    }

    // ==========================================
    // VERIFICAÇÃO DE CONEXÃO
    // ==========================================

    /**
     * Verifica se a API está online
     */
    async verificarSaude() {
        if (this.verificandoConexao) {
            return this.conectado;
        }

        this.verificandoConexao = true;

        try {
            const response = await fetch(`${this.baseUrl}${this.endpoints.health}`, {
                method: 'GET',
                headers: this.headers,
                signal: AbortSignal.timeout(5000)
            });

            this.conectado = response.ok;

            if (!this.conectado) {
                this.ultimoErro = new Error(`Servidor respondeu com status ${response.status}`);
            }

            return this.conectado;
        } catch (error) {
            this.conectado = false;
            this.ultimoErro = error;
            console.error('❌ Erro ao verificar conexão:', error.message);
            return false;
        } finally {
            this.verificandoConexao = false;
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
            } else {
                throw new Error('Nenhum arquivo PDF anexado');
            }
        } else {
            if (ficheiros && ficheiros.length > 0) {
                ficheiros.forEach((foto, index) => {
                    formData.append(`prova_${index}`, foto);
                });
                formData.append('total_paginas', ficheiros.length);
            } else {
                throw new Error('Nenhuma foto anexada');
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
     * Envia a prova para correção
     * @throws {Error} Se houver falha na conexão ou na API
     */
    async enviarParaCorrecao(formData, callbacks = {}) {
        const { onProgress, onComplete, onError } = callbacks;

        // Verifica conexão antes de enviar
        const online = await this.verificarSaude();

        if (!online) {
            const erro = new Error('🚫 Falha na conexão com o servidor. Verifique sua internet e tente novamente.');
            this.ultimoErro = erro;
            if (onError) onError(erro);
            throw erro;
        }

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let timeoutId = null;
            let concluido = false;

            // ==========================================
            // CONFIGURAÇÃO DO TIMEOUT
            // ==========================================
            const definirTimeout = () => {
                timeoutId = setTimeout(() => {
                    if (!concluido) {
                        xhr.abort();
                        const erro = new Error('⏰ Tempo limite excedido. O servidor demorou muito para responder.');
                        this.ultimoErro = erro;
                        this.conectado = false;
                        if (onError) onError(erro);
                        reject(erro);
                    }
                }, this.timeout);
            };

            // ==========================================
            // PROGRESSO DO UPLOAD
            // ==========================================
            if (onProgress) {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentual = Math.round((event.loaded / event.total) * 100);
                        onProgress(percentual, 'upload');
                    }
                });
            }

            // ==========================================
            // PROGRESSO DO DOWNLOAD
            // ==========================================
            xhr.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const percentual = Math.round((event.loaded / event.total) * 100);
                    onProgress(percentual, 'processando');
                }
            });

            // ==========================================
            // RESPOSTA COMPLETA
            // ==========================================
            xhr.addEventListener('load', () => {
                concluido = true;
                clearTimeout(timeoutId);

                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const resposta = JSON.parse(xhr.responseText);
                        this.conectado = true;
                        if (onComplete) onComplete(resposta);
                        resolve(resposta);
                    } catch (e) {
                        const erro = new Error('❌ Resposta inválida do servidor.');
                        this.ultimoErro = erro;
                        if (onError) onError(erro);
                        reject(erro);
                    }
                } else {
                    let mensagemErro = `❌ Erro ${xhr.status}: `;

                    try {
                        const resposta = JSON.parse(xhr.responseText);
                        mensagemErro += resposta.mensagem || resposta.error || xhr.statusText;
                    } catch (e) {
                        mensagemErro += xhr.statusText || 'Erro desconhecido no servidor.';
                    }

                    const erro = new Error(mensagemErro);
                    this.ultimoErro = erro;
                    this.conectado = false;
                    if (onError) onError(erro);
                    reject(erro);
                }
            });

            // ==========================================
            // ERROS DE REDE
            // ==========================================
            xhr.addEventListener('error', () => {
                concluido = true;
                clearTimeout(timeoutId);

                const erro = new Error('🚫 Falha na conexão com o servidor. Verifique sua internet.');
                this.ultimoErro = erro;
                this.conectado = false;
                if (onError) onError(erro);
                reject(erro);
            });

            // ==========================================
            // TIMEOUT
            // ==========================================
            xhr.addEventListener('timeout', () => {
                concluido = true;
                clearTimeout(timeoutId);

                const erro = new Error('⏰ Tempo limite excedido. O servidor demorou muito para responder.');
                this.ultimoErro = erro;
                this.conectado = false;
                if (onError) onError(erro);
                reject(erro);
            });

            // ==========================================
            // ABORT
            // ==========================================
            xhr.addEventListener('abort', () => {
                concluido = true;
                clearTimeout(timeoutId);

                const erro = new Error('⛔ Requisição cancelada.');
                this.ultimoErro = erro;
                if (onError) onError(erro);
                reject(erro);
            });

            // ==========================================
            // ENVIA A REQUISIÇÃO
            // ==========================================
            try {
                const url = `${this.baseUrl}${this.endpoints.corrigir}`;
                xhr.open('POST', url, true);
                xhr.timeout = this.timeout;

                definirTimeout();
                xhr.send(formData);
            } catch (error) {
                concluido = true;
                clearTimeout(timeoutId);
                const erro = new Error(`❌ Erro ao enviar: ${error.message}`);
                this.ultimoErro = erro;
                this.conectado = false;
                if (onError) onError(erro);
                reject(erro);
            }
        });
    }

    /**
     * Verifica o status de uma correção
     */
    async verificarStatus(id) {
        try {
            const online = await this.verificarSaude();
            if (!online) {
                throw new Error('🚫 Falha na conexão com o servidor.');
            }

            const url = `${this.baseUrl}${this.endpoints.status}/${id}`;
            const response = await fetch(url, {
                headers: this.headers,
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                let mensagem = `Erro ${response.status}`;
                try {
                    const dados = await response.json();
                    mensagem = dados.mensagem || dados.error || mensagem;
                } catch (e) {}
                throw new Error(`❌ ${mensagem}`);
            }

            return await response.json();
        } catch (error) {
            this.ultimoErro = error;
            throw error;
        }
    }

    /**
     * Baixa relatório da correção
     */
    async baixarRelatorio(id, formato = 'pdf') {
        try {
            const online = await this.verificarSaude();
            if (!online) {
                throw new Error('🚫 Falha na conexão com o servidor.');
            }

            const url = `${this.baseUrl}${this.endpoints.download}/${id}?formato=${formato}`;
            const response = await fetch(url, {
                signal: AbortSignal.timeout(30000)
            });

            if (!response.ok) {
                let mensagem = `Erro ${response.status}`;
                try {
                    const dados = await response.json();
                    mensagem = dados.mensagem || dados.error || mensagem;
                } catch (e) {}
                throw new Error(`❌ ${mensagem}`);
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

    // ==========================================
    // MÉTODOS DE CONFIGURAÇÃO
    // ==========================================

    setBaseUrl(url) {
        this.baseUrl = url;
        console.log('✅ URL da API atualizada:', url);
    }

    setTimeout(ms) {
        this.timeout = ms;
        console.log('⏱️ Timeout configurado:', ms, 'ms');
    }

    getUltimoErro() {
        return this.ultimoErro;
    }

    isOnline() {
        return this.conectado;
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
// FUNÇÃO PARA ENVIAR PROVA - SEM FALLBACK
// ==========================================

async function enviarProvaParaCorrecao(prova, ficheiros, config, chave = null) {
    const api = getApiService();

    // Prepara os dados
    const formData = api.prepararDadosParaAPI(prova, ficheiros, config, chave);

    // Configura callbacks
    const callbacks = {
        onProgress: (percentual, tipo) => {
            const mensagem = tipo === 'upload'
                ? `📤 Enviando... ${percentual}%`
                : `⚡ Processando... ${percentual}%`;
            if (typeof mostrarToast === 'function') {
                mostrarToast(mensagem);
            }
        },
        onComplete: (resposta) => {
            console.log('✅ Correção concluída:', resposta);
            return resposta;
        },
        onError: (erro) => {
            console.error('❌ Erro:', erro.message);
            if (typeof mostrarToast === 'function') {
                mostrarToast(`❌ ${erro.message}`);
            }
            throw erro;
        }
    };

    // Envia para API - SEM FALLBACK
    return await api.enviarParaCorrecao(formData, callbacks);
}

// ==========================================
// EXPORTAÇÃO
// ==========================================

window.ApiService = ApiService;
window.getApiService = getApiService;
window.enviarProvaParaCorrecao = enviarProvaParaCorrecao;

console.log('🚀 API Service inicializado (SEM FALLBACK LOCAL)');
