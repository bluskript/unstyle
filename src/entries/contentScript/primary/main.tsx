/* @refresh reload */
import { render } from "solid-js/web";
import renderContent from "../renderContent";
import App from "./App";
import { loadStyles } from "./loadStyles";

renderContent(import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS, (appRoot) => {
  loadStyles();
  render(() => <App />, appRoot);
});
