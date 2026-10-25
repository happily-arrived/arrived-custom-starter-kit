import type { ReactNode } from "react";

import type { PublicEventData } from "@/lib/happily/types";

import { Footer } from "./footer";
import { Header } from "./header";
import type { SectionKey } from "./helpers";
import { isSectionVisible, styleValue, text, visibleSections } from "./helpers";
import type { NavLinkItem } from "./navbar";

type EventShellProps = {
  eventData: PublicEventData;
  children: ReactNode;
};

export function EventShell({ eventData, children }: EventShellProps) {
  const { event } = eventData;
  const styles = event.styles;

  const sections = visibleSections(eventData);
  const sectionLinks: (NavLinkItem & { section: SectionKey })[] = [
    { label: "About", href: "/#about", section: "about" },
    { label: "Agenda", href: "/#agenda", section: "agenda" },
    { label: "Speakers", href: "/#speakers", section: "speakers" },
    { label: "Host", href: "/#host", section: "host" },
    { label: "Sponsors", href: "/#sponsors", section: "sponsors" },
    { label: "FAQ", href: "/#faqs", section: "faq" },
  ];

  const nav: NavLinkItem[] = [
    ...sectionLinks.filter((link) => sections[link.section]),
    ...(event.photos_toggle ? [{ label: "Gallery", href: "/photos" }] : []),
  ];

  const buttonLinks = event.display_settings.buttonLinks;
  const showCta =
    eventData.form?.is_active &&
    isSectionVisible(event, "register") &&
    buttonLinks?.navCTA.display &&
    buttonLinks.heroCTA.text;

  return (
    <div className="flex min-h-screen flex-col bg-(--event-base-bg) text-(--event-base-text)">
      <Header
        logo={event.logo_url}
        logoAlt={`${event.name} logo`}
        nav={nav}
        hideNavigation={event.display_settings.hideNavigation ?? false}
        ctaText={
          showCta ? text(buttonLinks!.heroCTA.text, "Register") : undefined
        }
        ctaHref={showCta ? "/#register" : undefined}
      />
      {children}
      <Footer baseBackgroundColor={styleValue(styles, "baseBg", "#ffffff")} />
    </div>
  );
}
