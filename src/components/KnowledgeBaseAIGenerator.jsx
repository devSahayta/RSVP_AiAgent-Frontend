import { useState, useRef, useEffect } from "react";
import {
  Wand2,
  ArrowUp,
  Loader2,
  Sparkles,
  X,
  RotateCcw,
  Check,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";

// Swap these for copy that matches the events you actually see most —
// they're just a head start, not a fixed list.
const EXAMPLE_PROMPTS = [
  "Sharma wedding at Grand Palace Hotel, Dec 20-21. Day 1 welcome lunch, Day 2 ceremony at 6pm. Formal attire.",
  "Company annual gala at Taj Convention Centre, black tie, cocktails then dinner, valet parking.",
  "Birthday dinner at home, casual dress, RSVP for headcount only.",
];

// Total time (ms) to "type" the finished draft into the editable box once it
// arrives, and how many chunks to split it into. Bounded so a long KB
// doesn't make the reveal drag on.
const REVEAL_MS = 650;
const REVEAL_STEPS = 22;

/**
 * Magic-wand trigger that opens a small AI drafting flow for the Knowledge
 * Base step: describe the event -> watch a draft get written -> edit it
 * directly in place -> insert. Renders as a centered dialog on larger
 * screens and a bottom sheet on small ones, so it never has to worry about
 * overflowing a fixed-width popover on a phone.
 *
 * Props:
 *  - context: object built by the parent (see buildKbAiContext in CreateAgent.jsx)
 *  - hasExistingContent: bool — whether the KB textarea already has text
 *  - onInsert: (content: string) => void — called when the host accepts a draft
 */
const KnowledgeBaseAIGenerator = ({
  context,
  hasExistingContent,
  onInsert,
}) => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [revealing, setRevealing] = useState(false);
  // null = still on the "describe it" view. Any string (including "") = review/edit view.
  const [draft, setDraft] = useState(null);

  const textareaRef = useRef(null);
  const draftRef = useRef(null);
  const revealTimer = useRef(null);

  useEffect(() => {
    if (open && draft === null) {
      const t = setTimeout(() => textareaRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open, draft]);

  // Lock background scroll while the dialog is open — matters most on mobile
  // where the sheet sits over the whole viewport.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => () => clearInterval(revealTimer.current), []);

  const reset = () => {
    clearInterval(revealTimer.current);
    setPrompt("");
    setDraft(null);
    setLoading(false);
    setRevealing(false);
  };

  const revealDraft = (fullText) => {
    setRevealing(true);
    setDraft("");
    const total = fullText.length;
    const chunk = Math.max(1, Math.ceil(total / REVEAL_STEPS));
    const tick = REVEAL_MS / REVEAL_STEPS;
    let i = 0;
    clearInterval(revealTimer.current);
    revealTimer.current = setInterval(() => {
      i += chunk;
      setDraft(fullText.slice(0, i));
      if (i >= total) {
        clearInterval(revealTimer.current);
        setRevealing(false);
      }
    }, tick);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error(
        "Describe the event first — venue, dates, dress code, anything guests might ask.",
      );
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/agent-system/generate-knowledge-base`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...context, user_prompt: prompt }),
        },
      );
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to generate knowledge base");
      }
      setLoading(false);
      revealDraft(data.data.content);
    } catch (err) {
      console.error("Generate KB error:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (!draft || !draft.trim()) {
      toast.error("There's nothing to insert yet.");
      return;
    }
    onInsert(draft.trim());
    toast.success(
      "Knowledge base updated — give it one more look before you continue.",
    );
    setOpen(false);
    reset();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const busy = loading || revealing;

  return (
    <>
      <button
        type="button"
        title="Draft knowledge base with AI"
        aria-label="Draft knowledge base with AI"
        onClick={() => setOpen(true)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#2A2A3E] bg-[#12121A] text-violet-300 transition-all duration-200 hover:border-violet-500/40 hover:bg-violet-500/10"
      >
        <Wand2 className="w-4 h-4" />
        <span className="absolute -top-1 -right-1 h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-violet-400" />
        </span>
      </button>

      {/* Backdrop + dialog. Always mounted (not conditionally rendered) so
          the open/close transition can run; hidden via opacity + pointer
          events when closed. Bottom sheet on mobile, centered card on sm+. */}
      <div
        className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-[#050507]/80 backdrop-blur-sm"
        />

        <div
          className={`relative w-full sm:max-w-xl max-h-[92vh] sm:max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-violet-500/25 bg-[#0B0B12] shadow-2xl shadow-violet-950/40 transition-all duration-200 ${
            open
              ? "translate-y-0 sm:scale-100 opacity-100"
              : "translate-y-6 sm:translate-y-0 sm:scale-95 opacity-0"
          }`}
        >
          {/* faint gradient rim, purely decorative */}
          <div className="pointer-events-none absolute inset-0 rounded-t-3xl sm:rounded-3xl bg-gradient-to-br from-violet-500/10 via-transparent to-blue-500/10" />

          <div className="relative p-5 sm:p-6">
            {/* header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-blue-500/20 border border-violet-500/30">
                  <Sparkles className="w-4 h-4 text-violet-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {draft === null ? "Draft with AI" : "Review & edit"}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {draft === null
                      ? "Describe the event in your own words"
                      : revealing
                        ? "Writing..."
                        : "Edit anything before inserting"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/5 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* two-step progress — genuinely a sequence: describe, then review */}
            <div className="flex items-center gap-1.5 mt-4 mb-5">
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${
                  draft === null ? "bg-violet-400" : "bg-violet-400/30"
                }`}
              />
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${
                  draft !== null ? "bg-violet-400" : "bg-[#22222E]"
                }`}
              />
            </div>

            {draft === null ? (
              <>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    placeholder="e.g., Sharma wedding at Grand Palace Hotel, Dec 20-21. Day 1 welcome lunch at 1pm, Day 2 ceremony at 6pm. Formal dress code, valet parking available..."
                    rows={5}
                    maxLength={2000}
                    className="w-full resize-none rounded-2xl border border-[#2A2A3E] bg-[#08080D] px-4 py-3.5 pr-14 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-white shadow-lg shadow-violet-500/30 transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {!loading ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {EXAMPLE_PROMPTS.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(ex)}
                        className="rounded-lg border border-[#2A2A3E] bg-[#12121A] px-2.5 py-1 text-[11px] text-gray-400 transition hover:border-violet-500/30 hover:text-violet-300"
                      >
                        {ex.split(",")[0]}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    <p className="flex items-center gap-2 text-xs text-violet-300">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Writing your knowledge base...
                    </p>
                    {[100, 88, 94, 60].map((w, i) => (
                      <div
                        key={i}
                        className="h-2.5 rounded-full bg-[#1A1A26] animate-pulse"
                        style={{
                          width: `${w}%`,
                          animationDelay: `${i * 120}ms`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="relative">
                  <textarea
                    ref={draftRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    readOnly={revealing}
                    rows={10}
                    className={`w-full resize-none rounded-2xl border bg-[#08080D] px-4 py-3.5 text-xs sm:text-sm text-gray-100 font-mono leading-relaxed outline-none transition ${
                      revealing
                        ? "border-violet-500/20"
                        : "border-[#2A2A3E] focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
                    }`}
                  />
                  {revealing && (
                    <span className="pointer-events-none absolute bottom-4 right-4 inline-block h-4 w-[2px] bg-violet-400 animate-pulse" />
                  )}
                  {!revealing && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-md bg-violet-500/15 border border-violet-500/25 px-2 py-0.5">
                      <Pencil className="w-2.5 h-2.5 text-violet-300" />
                      <span className="text-[10px] font-medium text-violet-300">
                        Editable
                      </span>
                    </div>
                  )}
                </div>

                {hasExistingContent && !revealing && (
                  <p className="mt-2.5 text-[11px] text-amber-300/80">
                    Inserting will replace your current knowledge base content.
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setDraft(null)}
                    disabled={busy}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#2A2A3E] bg-[#12121A] py-2.5 text-xs font-semibold text-gray-300 transition hover:border-[#3A3A4E] disabled:opacity-40"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Start over
                  </button>
                  <button
                    onClick={handleInsert}
                    disabled={busy}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {hasExistingContent ? "Replace" : "Insert"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default KnowledgeBaseAIGenerator;
