import { createFileRoute } from "@tanstack/react-router";
import { AshlaneApp } from "@/components/ashlane-app";
import { IntroSequence } from "@/components/intro-sequence";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <IntroSequence>
      <AshlaneApp />
    </IntroSequence>
  );
}