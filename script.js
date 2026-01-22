(function () {
  const PHONE_E164 = "5514996139532"; // +55 14 99613-9532 (sem +)
  const DEFAULT_SOURCE = "site";

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function encode(text) {
    return encodeURIComponent(text).replace(/%20/g, "+");
  }

  function buildWhatsUrl(message) {
    return `https://wa.me/${PHONE_E164}?text=${encode(message)}`;
  }

  function track(eventName, params = {}) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: eventName, ...params });
    } catch (_) {}
  }

  function openWhatsApp(message, source = DEFAULT_SOURCE) {
    track("lead_whatsapp_click", { source });
    window.open(buildWhatsUrl(message), "_blank", "noopener,noreferrer");
  }

  // ✅ WhatsApp direto (sem rolar)
  function openWhatsDirect(source, message = "") {
    track("lead_whatsapp_click", { source });
    const url = message
      ? buildWhatsUrl(message)
      : `https://wa.me/${PHONE_E164}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // ✅ rolar até o formulário (para CTAs do meio)
  function goToForm(source = "cta") {
    track("cta_go_to_form", { source });

    const formSection = document.getElementById("form");
    if (!formSection) return;

    formSection.scrollIntoView({ behavior: "smooth", block: "start" });

    setTimeout(() => {
      const firstInput = document.querySelector('#leadForm input[name="nome"]');
      if (firstInput) firstInput.focus();
    }, 450);
  }

const WHATS_MESSAGES = {
  topo: "Olá! Vim pelo site do Buffet Alabarse e gostaria de um orçamento 😊",
  rodape: "Olá! Estou no site do Buffet Alabarse e queria saber mais sobre valores e disponibilidade.",
};

  
  // ✅ CTAs que rolam pro formulário (não abrem WhatsApp)
  const ctaToFormButtons = [
    ["btnWhatsHero", "hero"],
    ["btnWhatsMid", "meio"],
    ["btnWhatsBottom", "faq"],
  ];

  for (const [id, source] of ctaToFormButtons) {
    const btn = document.getElementById(id);
    if (!btn) continue;

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      goToForm(source);
    });
  }

  // ✅ Header e Rodapé = Whats direto
  const btnTop = document.getElementById("btnWhatsTop");
  if (btnTop) {
    btnTop.addEventListener("click", function (e) {
      e.preventDefault();
      openWhatsDirect("topo_direto", WHATS_MESSAGES.topo);
    });
  }

  const btnFooter = document.getElementById("btnWhatsFooter");
  if (btnFooter) {
    btnFooter.addEventListener("click", function (e) {
      e.preventDefault();
      openWhatsDirect("rodape_direto", WHATS_MESSAGES.rodape);
    });
  }

  // ✅ Formulário -> abre WhatsApp com mensagem completa
  const form = document.getElementById("leadForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const fd = new FormData(form);
      const nome = (fd.get("nome") || "").toString().trim();
      const telefone = (fd.get("telefone") || "").toString().trim();
      const evento = (fd.get("evento") || "").toString().trim();
      const data = (fd.get("data") || "").toString().trim();
      const pessoas = (fd.get("pessoas") || "").toString().trim();
      const cidade = (fd.get("cidade") || "").toString().trim();
      const mensagem = (fd.get("mensagem") || "").toString().trim();

      track("lead_form_submit", { source: "form" });

      const lines = [
        "Olá! Quero solicitar orçamento com o BUFFET ALABARSE - CHURRASCO&CIA.",
        "",
        `Nome: ${nome || "-"}`,
        `Telefone: ${telefone || "-"}`,
        `Tipo de evento: ${evento || "-"}`,
        `Data: ${data || "-"}`,
        `Nº de pessoas: ${pessoas || "-"}`,
        `Cidade: ${cidade || "-"}`,
        mensagem ? `Mensagem: ${mensagem}` : ""
      ].filter(Boolean);

      openWhatsApp(lines.join("\n"), "form");
    });
  }

  // Modal de privacidade
  const privacyLink = document.getElementById("privacyLink");
  const modal = document.getElementById("privacyModal");

  function closeModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
  }
  function openModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "false");
  }

  if (privacyLink && modal) {
    privacyLink.addEventListener("click", function (e) {
      e.preventDefault();
      openModal();
    });

    modal.addEventListener("click", function (e) {
      const target = e.target;
      if (target && target.getAttribute && target.getAttribute("data-close") === "1") {
        closeModal();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }
})();



