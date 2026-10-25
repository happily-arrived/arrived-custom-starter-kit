import type { PublicEvent, PublicEventData } from "@/lib/happily/types";

type EventContent = PublicEventData["event"]["content"];
type EventStyles = PublicEventData["event"]["styles"];

export type SectionKey = keyof NonNullable<
  PublicEvent["display_settings"]["sections"]
>;

export function text(value: string | null | undefined, fallback = "") {
  return value?.trim() || fallback;
}

export function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

export function styleValue(
  styles: EventStyles,
  key: keyof EventStyles,
  fallback: string,
) {
  const value = styles[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function isSectionVisible(event: PublicEvent, sectionKey: SectionKey) {
  return event.display_settings.sections?.[sectionKey]?.display ?? true;
}

export function visibleSections(
  eventData: PublicEventData,
): Record<SectionKey, boolean> {
  const { event, form, sessions, speakers, sponsors, faqs } = eventData;
  const content = event.content;

  return {
    about:
      (hasText(content.aboutTitle) || hasText(content.aboutDescription)) &&
      isSectionVisible(event, "about"),
    agenda: sessions.length > 0 && isSectionVisible(event, "agenda"),
    speakers: speakers.length > 0 && isSectionVisible(event, "speakers"),
    register: Boolean(form) && isSectionVisible(event, "register"),
    host:
      (hasText(content.companyAboutTitle) ||
        hasText(content.companyAboutDescription)) &&
      isSectionVisible(event, "host"),
    sponsors: sponsors.length > 0 && isSectionVisible(event, "sponsors"),
    faq: faqs.length > 0 && isSectionVisible(event, "faq"),
  };
}

export function heroImage(content: EventContent) {
  return content.heroImage || content.heroGraphic || null;
}

export function formatEventDate(
  date: string | null,
  timezone: string | null,
  options: Intl.DateTimeFormatOptions,
) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    timeZone: timezone || undefined,
    ...options,
  }).format(new Date(date));
}

export function eventDateRange(event: PublicEventData["event"]) {
  const start = formatEventDate(event.start_date, event.timezone, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const end = formatEventDate(event.end_date, event.timezone, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (!start) {
    return null;
  }

  if (!end || end === start) {
    return start;
  }

  return `${start} - ${end}`;
}

export function eventTimeRange(event: PublicEventData["event"]) {
  const start = formatEventDate(event.start_date, event.timezone, {
    hour: "numeric",
    minute: "2-digit",
  });
  const end = formatEventDate(event.end_date, event.timezone, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (!start || !end) {
    return start;
  }

  return `${start} - ${end}`;
}

export function ordered<T extends { order: number | null }>(items: T[]) {
  return [...items].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
}
