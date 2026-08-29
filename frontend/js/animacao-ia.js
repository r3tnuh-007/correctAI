/* ============================================================
   ANIMAÇÃO IA AJUDANDO HUMANO
   Versão simplificada e funcional
   ============================================================ */

(function() {
    'use strict';

    class AnimacaoIA {
        constructor(container) {
            this.container = container;
            this.estaAtiva = false;
            this.intervaloMensagem = null;
            this.indiceMensagem = 0;

            this.mensagens = [
                { emoji: '🧠', texto: 'Analisando sua prova...', titulo: '🔍 A IA está a analisar...', subtitulo: 'A ler a sua prova com atenção' },
                { emoji: '⚡', texto: 'Processando dados...', titulo: '⚡ Processando dados...', subtitulo: 'A IA está a trabalhar para si' },
                { emoji: '🤖', texto: 'Corrigindo respostas...', titulo: '🤖 A IA está a corrigir...', subtitulo: 'A aplicar os critérios de avaliação' },
                { emoji: '✨', texto: 'Quase pronto!', titulo: '✨ Quase pronto!', subtitulo: 'A IA está a finalizar a correção' },
                { emoji: '🎯', texto: 'Ajustando detalhes...', titulo: '🎯 Ajustando detalhes...', subtitulo: 'A IA está a refinar a nota' },
                { emoji: '✅', texto: 'Corrigido com sucesso!', titulo: '✅ Corrigido com sucesso!', subtitulo: 'A IA concluiu a correção da sua prova' }
            ];
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

        renderizar() {
            if (!this.container) return;

            // Limpa o container
            this.container.innerHTML = '';

            // Cria a estrutura
            const wrapper = document.createElement('div');
            wrapper.className = 'animacao-ia';

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

                    <div class="animacao-ia__ia" id="iaIcone">🤖</div>
                    <div class="animacao-ia__humano" id="humanoIcone">🧑‍💻</div>

                    <div class="animacao-ia__bolha" id="bolhaDialogo">
                        <p class="animacao-ia__bolha-texto">
                            <span class="animacao-ia__bolha-emoji" id="bolhaEmoji">💡</span>
                            <span id="bolhaTexto">Analisando sua prova...</span>
                        </p>
                    </div>
                </div>

                <div class="animacao-ia__mensagem">
                    <h2 class="animacao-ia__titulo" id="tituloAnimacao">🔍 A IA está a analisar...</h2>
                    <p class="animacao-ia__subtitulo" id="subtituloAnimacao">A ler a sua prova com atenção</p>
                </div>

                <div class="animacao-ia__progresso">
                    <div class="animacao-ia__progresso-bar" id="barraProgresso"></div>
                </div>
            `;

            this.container.appendChild(wrapper);

            // Salva referências
            this.bolhaEmoji = document.getElementById('bolhaEmoji');
            this.bolhaTexto = document.getElementById('bolhaTexto');
            this.titulo = document.getElementById('tituloAnimacao');
            this.subtitulo = document.getElementById('subtituloAnimacao');
            this.barraProgresso = document.getElementById('barraProgresso');
            this.iaIcone = document.getElementById('iaIcone');
            this.humanoIcone = document.getElementById('humanoIcone');
            this.bolhaDialogo = document.getElementById('bolhaDialogo');
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
            const animacao = new AnimacaoIA(container);
            animacao.iniciar();
        }
    });

})();
