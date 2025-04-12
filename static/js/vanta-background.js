document.addEventListener("DOMContentLoaded", function () {
  VANTA.WAVES({
    el: "#vanta-bg",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    scale: 1.0,
    scaleMobile: 1.0,
    color: 0x2b7fc7, // Match the primary color
    shininess: 40.0,
    waveHeight: 12.0,
    waveSpeed: 0.75,
    zoom: 0.7,
  });
});
