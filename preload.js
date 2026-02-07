(function () {
  const cleanPlayerResponse = (data) => {
    if (!data) return data;

    if (data.adPlacements) data.adPlacements = [];
    if (data.playerAds) data.playerAds = [];
    if (data.adSlots) data.adSlots = [];

    if (data.streamingData?.adBreakIndex !== undefined) {
      delete data.streamingData.adBreakIndex;
    }

    if (data.annotations) {
      data.annotations = data.annotations.filter(
        (a) => !a.adAnnotationRenderer,
      );
    }

    return data;
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function () {
    this.addEventListener("readystatechange", function () {
      if (this.readyState === 4 && this.responseURL.includes("/v1/player")) {
        try {
          const originalResponse = JSON.parse(this.responseText);
          const cleaned = cleanPlayerResponse(originalResponse);

          Object.defineProperty(this, "responseText", {
            writable: true,
            value: JSON.stringify(cleaned),
          });
          Object.defineProperty(this, "response", {
            writable: true,
            value: JSON.stringify(cleaned),
          });
        } catch (e) {}
      }
    });
    return originalOpen.apply(this, arguments);
  };

  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    if (
      args[0] &&
      typeof args[0] === "string" &&
      args[0].includes("/v1/player")
    ) {
      const data = await response.json();
      const cleaned = cleanPlayerResponse(data);
      return new Response(JSON.stringify(cleaned), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }
    return response;
  };

  const fastForwardAds = () => {
    const video = document.querySelector("video");
    const adShowing = document.querySelector(
      ".ad-showing, .ad-interrupting, .ytp-ad-player-overlay",
    );

    if (adShowing && video) {
      console.log("⚡ Ad detectado - Acelerando...");
      video.muted = true;
      video.playbackRate = 16;
      video.currentTime = video.duration - 0.1;

      const skipBtn = document.querySelector(
        ".ytp-ad-skip-button, .ytp-skip-ad-button, .ytp-ad-skip-button-modern",
      );
      if (skipBtn) skipBtn.click();
    }
  };

  const injectStyles = () => {
    const style = document.createElement("style");
    style.innerHTML = `
      ytmusic-player-ads, ytmusic-display-ad, 
      .ytp-ad-module, .ytp-ad-overlay-container, 
      #player-ads, .ad-showing, .ad-interrupting {
        display: none !important;
      }
    `;
    document.head?.appendChild(style);
  };

  window.addEventListener("DOMContentLoaded", () => {
    injectStyles();

    setInterval(fastForwardAds, 200);

    const observer = new MutationObserver(() => {
      const ads = document.querySelectorAll("ytmusic-player-ads, .ad-showing");
      ads.forEach((ad) => ad.remove());
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
