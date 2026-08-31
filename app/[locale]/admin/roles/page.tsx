"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  getRoles,
  getPermissions,
  createRole,
  assignRole,
} from "@/lib/services/admin";
import { useResource } from "@/lib/useResource";
import { Skeleton, EmptyState } from "@/components/portal/DataState";
import { Notice, useReload, AdminItem, UserSelect } from "@/components/admin/AdminBits";
import ChipMulti from "@/components/register/ChipMulti";
import Select from "@/components/Select";
import { IconShield } from "@/components/icons";

export default function AdminRoles() {
  const t = useTranslations("admin");
  const [key, reload] = useReload();
  const roles = useResource(getRoles, [key]);
  const perms = useResource(getPermissions, []);

  // create-role form
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [cBusy, setCBusy] = useState(false);
  const [cNote, setCNote] = useState<{ ok: boolean; msg: string } | null>(null);

  // assign form
  const [userId, setUserId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [aBusy, setABusy] = useState(false);
  const [aNote, setANote] = useState<{ ok: boolean; msg: string } | null>(null);

  async function submitRole(e: React.FormEvent) {
    e.preventDefault();
    if (cBusy) return;
    if (!name.trim() || !title.trim()) {
      setCNote({ ok: false, msg: t("form.error") });
      return;
    }
    setCBusy(true);
    setCNote(null);
    try {
      await createRole({ name: name.trim(), title: title.trim(), description: desc.trim(), permissions: picked });
      setCNote({ ok: true, msg: t("form.created") });
      setName("");
      setTitle("");
      setDesc("");
      setPicked([]);
      reload();
    } catch (err) {
      const detail = err && typeof err === "object" && "detail" in err ? String((err as { detail?: string }).detail) : "";
      setCNote({ ok: false, msg: detail || t("form.error") });
    } finally {
      setCBusy(false);
    }
  }

  async function submitAssign(e: React.FormEvent) {
    e.preventDefault();
    if (aBusy) return;
    if (!userId.trim() || !roleId) {
      setANote({ ok: false, msg: t("form.error") });
      return;
    }
    setABusy(true);
    setANote(null);
    try {
      await assignRole(userId.trim(), roleId);
      setANote({ ok: true, msg: t("roles.assigned") });
      setUserId("");
      setRoleId("");
    } catch (err) {
      const detail = err && typeof err === "object" && "detail" in err ? String((err as { detail?: string }).detail) : "";
      setANote({ ok: false, msg: detail || t("form.error") });
    } finally {
      setABusy(false);
    }
  }

  return (
    <div className="agrid">
      {/* Roles list + create */}
      <div className="ppanel">
        <div className="ppanel__h"><b>{t("roles.listTitle")}</b><span className="advmuted">{roles.data.length}</span></div>
        {roles.status === "loading" ? (
          <Skeleton rows={2} />
        ) : !roles.data.length ? (
          <EmptyState icon={<IconShield />} title={t("roles.empty")} />
        ) : (
          <div className="alist">
            {roles.data.map((r, i) => (
              <AdminItem
                key={r.id}
                index={i + 1}
                title={r.title || r.name}
                meta={r.name}
                right={t("roles.permCount", { n: r.permissions.length })}
              />
            ))}
          </div>
        )}

        <h3 className="afh">{t("roles.create")}</h3>
        <form className="cform" style={{ maxWidth: "none" }} onSubmit={submitRole}>
          <div>
            <label>{t("roles.name")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="content_manager" />
          </div>
          <div>
            <label>{t("form.title")}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label>{t("form.description")}</label>
            <textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div>
            <label>{t("roles.permissions")}</label>
            {perms.status === "loading" ? (
              <Skeleton rows={1} />
            ) : (
              <ChipMulti
                options={perms.data.map((p) => ({ value: p.code, label: p.title }))}
                value={picked}
                onChange={setPicked}
              />
            )}
          </div>
          {cNote ? <Notice ok={cNote.ok} msg={cNote.msg} /> : null}
          <button className="btn btn--pri" type="submit" disabled={cBusy}>
            {cBusy ? t("form.saving") : t("form.save")}
          </button>
        </form>
      </div>

      {/* Assign role */}
      <div className="ppanel">
        <div className="ppanel__h"><b>{t("roles.assignTitle")}</b></div>
        <p className="advmuted" style={{ marginBottom: 16 }}>{t("roles.assignLead")}</p>
        <form className="cform" style={{ maxWidth: "none" }} onSubmit={submitAssign}>
          <UserSelect
            value={userId}
            onChange={setUserId}
            label={t("roles.user")}
            placeholder={t("roles.selectUser")}
          />
          <div>
            <label>{t("roles.role")}</label>
            <Select
              value={roleId}
              onChange={setRoleId}
              options={roles.data.map((r) => ({ value: r.id, label: r.title || r.name }))}
              ariaLabel={t("roles.role")}
              placeholder={t("roles.selectRole")}
            />
          </div>
          {aNote ? <Notice ok={aNote.ok} msg={aNote.msg} /> : null}
          <button className="btn btn--pri" type="submit" disabled={aBusy}>
            {aBusy ? t("form.saving") : t("roles.assign")}
          </button>
        </form>
      </div>
    </div>
  );
}
