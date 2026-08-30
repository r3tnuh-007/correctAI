/* ============================================================
   ANIMAÇÃO IA AJUDANDO HUMANO
   Suporta idioma (PT/EN) e um modo compacto para ser embutida
   na página principal (hero) além da página de demonstração.
   ============================================================ */

(function() {
    'use strict';

    const MENSAGENS = {
        pt: [
            { emoji: '🧠', texto: 'Analisando sua prova...', titulo: '🔍 A IA está a analisar...', subtitulo: 'A ler a sua prova com atenção' },
            { emoji: '⚡', texto: 'Processando dados...', titulo: '⚡ Processando dados...', subtitulo: 'A IA está a trabalhar para si' },
            { emoji: '🤖', texto: 'Corrigindo respostas...', titulo: '🤖 A IA está a corrigir...', subtitulo: 'A aplicar os critérios de avaliação' },
            { emoji: '✨', texto: 'Quase pronto!', titulo: '✨ Quase pronto!', subtitulo: 'A IA está a finalizar a correção' },
            { emoji: '🎯', texto: 'Ajustando detalhes...', titulo: '🎯 Ajustando detalhes...', subtitulo: 'A IA está a refinar a nota' },
            { emoji: '✅', texto: 'Corrigido com sucesso!', titulo: '✅ Corrigido com sucesso!', subtitulo: 'A IA concluiu a correção da sua prova' }
        ],
        en: [
            { emoji: '🧠', texto: 'Analysing your exam...', titulo: '🔍 The AI is analysing...', subtitulo: 'Reading your exam carefully' },
            { emoji: '⚡', texto: 'Processing data...', titulo: '⚡ Processing data...', subtitulo: 'The AI is working for you' },
            { emoji: '🤖', texto: 'Grading answers...', titulo: '🤖 The AI is grading...', subtitulo: 'Applying the grading criteria' },
            { emoji: '✨', texto: 'Almost there!', titulo: '✨ Almost there!', subtitulo: 'The AI is finishing up the grading' },
            { emoji: '🎯', texto: 'Fine-tuning details...', titulo: '🎯 Fine-tuning details...', subtitulo: 'The AI is refining the score' },
            { emoji: '✅', texto: 'Graded successfully!', titulo: '✅ Graded successfully!', subtitulo: 'The AI finished grading your exam' }
        ]
    };

    function idiomaPorDefeito() {
        if (typeof window.idiomaAtual === 'function') {
            const idioma = window.idiomaAtual();
            if (idioma === 'pt' || idioma === 'en') return idioma;
        }
        return 'en';
    }

    class AnimacaoIA {
        constructor(container, opcoes = {}) {
            this.container = container;
            this.compacto = !!opcoes.compacto;
            this.estaAtiva = false;
            this.intervaloMensagem = null;
            this.indiceMensagem = 0;
            this.idioma = opcoes.idioma === 'pt' || opcoes.idioma === 'en' ? opcoes.idioma : idiomaPorDefeito();
            this.mensagens = MENSAGENS[this.idioma];
        }

        iniciar() {
            if (this.estaAtiva) return;
            this.estaAtiva = true;
            this.renderizar();
            this.iniciarCicloMensagens();
            this.adicionarEventos();
        }

        parar() {
            this.estaAtiva = false;
            if (this.intervaloMensagem) {
                clearInterval(this.intervaloMensagem);
                this.intervaloMensagem = null;
            }
            if (this.container) {
                this.container.innerHTML = '';
            }
        }

        /**
         * Troca o idioma das mensagens em tempo real (usado quando o
         * botão de idioma da página principal é acionado).
         */
        mudarIdioma(idioma) {
            if (idioma !== 'pt' && idioma !== 'en') return;
            this.idioma = idioma;
            this.mensagens = MENSAGENS[this.idioma];
            this.atualizarMensagem(this.indiceMensagem);
        }

        renderizar() {
            if (!this.container) return;

            // Limpa o container
            this.container.innerHTML = '';

            // Cria a estrutura
            const wrapper = document.createElement('div');
            wrapper.className = this.compacto ? 'animacao-ia animacao-ia--compacto' : 'animacao-ia';

            const primeiraMensagem = this.mensagens[0];

            wrapper.innerHTML = `
                <div class="animacao-ia__cena">
                    <div class="animacao-ia__fundo"></div>

                    <div class="animacao-ia__particulas">
                        <div class="particula"></div>
                        <div class="particula"></div>
                        <div class="particula"></div>
                        <div class="particula"></div>
                        <div class="particula"></div>
                        <div class="particula"></div>
                        <div class="particula"></div>
                        <div class="particula"></div>
                        <div class="particula"></div>
                        <div class="particula"></div>
                    </div>

                    <div class="animacao-ia__ligacao"></div>
                    <div class="animacao-ia__faisca"></div>

                    <div class="animacao-ia__ia" id="iaIcone">🤖</div>
                    <div class="animacao-ia__humano" id="humanoIcone">🧑‍💻</div>

                    <div class="animacao-ia__bolha" id="bolhaDialogo">
                        <p class="animacao-ia__bolha-texto">
                            <span class="animacao-ia__bolha-emoji" id="bolhaEmoji">${primeiraMensagem.emoji}</span>
                            <span id="bolhaTexto">${primeiraMensagem.texto}</span>
                        </p>
                    </div>
                </div>

                <div class="animacao-ia__mensagem">
                    <h2 class="animacao-ia__titulo" id="tituloAnimacao">${primeiraMensagem.titulo}</h2>
                    <p class="animacao-ia__subtitulo" id="subtituloAnimacao">${primeiraMensagem.subtitulo}</p>
                </div>

                <div class="animacao-ia__progresso">
                    <div class="animacao-ia__progresso-bar" id="barraProgresso"></div>
                </div>
            `;

            this.container.appendChild(wrapper);

            // Salva referências
            this.bolhaEmoji = wrapper.querySelector('#bolhaEmoji');
            this.bolhaTexto = wrapper.querySelector('#bolhaTexto');
            this.titulo = wrapper.querySelector('#tituloAnimacao');
            this.subtitulo = wrapper.querySelector('#subtituloAnimacao');
            this.barraProgresso = wrapper.querySelector('#barraProgresso');
            this.iaIcone = wrapper.querySelector('#iaIcone');
            this.humanoIcone = wrapper.querySelector('#humanoIcone');
            this.bolhaDialogo = wrapper.querySelector('#bolhaDialogo');
        }

        iniciarCicloMensagens() {
            if (this.intervaloMensagem) {
                clearInterval(this.intervaloMensagem);
            }

            this.atualizarMensagem(0);

            this.intervaloMensagem = setInterval(() => {
                if (!this.estaAtiva) return;
                this.indiceMensagem = (this.indiceMensagem + 1) % this.mensagens.length;
                this.atualizarMensagem(this.indiceMensagem);
            }, 2500);
        }

        atualizarMensagem(indice) {
            const msg = this.mensagens[indice] || this.mensagens[0];

            if (this.bolhaEmoji) this.bolhaEmoji.textContent = msg.emoji;
            if (this.bolhaTexto) this.bolhaTexto.textContent = msg.texto;
            if (this.titulo) this.titulo.textContent = msg.titulo;
            if (this.subtitulo) this.subtitulo.textContent = msg.subtitulo;

            // Anima a bolha
            if (this.bolhaDialogo) {
                this.bolhaDialogo.style.animation = 'none';
                void this.bolhaDialogo.offsetWidth; // Força reflow
                this.bolhaDialogo.style.animation = 'bolhaAparecer 0.5s ease-out both';
            }

            // Atualiza a barra de progresso baseado no índice
            if (this.barraProgresso) {
                const progresso = ((indice + 1) / this.mensagens.length) * 100;
                this.barraProgresso.style.width = `${Math.min(100, progresso)}%`;
            }
        }

        adicionarEventos() {
            // Hover na IA
            if (this.iaIcone) {
                this.iaIcone.addEventListener('mouseenter', () => {
                    this.iaIcone.style.transform = 'scale(1.2) rotate(-8deg)';
                    this.iaIcone.style.transition = 'transform 0.3s ease';
                });
                this.iaIcone.addEventListener('mouseleave', () => {
                    this.iaIcone.style.transform = '';
                });
            }

            // Hover no Humano
            if (this.humanoIcone) {
                this.humanoIcone.addEventListener('mouseenter', () => {
                    this.humanoIcone.style.transform = 'scale(1.15)';
                    this.humanoIcone.style.transition = 'transform 0.3s ease';
                });
                this.humanoIcone.addEventListener('mouseleave', () => {
                    this.humanoIcone.style.transform = '';
                });
            }

            // Clique para reiniciar
            if (this.container) {
                this.container.addEventListener('click', () => {
                    this.indiceMensagem = 0;
                    this.atualizarMensagem(0);
                    if (this.barraProgresso) {
                        this.barraProgresso.style.animation = 'none';
                        void this.barraProgresso.offsetWidth;
                        this.barraProgresso.style.animation = 'progressoCarregar 5s ease-in-out infinite';
                    }
                });
            }
        }

        // Método para atualizar manualmente
        setProgresso(percentual) {
            if (this.barraProgresso) {
                this.barraProgresso.style.width = `${Math.min(100, Math.max(0, percentual))}%`;
            }
        }
    }

    // Exporta para uso global
    window.AnimacaoIA = AnimacaoIA;

    // Inicializa automaticamente se encontrar o container
    document.addEventListener('DOMContentLoaded', function() {
        const container = document.getElementById('animacaoContainer');
        if (container) {
            const compacto = container.hasAttribute('data-compacto');
            const animacao = new AnimacaoIA(container, { compacto });
            animacao.iniciar();
            // Guarda a instância para permitir sincronizar o idioma
            // com o botão 🌐 PT/EN da página principal.
            window.animacaoIAInstancia = animacao;
        }
    });

})();
