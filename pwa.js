let deferredPrompt;

const installButton = document.getElementById("installButton");

const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

if (installButton) {
  installButton.style.display = "none";
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("../service-worker.js");
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;

  if (installButton && !isIOS && !isStandalone) {
    installButton.style.display = "block";
  }
});

if (installButton) {
  installButton.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    await deferredPrompt.userChoice;

    deferredPrompt = null;
    installButton.style.display = "none";
  });
}