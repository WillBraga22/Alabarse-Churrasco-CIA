(function () {
  const DEFAULT_SOURCE = "site";

  // ✅ Contatos (E.164 sem +)
  const CONTACTS = {
    rita: { name: "Rita", phone: "5514996139532" },
    claudio: { name: "Cláudio", phone: "5514991380914" },
  };

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function encode(text) {
    return encodeURIComponent(text);
  }

  // ✅ Mantive seu padrão api.whatsapp.com (funciona bem em desktop e mobile)
  function buildWhatsUrl(phoneE164, message = "") {
    const base = `https://api.whatsapp.com/send?phone=${phoneE164}`;
    return message ? `${base}&text=${encode(message)}` : base;
  }

  function track(eventName, params = {}) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: eventName, ...params });
    } catch (_) {}
  }

  // ========= Modal Whats (Rita / Cláudio) =========
  const whatsModal = document.getElementById("whatsModal");
  const whatsRita = document.getElementById("whatsRita");
  const whatsClaudio = document.getElementById("whatsClaudio");

  let pendingMessage = "";
  let pendingSource = DEFAULT_SOURCE;

  function openWhatsChooser(source, message = "") {
    pendingSource = source || DEFAULT_SOURCE;
    pendingMessage = message || "";

    // Prepara os links do modal
    if (whatsRita) whatsRita.href = buildWhatsUrl(CONTACTS.rita.phone, pendingMessage);
    if (whatsClaudio) whatsClaudio.href = buildWhatsUrl(CONTACTS.claudio.phone, pendingMessage);

    // Abre modal
    if (whatsModal) {
      whatsModal.setAttribute("aria-hidden", "false");
      track("whats_modal_open", { source: pendingSource });
    } else {
      // fallback: se o modal não existir, abre direto na Rita
      window.open(buildWhatsUrl(CONTACTS.rita.phone, pendingMessage), "_blank", "noopener,noreferrer");
    }
  }

  function closeWhatsChooser() {
    if (!whatsModal) return;
    whatsModal.setAttribute("aria-hidden", "true");
  }

  // Fecha modal ao clicar fora ou no X
  if (whatsModal) {
    whatsModal.addEventListener("click", function (e) {
      const t = e.target;
      if (t && t.getAttribute && t.getAttribute("data-close") === "1") {
        closeWhatsChooser();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeWhatsChooser();
    });
  }

  // Track ao escolher um contato (e fecha o modal)
  function bindContactTrack(el, contactKey) {
    if (!el) return;
    el.addEventListener("click", function () {
      track("lead_whatsapp_click", {
        source: pendingSource,
        contact: contactKey,
        stage: "open_whatsapp"
      });
      closeWhatsChooser();
    });
  }

  bindContactTrack(whatsRita, "rita");
  bindContactTrack(whatsClaudio, "claudio");

  // ========= Mensagens por botão =========
  const WHATS_MESSAGES = {
    topo: "Olá! Vim pelo site do Buffet Alabarse e gostaria de um orçamento 😊",
    hero: "Olá! Quero solicitar orçamento para um evento. Pode me ajudar? 😊",
    meio: "Olá! Gostaria de saber valores e disponibilidade para meu evento.",
    faq: "Olá! Quero orçamento e opções de cardápio. Pode me passar?",
    rodape: "Olá! Estou no site do Buffet Alabarse e queria saber mais sobre valores e disponibilidade.",
  };

  // ========= Liga os botões de WhatsApp =========
  function bindWhatsButton(id, sourceKey) {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      track("lead_whatsapp_click", { source: sourceKey, stage: "open_chooser" });
      openWhatsChooser(sourceKey, WHATS_MESSAGES[sourceKey] || "");
    });
  }

  // ✅ Agora TODOS abrem o modal (Rita / Cláudio)
  bindWhatsButton("btnWhatsTop", "topo");
  bindWhatsButton("btnWhatsHero", "hero");
  bindWhatsButton("btnWhatsMid", "meio");
  bindWhatsButton("btnWhatsBottom", "faq");
  bindWhatsButton("btnWhatsFooter", "rodape");

  // ========= Formulário -> abre modal com mensagem completa =========
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
        "Olá! Quero solicitar orçamento com o BUFFET ALABARSE.",
        "",
        `Nome: ${nome || "-"}`,
        `Telefone: ${telefone || "-"}`,
        `Tipo de evento: ${evento || "-"}`,
        `Data: ${data || "-"}`,
        `Nº de pessoas: ${pessoas || "-"}`,
        `Cidade: ${cidade || "-"}`,
        mensagem ? `Mensagem: ${mensagem}` : ""
      ].filter(Boolean);

      // ✅ Abre modal para escolher Rita ou Cláudio com mensagem pronta
      openWhatsChooser("form", lines.join("\n"));
    });
  }

  // ========= Modal de privacidade (igual ao seu) =========
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
