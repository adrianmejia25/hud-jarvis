# hud-jarvis

HUD theme for the Claude Code desktop app: an animated backdrop of concentric cyan rings (reactor, compass, scales and wireframe terrain) behind the conversation, with dark glass and matching dark-mode colors.

It uses the theme feature of mods: [Put a backdrop behind the conversation](https://code.claude.com/docs/en/plugins/mods/interface#put-a-backdrop-behind-the-conversation).

## Requirements

- The Claude desktop app, Code tab. The terminal doesn't draw backdrops.
- Claude Code v2.1.324 or later.
- An account that allows mods. If your organization blocks them, the theme doesn't load.
- With a third-party provider instead of a Claude account, Claude Desktop v5.11492.5 or earlier doesn't apply the colors.

## Install

In a session in the Code tab, run:

```
/plugin marketplace add adrianmejia25/hud-jarvis
/plugin install hud-jarvis@hud-jarvis
```

Or from your shell:

```bash
claude plugin marketplace add adrianmejia25/hud-jarvis
claude plugin install hud-jarvis@hud-jarvis
```

Then start a new session in the Code tab. The theme is applied when each session starts.

If you installed an earlier copy by cloning this repo into `~/.claude/skills/hud-jarvis`, delete that folder first, so the mod doesn't load twice.

### Install without the marketplace

Clone the repo into your Claude Code skills folder. This command works in PowerShell and Git Bash:

```bash
git clone https://github.com/adrianmejia25/hud-jarvis "$HOME/.claude/skills/hud-jarvis"
```

## Update

From your shell, then start a new session:

```bash
claude plugin marketplace update hud-jarvis
claude plugin update hud-jarvis@hud-jarvis
```

## Commands

- `/hud`: cyan HUD (default, with a boot animation).
- `/hud ambar`: the same scene in amber.
- `/hud auto`: amber from 07:00 to 18:59, cyan the rest of the day.
- `/hud quieto`: cyan with no animations (for troubleshooting).

## If it doesn't show

Run `/hud`. Its message says whether the backdrop was requested, or why it wasn't drawn (for example, rejected colors or a surface that doesn't draw backdrops).

## Notes

- The scene adapts to any window size and aspect ratio: the reactor scales with the window, and the corner frames and side scales stay pinned to the window edges. It assumes the sidebar is open (about 360 px wide). With the sidebar closed, the scene sits about 180 px right of center.
- The animation runs in a script-less frame that the app can pause; on some machines it stops 20 to 25 seconds after the frame is created. To keep it moving, the theme reloads the frame every 15 seconds, and also when another window attaches to the session and on `/hud`. Each reload resumes the animations where they were, so you may only notice a brief hitch.

## Files

- `hooks/register.tsx`: the SVG scene, the variants and the colors.
- `hooks/make-colors.js` and `make-colors.d.ts`: helper generated from the Claude Code documentation, copied unchanged.
- `.claude-plugin/plugin.json`: the plugin manifest.
- `.claude-plugin/marketplace.json`: the marketplace that lists this plugin.

## License

MIT for the code in this repo (see `LICENSE`). `hooks/make-colors.js` comes from the Claude Code documentation and isn't covered by that license.
