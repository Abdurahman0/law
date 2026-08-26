"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  LAWYERS,
  initials,
  AREA_KEYS,
  REGION_KEYS,
  type Lawyer,
} from "@/lib/lawyers";
import Select, { type Option } from "../Select";
import { IconChevronLeft, IconChevronRight, IconInfo } from "../icons";

const priceNum = (p: string) => Number(p.replace(/\s/g, "")) || 0;

export default function LawyersSection({
  initialArea = "",
  showFlow = true,
  standalone = false,
  compact = false,
}: {
  initialArea?: string;
  showFlow?: boolean;
  standalone?: boolean;
  compact?: boolean;
}) {
  const t = useTranslations("lawyers");
  const te = useTranslations("enums");
  const [area, setArea] = useState(initialArea);
  const [region, setRegion] = useState("");
  const [sort, setSort] = useState("rating");
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const list = useMemo(() => {
    const filtered = LAWYERS.filter(
      (l) => (!area || l.areaKey === area) && (!region || l.regionKey === region),
    );
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sort === "experience") return b.exp - a.exp;
      if (sort === "priceAsc") return priceNum(a.price) - priceNum(b.price);
      if (sort === "priceDesc") return priceNum(b.price) - priceNum(a.price);
      return b.rate - a.rate;
    });
    return sorted;
  }, [area, region, sort]);

  const syncNav = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 2;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= max);
  }, []);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = 0;
    syncNav();
  }, [area, region, sort, syncNav]);

  function scrollBy(dir: number) {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".advcard");
    const step = card ? card.offsetWidth + 12 : 320;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * step, behavior: reduce ? "auto" : "smooth" });
  }

  const regionOpts: Option[] = [
    { value: "", label: te("regions.all") },
    ...REGION_KEYS.map((r) => ({ value: r, label: te(`regions.${r}`) })),
  ];
  const sortOpts: Option[] = [
    { value: "rating", label: t("filters.sortRating") },
    { value: "experience", label: t("filters.sortExperience") },
    { value: "priceAsc", label: t("filters.sortPriceAsc") },
    { value: "priceDesc", label: t("filters.sortPriceDesc") },
  ];
  const stats = t.raw("stats") as { value: string; label: string }[];

  function card(l: Lawyer) {
    return (
      <article className="advcard" key={l.name}>
        <div className="advcard__top">
          <div className="advcard__row">
            <div className="advcard__av">{initials(l.name)}</div>
            <div style={{ minWidth: 0 }}>
              <div className="advcard__n">{l.name}</div>
              <div className="advcard__sp">
                {te(`areas.${l.areaKey}`)} · {te(`regions.${l.regionKey}`)}
              </div>
              {l.super ? (
                <span className="advcard__badge">{t("card.super")}</span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="advcard__b">
          <div className="rating">
            <b>{l.rate.toFixed(1)}</b>
            <span>{t("card.reviews", { count: l.rev, years: l.exp })}</span>
          </div>
          <div className="wins">
            <div className="win">
              <b>{l.full}</b>
              <span>{t("card.fullWin")}</span>
            </div>
            <div className="win">
              <b>{l.part}</b>
              <span>{t("card.partialWin")}</span>
            </div>
            <div className="win">
              <b>
                {t("card.responseValue")}
                <small>{t("card.responseUnit")}</small>
              </b>
              <span>{t("card.responseLabel")}</span>
            </div>
          </div>
          <div className="advcard__ft">
            <div className="price">
              <b>{l.price}</b>
              <span>{t("card.priceNote")}</span>
            </div>
            <button className="btn btn--pri btn--sm" type="button">
              {t("card.choose")}
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <section className="sec" id="lawyers" style={{ background: "var(--b50)" }}>
      <div className="wrap">
        <div className="head head--row">
          <div>
            <span className="kick">{t("kicker")}</span>
            <h2 className="h2">{t("title")}</h2>
            <p className="lead">{t("lead")}</p>
          </div>
          {!compact ? (
            <div className="navbtns">
              <button
                className="nbtn"
                onClick={() => scrollBy(-1)}
                disabled={atStart}
                aria-label="prev"
              >
                <IconChevronLeft />
              </button>
              <button
                className="nbtn"
                onClick={() => scrollBy(1)}
                disabled={atEnd}
                aria-label="next"
              >
                <IconChevronRight />
              </button>
            </div>
          ) : null}
        </div>

        {standalone ? (
          <div className="strip">
            {stats.map((s, i) => (
              <div className="strip__i" key={i}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="chiprow">
          <button
            className="fchip"
            aria-pressed={area === ""}
            onClick={() => setArea("")}
          >
            {t("filterAll")}
          </button>
          {AREA_KEYS.map((a) => (
            <button
              key={a}
              className="fchip"
              aria-pressed={area === a}
              onClick={() => setArea(a)}
            >
              {te(`areas.${a}`)}
            </button>
          ))}
        </div>

        {standalone ? (
          <div className="filters">
            <div className="fld">
              <label>{t("filters.region")}</label>
              <Select
                value={region}
                onChange={setRegion}
                options={regionOpts}
                ariaLabel={t("filters.region")}
              />
            </div>
            <div className="fld">
              <label>{t("filters.sort")}</label>
              <Select
                value={sort}
                onChange={setSort}
                options={sortOpts}
                ariaLabel={t("filters.sort")}
              />
            </div>
          </div>
        ) : null}

        {compact ? (
          <div className="advgrid">
            {list.length ? (
              list.map(card)
            ) : (
              <div style={{ padding: 36, textAlign: "center", color: "var(--gray)", width: "100%" }}>
                {t("empty")}
              </div>
            )}
          </div>
        ) : (
          <div className="scroller" ref={scroller} onScroll={syncNav}>
            {list.length ? (
              list.map(card)
            ) : (
              <div style={{ padding: 36, textAlign: "center", color: "var(--gray)", width: "100%" }}>
                {t("empty")}
              </div>
            )}
          </div>
        )}

        <div className="info">
          <IconInfo />
          <span>{t("priceInfo")}</span>
        </div>

        {showFlow ? (
          <div className="flow">
            {(t.raw("flow") as { title: string; text: string }[]).map((f, i) => (
              <div className="fstep" key={i}>
                <b>{i + 1}</b>
                <strong>{f.title}</strong>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
