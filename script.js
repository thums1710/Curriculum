/** EmailJS — coloque aqui a tua Public Key (EmailJS → Account → API Keys) */
const EMAILJS_PUBLIC_KEY = "APPl2cW5_E4IfksqH";

const EMAILJS_SERVICE_ID = "service_4pde1xf";
const EMAILJS_TEMPLATE_ID = "template_2aehuco";

document.addEventListener("DOMContentLoaded", () => {
    // Elementos
    const btnToggleResumo = document.getElementById("toggleResumo");
    const btnToggleTema = document.getElementById("toggleTema");
    const textoResumo = document.getElementById("textoResumo");
    const saudacao = document.getElementById("saudacao");
    const contador = document.getElementById("contador");
    const formContato = document.getElementById("formContato");
    const inputNome = document.getElementById("nome");
    const inputEmailContato = document.getElementById("email");
    const textareaMensagem = document.getElementById("mensagem");
    const limpar = document.getElementById("limpar");
    const ano = document.getElementById("ano");
    const canvas = document.getElementById("skillsChart");

    // Ano atual no rodapé
    if (ano) ano.textContent = new Date().getFullYear();

    // ------ Tema persistente ------
    const metaThemeColor = document.getElementById("metaThemeColor");

    function aplicarCorBarraStatus(tema) {
        if (!metaThemeColor) return;
        metaThemeColor.setAttribute("content", tema === "light" ? "#f0f3f8" : "#0c0f14");
    }

    const iconeSol = btnToggleTema?.querySelector(".btn-theme__icon--sun");
    const iconeLua = btnToggleTema?.querySelector(".btn-theme__icon--moon");

    function atualizarUiTema(tema) {
        if (!btnToggleTema) return;
        const claro = tema === "light";
        btnToggleTema.setAttribute("aria-pressed", claro ? "true" : "false");
        btnToggleTema.setAttribute("aria-label", claro ? "Ativar tema escuro" : "Ativar tema claro");
        btnToggleTema.setAttribute("title", claro ? "Tema escuro" : "Tema claro");
        if (iconeSol) iconeSol.toggleAttribute("hidden", claro);
        if (iconeLua) iconeLua.toggleAttribute("hidden", !claro);
    }

    const temaSalvo = localStorage.getItem("tema") || "dark";
    document.body.setAttribute("data-theme", temaSalvo);
    aplicarCorBarraStatus(temaSalvo);
    atualizarUiTema(temaSalvo);

    // Alternar tema
    btnToggleTema?.addEventListener("click", () => {
        const atual = document.body.getAttribute("data-theme") === "light" ? "dark" : "light";
        document.body.setAttribute("data-theme", atual);
        localStorage.setItem("tema", atual);
        aplicarCorBarraStatus(atual);
        atualizarUiTema(atual);
    });

    // ------ Botão fixo “voltar ao topo” (aparece ao descer a página) ------
    const scrollTopBtn = document.getElementById("scrollTopBtn");
    const scrollTopThresholdPx = 160;
    let scrollTopRaf = 0;

    function atualizarBotaoTopo() {
        if (!scrollTopBtn) return;
        const y = window.scrollY || document.documentElement.scrollTop;
        const mostrar = y > scrollTopThresholdPx;
        scrollTopBtn.classList.toggle("is-visible", mostrar);
        scrollTopBtn.setAttribute("aria-hidden", mostrar ? "false" : "true");
        scrollTopBtn.tabIndex = mostrar ? 0 : -1;
    }

    function agendarAtualizarBotaoTopo() {
        if (!scrollTopBtn) return;
        if (scrollTopRaf) return;
        scrollTopRaf = window.requestAnimationFrame(() => {
            scrollTopRaf = 0;
            atualizarBotaoTopo();
        });
    }

    window.addEventListener("scroll", agendarAtualizarBotaoTopo, { passive: true });
    atualizarBotaoTopo();

    scrollTopBtn?.addEventListener("click", () => {
        const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduzirMovimento ? "auto" : "smooth" });
    });

    // ------ Mostrar/ocultar resumo ------
    btnToggleResumo?.addEventListener("click", () => {
        textoResumo.classList.toggle("hidden");
        const oculto = textoResumo.classList.contains("hidden");
        btnToggleResumo.setAttribute("aria-expanded", oculto ? "false" : "true");
    });

    // ------ Saudação com nome (localStorage) ------
    const nomeSalvo = localStorage.getItem("nome");
    if (nomeSalvo) {
        if (saudacao) saudacao.textContent = `Olá, ${nomeSalvo}. Bem-vindo ao currículo online.`;
        if (inputNome) inputNome.value = nomeSalvo;
    }

    if (typeof emailjs !== "undefined" && EMAILJS_PUBLIC_KEY) {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }

    const btnEnviarContato = document.getElementById("btnEnviarContato");
    const toastContato = document.getElementById("toastContato");
    let toastContatoEsconderId = 0;

    function definirCarregamentoEnvio(ativo) {
        if (!btnEnviarContato) return;
        btnEnviarContato.disabled = ativo;
        btnEnviarContato.classList.toggle("is-loading", ativo);
        btnEnviarContato.setAttribute("aria-busy", ativo ? "true" : "false");
    }

    function mostrarToastEnvioSucesso() {
        if (!toastContato) return;
        toastContato.textContent = "Mensagem enviada com sucesso!";
        toastContato.hidden = false;
        window.clearTimeout(toastContatoEsconderId);
        window.requestAnimationFrame(() => {
            toastContato.classList.add("is-visible");
        });
        toastContatoEsconderId = window.setTimeout(() => {
            toastContato.classList.remove("is-visible");
            window.setTimeout(() => {
                toastContato.hidden = true;
                toastContato.textContent = "";
            }, 380);
        }, 4200);
    }

    formContato?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nome = inputNome?.value?.trim() ?? "";
        const email = inputEmailContato?.value?.trim() ?? "";
        const mensagem = textareaMensagem?.value?.trim() ?? "";
        if (!nome || !email || !mensagem) {
            alert("Preencha nome, e-mail e a mensagem para enviar.");
            return;
        }
        if (typeof emailjs === "undefined") {
            alert("O envio por e-mail não está disponível (SDK EmailJS não carregou).");
            return;
        }
        if (!EMAILJS_PUBLIC_KEY) {
            alert("Configura a Public Key do EmailJS no ficheiro script.js (constante EMAILJS_PUBLIC_KEY).");
            return;
        }

        definirCarregamentoEnvio(true);

        try {
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                { nome, email, mensagem },
                { publicKey: EMAILJS_PUBLIC_KEY }
            );
            mostrarToastEnvioSucesso();
            localStorage.setItem("nome", nome);
            if (saudacao) saudacao.textContent = `Olá, ${nome}. Bem-vindo ao currículo online.`;
            formContato.reset();
        } catch (err) {
            console.error(err);
            alert("Não foi possível enviar a mensagem. Tenta novamente mais tarde.");
        } finally {
            definirCarregamentoEnvio(false);
        }
    });

    limpar?.addEventListener("click", () => {
        localStorage.removeItem("nome");
        if (saudacao) saudacao.textContent = "Bem-vindo ao currículo online.";
        if (inputNome) inputNome.value = "";
        if (inputEmailContato) inputEmailContato.value = "";
        if (textareaMensagem) textareaMensagem.value = "";
    });

    // ------ Canvas: gráfico de setores ------
    // Dados simulados (edite à vontade)
    // ------ Canvas: gráfico de setores (donut) + legenda HTML ao lado ------
    const data = [
        { label: "Suporte / Service Desk", value: 30, color: "#38bdf8" },
        { label: "Infraestrutura e Linux", value: 10, color: "#4ade80" },
        { label: "Tradução e localização", value: 15, color: "#fbbf24" },
        { label: "Operações online e e-commerce", value: 35, color: "#fb7185" },
        { label: "Programação e automação", value: 10, color: "#a78bfa" }
    ];

    /** Índice da fatia destacada (null = todas normais) */
    let selectedSkillIndex = null;

    function getChartLayout(cssWIn, cssHIn) {
        const cssW = (cssWIn ?? canvas.clientWidth) || Number(canvas.getAttribute("width")) || 520;
        const cssH = (cssHIn ?? canvas.clientHeight) || Number(canvas.getAttribute("height")) || 260;
        const w = cssW;
        const h = cssH;
        const radius = Math.min(w, h) * 0.40;
        return {
            w,
            h,
            cx: w * 0.30,
            cy: h * 0.56,
            radius,
            inner: radius * 0.56
        };
    }

    /**
     * @returns {number} índice da fatia | "center" (buraco) | "outside"
     */
    function hitTestSlice(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const { cx, cy, radius, inner } = getChartLayout();
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < inner) return "center";
        if (dist > radius) return "outside";
        const angle = Math.atan2(dy, dx);
        const norm = (angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
        const total = data.reduce((a, d) => a + d.value, 0);
        let acc = 0;
        for (let i = 0; i < data.length; i++) {
            const ang = (data[i].value / total) * Math.PI * 2;
            if (norm >= acc && norm < acc + ang) return i;
            acc += ang;
        }
        return data.length - 1;
    }

    function drawChart() {
        if (!canvas?.getContext) return;
        const ctx = canvas.getContext("2d");

        const dpr = window.devicePixelRatio || 1;
        const cssW = canvas.clientWidth || Number(canvas.getAttribute("width")) || 520;
        const cssH = canvas.clientHeight || Number(canvas.getAttribute("height")) || 260;
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const { w, h, cx, cy, radius, inner } = getChartLayout(cssW, cssH);

        const styles = getComputedStyle(document.body);
        const fg = styles.getPropertyValue("--fg").trim();
        const bg = styles.getPropertyValue("--bg").trim() || "#101218";

        ctx.clearRect(0, 0, w, h);
        ctx.font = "500 13px Inter, system-ui, Segoe UI, sans-serif";
        ctx.textBaseline = "top";
        ctx.fillStyle = fg;
        ctx.fillText("Distribuição indicativa (percentagem)", 14, 10);

        const total = data.reduce((a, d) => a + d.value, 0);
        let start = -Math.PI / 2;
        data.forEach((d, i) => {
            const ang = (d.value / total) * Math.PI * 2;
            ctx.save();
            ctx.globalAlpha = selectedSkillIndex === null ? 1 : (i === selectedSkillIndex ? 1 : 0.2);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, start, start + ang);
            ctx.closePath();
            ctx.fillStyle = d.color;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = bg;
            ctx.stroke();
            ctx.restore();
            start += ang;
        });

        /* Halo de luz na fatia selecionada (antes do furo do donut) */
        if (selectedSkillIndex !== null) {
            let a0 = -Math.PI / 2;
            for (let i = 0; i < data.length; i++) {
                const ang = (data[i].value / total) * Math.PI * 2;
                if (i === selectedSkillIndex) {
                    const d = data[i];
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.arc(cx, cy, radius, a0, a0 + ang);
                    ctx.closePath();
                    ctx.globalAlpha = 1;
                    ctx.shadowBlur = 34;
                    ctx.shadowColor = d.color;
                    ctx.fillStyle = d.color;
                    ctx.fill();
                    ctx.shadowBlur = 14;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.fill();
                    ctx.restore();
                    break;
                }
                a0 += ang;
            }
        }

        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(cx, cy, inner, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const legend = document.getElementById("legend");
        if (legend) {
            legend.innerHTML = "";
            data.forEach((d, i) => {
                const li = document.createElement("li");
                li.className = "legenda-item";
                li.dataset.index = String(i);
                if (selectedSkillIndex !== null) {
                    li.classList.toggle("legenda-item--active", i === selectedSkillIndex);
                    li.classList.toggle("legenda-item--dim", i !== selectedSkillIndex);
                }
                const sw = document.createElement("span");
                sw.className = "swatch";
                sw.style.backgroundColor = d.color;
                const label = document.createElement("span");
                label.className = "legenda-label";
                label.textContent = `${d.label} (${d.value}%)`;
                li.append(sw, label);
                legend.appendChild(li);
            });
        }
    }

    drawChart();
    btnToggleTema?.addEventListener("click", () => setTimeout(drawChart, 0));
    window.addEventListener("resize", drawChart);

    canvas?.addEventListener("click", (e) => {
        e.stopPropagation();
        const hit = hitTestSlice(e.clientX, e.clientY);
        if (hit === "center" || hit === "outside") {
            selectedSkillIndex = null;
        } else if (typeof hit === "number") {
            selectedSkillIndex = selectedSkillIndex === hit ? null : hit;
        }
        drawChart();
    });

    document.getElementById("legend")?.addEventListener("click", (e) => {
        const li = e.target.closest(".legenda-item");
        if (!li || !e.currentTarget.contains(li)) return;
        e.stopPropagation();
        const idx = Number(li.dataset.index);
        if (!Number.isInteger(idx) || idx < 0 || idx >= data.length) return;
        selectedSkillIndex = selectedSkillIndex === idx ? null : idx;
        drawChart();
    });

    document.addEventListener("click", () => {
        if (selectedSkillIndex === null) return;
        selectedSkillIndex = null;
        drawChart();
    });

    // ------ Leitor de áudio (hero, controlos personalizados) ------
    (function initHeroAudioPlayer() {
        const root = document.querySelector("[data-audio-player]");
        if (!root) return;
        const audio = root.querySelector("audio");
        const btn = root.querySelector(".hero-audio-player__play");
        const iconPlay = root.querySelector(".hero-audio-player__icon--play");
        const iconPause = root.querySelector(".hero-audio-player__icon--pause");
        const currentEl = root.querySelector(".hero-audio-player__current");
        const durationEl = root.querySelector(".hero-audio-player__duration");
        const bar = root.querySelector(".hero-audio-player__bar");
        const fill = root.querySelector(".hero-audio-player__fill");
        if (!audio || !btn || !iconPlay || !iconPause || !currentEl || !durationEl || !bar || !fill) return;

        const fmt = (t) => {
            if (!Number.isFinite(t) || t < 0) return "0:00";
            const m = Math.floor(t / 60);
            const s = Math.floor(t % 60);
            return `${m}:${String(s).padStart(2, "0")}`;
        };

        function updateUi() {
            const cur = audio.currentTime;
            const dur = audio.duration;
            currentEl.textContent = fmt(cur);
            if (Number.isFinite(dur)) durationEl.textContent = fmt(dur);
            let pct = 0;
            if (Number.isFinite(dur) && dur > 0) pct = (cur / dur) * 100;
            fill.style.width = `${pct}%`;
            bar.setAttribute("aria-valuenow", String(Math.round(pct)));
            bar.setAttribute("aria-valuetext", `${fmt(cur)} de ${fmt(Number.isFinite(dur) ? dur : 0)}`);
        }

        function setPlayingUi(playing) {
            btn.classList.toggle("hero-audio-player__play--active", playing);
            btn.setAttribute("aria-pressed", playing ? "true" : "false");
            btn.setAttribute("aria-label", playing ? "Pausar áudio de apresentação" : "Reproduzir áudio de apresentação");
            if (playing) {
                iconPlay.setAttribute("hidden", "");
                iconPause.removeAttribute("hidden");
            } else {
                iconPause.setAttribute("hidden", "");
                iconPlay.removeAttribute("hidden");
            }
        }

        btn.addEventListener("click", () => {
            if (audio.paused) audio.play().catch(() => {});
            else audio.pause();
        });

        audio.addEventListener("play", () => setPlayingUi(true));
        audio.addEventListener("pause", () => setPlayingUi(false));
        audio.addEventListener("ended", () => {
            setPlayingUi(false);
            updateUi();
        });
        audio.addEventListener("timeupdate", updateUi);
        audio.addEventListener("loadedmetadata", updateUi);

        function seekFromClientX(clientX) {
            const rect = bar.getBoundingClientRect();
            if (rect.width <= 0) return;
            const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
            const dur = audio.duration;
            if (Number.isFinite(dur) && dur > 0) audio.currentTime = ratio * dur;
        }

        let drag = false;
        bar.addEventListener("pointerdown", (e) => {
            if (e.button !== 0) return;
            drag = true;
            bar.setPointerCapture(e.pointerId);
            seekFromClientX(e.clientX);
        });
        bar.addEventListener("pointermove", (e) => {
            if (!drag) return;
            seekFromClientX(e.clientX);
        });
        bar.addEventListener("pointerup", (e) => {
            drag = false;
            try {
                bar.releasePointerCapture(e.pointerId);
            } catch (_) { /* ignore */ }
        });
        bar.addEventListener("pointercancel", () => {
            drag = false;
        });

        bar.addEventListener("keydown", (e) => {
            const dur = audio.duration;
            if (!Number.isFinite(dur) || dur <= 0) return;
            const step = 5;
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                audio.currentTime = Math.min(dur, audio.currentTime + step);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                audio.currentTime = Math.max(0, audio.currentTime - step);
            } else if (e.key === "Home") {
                e.preventDefault();
                audio.currentTime = 0;
            } else if (e.key === "End") {
                e.preventDefault();
                audio.currentTime = dur;
            }
        });

        setPlayingUi(false);
        updateUi();
    })();
});
