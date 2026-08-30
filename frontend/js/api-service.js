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
        this.baseUrl = 'https://canned-tainted-washstand.ngrok-free.dev';
        this.timeout = 300000; // 5 minutos

        // Endpoints
        this.endpoints = {
            corrigir: '/images-upload',
            status: '/status',
            download: '/download',
            health: '/health'
        };

        // Headers padrão (para requisições JSON)
        this.headers = {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'  // 🔑 CRUCIAL para ngrok
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
            console.log(`📡 Verificando saúde: ${this.baseUrl}${this.endpoints.health}`);

            const response = await fetch(`${this.baseUrl}${this.endpoints.health}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true'  // 🔑 CRUCIAL para ngrok
                },
                signal: AbortSignal.timeout(5000)
            });

            console.log(`🌕 Health check status: ${response.status}`);

            // Verifica se a resposta é JSON (e não a página de aviso do ngrok)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log('🟢 Health check bem-sucedido:', data);
                this.conectado = true;
                this.ultimoErro = null;
                return true;
            } else {
                // Se não for JSON, provavelmente é a página de aviso do ngrok
                console.warn('⚠️ Resposta não é JSON (possível página de aviso do ngrok)');
                this.conectado = false;
                this.ultimoErro = new Error('Servidor respondeu com página de aviso (ngrok). Verifique o cabeçalho ngrok-skip-browser-warning.');
                return false;
            }

        } catch (error) {
            this.conectado = false;
            this.ultimoErro = error;
            console.error('🚫 Erro ao verificar conexão:', error.message);
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

        // 1. Prepara os dados do estudante no formato JSON esperado pelo backend
        const studentData = {
            student_name: prova.nome || '',
            id: prova.numero || String(Date.now()),
            submission_time: new Date().toISOString(),
            class: prova.turma || '',
            subject: prova.disciplina || '',
            observations: `Número: ${prova.numero || ''}, Tipo: ${prova.tipo || 'foto'}`
        };

        // Adiciona os dados do estudante como JSON string
        formData.append('student_data', JSON.stringify(studentData));

        // 2. Adiciona as imagens (campo 'images' como esperado pelo backend)
        if (ficheiros && ficheiros.length > 0) {
            // Para cada arquivo, adiciona no campo 'images'
            ficheiros.forEach((foto, index) => {
                // O nome do campo DEVE ser 'images' para todos os arquivos
                formData.append('images', foto);
            });
        } else {
            throw new Error('Nenhum arquivo anexado');
        }

        // 3. Adiciona a chave de correção (se existir) como imagens adicionais
        // NOTA: O backend atual não suporta chave separada, você precisa adaptar
        if (chave) {
            // Opção 1: Adicionar como imagens adicionais com um identificador
            // Ou criar um novo endpoint que aceite chave
            alert("⚠️ Chave de correção não é suportada pelo backend atual");
            console.warn('⚠️ Chave de correção não é suportada pelo backend atual');
        }

        // 4. Timestamp (já incluído no student_data)
        // formData.append('timestamp', new Date().toISOString());

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

        if (onProgress) onProgress(0, 'upload');

        try {
            const url = `${this.baseUrl}${this.endpoints.corrigir}`;
            console.log(`📡 Enviando para: ${url}`);

            // 🔑 IMPORTANTE: Adicionar ngrok-skip-browser-warning ao enviar
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'ngrok-skip-browser-warning': 'true'  // 🔑 CRUCIAL para ngrok
                },
                signal: AbortSignal.timeout(this.timeout)
            });

            if (onProgress) onProgress(100, 'upload');

            if (!response.ok) {
                let mensagemErro = `❌ Erro ${response.status}: `;
                try {
                    const resposta = await response.json();
                    mensagemErro += resposta.mensagem || resposta.error || response.statusText;
                } catch (e) {
                    mensagemErro += response.statusText || 'Erro desconhecido no servidor.';
                }

                const erro = new Error(mensagemErro);
                this.ultimoErro = erro;
                this.conectado = false;
                if (onError) onError(erro);
                throw erro;
            }

            let resposta;
            try {
                resposta = await response.json();
            } catch (e) {
                const erro = new Error('❌ Resposta inválida do servidor.');
                this.ultimoErro = erro;
                if (onError) onError(erro);
                throw erro;
            }

            this.conectado = true;
            if (onComplete) onComplete(resposta);
            return resposta;
        } catch (error) {
            if (error && typeof error.message === 'string' && error.message.startsWith('❌')) {
                throw error;
            }

            if (error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
                const erro = new Error('⏰ Tempo limite excedido. O servidor demorou muito para responder.');
                this.ultimoErro = erro;
                this.conectado = false;
                if (onError) onError(erro);
                throw erro;
            }

            const erro = new Error('🚫 Falha na conexão com o servidor. Verifique sua internet.');
            this.ultimoErro = erro;
            this.conectado = false;
            if (onError) onError(erro);
            throw erro;
        }
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
                headers: {
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true'  // 🔑 CRUCIAL para ngrok
                },
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
                headers: {
                    'ngrok-skip-browser-warning': 'true'  // 🔑 CRUCIAL para ngrok
                },
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
            console.log('🟢 Correção concluída:', resposta);
            alert('🟢 Correção concluída com sucesso!\n' + resposta.evaluation);
            return resposta;
        },
        onError: (erro) => {
            console.error('🚫 Erro:', erro.message);
            if (typeof mostrarToast === 'function') {
                mostrarToast(`🚫 ${erro.message}`);
            }
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
