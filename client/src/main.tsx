import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import {
  ThemeProvider,
  createTheme,
  THEME_ID as MATERIAL_THEME_ID,
} from "@mui/material/styles";

import { CssVarsProvider as JoyCssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/material/CssBaseline";

import "./index.css";
import "./app/i18n";
import App from "./App.tsx";

const materialTheme = createTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={{ [MATERIAL_THEME_ID]: materialTheme }}>
      <JoyCssVarsProvider>
        <CssBaseline enableColorScheme />
        <App />
      </JoyCssVarsProvider>
    </ThemeProvider>
  </StrictMode>
);
