// Uzbek phone helpers. The input always shows a "+998 …" mask; the backend
// gets a clean E.164 number.
export function formatUzPhone(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("998")) d = d.slice(3);
  d = d.slice(0, 9);
  let out = "+998";
  if (d.length) out += " " + d.slice(0, 2);
  if (d.length > 2) out += " " + d.slice(2, 5);
  if (d.length > 5) out += " " + d.slice(5, 7);
  if (d.length > 7) out += " " + d.slice(7, 9);
  return out;
}

// E.164 form for the API, e.g. "+998901234567".
export function normUzPhone(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("998")) d = d.slice(3);
  d = d.slice(0, 9);
  return "+998" + d;
}

// 9 subscriber digits entered?
export function isValidUzPhone(input: string): boolean {
  const d = normUzPhone(input).slice(4);
  return d.length === 9;
}
