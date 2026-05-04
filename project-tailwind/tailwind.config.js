/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          soft: "var(--accent-soft)",
          border: "var(--accent-border)",
          fg: "var(--accent-fg)",
        },
        surface: {
          DEFAULT: "var(--bg)",
          subtle: "var(--bg-subtle)",
          panel: "var(--panel)",
          elev: "var(--elev-bg)",
        },
        line: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
          divider: "var(--divider)",
        },
        ink: {
          DEFAULT: "var(--fg)",
          muted: "var(--fg-muted)",
          subtle: "var(--fg-subtle)",
          faint: "var(--fg-faint)",
        },
        ok: "var(--ok)",
        warn: "var(--warn)",
        err: "var(--err)",
        chart: {
          red: "var(--red)",
          green: "var(--green)",
          blue: "var(--blue)",
          luma: "var(--luma)",
        },
      },
      borderRadius: {
        xs: "3px",
        sm: "5px",
        md: "7px",
        lg: "10px",
        xl: "14px",
      },
      boxShadow: {
        sm: "0 1px 0 rgba(16,24,40,.04), 0 1px 2px rgba(16,24,40,.05)",
        md: "0 2px 4px rgba(16,24,40,.05), 0 8px 20px -4px rgba(16,24,40,.08)",
        lg: "0 10px 30px -8px rgba(16,24,40,.15), 0 4px 8px rgba(16,24,40,.06)",
        focus: "0 0 0 3px var(--accent-soft)",
      },
      fontFamily: {
        sans: [
          '"IBM Plex Sans"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"IBM Plex Mono"',
          "ui-monospace",
          '"SF Mono"',
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["10px", "1.4"],
      },
      spacing: {
        topbar: "48px",
      },
    },
  },
  plugins: [],
};
