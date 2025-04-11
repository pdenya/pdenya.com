document.addEventListener('DOMContentLoaded', function() {
  // Only initialize Vanta if we're not on a mobile device
  if (window.innerWidth > 768) {
    VANTA.WAVES({
      el: "#vanta-bg",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x2b7fc7, // Match the primary color
      shininess: 40.00,
      waveHeight: 12.00,
      waveSpeed: 0.75,
      zoom: 0.70
    });
  }
});