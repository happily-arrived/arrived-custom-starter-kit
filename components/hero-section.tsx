import Image from "next/image";

import type { PublicEventData } from "@/lib/happily/types";

import { Button } from "@/components/ui/button";

import { ScrollLink } from "./scroll-link";
import { EventDetails } from "./event-details";
import { heroImage, isSectionVisible, text } from "./helpers";
import { Container } from "./container";

type HeroSectionProps = {
  event: PublicEventData["event"];
  formActive?: boolean;
};

export function HeroSection({ event, formActive }: HeroSectionProps) {
  const content = event.content;
  const heroSectionType = content.heroSection ?? "image";
  const image = heroImage(content);
  const overlayOpacity =
    content.overlay === "0%" ? "bg-black/0" : "bg-black/50";
  const hasBackground = heroSectionType !== "none";

  return (
    <section className="relative isolate overflow-hidden">
      {hasBackground && (
        <>
          {heroSectionType === "video" && content.heroVideo && (
            <video
              key={content.heroVideo}
              className="absolute inset-0 -z-20 size-full object-cover"
              loop
              muted
              autoPlay
              playsInline
            >
              <source src={content.heroVideo} type="video/mp4" />
            </video>
          )}
          {heroSectionType === "image" && image && (
            <Image
              src={image}
              alt=""
              fill
              priority
              sizes="100vw"
              className="absolute inset-0 -z-20 object-cover"
            />
          )}
          <div className={`absolute inset-0 -z-10 ${overlayOpacity}`} />
        </>
      )}
      <Container
        id="hero"
        className="grid content-end max-w-7xl py-20 min-h-[50vh]"
      >
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">
            {text(content.companyName, event.type ?? "Event")}
          </p>
          <h1 className="text-5xl font-semibold leading-tight sm:text-7xl">
            {text(event.name, event.name)}
          </h1>
          <EventDetails event={event} />
          <p>{text(content.heroText)}</p>
          {formActive &&
          isSectionVisible(event, "register") &&
          event.display_settings.buttonLinks?.heroCTA.display &&
          event.display_settings.buttonLinks.heroCTA.text ? (
            <Button
              asChild
              size="lg"
              className="mt-4 min-h-12 bg-(--event-accent-bg) px-5 py-3 font-semibold text-(--event-accent-text) hover:bg-(--event-accent-bg)/85"
            >
              <ScrollLink href="#register">
                {text(
                  event.display_settings.buttonLinks.heroCTA.text,
                  "Register",
                )}
              </ScrollLink>
            </Button>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
