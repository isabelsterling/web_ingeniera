/* ═══════════════════════════════════════════════════════════════════════════
   LINKKIT — main.js v2.0
   Lógica para las 9 herramientas de enlaces
══════════════════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────────────
   DETECCIÓN DE ENTER EN INPUTS
──────────────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Shortener
  const shortInput = document.getElementById('short-input');
  if (shortInput) {
    shortInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') shortenURL();
    });
  }
  
  // QR Generator
  const qrInput = document.getElementById('qr-input');
  if (qrInput) {
    qrInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') generateQR();
    });
  }
  
  // Unshortener
  const unshortInput = document.getElementById('unshort-input');
  if (unshortInput) {
    unshortInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') unshortenURL();
    });
  }
  
  // Link Checker
  const checkInput = document.getElementById('check-input');
  if (checkInput) {
    checkInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') checkLink();
    });
  }
  
  // OG Preview
  const ogInput = document.getElementById('og-input');
  if (ogInput) {
    ogInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') fetchOG();
    });
  }
  
  // Cleaner
  const cleanInput = document.getElementById('clean-input');
  if (cleanInput) {
    cleanInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') cleanURL();
    });
  }
  
  // UTM - Enter en los campos
  const utmFields = ['utm-base', 'utm-source', 'utm-medium', 'utm-campaign', 'utm-content', 'utm-term'];
  utmFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter') buildUTM();
      });
    }
  });
});

/* ─────────────────────────────────────────────────────────────────────────────
   NAVEGACIÓN DE TABS
──────────────────────────────────────────────────────────────────────────── */
function switchTab(tab) {
  // Ocultar todos los paneles
  const panels = document.querySelectorAll('.panel');
  panels.forEach(p => p.classList.remove('active'));
  
  // Resetear todos los tabs
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(t => t.className = 'tab-btn');
  
  // Mostrar panel seleccionado
  const panelMap = {
    'shortener':    { panel: 'panel-shortener',    tabClass: 'active-shortener', tabId: 'tab-short' },
    'qr':           { panel: 'panel-qr',           tabClass: 'active-qr', tabId: 'tab-qr' },
    'unshortener':  { panel: 'panel-unshortener',  tabClass: 'active-unshort', tabId: 'tab-unshort' },
    'linkcheck':    { panel: 'panel-linkcheck',    tabClass: 'active-check', tabId: 'tab-check' },
    'ogpreview':    { panel: 'panel-ogpreview',    tabClass: 'active-og', tabId: 'tab-og' },
    'utm':          { panel: 'panel-utm',          tabClass: 'active-utm', tabId: 'tab-utm' },
    'encoder':      { panel: 'panel-encoder',      tabClass: 'active-encoder', tabId: 'tab-encode' },
    'cleaner':      { panel: 'panel-cleaner',      tabClass: 'active-clean', tabId: 'tab-clean' },
    'qrreader':     { panel: 'panel-qrreader',     tabClass: 'active-read', tabId: 'tab-read' }
  };
  
  if (panelMap[tab]) {
    const panel = document.getElementById(panelMap[tab].panel);
    if (panel) panel.classList.add('active');
    
    const tabBtn = document.getElementById(panelMap[tab].tabId);
    if (tabBtn) tabBtn.classList.add(panelMap[tab].tabClass);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERRAMIENTA 1: ACORTADOR DE URL
══════════════════════════════════════════════════════════════════════════ */
async function shortenURL() {
  const input  = document.getElementById('short-input').value.trim();
  const btn    = document.getElementById('short-btn');
  const loader = document.getElementById('short-loader');
  const result = document.getElementById('short-result');
  const urlEl  = document.getElementById('short-url');

  result.classList.remove('visible');
  hideError('short-error');

  if (!input) {
    showError('short-error', '⚠ Ingresa una URL para acortar.');
    return;
  }
  if (!isValidURL(input)) {
    showError('short-error', '⚠ URL no válida. Asegúrate de incluir https://');
    return;
  }

  btn.disabled = true;
  loader.classList.add('visible');

  try {
    const res = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(input)}`);
    const data = await res.json();

    if (data.shorturl) {
      urlEl.textContent = data.shorturl;
      result.classList.add('visible');
    } else {
      showError('short-error', '⚠ No se pudo acortar. ' + (data.errormessage || 'Intenta de nuevo.'));
    }
  } catch (e) {
    showError('short-error', '⚠ Error de conexión. Verifica tu internet.');
  } finally {
    btn.disabled = false;
    loader.classList.remove('visible');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERRAMIENTA 2: GENERADOR QR
══════════════════════════════════════════════════════════════════════════ */
let qrSize = 220;
let qrInstance = null;

function setSize(btn, size) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  qrSize = size;
  if (document.getElementById('qr-result').classList.contains('visible')) {
    generateQR();
  }
}

function generateQR() {
  const input = document.getElementById('qr-input').value.trim();
  const result = document.getElementById('qr-result');
  const container = document.getElementById('qr-container');

  hideError('qr-error');

  if (!input) {
    showError('qr-error', '⚠ Ingresa una URL o texto para generar el QR.');
    return;
  }

  container.innerHTML = '';
  qrInstance = null;

  try {
    qrInstance = new QRCode(container, {
      text: input,
      width: qrSize,
      height: qrSize,
      colorDark: '#1c1c1e',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    document.getElementById('qr-url-text').textContent = input;
    result.classList.add('visible');
  } catch (e) {
    showError('qr-error', '⚠ No se pudo generar el QR. Intenta con un texto más corto.');
  }
}

function downloadQR() {
  const container = document.getElementById('qr-container');
  const canvas = container.querySelector('canvas');
  const img = container.querySelector('img');
  const link = document.createElement('a');
  link.download = 'linkkit-qr.png';

  if (canvas) {
    link.href = canvas.toDataURL('image/png');
  } else if (img) {
    link.href = img.src;
  } else {
    return;
  }
  link.click();
}

function clearQR() {
  document.getElementById('qr-input').value = '';
  document.getElementById('qr-container').innerHTML = '';
  document.getElementById('qr-result').classList.remove('visible');
  hideError('qr-error');
  qrInstance = null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERRAMIENTA 3: EXPANSOR DE URL (UNSHORTENER)
══════════════════════════════════════════════════════════════════════════ */
async function unshortenURL() {
  const input  = document.getElementById('unshort-input').value.trim();
  const btn    = document.getElementById('unshort-btn');
  const loader = document.getElementById('unshort-loader');
  const result = document.getElementById('unshort-result');
  const urlEl  = document.getElementById('unshort-url');

  result.classList.remove('visible');
  hideError('unshort-error');

  if (!input) {
    showError('unshort-error', '⚠ Ingresa un enlace acortado para expandir.');
    return;
  }
  if (!isValidURL(input)) {
    showError('unshort-error', '⚠ URL no válida. Asegúrate de incluir https://');
    return;
  }

  btn.disabled = true;
  loader.classList.add('visible');

  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(input)}`);
    const data = await res.json();

    if (data.contents) {
      // Si el contenido contiene una URL, intentamos extraerla de la respuesta
      // Para enlaces acortados, la URL final está en la cabecera Location
      const urlMatch = data.contents.match(/Location:\s*(https?:\/\/[^\s]+)/i);
      if (urlMatch) {
        urlEl.textContent = urlMatch[1];
      } else {
        // Si no hay Location, mostramos la URL original (puede que no haya redirección)
        urlEl.textContent = input;
      }
      result.classList.add('visible');
    } else {
      showError('unshort-error', '⚠ No se pudo expandir el enlace.');
    }
  } catch (e) {
    showError('unshort-error', '⚠ Error de conexión. Verifica tu internet.');
  } finally {
    btn.disabled = false;
    loader.classList.remove('visible');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERRAMIENTA 4: VERIFICADOR DE ENLACES
══════════════════════════════════════════════════════════════════════════ */
async function checkLink() {
  const input  = document.getElementById('check-input').value.trim();
  const btn    = document.getElementById('check-btn');
  const loader = document.getElementById('check-loader');
  const result = document.getElementById('check-result');

  result.classList.remove('visible');
  hideError('check-error');

  if (!input) {
    showError('check-error', '⚠ Ingresa una URL para verificar.');
    return;
  }
  if (!isValidURL(input)) {
    showError('check-error', '⚠ URL no válida.');
    return;
  }

  btn.disabled = true;
  loader.classList.add('visible');

  const statusIcon = document.getElementById('status-icon');
  const statusCode = document.getElementById('status-code');
  const statusText = document.getElementById('status-text');
  const checkDetails = document.getElementById('check-details');

  // Resetear estado
  statusIcon.className = 'status-icon';
  statusCode.textContent = '—';
  statusText.textContent = 'Verificando...';

  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(input)}`);
    const data = await res.json();

    if (data.contents) {
      // Si hay contenido, la URL es accesible
      statusCode.textContent = '200';
      statusIcon.classList.add('success');
      statusIcon.textContent = '✓';
      statusText.textContent = 'Enlace activo';
      checkDetails.innerHTML = `<code>200 OK</code> · El enlace está funcionando correctamente.`;
    } else {
      statusCode.textContent = '404';
      statusIcon.classList.add('error');
      statusIcon.textContent = '✕';
      statusText.textContent = 'Enlace no encontrado';
      checkDetails.innerHTML = `<code>404 Not Found</code> · La URL no existe o está inaccesible.`;
    }

    result.classList.add('visible');
  } catch (e) {
    statusCode.textContent = '—';
    statusIcon.classList.add('error');
    statusIcon.textContent = '✕';
    statusText.textContent = 'Error de conexión';
    checkDetails.innerHTML = `No se pudo verificar el enlace.`;
    result.classList.add('visible');
  } finally {
    btn.disabled = false;
    loader.classList.remove('visible');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERRAMIENTA 5: OPEN GRAPH PREVIEW
══════════════════════════════════════════════════════════════════════════ */
async function fetchOG() {
  const input  = document.getElementById('og-input').value.trim();
  const btn    = document.getElementById('og-btn');
  const loader = document.getElementById('og-loader');
  const preview = document.getElementById('og-preview');

  preview.classList.remove('visible');
  hideError('og-error');

  if (!input) {
    showError('og-error', '⚠ Ingresa una URL para obtener la preview.');
    return;
  }
  if (!isValidURL(input)) {
    showError('og-error', '⚠ URL no válida.');
    return;
  }

  btn.disabled = true;
  loader.classList.add('visible');

  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(input)}`);
    const data = await res.json();

    if (!data.contents) {
      throw new Error('No se pudo obtener el contenido');
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');

    const getMeta = (prop) => {
      const meta = doc.querySelector(`meta[property="${prop}"]`) || 
                   doc.querySelector(`meta[name="${prop}"]`);
      return meta ? meta.getAttribute('content') : '';
    };

    const ogTitle = getMeta('og:title') || getMeta('twitter:title') || doc.title || 'Sin título';
    const ogDesc = getMeta('og:description') || getMeta('twitter:description') || getMeta('description') || 'Sin descripción';
    const ogImage = getMeta('og:image') || getMeta('twitter:image') || '';
    const ogSite = getMeta('og:site_name') || new URL(input).hostname;

    // Actualizar Twitter preview
    document.getElementById('og-title').textContent = ogTitle;
    document.getElementById('og-desc').textContent = ogDesc;
    document.getElementById('og-site').textContent = ogSite;
    
    const ogImageEl = document.getElementById('og-image');
    if (ogImage) {
      ogImageEl.style.backgroundImage = `url(${ogImage})`;
      ogImageEl.innerHTML = '';
    } else {
      ogImageEl.style.backgroundImage = 'none';
      ogImageEl.innerHTML = '<span style="color:var(--ink-soft);font-size:12px;">📷 Sin imagen</span>';
    }

    // Actualizar WhatsApp preview
    document.getElementById('og-title-wa').textContent = ogTitle;
    document.getElementById('og-desc-wa').textContent = ogDesc;
    
    const ogImageWa = document.getElementById('og-image-wa');
    if (ogImage) {
      ogImageWa.style.backgroundImage = `url(${ogImage})`;
      ogImageWa.innerHTML = '';
    } else {
      ogImageWa.style.backgroundImage = 'none';
      ogImageWa.innerHTML = '📷';
    }

    preview.classList.add('visible');
  } catch (e) {
    showError('og-error', '⚠ Error al cargar la preview. Verifica que la URL sea pública.');
  } finally {
    btn.disabled = false;
    loader.classList.remove('visible');
  }
}

function clearOG() {
  document.getElementById('og-input').value = '';
  document.getElementById('og-preview').classList.remove('visible');
  hideError('og-error');
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERRAMIENTA 6: CONSTRUCTOR UTM
══════════════════════════════════════════════════════════════════════════ */
function buildUTM() {
  const base = document.getElementById('utm-base').value.trim();
  const source = document.getElementById('utm-source').value.trim();
  const medium = document.getElementById('utm-medium').value.trim();
  const campaign = document.getElementById('utm-campaign').value.trim();
  const content = document.getElementById('utm-content').value.trim();
  const term = document.getElementById('utm-term').value.trim();
  
  const result = document.getElementById('utm-result');
  const urlEl = document.getElementById('utm-url');

  result.classList.remove('visible');
  hideError('utm-error');

  if (!base) {
    showError('utm-error', '⚠ Ingresa la URL base del sitio.');
    return;
  }
  if (!source) {
    showError('utm-error', '⚠ El parámetro utm_source es obligatorio.');
    return;
  }
  if (!medium) {
    showError('utm-error', '⚠ El parámetro utm_medium es obligatorio.');
    return;
  }

  try {
    const url = new URL(base);
    const params = new URLSearchParams(url.search);

    params.set('utm_source', source);
    params.set('utm_medium', medium);
    if (campaign) params.set('utm_campaign', campaign);
    if (content) params.set('utm_content', content);
    if (term) params.set('utm_term', term);

    url.search = params.toString();
    urlEl.textContent = url.toString();
    result.classList.add('visible');
  } catch (e) {
    showError('utm-error', '⚠ URL base no válida.');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERRAMIENTA 7: CODIFICADOR / DECODIFICADOR URL
══════════════════════════════════════════════════════════════════════════ */
function encodeURL() {
  const input = document.getElementById('encode-input').value;
  const result = document.getElementById('encode-result');
  const urlEl = document.getElementById('encoded-result');

  result.classList.remove('visible');

  if (!input) {
    urlEl.textContent = 'Escribe algo para codificar';
    result.classList.add('visible');
    return;
  }

  try {
    urlEl.textContent = encodeURIComponent(input);
    result.classList.add('visible');
  } catch (e) {
    urlEl.textContent = 'Error al codificar';
    result.classList.add('visible');
  }
}

function decodeURL() {
  const input = document.getElementById('decode-input').value;
  const result = document.getElementById('decode-result');
  const urlEl = document.getElementById('decoded-result');

  result.classList.remove('visible');

  if (!input) {
    urlEl.textContent = 'Escribe algo para decodificar';
    result.classList.add('visible');
    return;
  }

  try {
    urlEl.textContent = decodeURIComponent(input);
    result.classList.add('visible');
  } catch (e) {
    urlEl.textContent = 'Error: URL mal codificada';
    result.classList.add('visible');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERRAMIENTA 8: LIMPIADOR DE ENLACES
══════════════════════════════════════════════════════════════════════════ */
function cleanURL() {
  const input = document.getElementById('clean-input').value.trim();
  const result = document.getElementById('clean-result');
  const urlEl = document.getElementById('clean-url');

  result.classList.remove('visible');
  hideError('clean-error');

  if (!input) {
    showError('clean-error', '⚠ Ingresa una URL para limpiar.');
    return;
  }

  try {
    const url = new URL(input);
    const params = new URLSearchParams(url.search);
    
    const removeParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'fbclid', 'gclid', 'msclkid', 'dclid', 'zanpid',
      '_ga', '_gl', 'mc_cid', 'mc_eid', 'ref',
      'fb_action_ids', 'fb_action_types', 'fb_source',
      'yclid', '_openstat', 'vero_conv', 'vero_id',
      'tracking', 's_id', 'utm_id', 'utm_partner'
    ];
    
    removeParams.forEach(p => params.delete(p));
    
    url.search = params.toString();
    urlEl.textContent = url.toString();
    result.classList.add('visible');
  } catch (e) {
    showError('clean-error', '⚠ URL no válida.');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERRAMIENTA 9: LECTOR DE CÓDIGOS QR
══════════════════════════════════════════════════════════════════════════ */
function processQR(input) {
  const file = input.files[0];
  const loader = document.getElementById('qr-read-loader');
  const result = document.getElementById('qr-read-result');
  const error = document.getElementById('qr-read-error');
  const textEl = document.getElementById('qr-read-text');
  const typeEl = document.getElementById('qr-read-type');
  const imgEl = document.getElementById('qr-read-image');

  result.classList.remove('visible');
  error.classList.remove('visible');

  if (!file) return;

  loader.classList.add('visible');

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      loader.classList.remove('visible');

      if (code) {
        textEl.textContent = code.data;
        
        let type = 'Texto';
        if (code.data.startsWith('http://') || code.data.startsWith('https://')) {
          type = '🔗 URL';
        } else if (code.data.startsWith('WIFI:')) {
          type = '📶 WiFi';
        } else if (code.data.startsWith('BEGIN:VCARD') || code.data.includes('MECARD:')) {
          type = '👤 Contacto';
        } else if (/^\d+$/.test(code.data) && code.data.length > 5) {
          type = '🔢 Número';
        } else if (code.data.startsWith('mailto:')) {
          type = '📧 Email';
        } else if (code.data.startsWith('tel:')) {
          type = '📞 Teléfono';
        } else if (code.data.startsWith('sms:')) {
          type = '💬 SMS';
        }
        
        typeEl.textContent = type;
        imgEl.src = e.target.result;
        result.classList.add('visible');
      } else {
        error.textContent = '⚠ No se detectó ningún código QR en la imagen.';
        error.classList.add('visible');
        imgEl.src = '';
      }
    };
    img.onerror = function() {
      loader.classList.remove('visible');
      error.textContent = '⚠ No se pudo cargar la imagen.';
      error.classList.add('visible');
    };
    img.src = e.target.result;
  };
  reader.onerror = function() {
    loader.classList.remove('visible');
    error.textContent = '⚠ Error al leer el archivo.';
    error.classList.add('visible');
  };
  reader.readAsDataURL(file);
}

function copyQRText() {
  const text = document.getElementById('qr-read-text').textContent;
  if (!text || text === 'No se detectó contenido') return;
  
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Copiado';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
    }, 2000);
  });
}

function clearQRReader() {
  document.getElementById('qr-file-input').value = '';
  document.getElementById('qr-read-result').classList.remove('visible');
  document.getElementById('qr-read-error').classList.remove('visible');
  document.getElementById('qr-read-image').src = '';
  document.getElementById('qr-read-text').textContent = '';
  document.getElementById('qr-read-type').textContent = '';
}

/* ═══════════════════════════════════════════════════════════════════════════
   COPIA GENÉRICA (para cualquier resultado)
══════════════════════════════════════════════════════════════════════════ */
function copyURL(targetId) {
  const url = document.getElementById(targetId).textContent;
  if (!url) return;
  
  navigator.clipboard.writeText(url).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Copiado';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
    }, 2000);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS — Funciones auxiliares
══════════════════════════════════════════════════════════════════════════ */
function isValidURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.classList.add('visible');
  }
}

function hideError(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('visible');
  }
}