# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

---

## Environment variables

This project reads a few Vite environment variables during build.

- `VITE_QR_BASE_URL` – base URL used when generating a QR code in `QueueInformation`.
  If unset it defaults to `https://nmmc-queue-system.vercel.app`.

Create a `.env` file in the project root with your values (this file is
ignored by git). You can also define these variables in your Vercel project
settings so each deployment uses the same domain regardless of the generated
preview hostname.

## Linux Kiosk Auto Print (Bluetooth Serial)

This project includes a local print daemon and systemd units so printing can be
automatic after clicking `Print Ticket`.

### Files included

- `scripts/print-daemon.mjs` - local HTTP print service (writes ESC/POS to `/dev/rfcomm0`)
- `deploy/linux/rfcomm-bind.service` - binds Bluetooth printer serial device on boot
- `deploy/linux/kiosk-print-daemon.service` - starts local print daemon on boot

### 1) Install app on kiosk machine

Example target path:

```bash
sudo mkdir -p /opt/nmmc-queue-system
sudo cp -r . /opt/nmmc-queue-system
cd /opt/nmmc-queue-system
npm install
```

### 2) Install systemd units

```bash
sudo cp deploy/linux/rfcomm-bind.service /etc/systemd/system/
sudo cp deploy/linux/kiosk-print-daemon.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable rfcomm-bind.service kiosk-print-daemon.service
sudo systemctl start rfcomm-bind.service kiosk-print-daemon.service
```

### 3) Pair/trust Bluetooth printer once

```bash
sudo bluetoothctl
power on
agent on
default-agent
trust 86:67:7A:60:EA:72
exit
```

### 4) Verify status

```bash
ls -l /dev/rfcomm0
systemctl status rfcomm-bind.service
systemctl status kiosk-print-daemon.service
```

When the kiosk app calls `onPrint`, it sends a POST request to `http://127.0.0.1:8787/print`.
If daemon printing fails, browser printing remains as fallback.