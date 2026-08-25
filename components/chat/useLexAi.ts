"use client";

import { useTranslations } from "next-intl";
import {
  classify,
  detectIntent,
  RULE_META,
  type Keywords,
  type RuleKey,
  type StageKey,
} from "@/lib/lexai";

export type Reply = {
  text: string;
  meta: string;
  area: string | null;
  stageKey: StageKey;
};

export type FinderResult = {
  ruleKey: RuleKey;
  stageKey: StageKey;
  dir: string;
  services: string[];
  price: string;
  area: string | null;
  stageName: string;
};

export function useLexAi() {
  const tf = useTranslations("finder");
  const tc = useTranslations("chat");
  const te = useTranslations("enums");

  const keywords = tf.raw("keywords") as Keywords;
  const rules = tf.raw("rules") as Record<
    string,
    { dir: string; services: string[]; price: string }
  >;
  const responses = tc.raw("responses") as Record<
    string,
    { text: string; meta: string }
  >;

  const stageLabel = (k: StageKey) =>
    k === "unknown" ? te("stages.unknown.name") : te(`stages.${k}.name`);

  const ruleOf = (ruleKey: RuleKey) =>
    rules[ruleKey === "general" ? "general" : ruleKey];

  function reply(text: string): Reply {
    const intent = detectIntent(text);
    if (intent !== "classify") {
      const r = responses[intent];
      return { text: r.text, meta: r.meta, area: null, stageKey: "unknown" };
    }
    const { ruleKey, stageKey } = classify(text, keywords);
    const respKey = ruleKey === "general" ? "generic" : ruleKey;
    const r = responses[respKey] || responses.generic;
    const ruleData = ruleOf(ruleKey);
    const suffix = tc("analysisSuffix", {
      dir: ruleData.dir,
      stage: stageLabel(stageKey),
      price: ruleData.price,
    });
    return {
      text: r.text + "\n\n" + suffix,
      meta: r.meta,
      area: RULE_META[ruleKey].area,
      stageKey,
    };
  }

  function classifyForFinder(text: string): FinderResult {
    const { ruleKey, stageKey } = classify(text, keywords);
    const ruleData = ruleOf(ruleKey);
    return {
      ruleKey,
      stageKey,
      dir: ruleData.dir,
      services: ruleData.services,
      price: ruleData.price,
      area: RULE_META[ruleKey].area,
      stageName: stageLabel(stageKey),
    };
  }

  return { reply, classifyForFinder };
}
