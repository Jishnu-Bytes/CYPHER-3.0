/**
 * CYPHER Sovereign Civic Hazard Response Platform
 * Shared Utilities: Demo Mode Failsafe, Canvas Image Compression, & Responsive Guards
 */

// 1. DEMO MODE MANAGEMENT & SANDBOX UI VISIBILITY
window.CYPHER_DEMO_MODE = (function() {
  try {
    const saved = localStorage.getItem('cypher_demo_mode');
    if (saved !== null) return saved === 'true';
  } catch(e) {}
  return false;
})();

function applySandboxVisibility() {
  const isDemo = Boolean(window.CYPHER_DEMO_MODE);
  let styleTag = document.getElementById('cypher-sandbox-style');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'cypher-sandbox-style';
    document.head.appendChild(styleTag);
  }
  if (!isDemo) {
    styleTag.innerHTML = `
      .sandbox-control, [data-sandbox="true"], #btn-simulate-liveness, #simulation-sample-container {
        display: none !important;
      }
    `;
  } else {
    styleTag.innerHTML = '';
  }
}

// Fetch server config on initialization to synchronize live/demo mode environment
(async function syncServerConfig() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const cfg = await res.json();
      const saved = localStorage.getItem('cypher_demo_mode');
      if (saved === null && typeof cfg.demoMode === 'boolean') {
        window.CYPHER_DEMO_MODE = cfg.demoMode;
      }
      applySandboxVisibility();
      renderDemoBadge();
    }
  } catch(e) {
    applySandboxVisibility();
  }
})();

function setDemoMode(active) {
  window.CYPHER_DEMO_MODE = !!active;
  try {
    localStorage.setItem('cypher_demo_mode', String(window.CYPHER_DEMO_MODE));
  } catch(e) {}
  applySandboxVisibility();
  renderDemoBadge();
  showToast(
    window.CYPHER_DEMO_MODE 
      ? "⚡ DEMO MODE ACTIVATED: Submissions use realistic 250ms synthetic models."
      : "🟢 LIVE AI MODE ACTIVATED: Realtime Gemini 2.0 Flash connected.",
    window.CYPHER_DEMO_MODE ? "warning" : "success"
  );
  window.dispatchEvent(new CustomEvent('cypher-demo-mode-changed', { detail: { active: window.CYPHER_DEMO_MODE } }));
}

function toggleDemoMode() {
  setDemoMode(!window.CYPHER_DEMO_MODE);
}

// Global Key Listener: Ctrl+Shift+D or Cmd+Shift+D
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
    e.preventDefault();
    toggleDemoMode();
  }
});

// Subtle floating indicator badge in top right corner
function renderDemoBadge() {
  let badge = document.getElementById('cypher-demo-mode-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'cypher-demo-mode-badge';
    badge.className = 'fixed top-3 right-3 z-50 transition-all duration-300 pointer-events-auto';
    document.body.appendChild(badge);
  }

  if (window.CYPHER_DEMO_MODE) {
    badge.innerHTML = `
      <div onclick="toggleDemoMode()" title="Click to toggle or press Ctrl+Shift+D" class="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-[10px] sm:text-xs font-mono font-bold tracking-wider shadow-lg shadow-amber-500/10 cursor-pointer backdrop-blur-md active:scale-95 transition-transform">
        <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
        <span>DEMO MODE ACTIVE</span>
        <span class="hidden sm:inline text-amber-400/70 text-[9px]">(Ctrl+Shift+D)</span>
      </div>
    `;
    badge.classList.remove('hidden');
  } else {
    // Show a minimal discrete hint on hover or small dot
    badge.innerHTML = `
      <div onclick="toggleDemoMode()" title="Click to activate Demo Mode (Ctrl+Shift+D)" class="px-2 py-0.5 rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-slate-200 text-[9px] sm:text-[10px] font-mono tracking-wider cursor-pointer backdrop-blur transition active:scale-95">
        <span>DEMO: OFF</span>
      </div>
    `;
    badge.classList.remove('hidden');
  }
}

// 2. HTML5 CANVAS CLIENT-SIDE IMAGE COMPRESSION (Max 1280px, Quality 0.75, < 2MB Payload Guard)
async function compressImage(fileOrBlob, maxWidth = 1280, maxHeight = 1280, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!fileOrBlob) return reject(new Error("No file provided"));
    
    // If SVG or tiny, read directly
    if (fileOrBlob.type === 'image/svg+xml' || fileOrBlob.size < 50000) {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const dataUrl = reader.result;
        const base64 = typeof dataUrl === 'string' ? dataUrl.split(',')[1] : '';
        resolve({ blob: fileOrBlob, base64, dataUrl, mimeType: fileOrBlob.type });
      };
      reader.readAsDataURL(fileOrBlob);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("Unable to create 2D canvas context"));

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Quality compression to JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = compressedDataUrl.split(',')[1];

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve({
                base64,
                dataUrl: compressedDataUrl,
                mimeType: 'image/jpeg',
                sizeBytes: Math.round(base64.length * 0.75)
              });
            }
            resolve({
              blob,
              base64,
              dataUrl: compressedDataUrl,
              mimeType: 'image/jpeg',
              sizeBytes: blob.size
            });
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(fileOrBlob);
  });
}

// 3. TOAST NOTIFICATION UTILITY
function showToast(message, type = "info") {
  let toastContainer = document.getElementById('cypher-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'cypher-toast-container';
    toastContainer.className = 'fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full px-4';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const borderColors = {
    info: 'border-blue-500/40 bg-slate-900/95 text-blue-300',
    success: 'border-emerald-500/40 bg-slate-900/95 text-emerald-300',
    warning: 'border-amber-500/40 bg-slate-900/95 text-amber-300',
    danger: 'border-red-500/40 bg-slate-900/95 text-red-300'
  };

  const icons = {
    info: 'fa-circle-info',
    success: 'fa-circle-check',
    warning: 'fa-triangle-exclamation',
    danger: 'fa-circle-exclamation'
  };

  toast.className = `pointer-events-auto p-3.5 rounded-xl border shadow-2xl backdrop-blur-md text-xs font-mono flex items-start space-x-2.5 transition-all duration-300 transform translate-y-2 opacity-0 ${borderColors[type] || borderColors.info}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info} mt-0.5 text-sm"></i>
    <div class="flex-grow">${message}</div>
  `;

  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Automatically mount badge on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderDemoBadge);
} else {
  renderDemoBadge();
}

// Make functions globally available
window.compressImage = compressImage;
window.setDemoMode = setDemoMode;
window.toggleDemoMode = toggleDemoMode;
window.showToast = showToast;
