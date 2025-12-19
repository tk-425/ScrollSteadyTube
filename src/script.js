// ScrollSteadyTube - Stick the YouTube player to the top while scrolling

const STICKY_CLASS = 'sst-sticky-player';
const STYLE_ID = 'sst-style';

// Always enabled on watch pages; no UI toggle

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    /* While sticky, ensure above content */
    .${STICKY_CLASS} { z-index: 2147483647 !important; }

  `;
  document.head.appendChild(style);
}

function findPlayerContainer() {
  // Prefer the ytd-player shell which wraps the html5 player
  const ytdPlayer = document.querySelector('ytd-watch-flexy #ytd-player');
  if (ytdPlayer) return ytdPlayer;
  // Fallbacks
  const moviePlayer = document.getElementById('movie_player');
  if (moviePlayer) return moviePlayer;
  const generic = document.querySelector('#player, .html5-video-player');
  return generic || null;
}

let currentContainer = null;
let placeholder = null;
let gapCover = null;
let stuck = false;
let ro = null; // ResizeObserver

function mastheadHeight() {
  const mast = document.getElementById('masthead-container') || document.querySelector('ytd-masthead');
  if (mast) return Math.ceil(mast.getBoundingClientRect().height || 56);
  return 56;
}

function getAspectRatio() {
  // width / height
  try {
    const playerEl = document.querySelector('.html5-video-player');
    if (playerEl && typeof playerEl.getVideoAspectRatio === 'function') {
      const ar = playerEl.getVideoAspectRatio();
      if (ar && isFinite(ar) && ar > 0) return ar;
    }
  } catch (_) { /* ignore */ }
  return 16 / 9;
}

function stickNow() {
  if (!currentContainer || stuck) return;
  const rect = currentContainer.getBoundingClientRect();
  placeholder = document.createElement('div');
  // Let width be responsive; only reserve height
  const ar = getAspectRatio();
  placeholder.style.height = Math.round(rect.width / ar) + 'px';
  placeholder.style.pointerEvents = 'none';
  currentContainer.parentNode && currentContainer.parentNode.insertBefore(placeholder, currentContainer);

  const top = mastheadHeight();
  Object.assign(currentContainer.style, {
    position: 'fixed',
    top: top + 'px',
    left: rect.left + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px',
  });
  currentContainer.style.setProperty('z-index', '2147483647', 'important');
  currentContainer.classList.add(STICKY_CLASS);
  
  // Set z-index on player containers to ensure they stay above comments
  // Normal mode: #player-container, Theater mode: #player-full-bleed-container
  const playerContainer = document.querySelector('#player-container');
  if (playerContainer) {
    playerContainer.style.setProperty('z-index', '999', 'important');
  }
  const fullBleedContainer = document.querySelector('#player-full-bleed-container');
  if (fullBleedContainer) {
    fullBleedContainer.style.setProperty('z-index', '999', 'important');
  }
  
  stuck = true;

  // Watch width changes (e.g., theater toggle) and keep sizing synced
  if (!ro && 'ResizeObserver' in window) {
    ro = new ResizeObserver(() => updateSticky());
  }
  if (ro && placeholder) ro.observe(placeholder);

  ensureGapCover();
}

function unstickNow() {
  if (!currentContainer || !stuck) return;
  currentContainer.classList.remove(STICKY_CLASS);
  currentContainer.style.position = '';
  currentContainer.style.top = '';
  currentContainer.style.left = '';
  currentContainer.style.width = '';
  currentContainer.style.height = '';
  currentContainer.style.zIndex = '';
  
  // Remove z-index from player containers
  const playerContainer = document.querySelector('#player-container');
  if (playerContainer) {
    playerContainer.style.zIndex = '';
  }
  const fullBleedContainer = document.querySelector('#player-full-bleed-container');
  if (fullBleedContainer) {
    fullBleedContainer.style.zIndex = '';
  }
  
  if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
  placeholder = null;
  stuck = false;
  if (ro) ro.disconnect();
  removeGapCover();
}

function updateSticky() {
  if (!currentContainer) { unstickNow(); return; }
  if (document.fullscreenElement) { unstickNow(); return; }
  const refRect = (stuck && placeholder) ? placeholder.getBoundingClientRect() : currentContainer.getBoundingClientRect();
  const top = refRect.top;
  const threshold = mastheadHeight();
  if (top <= threshold) {
    // Keep left/width in sync while stuck
    if (!stuck) stickNow();
    else {
      const ar = getAspectRatio();
      const rect = placeholder ? placeholder.getBoundingClientRect() : currentContainer.getBoundingClientRect();
      currentContainer.style.top = mastheadHeight() + 'px';
      currentContainer.style.left = rect.left + 'px';
      currentContainer.style.width = rect.width + 'px';
      currentContainer.style.height = Math.round(rect.width / ar) + 'px';
      currentContainer.style.setProperty('z-index', '2147483647', 'important');
      
      // Ensure player containers have z-index to stay above comments
      const playerContainer = document.querySelector('#player-container');
      if (playerContainer) {
        playerContainer.style.setProperty('z-index', '999', 'important');
      }
      const fullBleedContainer = document.querySelector('#player-full-bleed-container');
      if (fullBleedContainer) {
        fullBleedContainer.style.setProperty('z-index', '999', 'important');
      }
      
      // Keep reserved space height matching new aspect
      if (placeholder) placeholder.style.height = Math.round(rect.width / ar) + 'px';
      // Keep the cover aligned
      updateGapCover();
    }
  } else {
    unstickNow();
  }
}

function getPageBgColor() {
  try {
    const el = document.querySelector('ytd-app') || document.body || document.documentElement;
    const cs = window.getComputedStyle(el);
    return cs && cs.backgroundColor ? cs.backgroundColor : '#0f0f0f';
  } catch (_) {
    return '#0f0f0f';
  }
}

function ensureGapCover() {
  if (gapCover) return;
  gapCover = document.createElement('div');
  Object.assign(gapCover.style, {
    position: 'fixed',
    left: '0',
    right: '0',
    height: '6px',
    top: mastheadHeight() + 'px',
    background: getPageBgColor(),
    zIndex: '2147483646', // just under the player
    pointerEvents: 'none',
  });
  document.body.appendChild(gapCover);
}

function updateGapCover() {
  if (!gapCover) return;
  gapCover.style.top = mastheadHeight() + 'px';
  gapCover.style.background = getPageBgColor();
}

function removeGapCover() {
  if (gapCover && gapCover.parentNode) gapCover.parentNode.removeChild(gapCover);
  gapCover = null;
}

function setupSticky() {
  injectStyles();
  const container = findPlayerContainer();
  if (!container) return;
  if (currentContainer !== container) {
    unstickNow();
    currentContainer = container;
  }
  updateSticky();
}

function onRouteChangeMaybeSetup() {
  // Only activate on watch pages
  const onWatch = !!document.querySelector('ytd-watch-flexy');
  if (onWatch) setupSticky();
  else unstickNow();
}

// React to SPA navigations and DOM mutations
const domObserver = new MutationObserver(() => onRouteChangeMaybeSetup());

// No toggle UI: always on for watch pages

function start() {
  onRouteChangeMaybeSetup();
  domObserver.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true
  });

  // Keep in sync with fullscreen changes
  document.addEventListener('fullscreenchange', () => {
    // If entering fullscreen, ensure we unstick; if exiting, recompute
    unstickNow();
    // Give layout a moment to settle after exiting fullscreen
    setTimeout(setupSticky, 50);
  });

  // Scroll/resize handlers to maintain sticky positioning
  window.addEventListener('scroll', updateSticky, { passive: true });
  window.addEventListener('resize', () => {
    if (stuck) {
      // Recompute placement on resize
      unstickNow();
      setupSticky();
    } else {
      updateSticky();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
