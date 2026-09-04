"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  listFolders,
  createFolder,
  deleteFolder,
  listFiles,
  createFile,
  deleteFile,
  type WorkspaceFile,
} from "@/lib/services/backend";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "./DataState";
import { Notice } from "@/components/admin/AdminBits";
import Modal from "@/components/admin/Modal";
import Select from "@/components/Select";
import { IconFileText, IconPlus, IconClose, IconExternal, IconDocLines } from "@/components/icons";

function fmtSize(n: number) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function WorkspacePanel() {
  const t = useTranslations("portal.workspace");
  const [key, setKey] = useState(0);
  const reload = () => setKey((k) => k + 1);
  const folders = useResource(() => listFolders(), [key]);
  const files = useResource<WorkspaceFile>(() => listFiles(), [key]);
  const [sel, setSel] = useState<string>("");

  const [folderName, setFolderName] = useState("");
  const [folderBusy, setFolderBusy] = useState(false);
  const [fileOpen, setFileOpen] = useState(false);

  const shown = useMemo(
    () => (sel ? files.data.filter((f) => f.folderId === sel) : files.data),
    [files.data, sel],
  );

  async function addFolder(e: React.FormEvent) {
    e.preventDefault();
    if (folderBusy || !folderName.trim()) return;
    setFolderBusy(true);
    try {
      await createFolder({ name: folderName.trim() });
      setFolderName("");
      reload();
    } catch {
      /* ignore */
    } finally {
      setFolderBusy(false);
    }
  }

  return (
    <div className="ppanel">
      <div className="ppanel__h">
        <b>{t("title")}</b>
        <button className="btn btn--pri btn--sm" type="button" onClick={() => setFileOpen(true)}>
          <IconPlus />
          {t("addFile")}
        </button>
      </div>
      <p className="advmuted" style={{ marginBottom: 14 }}>{t("lead")}</p>

      <form className="wsp__folders" onSubmit={addFolder}>
        <button
          type="button"
          className={`fchip${sel === "" ? " on" : ""}`}
          aria-pressed={sel === ""}
          onClick={() => setSel("")}
        >
          {t("allFiles")}
        </button>
        {folders.data.map((f) => (
          <span key={f.id} className={`wsp__folder${sel === f.id ? " on" : ""}`}>
            <button type="button" className="wsp__folder-b" onClick={() => setSel(f.id)}>
              <IconDocLines />
              {f.name}
            </button>
            <button
              type="button"
              className="wsp__folder-x"
              aria-label={t("remove")}
              onClick={() => deleteFolder(f.id).then(reload).catch(() => {})}
            >
              <IconClose />
            </button>
          </span>
        ))}
        <span className="wsp__newfolder">
          <input value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder={t("folderPh")} />
          <button className="btn btn--line btn--sm" type="submit" disabled={folderBusy}>
            <IconPlus />
            {t("addFolder")}
          </button>
        </span>
      </form>

      {files.status === "loading" ? (
        <Skeleton rows={3} />
      ) : !shown.length ? (
        <EmptyState icon={<IconFileText />} title={t("empty")} text={t("emptyText")} />
      ) : (
        <div className="wsp__files">
          {shown.map((f) => (
            <div className="prow" key={f.id}>
              <span className="prow__i" style={{ background: "var(--grad)", color: "#fff" }}>
                <IconFileText />
              </span>
              <div className="prow__m">
                <b>{f.fileName}</b>
                <span>{[f.mimeType, fmtSize(f.size)].filter(Boolean).join(" · ")}</span>
              </div>
              <div style={{ display: "flex", gap: 8, flex: "none" }}>
                {f.fileUrl ? (
                  <a className="btn btn--line btn--sm" href={f.fileUrl} target="_blank" rel="noopener noreferrer" aria-label={t("open")}>
                    <IconExternal style={{ width: 15, height: 15 }} />
                  </a>
                ) : null}
                <button
                  className="btn btn--line btn--sm"
                  type="button"
                  aria-label={t("remove")}
                  onClick={() => deleteFile(f.id).then(reload).catch(() => {})}
                >
                  <IconClose style={{ width: 15, height: 15 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddFileModal
        open={fileOpen}
        onClose={() => setFileOpen(false)}
        folders={folders.data.map((f) => ({ value: f.id, label: f.name }))}
        defaultFolder={sel}
        onSaved={reload}
      />
    </div>
  );
}

function AddFileModal({
  open,
  onClose,
  folders,
  defaultFolder,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  folders: { value: string; label: string }[];
  defaultFolder: string;
  onSaved: () => void;
}) {
  const t = useTranslations("portal.workspace");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [folder, setFolder] = useState(defaultFolder);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; msg: string } | null>(null);

  const opts = [{ value: "", label: t("noFolder") }, ...folders];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !name.trim()) {
      setNote({ ok: false, msg: t("error") });
      return;
    }
    setBusy(true);
    setNote(null);
    try {
      await createFile({
        file_name: name.trim(),
        file_url: url.trim() || undefined,
        folder_id: folder || undefined,
      });
      setNote({ ok: true, msg: t("saved") });
      setName("");
      setUrl("");
      onSaved();
      setTimeout(onClose, 800);
    } catch {
      setNote({ ok: false, msg: t("error") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("addFile")}>
      <form className="cform" style={{ maxWidth: "none" }} onSubmit={submit}>
        <div>
          <label>{t("fileName")}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("fileNamePh")} />
        </div>
        <div>
          <label>{t("fileUrl")}</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={t("fileUrlPh")} />
        </div>
        <div>
          <label>{t("folder")}</label>
          <Select value={folder} onChange={setFolder} options={opts} ariaLabel={t("folder")} />
        </div>
        {note ? <Notice ok={note.ok} msg={note.msg} /> : null}
        <button className="btn btn--pri btn--full" type="submit" disabled={busy}>
          {busy ? t("saving") : t("save")}
        </button>
      </form>
    </Modal>
  );
}
