(function () {
  "use strict";

  const CONFIG = {
    // Cole aqui o endpoint do Google Apps Script caso queira salvar o lead ANTES de abrir o WhatsApp.
    LEAD_ENDPOINT: "",

    // Para transformar o clique em conversão nativa do Google Ads, cole o valor completo:
    // Exemplo: AW-17899946680/AbCdEfGh123456789
    ADS_CONVERSION_SEND_TO: "",
  };

  const CONTACTS = {
    rita: { key: "rita", name: "Rita", phone: "5514996139532" },
    claudio: { key: "claudio", name: "Cláudio", phone: "5514991380914" },
  };

  const MESSAGES = {
    topo: "Olá! Vim pelo site do Buffet Alabarse e gostaria de consultar uma data para meu evento. Pode me ajudar? 😊",
    hero: "Olá! Quero consultar a disponibilidade para um evento e receber opções de buffet. Pode me ajudar? 😊",
    galeria: "Olá! Vi as fotos no site do Buffet Alabarse e gostaria de conhecer as opções para meu evento.",
    como_funciona: "Olá! Quero começar um orçamento com o Buffet Alabarse. Pode me orientar?",
    casamento: "Olá! Estou planejando um casamento e gostaria de consultar data e opções de buffet.",
    aniversario: "Olá! Estou planejando uma comemoração e gostaria de consultar data e opções de buffet.",
    corporativo: "Olá! Estou organizando um evento corporativo e gostaria de consultar data e opções de buffet.",
    sobre: "Olá! Vim pelo site e gostaria de falar sobre meu evento.",
    final: "Olá! Quero consultar a data do meu evento com o Buffet Alabarse.",
    rodape: "Olá! Vim pelo site do Buffet Alabarse e gostaria de um orçamento.",
    mobile_sticky: "Olá! Quero consultar uma data para meu evento com o Buffet Alabarse.",
  };

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function buildWhatsUrl(phone, message) {
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message || "")}`;
  }

  function track(eventName, params) {
    const payload = params || {};
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: eventName, ...payload });
    } catch (_) {}

    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", eventName, payload);
      }
    } catch (_) {}
  }

  function trackAdsConversion() {
    if (!CONFIG.ADS_CONVERSION_SEND_TO) return;
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", "conversion", {
          send_to: CONFIG.ADS_CONVERSION_SEND_TO,
        });
      }
    } catch (_) {}
  }

  // Seletor de atendimento: todos os CTAs deixam a pessoa escolher Rita ou Cláudio.
  const whatsModal = document.getElementById("whatsModal");
  const whatsRita = document.getElementById("whatsRita");
  const whatsClaudio = document.getElementById("whatsClaudio");
  let pendingSource = "site";
  let pendingMessage = "";

  function openWhatsChooser(source, message) {
    pendingSource = source || "site";
    pendingMessage = message || "";

    if (whatsRita) whatsRita.href = buildWhatsUrl(CONTACTS.rita.phone, pendingMessage);
    if (whatsClaudio) whatsClaudio.href = buildWhatsUrl(CONTACTS.claudio.phone, pendingMessage);

    track("lead_whatsapp_click", {
      source: pendingSource,
      stage: "open_chooser",
    });

    if (whatsModal) {
      whatsModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    } else {
      window.open(buildWhatsUrl(CONTACTS.rita.phone, pendingMessage), "_blank", "noopener,noreferrer");
    }
  }

  function closeWhatsChooser() {
    if (!whatsModal) return;
    whatsModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function bindContactChoice(element, contact) {
    if (!element) return;
    element.addEventListener("click", function () {
      track("lead_whatsapp_click", {
        source: pendingSource,
        contact: contact.key,
        stage: "open_whatsapp",
      });
      trackAdsConversion();
      closeWhatsChooser();
    });
  }

  bindContactChoice(whatsRita, CONTACTS.rita);
  bindContactChoice(whatsClaudio, CONTACTS.claudio);

  if (whatsModal) {
    whatsModal.addEventListener("click", function (event) {
      const target = event.target;
      if (target && target.getAttribute && target.getAttribute("data-whats-close") === "1") {
        closeWhatsChooser();
      }
    });
  }

  document.querySelectorAll("[data-whatsapp]").forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      const source = button.getAttribute("data-whatsapp") || "site";
      openWhatsChooser(source, MESSAGES[source] || MESSAGES.hero);
    });
  });

  function formatDate(dateString) {
    if (!dateString) return "-";
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  async function saveLead(payload) {
    if (!CONFIG.LEAD_ENDPOINT) return false;
    try {
      await fetch(CONFIG.LEAD_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  const form = document.getElementById("leadForm");
  const formStatus = document.getElementById("formStatus");

  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const requiredFields = Array.from(form.querySelectorAll("[required]"));
      let firstInvalid = null;
      requiredFields.forEach((field) => {
        const invalid = !String(field.value || "").trim();
        field.classList.toggle("input-error", invalid);
        if (invalid && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        if (formStatus) formStatus.textContent = "Preencha as quatro informações para continuar.";
        firstInvalid.focus();
        return;
      }

      if (formStatus) formStatus.textContent = "";

      const fd = new FormData(form);
      const payload = {
        timestamp: new Date().toISOString(),
        evento: String(fd.get("evento") || "").trim(),
        data: String(fd.get("data") || "").trim(),
        pessoas: String(fd.get("pessoas") || "").trim(),
        cidade: String(fd.get("cidade") || "").trim(),
        source: "form_orcamento_express",
      };

      try {
        localStorage.setItem("alabarse_last_quote", JSON.stringify(payload));
      } catch (_) {}

      track("lead_form_submit", {
        source: "orcamento_express",
        event_type: payload.evento,
        guests: payload.pessoas,
        city: payload.cidade,
      });

      saveLead(payload);

      const message = [
        "Olá! Quero solicitar um orçamento com o Buffet Alabarse 😊",
        "",
        `Evento: ${payload.evento}`,
        `Data: ${formatDate(payload.data)}`,
        `Convidados: ${payload.pessoas}`,
        `Cidade: ${payload.cidade}`,
        "",
        "Pode me passar as opções e verificar a disponibilidade?",
      ].join("\n");

      openWhatsChooser("form_orcamento_express", message);
    });

    form.querySelectorAll("input,select").forEach((field) => {
      field.addEventListener("input", () => field.classList.remove("input-error"));
      field.addEventListener("change", () => field.classList.remove("input-error"));
    });
  }

  // CTA fixo só aparece depois que o CTA principal sai da tela.
  const mobileCta = document.getElementById("mobileCta");
  const heroCta = document.querySelector('[data-whatsapp="hero"]');
  if (mobileCta && heroCta && "IntersectionObserver" in window) {
    const stickyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        mobileCta.classList.toggle("is-visible", !entry.isIntersecting);
      });
    }, { threshold: 0.1 });
    stickyObserver.observe(heroCta);
  }

  // Data mínima = hoje.
  const dateField = document.getElementById("data");
  if (dateField) {
    const now = new Date();
    const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateField.min = localToday;
  }

  // Privacidade.
  const privacyLink = document.getElementById("privacyLink");
  const privacyModal = document.getElementById("privacyModal");

  function setPrivacy(open) {
    if (!privacyModal) return;
    privacyModal.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.classList.toggle("modal-open", open);
  }

  if (privacyLink && privacyModal) {
    privacyLink.addEventListener("click", () => setPrivacy(true));
    privacyModal.addEventListener("click", (event) => {
      if (event.target && event.target.getAttribute("data-close") === "1") setPrivacy(false);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeWhatsChooser();
    setPrivacy(false);
  });

  // Exposição de seções para diagnóstico de funil no dataLayer/gtag.
  const observedSections = document.querySelectorAll("#experiencia,#como-funciona,#avaliacoes,#orcamento,#faq");
  if ("IntersectionObserver" in window && observedSections.length) {
    const seen = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || seen.has(entry.target.id)) return;
        seen.add(entry.target.id);
        track("section_view", { section: entry.target.id });
      });
    }, { threshold: 0.35 });
    observedSections.forEach((section) => observer.observe(section));
  }
})();
