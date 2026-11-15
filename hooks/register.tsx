import type { Register } from 'claude-code'

import { makeColors } from './make-colors.js'

// Tema HUD: solo fondo y colores, con la función de temas del artículo
// ($.theme.set + el render site Backdrop). No añade paneles ni cambia nada más.
const BACKDROP = 'hud'
const CYAN = '#19c6f0'
const ICE = '#7ff3ff'
const AMBER = '#ffb02e'
const DIM = '#0e5f7a'

const W = 1920
const H = 1080
// La app tapa con la barra lateral unos 360 px a la izquierda, así que el centro
// de lo que se ve queda a la derecha del centro de la ventana: el reactor va ahí.
const LEFT = 400 // borde izquierdo de lo visible, con margen
const CX = 1140
const CY = 545 // la ventana recorta ~30 px arriba y abajo y la barra del título tapa los de arriba
const TOP = 100 // primera línea visible bajo la barra del título

const pt = (r: number, a: number) => `${Math.round(CX + Math.cos(a) * r)} ${Math.round(CY + Math.sin(a) * r)}`

const circle = (r: number, stroke: string, sw: number, extra = '') =>
  `<circle cx="${CX}" cy="${CY}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`

// Grupo que gira alrededor del centro; si la app no anima, queda quieto.
const spin = (seconds: number, reverse: boolean, inner: string) =>
  `<g>${inner}<animateTransform attributeName="transform" type="rotate" ` +
  `from="${reverse ? 360 : 0} ${CX} ${CY}" to="${reverse ? 0 : 360} ${CX} ${CY}" ` +
  `dur="${seconds}s" repeatCount="indefinite"/></g>`

// Marcas de escala alrededor de un radio.
const ticks = (r: number, n: number, len: number, stroke: string, sw = 2) => {
  let d = ''
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2
    d += `M${pt(r, a)}L${pt(r + len, a)}`
  }
  return `<path d="${d}" stroke="${stroke}" stroke-width="${sw}" fill="none"/>`
}

// Arco abierto entre dos ángulos.
const arc = (r: number, a0: number, a1: number, stroke: string, sw: number) =>
  `<path d="M${pt(r, a0)}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${pt(r, a1)}" fill="none" stroke="${stroke}" stroke-width="${sw}"/>`

// Cuadrícula: fina cada 60 y marcada cada 240.
let fine = ''
let major = ''
for (let x = 0; x <= W; x += 60) (x % 240 === 0 ? (major += `M${x} 0V${H}`) : (fine += `M${x} 0V${H}`))
for (let y = 0; y <= H; y += 60) (y % 240 === 0 ? (major += `M0 ${y}H${W}`) : (fine += `M0 ${y}H${W}`))

// Marcos de esquina.
const corner = (x: number, y: number, sx: number, sy: number) =>
  `<path d="M${x} ${y + sy * 110}V${y}H${x + sx * 110}" fill="none" stroke="${CYAN}" stroke-width="4"/>` +
  `<path d="M${x + sx * 14} ${y + sy * 70}V${y + sy * 14}H${x + sx * 70}" fill="none" stroke="${DIM}" stroke-width="2"/>`

// Brújula arriba: marcas cada 24 px y rumbos cada 4.
let compass = ''
let compassText = ''
const names = ['N', '045', 'E', '135', 'S', '225', 'O', '315']
for (let k = 0, x = CX - 576; x <= CX + 576; k++, x += 24) {
  const big = k % 4 === 0
  compass += `M${x} ${TOP}V${TOP + (big ? 24 : 12)}`
  if (big) compassText += `<text x="${x}" y="${TOP + 52}" text-anchor="middle" font-family="monospace" font-size="18" fill="${ICE}">${names[(k / 4) % 8]}</text>`
}

// Escalas laterales con cifras.
let scaleL = ''
let scaleR = ''
let scaleText = ''
for (let k = 0, y = CY - 230; y <= CY + 230; k++, y += 23) {
  const big = k % 5 === 0
  scaleL += `M${LEFT} ${y}h${big ? 34 : 18}`
  scaleR += `M${W - 64} ${y}h${big ? -34 : -18}`
  if (big) scaleText += `<text x="${LEFT + 44}" y="${y + 6}" font-family="monospace" font-size="16" fill="${CYAN}">${String(120 - k * 4).padStart(3, '0')}</text>`
}

// Terreno en malla: filas de atrás hacia adelante, cada una tapa a la anterior.
let terrain = ''
for (let j = 0; j < 6; j++) {
  const t = j / 5
  const y0 = 720 + t * t * 300
  const amp = 8 + t * 56
  let pts = ''
  for (let x = 0; x <= W; x += 80) {
    const y = y0 - amp * (0.5 + 0.5 * Math.sin(x / 150 + j * 1.7) * Math.cos(x / 61 + j))
    pts += `${x},${Math.round(y)} `
  }
  terrain += `<polygon points="${pts}${W},${H} 0,${H}" fill="#02080f" fill-opacity="0.92" stroke="${CYAN}" stroke-opacity="${(0.18 + t * 0.7).toFixed(2)}" stroke-width="${(1 + t).toFixed(1)}"/>`
}

// Segmentos del reactor: 10 bloques en un anillo grueso.
const C = 2 * Math.PI * 205
const segs = circle(205, '#0b3a50', 46, `stroke-dasharray="${(C / 10 - 14).toFixed(1)} 14"`)
const segsHi = circle(205, CYAN, 46, `stroke-dasharray="${(C / 10 - 14).toFixed(1)} ${(C - (C / 10 - 14)).toFixed(1)}" stroke-opacity="0.8"`)

const text = (x: number, y: number, s: string, fill: string, anchor = 'start', size = 18) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="monospace" font-size="${size}" fill="${fill}">${s}</text>`

// Ticker de datos: líneas hexadecimales fijas en el margen derecho.
let ticker = ''
for (let k = 0; k < 7; k++) {
  const hex = (0x3a7f + k * 0x1d3b) % 0xffff
  ticker += text(W - 60, TOP + 130 + k * 20, `0x${hex.toString(16).toUpperCase().padStart(4, '0')} · ${(k * 37 + 12) % 100}`, k % 3 === 0 ? ICE : DIM, 'end', 13)
}

const SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
  `<defs><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${CYAN}" stop-opacity="0.26"/><stop offset="0.45" stop-color="${CYAN}" stop-opacity="0.07"/><stop offset="1" stop-color="${CYAN}" stop-opacity="0"/></radialGradient>` +
  `<linearGradient id="v" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#02080f" stop-opacity="0"/><stop offset="0.2" stop-color="#02080f" stop-opacity="0.5"/><stop offset="0.8" stop-color="#02080f" stop-opacity="0.5"/><stop offset="1" stop-color="#02080f" stop-opacity="0"/></linearGradient></defs>` +
  `<rect width="${W}" height="${H}" fill="#02080f"/>` +
  `<path d="${fine}" stroke="#06151f" stroke-width="1" fill="none"/>` +
  `<path d="${major}" stroke="#0a2a3b" stroke-width="1.5" fill="none"/>` +
  `<circle cx="${CX}" cy="${CY}" r="640" fill="url(#g)"/>` +
  // Anillos exteriores y reactor, a media intensidad para que el texto se lea.
  `<g opacity="0.42">` +
  circle(560, DIM, 2, 'stroke-dasharray="3 12"') +
  spin(120, false, ticks(520, 90, 20, DIM) + ticks(520, 36, 34, CYAN, 3)) +
  // Reactor
  segs +
  spin(26, true, segsHi) +
  circle(172, '#0b3a50', 20, 'stroke-opacity="0.6"') +
  circle(172, ICE, 2) +
  spin(18, false, circle(140, CYAN, 4, 'stroke-dasharray="22 10"')) +
  `<circle cx="${CX}" cy="${CY}" r="108" fill="#04202e" stroke="${ICE}" stroke-width="3"/>` +
  `<path d="M${pt(80, -Math.PI / 2)}L${pt(80, Math.PI / 6)}L${pt(80, (5 * Math.PI) / 6)}Z" fill="none" stroke="${CYAN}" stroke-width="3"/>` +
  `<path d="M${pt(46, Math.PI / 2)}L${pt(46, (-Math.PI) / 6)}L${pt(46, (-5 * Math.PI) / 6)}Z" fill="none" stroke="${ICE}" stroke-width="2"/>` +
  `<circle cx="${CX}" cy="${CY}" r="22" fill="${ICE}"><animate attributeName="r" values="22;27;22" dur="3s" repeatCount="indefinite"/><animate attributeName="fill-opacity" values="1;0.65;1" dur="3s" repeatCount="indefinite"/></circle>` +
  ticks(108, 60, 12, ICE, 2) +
  `</g>` +
  // Velo de lectura: oscurece la franja donde va el texto del chat.
  `<rect x="${CX - 640}" y="0" width="1280" height="${H}" fill="url(#v)"/>` +
  // Anillos con movimiento, por encima del velo para que se note que giran:
  // son arcos finos y dispersos, así que casi no tapan el texto.
  `<g opacity="0.8">` +
  spin(40, true, arc(470, 0.2, 2.2, CYAN, 6) + arc(470, 3.4, 4.6, CYAN, 6) + arc(470, 5.4, 6.0, AMBER, 6)) +
  spin(24, false, circle(420, ICE, 1.5, 'stroke-dasharray="40 10 6 10"')) +
  `</g>` +
  // Retícula (solo las esquinas, lejos del texto)
  `<g opacity="0.7"><path d="M${CX - 560} ${CY - 250}v-30h30M${CX + 560} ${CY - 250}v-30h-30M${CX - 560} ${CY + 250}v30h30M${CX + 560} ${CY + 250}v30h-30" fill="none" stroke="${AMBER}" stroke-width="3"/></g>` +
  // Terreno
  terrain +
  // Brújula
  `<g opacity="0.6"><line x1="${CX - 576}" y1="${TOP}" x2="${CX + 576}" y2="${TOP}" stroke="${CYAN}" stroke-width="2"/>` +
  `<path d="${compass}" stroke="${CYAN}" stroke-width="2" fill="none"/>` +
  compassText +
  `<path d="M${CX - 10} ${TOP - 16}L${CX} ${TOP - 30}L${CX + 10} ${TOP - 16}Z" fill="${AMBER}"/></g>` +
  // Escalas
  `<path d="${scaleL}" stroke="${CYAN}" stroke-width="2"/><path d="${scaleR}" stroke="${CYAN}" stroke-width="2"/>` +
  scaleText +
  // Lecturas de esquina
  // Lecturas solo en el margen derecho, fuera de la columna del texto, y tenues.
  `<g opacity="0.55">` +
  text(W - 60, TOP + 50, 'SISTEMA EN LÍNEA', ICE, 'end', 18) +
  text(W - 60, TOP + 76, 'REACTOR 100%', CYAN, 'end', 16) +
  text(W - 60, TOP + 100, 'ENLACE SEGURO', CYAN, 'end', 16) +
  `</g>` +
  corner(LEFT - 20, TOP - 14, 1, 1) +
  corner(W - 40, TOP - 14, -1, 1) +
  corner(LEFT - 20, H - 60, 1, -1) +
  corner(W - 40, H - 60, -1, -1) +
  // Adornos del margen derecho, fuera de la columna del texto y muy tenues:
  // ticker de datos, caja de objetivo con mira y dos microglitches.
  `<g opacity="0.4">${ticker}` +
  `<path d="M${W - 118} ${CY + 40}v-16h16M${W - 62} ${CY + 40}v-16h-16M${W - 118} ${CY + 96}v16h16M${W - 62} ${CY + 96}v16h-16" fill="none" stroke="${AMBER}" stroke-width="2"/>` +
  `<path d="M${W - 90} ${CY + 56}v24M${W - 102} ${CY + 68}h24" stroke="${CYAN}" stroke-width="1.5"/>` +
  text(W - 60, CY + 134, 'OBJ 01 · FIJADO', ICE, 'end', 13) +
  `</g>` +
  `<rect x="${W - 150}" y="${TOP + 330}" width="90" height="2" fill="${ICE}" opacity="0"><animate attributeName="opacity" values="0;0;0.7;0;0;0.5;0;0" keyTimes="0;0.5;0.52;0.55;0.8;0.81;0.84;1" dur="7s" repeatCount="indefinite"/></rect>` +
  `<rect x="${W - 130}" y="${CY + 250}" width="60" height="2" fill="${CYAN}" opacity="0"><animate attributeName="opacity" values="0;0;0.6;0;0" keyTimes="0;0.3;0.32;0.36;1" dur="11s" repeatCount="indefinite"/></rect>` +
  // Barrido de escaneo
  `<rect x="0" y="0" width="${W}" height="4" fill="${ICE}" fill-opacity="0.45"><animate attributeName="y" values="${TOP};${H - 40};${TOP}" dur="10s" repeatCount="indefinite"/></rect>` +
  `</svg>`

// Colores a juego para la pestaña Code (solo modo oscuro): fondo azul marino,
// texto helado y acento cian. Van en la misma llamada que el fondo, porque otra
// llamada a $.theme.set borra lo anterior.
type Variant = {
  scene: string
  name: string
  svg: string
  bg: string
  tint: string
  colors: ReturnType<typeof makeColors>
}

// Variante ámbar: el mismo dibujo con la paleta cambiada (cian <-> ámbar).
const AMBER_SWAPS: [string, string][] = [
  [CYAN, '#ffb02e'], [ICE, '#ffe3a8'], [DIM, '#7a4a0e'], [AMBER, '#19c6f0'],
  ['#0b3a50', '#4a2c0a'], ['#04202e', '#241405'], ['#06151f', '#150d05'], ['#0a2a3b', '#2b1a08'], ['#02080f', '#0a0603'],
]
// Una sola pasada, para que un color ya cambiado no se vuelva a cambiar.
const SWAP_MAP = new Map(AMBER_SWAPS)
const SVG_AMBAR = SVG.replace(new RegExp(AMBER_SWAPS.map(([a]) => a).join('|'), 'g'), m => SWAP_MAP.get(m) ?? m)

// Colores a juego, resaltado de código, colores de git y bordes más marcados.
const git = (added: string, removed: string, modified: string, merged: string, muted: string) => ({
  added, removed, modified, merged, closed: muted, conflicting: removed, draft: muted,
})

const cian = makeColors({
  label: 'HUD',
  only: 'dark',
  codeTheme: { dark: 'night-owl' },
  contrast: 'more',
  dark: {
    gray: {
      anchors: {
        'surface-0': '#02080f', 'surface-1': '#051420', 'surface-2': '#061d2b', 'surface-3': '#082333',
        'text-primary': '#e6fbff', 'text-secondary': '#b4e4f0', 'text-muted': '#8cc4d6',
      },
    },
    roles: { accent: CYAN, warning: AMBER, success: '#4df0b8', danger: '#ff7a92' },
    git: git('#4df0b8', '#ff7a92', '#ffb02e', '#a99bff', '#8cc4d6'),
  },
})

const ambar = makeColors({
  label: 'HUD ámbar',
  only: 'dark',
  codeTheme: { dark: 'night-owl' },
  contrast: 'more',
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0a0603', 'surface-1': '#150d05', 'surface-2': '#1d1207', 'surface-3': '#271809',
        'text-primary': '#fff4e0', 'text-secondary': '#f0d8b0', 'text-muted': '#cfae7e',
      },
    },
    roles: { accent: '#ffb02e', warning: '#ffd36b', success: '#4df0b8', danger: '#ff7a92' },
    git: git('#4df0b8', '#ff7a92', '#ffd36b', '#a99bff', '#cfae7e'),
  },
})

// Estados del HUD cian: el mismo dibujo, más rápido o con una capa breve encima.
const encima = (svg: string, extra: string) => svg.replace('</svg>', extra + '</svg>')
const BG = '#02080f'
const CIRC = (r: number) => 2 * Math.PI * r

// Arranque: cortina oscura que se abre, anillos que se dibujan y un rótulo.
const dibuja = (r: number, begin: number) =>
  `<circle cx="${CX}" cy="${CY}" r="${r}" fill="none" stroke="${ICE}" stroke-width="3" stroke-dasharray="${CIRC(r).toFixed(0)}" stroke-dashoffset="${CIRC(r).toFixed(0)}" opacity="0">` +
  `<animate attributeName="stroke-dashoffset" from="${CIRC(r).toFixed(0)}" to="0" dur="1.4s" begin="${begin}s" fill="freeze"/>` +
  `<animate attributeName="opacity" values="1;1;0" keyTimes="0;0.7;1" dur="3.4s" fill="freeze"/></circle>`
const ARRANQUE =
  // opacity="0" de base: si la animación termina sin "congelar", la cortina no vuelve a tapar el HUD.
  `<rect width="${W}" height="${H}" fill="${BG}" opacity="0"><animate attributeName="opacity" values="1;1;0" keyTimes="0;0.4;1" dur="3.4s" fill="freeze"/></rect>` +
  dibuja(140, 0.2) + dibuja(205, 0.5) + dibuja(470, 0.8) +
  `<text x="${CX}" y="${CY + 330}" text-anchor="middle" font-family="monospace" font-size="22" fill="${ICE}" opacity="0">INICIALIZANDO SISTEMAS` +
  `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.75;1" dur="3.4s" fill="freeze"/></text>`

const VARIANTS = {
  cian: { scene: BACKDROP, name: 'cian', svg: encima(SVG, ARRANQUE), plain: SVG, bg: BG, tint: '#02121c', colors: cian },
  ambar: { scene: BACKDROP + '-ambar', name: 'ámbar', svg: SVG_AMBAR, plain: SVG_AMBAR, bg: '#0a0603', tint: '#140a03', colors: ambar },
  // Diagnóstico: el mismo HUD sin ninguna animación SMIL.
  quieto: { scene: BACKDROP + '-quieto', name: 'quieto', svg: SVG.replace(/<animate[^>]*\/>/g, ''), plain: SVG.replace(/<animate[^>]*\/>/g, ''), bg: BG, tint: '#02121c', colors: cian },
} satisfies Record<string, Variant & { plain: string }>

type Engine = { theme: { set: (a: object) => Promise<{ isDrawn: boolean; reason?: string }> } }

// Pide el tema y devuelve en una línea qué pasó, también si falla.
const poner = async ($: Engine, v: Variant): Promise<string> => {
  // Solo los avisos "Desktop won't paint" hacen que la app rechace el tema.
  const refused = v.colors.problems.filter(p => p.startsWith("Desktop won't paint"))
  if (refused.length > 0) return `colores rechazados: ${refused[0]}`
  try {
    const set = await $.theme.set({
      backdrop: { scene: v.scene, glass: { blur: 5, opacity: 0.4, tint: v.tint } },
      colors: v.colors.theme,
      overrideColorScheme: 'dark',
    })
    return set.isDrawn ? `HUD ${v.name} pedido a la app` : `sin fondo: ${set.reason}`
  } catch (err) {
    return `error al pedir el fondo: ${err instanceof Error ? err.message : String(err)}`
  }
}

// auto: ámbar de día (07-18 h), cian de noche.
const elegir = (arg: string): Variant => {
  const a = arg.trim().toLowerCase()
  if (a === 'ambar' || a === 'ámbar') return VARIANTS.ambar
  if (a === 'quieto') return VARIANTS.quieto
  if (a === 'auto') {
    const h = new Date().getHours()
    return h >= 7 && h < 19 ? VARIANTS.ambar : VARIANTS.cian
  }
  return VARIANTS.cian
}

// Diagnóstico: deja en el registro, una sola vez por mensaje, qué pasó al dibujar el fondo.
const dicho = new Set<string>()
const avisar = ($: { ui: { log: (m: string) => unknown } }, msg: string) => {
  if (dicho.has(msg)) return
  dicho.add(msg)
  $.ui.log(`hud: ${msg}`)
}

// El marco del SVG no tiene scripts: si la app lo pausa (oculto, split view,
// mucho tiempo), nada lo reanuda. Cambiar el source obliga a crear un marco
// nuevo, así que cada "recarga" sube este número y el SVG lo lleva dentro.
let recarga = 0
const RECARGA_MS = 10 * 60 * 1000
let reloj: { cancel: () => void } | undefined

const recargar = ($: { ui: { invalidate: (ev: 'ui.render') => void } }) => {
  recarga++
  $.ui.invalidate('ui.render')
}

// El arranque solo en el primer dibujo; las recargas usan el HUD sin cortina.
const fuente = (v: { svg: string; plain: string }) =>
  (recarga === 0 ? v.svg : v.plain).replace('</svg>', `<g id="r${recarga}"/></svg>`)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'hud', description: 'Fondo HUD: /hud (cian), /hud ambar, /hud auto (por hora)' })
    await poner($, VARIANTS.cian)
    // Un solo reloj por proceso, aunque haya varias sesiones.
    reloj ??= $.clock.every(RECARGA_MS, () => recargar($))
    return next(e)
  })

  // Otra ventana o app se une a la sesión (split view, abrir la sesión): marco nuevo.
  on('session.attach', async ($, e, next) => {
    const result = await next(e)
    recargar($)
    return result
  })

  on('command.run', { command: 'hud' }, async ($, e) => {
    const text = await poner($, elegir(e.args ?? ''))
    recargar($)
    return { text }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    const v = Object.values(VARIANTS).find(x => x.scene === e.props.scene)
    // Se filtra solo por escena: e.props.plugin puede no ser exactamente PLUGIN.
    if (!v) return next(e)
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      avisar($, `superficie ${e.surface} no dibuja fondos`)
      return next(e)
    }
    const ui = $.ui.resolve(e)
    if (!('Svg' in ui)) {
      avisar($, `sin Svg en la superficie ${e.surface}`)
      return next(e)
    }
    avisar($, `fondo ${v.name} dibujado en ${e.surface} (plugin=${e.props.plugin})`)
    const { Svg } = ui
    // isInteractive: marco aislado donde corren las animaciones SMIL.
    return <Svg source={fuente(v)} alt={`Fondo HUD ${v.name} con reactor de anillos, brújula y terreno en malla`} isInteractive />
  })
}
