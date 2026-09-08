// Uzbek phone helpers. Inputs show a fixed "+998" prefix; the field itself
// holds only the 9 subscriber digits and the backend gets a clean E.164 number.

// Strip the 998 country code from a digit string. Repeats, so a paste that
// carries the code twice (e.g. "+998+998901234567") still collapses. The
// guard is `!== 9`, not `> 9`: a bare "998" (just the code, no number) and a
// double code both reduce to a valid 9-digit subscriber or empty, while a
// genuine 9-digit "99 8.." subscriber (operator 99) is left untouched.
function stripCode(digits: string): string {
  let d = digits;
  while (d.startsWith("998") && d.length !== 9) d = d.slice(3);
  return d;
}

export function formatUzPhone(input: string): string {
  const d = stripCode(input.replace(/\D/g, "")).slice(0, 9);
  let out = "+998";
  if (d.length) out += " " + d.slice(0, 2);
  if (d.length > 2) out += " " + d.slice(2, 5);
  if (d.length > 5) out += " " + d.slice(5, 7);
  if (d.length > 7) out += " " + d.slice(7, 9);
  return out;
}

// E.164 form for the API, e.g. "+998901234567".
export function normUzPhone(input: string): string {
  const d = stripCode(input.replace(/\D/g, "")).slice(0, 9);
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
  return stripCode(input.replace(/\D/g, "")).slice(0, 9);
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
