# Portfolio — Jared Goroski

Personal portfolio site for Jared Goroski, data scientist on FTSE Russell's
equity index data team (London Stock Exchange Group). Static HTML/CSS/JS,
hosted on GitHub Pages.

**Live:** https://j-goroski.github.io/portfolio/

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Home: hero, about, projects, skills |
| `index_engine.html` | Project: rules-based equity index engine |
| `sec-xbrl-pipeline.html` | Project: SEC EDGAR / XBRL data pipeline |
| `qlora-extraction.html` | Project: QLoRA filing-extraction model |
| `nyc-accident-ml-analysis.html` | Project: NYC accident ML analysis |
| `styles.css` | Dark-minimal theme (deep navy + amber accent) |
| `script.js` | Index-constituent hero animation + email modal |
| `images/` | Project screenshots |
| `documents/` | Project reports (PDF) |

## Design

Dark-minimal. Deep navy base (`#0B0E14`) with a single amber signal accent
(`#E0A93B`). Type: Space Grotesk (display) / Inter (body) / JetBrains Mono (data).
The hero animation is an "index constituent" field — points carry a score and a
drifting threshold with a buffer band gives membership hysteresis (amber = in
index, dim = out), visualizing the banding/buffer rule from `index_engine`.

## Local preview

No build step. Serve the folder and open it:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## TODO

- Add public repo URLs on the three new project pages (currently `href="#"`).
- Add screenshots where pages have `.placeholder` blocks.
