// Tiny event bus so any button can open the global AI chat dock.
export const OPEN_CHAT = "lexgo:open-chat";

export function openChat() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_CHAT));
  }
}
