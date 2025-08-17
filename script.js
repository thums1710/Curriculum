document.addEventListener("DOMContentLoaded", () => {
    // Elementos
    const btnOla = document.getElementById("btn");
    const btnToggleResumo = document.getElementById("toggleResumo");
    const btnToggleTema = document.getElementById("toggleTema");
    const textoResumo = document.getElementById("textoResumo");
    const saudacao = document.getElementById("saudacao");
    const contador = document.getElementById("contador");
    const formNome = document.getElementById("formNome");
    const inputNome = document.getElementById("nome");
    const limpar = document.getElementById("limpar");
    const ano = document.getElementById("ano");
    const canvas = document.getElementById("skillsChart");

    // ------ Mensagem ao sair da página (exit-intent) ------
    let exitShown = false;
    function showExitMessage() {
        if (exitShown) return;
        exitShown = true;
        alert("Olá! Obrigado por visitar meu currículo. Volte sempre 🙂");
    }

    // Desktop: o mouse sai pelo topo da janela (indo fechar a aba, trocar de guia, etc.)
    document.addEventListener("mouseout", (e) => {
        const toElement = e.relatedTarget || e.toElement;
        if (!toElement && e.clientY <= 0) {
            showExitMessage();
        }
    }, { passive: true });

    // Fallback (mobile e alguns navegadores): quando a página fica oculta
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            showExitMessage();
        }
    });

    // Garantia extra: se ainda assim o usuário sair, tente disparar uma única vez
    window.addEventListener("pagehide", () => showExitMessage(), { once: true });

    // Ano atual no rodapé
    if (ano) ano.textContent = new Date().getFullYear();

    // ------ Tema persistente ------
    const temaSalvo = localStorage.getItem("tema") || "dark";
    document.body.setAttribute("data-theme", temaSalvo);
    if (btnToggleTema) btnToggleTema.setAttribute("aria-pressed", temaSalvo === "light" ? "true" : "false");

    // Alternar tema
    btnToggleTema?.addEventListener("click", () => {
        const atual = document.body.getAttribute("data-theme") === "light" ? "dark" : "light";
        document.body.setAttribute("data-theme", atual);
        localStorage.setItem("tema", atual);
        btnToggleTema.setAttribute("aria-pressed", atual === "light" ? "true" : "false");
    });

    // ------ Mostrar/ocultar resumo ------
    btnToggleResumo?.addEventListener("click", () => {
        textoResumo.classList.toggle("hidden");
        btnToggleResumo.textContent = textoResumo.classList.contains("hidden")
            ? "Mostrar resumo"
            : "Ocultar resumo";
    });

    // ------ Saudação com nome (localStorage) ------
    const nomeSalvo = localStorage.getItem("nome");
    if (nomeSalvo) {
        saudacao.textContent = `Olá, ${nomeSalvo}! Seja bem-vindo ao meu currículo.`;
        if (inputNome) inputNome.value = nomeSalvo;
    }

    formNome?.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome = inputNome?.value?.trim();
        if (!nome) {
            alert("Por favor, preencha seu nome para personalizar a saudação.");
            return;
        }
        localStorage.setItem("nome", nome);
        saudacao.textContent = `Olá, ${nome}! Feliz em ter você aqui.`;
    });

    limpar?.addEventListener("click", () => {
        localStorage.removeItem("nome");
        saudacao.textContent = "Olá! Bem-vindo ao meu currículo online.";
        if (inputNome) inputNome.value = "";
    });

    // ------ Contador de visitas ------
    const visitas = Number(localStorage.getItem("visitas") || "0") + 1;
    localStorage.setItem("visitas", String(visitas));
    if (contador) {
        contador.textContent = `Você já visitou esta página ${visitas} ${visitas === 1 ? "vez" : "vezes"}.`;
    }

    // ------ Canvas: gráfico de setores ------
    // Dados simulados (edite à vontade)
    // ------ Canvas: gráfico de setores (donut) + legenda HTML ao lado ------
    const data = [
        { label: "Suporte/Service Desk", value: 30, color: "#3b82f6" }, // azul
        { label: "Infra & Linux", value: 10, color: "#16a34a" }, // verde
        { label: "Tradução/Localização", value: 15, color: "#f59e0b" }, // âmbar
        { label: "Operações Online/E-commerce", value: 35, color: "#ef4444" }, // vermelho
        { label: "Programação/Automação", value: 10, color: "#a855f7" }  // roxo
    ];

    function drawChart() {
        if (!canvas?.getContext) return;
        const ctx = canvas.getContext("2d");

        // Escala HiDPI + tamanho baseado no tamanho VISUAL do canvas (responsivo)
        const dpr = window.devicePixelRatio || 1;
        const cssW = canvas.clientWidth || Number(canvas.getAttribute("width")) || 520;
        const cssH = canvas.clientHeight || Number(canvas.getAttribute("height")) || 260;
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const w = cssW, h = cssH;
        const cx = w * 0.30, cy = h * 0.56;
        const radius = Math.min(w, h) * 0.40;
        const inner = radius * 0.56;

        const styles = getComputedStyle(document.body);
        const fg = styles.getPropertyValue("--fg").trim();
        const bg = styles.getPropertyValue("--bg").trim() || "#0b0c10";

        // Limpa e título
        ctx.clearRect(0, 0, w, h);
        ctx.font = "16px system-ui, Segoe UI, Roboto, Arial";
        ctx.textBaseline = "top";
        ctx.fillStyle = fg;
        ctx.fillText("Distribuição aproximada de habilidades", 16, 10);

        // Fatias com contorno na cor do fundo (separa visualmente)
        const total = data.reduce((a, d) => a + d.value, 0);
        let start = -Math.PI / 2;
        data.forEach(d => {
            const ang = (d.value / total) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, start, start + ang);
            ctx.closePath();
            ctx.fillStyle = d.color;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = bg;
            ctx.stroke();
            start += ang;
        });

        // Furo do donut
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(cx, cy, inner, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Legenda ao lado (HTML)
        const legend = document.getElementById("legend");
        if (legend) {
            legend.innerHTML = "";
            data.forEach(d => {
                const li = document.createElement("li");
                li.className = "legenda-item";
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
    // Redesenhar ao alternar tema e ao redimensionar (mantém contraste e layout)
    btnToggleTema?.addEventListener("click", () => setTimeout(drawChart, 0));
    window.addEventListener("resize", drawChart);


    // Redesenha quando alternar o tema (garante contraste do contorno)
    btnToggleTema?.addEventListener("click", () => {
        // aguarda o atributo data-theme ser aplicado e então redesenha
        setTimeout(drawChart, 0);
    });

    // (Opcional) redesenhar ao redimensionar a janela
    window.addEventListener("resize", () => {
        // mantém os atributos width/height do canvas; se controlar via CSS, ajuste aqui
        drawChart();
    });
});

