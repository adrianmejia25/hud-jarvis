# hud-jarvis

Tema HUD para la app de escritorio de Claude Code: un fondo animado de anillos concéntricos en cian (reactor, brújula, escalas y terreno en malla) detrás de la conversación, con vidrio oscuro y colores a juego en modo oscuro.

Usa la función de temas de los mods: [Put a backdrop behind the conversation](https://code.claude.com/docs/en/plugins/mods/interface#put-a-backdrop-behind-the-conversation).

## Requisitos

- La app de escritorio de Claude, pestaña Code. El terminal no dibuja fondos.
- Claude Code v2.1.324 o posterior.
- Una cuenta que permita mods. Si tu organización los bloquea, el tema no carga.
- Con un proveedor externo en vez de una cuenta de Claude, Claude Desktop v5.11492.5 o anterior no aplica los colores.

## Instalar

Clona el repo en la carpeta de skills de Claude Code. Este comando funciona en PowerShell y en Git Bash:

```bash
git clone https://github.com/adrianmejia25/hud-jarvis "$HOME/.claude/skills/hud-jarvis"
```

O pídeselo a Claude en la pestaña Code:

> Clona https://github.com/adrianmejia25/hud-jarvis en la carpeta `.claude/skills/hud-jarvis` de mi usuario y verifica que quede `hooks/register.tsx` ahí.

Después abre una sesión nueva en la pestaña Code. El tema se aplica al iniciar cada sesión.

## Comandos

- `/hud`: HUD cian (por defecto, con animación de arranque).
- `/hud ambar`: la misma escena en ámbar.
- `/hud auto`: ámbar de 07:00 a 18:59, cian el resto.
- `/hud quieto`: cian sin animaciones (diagnóstico).

## Si no aparece

Corre `/hud`: el mensaje dice si el fondo se pidió o por qué no se dibujó (por ejemplo, colores rechazados o una superficie que no dibuja fondos).

## Notas

- El dibujo está pensado para una ventana de unos 1920×1080 con la barra lateral abierta (unos 360 px). En otras pantallas el reactor puede quedar algo descentrado.
- La animación corre en un marco sin scripts que la app puede pausar. Para que no se quede quieta, el tema lo recarga al abrir una sesión, cuando otra ventana se une a ella, con `/hud` y cada 10 minutos. Cada recarga reinicia los giros.

## Archivos

- `hooks/register.tsx`: la escena SVG, las variantes y los colores.
- `hooks/make-colors.js` y `make-colors.d.ts`: helper generado de la documentación de Claude Code, copiado sin cambios.

## Licencia

MIT para el código de este repo (ver `LICENSE`). `hooks/make-colors.js` viene de la documentación de Claude Code y no está cubierto por esa licencia.
