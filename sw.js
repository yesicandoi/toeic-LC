<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(reg => {
    reg.onupdatefound = () => {
      const newWorker = reg.installing;
      newWorker.onstatechange = () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // 🔥 새 버전 감지 → 강제 새로고침
          window.location.reload();
        }
      };
    };
  });
}
</script>
