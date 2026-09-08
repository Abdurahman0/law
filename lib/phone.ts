// Uzbek phone helpers. The input always shows a "+998 …" mask; the backend
// gets a clean E.164 number.
export function formatUzPhone(input: string): string {
  let d = input.replace(/\D/g, "");
  // Strip the 998 country code — repeatedly, so a paste that lands next to an
  // existing "+998 " (e.g. "+998 +998901234567") does not keep a stray "998".
  // Guard on length so a real 9-digit "99 8.." subscriber number is untouched.
  while (d.startsWith("998") && d.length > 9) d = d.slice(3);
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
  while (d.startsWith("998") && d.length > 9) d = d.slice(3);
  d = d.slice(0, 9);
  return "+998" + d;
}

// 9 subscriber digits entered?
export function isValidUzPhone(input: string): boolean {
  const d = normUzPhone(input).slice(4);
  return d.length === 9;
}

// Subscriber digits only (max 9), country code stripped. For inputs that show
// a fixed "+998" prefix separately, so the field never holds the code itself.
export function uzSubscriber(input: string): string {
  let d = input.replace(/\D/g, "");
  while (d.startsWith("998") && d.length > 9) d = d.slice(3);
  return d.slice(0, 9);
}

// Pretty subscriber without the code, e.g. "90 123 45 67".
export function formatUzSubscriber(input: string): string {
  const d = uzSubscriber(input);
  let out = "";
  if (d.length) out += d.slice(0, 2);
  if (d.length > 2) out += " " + d.slice(2, 5);
  if (d.length > 5) out += " " + d.slice(5, 7);
  if (d.length > 7) out += " " + d.slice(7, 9);
  return out;
}
