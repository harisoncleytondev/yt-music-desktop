window.addEventListener("DOMContentLoaded", () => {
  const removeAds = () => {
    document
      .querySelectorAll("ytmusic-player-ads, ytmusic-display-ad, .ad-showing")
      .forEach((el) => el.remove());

    const video = document.querySelector("video");
    if (video && video.duration && video.duration < 60) {
      video.currentTime = video.duration;
    }
  };

  const observer = new MutationObserver(removeAds);

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  removeAds();
});
