// Google Analytics 4. Without a measurement ID in VITE_GA_ID every call here is a
// no-op, so local builds send nothing.
const GA_ID = import.meta.env.VITE_GA_ID

let loaded = false

export function initAnalytics() {
  if (loaded || !GA_ID) return
  loaded = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  // Page views are sent by hand because the site routes with the URL hash.
  window.gtag('config', GA_ID, { send_page_view: false })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)
}

function send(name, params) {
  if (loaded) window.gtag('event', name, params)
}

export function trackPage(page) {
  send('page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.hash}`,
    page_name: page,
  })
}

// demo_start fires once per visit, on the first touch of any demo. Every later touch
// counts as one widget_interaction, so GA can report both users and total uses per widget.
let started = false
export function trackWidget(widget) {
  if (!started) {
    started = true
    send('demo_start', { widget_name: widget })
  }
  send('widget_interaction', { widget_name: widget })
}

const completed = new Set()
export function trackComplete(widget) {
  if (completed.has(widget)) return
  completed.add(widget)
  send('demo_complete', { widget_name: widget })
}

// Spread onto a demo's wrapper: <div {...tracked('merge')}>.
export const tracked = widget => ({
  onPointerDownCapture: () => trackWidget(widget),
  onKeyDownCapture: e => { if (e.key === 'Enter' || e.key === ' ') trackWidget(widget) },
})
