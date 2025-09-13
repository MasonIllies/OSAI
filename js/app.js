// ---- Config (edit these) ----
const INTRO_VIDEO_ID = "dQw4w9WgXcQ"; // placeholder
const INTRO_VIDEO_PARAMS = "rel=0&modestbranding=1&playsinline=1";
const APP_AUTH_BASE_URL = "https://www.osai.llc"; // TODO: change if needed
const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/test_123456"; // TODO: replace
// -----------------------------

// Footer year
document.getElementById("year").textContent = String(new Date().getFullYear());

// Video click-to-play
const playBtn = document.getElementById("playBtn");
const videoFrame = document.getElementById("videoFrame");
if (playBtn && videoFrame) {
  playBtn.addEventListener("click", () => {
    const src = `https://www.youtube-nocookie.com/embed/${INTRO_VIDEO_ID}?${INTRO_VIDEO_PARAMS}&autoplay=1`;
    const iframe = document.createElement("iframe");
    iframe.setAttribute("title", "OSAI Introduction");
    iframe.setAttribute("src", src);
    iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    iframe.style.position = "absolute";
    iframe.style.inset = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";
    videoFrame.innerHTML = "";
    videoFrame.appendChild(iframe);
  });
}

// Modal open/close
const sheet = document.getElementById("sheet");
const openSignup = document.getElementById("openSignup");
const emailInput = document.getElementById("emailInput");
const sheetEmail = document.getElementById("sheetEmail");
const errorEl = document.getElementById("error");
const methodSel = document.getElementById("method");
const cardExtras = document.getElementById("cardExtras");
const submitBtn = document.getElementById("submitBtn");

function openSheet() {
  sheet.classList.remove("hidden");
  sheet.setAttribute("aria-hidden", "false");
  // prefill email
  if (emailInput && sheetEmail) sheetEmail.value = emailInput.value || "";
}
function closeSheet() {
  sheet.classList.add("hidden");
  sheet.setAttribute("aria-hidden", "true");
}
openSignup?.addEventListener("click", openSheet);
sheet?.addEventListener("click", (e) => {
  if (e.target?.dataset?.close !== undefined) closeSheet();
});

// Switch payment/auth method
methodSel?.addEventListener("change", () => {
  const val = methodSel.value;
  cardExtras.style.display = val === "card" ? "flex" : "none";
});
methodSel?.dispatchEvent(new Event("change"));

// Submit handler
document.getElementById("sheetForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  errorEl.hidden = true;
  const email = sheetEmail.value.trim();
  const method = methodSel.value;

  // minimal validation
  if (!email || !email.includes("@")) {
    errorEl.textContent = "Enter a valid email address.";
    errorEl.hidden = false;
    return;
  }

  if (method === "card") {
    const agree = document.getElementById("agree").checked;
    if (!agree) {
      errorEl.textContent = "Please agree to the Terms to continue.";
      errorEl.hidden = false;
      return;
    }
    window.open(STRIPE_CHECKOUT_URL || "#", "_blank");
    return;
  }

  // OAuth / Magic link redirects
  const u = new URL(APP_AUTH_BASE_URL.replace(/\/$/, ""));
  if (method === "google") u.pathname = "/auth/google";
  else if (method === "apple") u.pathname = "/auth/apple";
  else u.pathname = "/auth/magic";

  if (method === "magic") u.searchParams.set("email", email);
  else u.searchParams.set("prefill_email", email);

  window.open(u.toString(), "_blank");
});

// Optional: if you add an /assets/logo.png, you can point the <img src> there.
// Example:
// document.getElementById("logo").src = "/assets/logo.png";
