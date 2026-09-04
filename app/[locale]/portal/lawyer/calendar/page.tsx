"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  listCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  type CalendarEvent,
} from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { Notice } from "@/components/admin/AdminBits";
import Modal from "@/components/admin/Modal";
import Select from "@/components/Select";
import { IconCalendar, IconPlus, IconClock, IconMapPin, IconClose } from "@/components/icons";

const TYPES = ["hearing", "investigative", "meeting", "deadline"] as const;

function fmt(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function LawyerCalendar() {
  const t = useTranslations("portal.lawyer.calendar");
  const [reloadKey, setReloadKey] = useState(0);
  const res = useResource<CalendarEvent>(() => listCalendarEvents(), [reloadKey]);
  const reload = () => setReloadKey((k) => k + 1);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>("hearing");
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !title.trim() || !when) return;
    setBusy(true);
    setNote(null);
    try {
      await createCalendarEvent({
        type,
        title: title.trim(),
        starts_at: new Date(when).toISOString(),
        location: location.trim() || undefined,
      });
      setNote({ ok: true, msg: t("created") });
      setTitle("");
      setWhen("");
      setLocation("");
      reload();
      setTimeout(() => setOpen(false), 900);
    } catch {
      setNote({ ok: false, msg: t("error") });
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    try {
      await deleteCalendarEvent(id);
      reload();
    } catch {
      /* ignore */
    }
  }

  const typeOpts = TYPES.map((v) => ({ value: v, label: t(v) }));

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <button className="btn btn--pri btn--sm" type="button" onClick={() => setOpen(true)}>
          <IconPlus />
          {t("add")}
        </button>
      </div>

      {res.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !res.data.length ? (
        <EmptyState icon={<IconCalendar />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="calist">
          {res.data.map((ev) => (
            <div className="calev" key={ev.id}>
              <span className={`calev__type calev__type--${ev.type}`}>{t.has(ev.type) ? t(ev.type) : ev.type}</span>
              <div className="calev__m">
                <b>{ev.title}</b>
                <span>
                  <IconClock />
                  {fmt(ev.startsAt)}
                  {ev.location ? (
                    <>
                      {" · "}
                      <IconMapPin />
                      {ev.location}
                    </>
                  ) : null}
                </span>
              </div>
              <button className="calev__x" type="button" aria-label={t("remove")} onClick={() => remove(ev.id)}>
                <IconClose />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={t("addTitle")}>
        <form className="cform" style={{ maxWidth: "none" }} onSubmit={submit}>
          <div>
            <label>{t("typeLabel")}</label>
            <Select value={type} onChange={setType} options={typeOpts} ariaLabel={t("typeLabel")} />
          </div>
          <div>
            <label>{t("titleLabel")}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("titlePh")} />
          </div>
          <div>
            <label>{t("dateLabel")}</label>
            <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </div>
          <div>
            <label>{t("locationLabel")}</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("locationPh")} />
          </div>
          {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
          <button className="btn btn--pri btn--full" type="submit" disabled={busy}>
            {busy ? t("saving") : t("save")}
          </button>
        </form>
      </Modal>
    </div>
  );
}
