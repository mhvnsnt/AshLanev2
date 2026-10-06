import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  // GitHub Pages serves the app from /AshLanev2/ — the router must strip
  // that prefix when matching client-side routes. import.meta.env.BASE_URL
  // is "/AshLanev2/" for PAGES_BUILD and "/" everywhere else.
  const basepath = import.meta.env.BASE_URL.replace(/\/$/, "");
  return createRouter({
    routeTree,
    basepath: basepath || "/",
    defaultErrorComponent: AppErrorComponent,
  });
}
