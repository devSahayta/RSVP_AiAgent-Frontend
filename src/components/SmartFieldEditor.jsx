import { useState } from "react";
import {
  Trash2,
  ToggleLeft,
  Hash,
  List,
  Type,
  FileText,
  Plane,
} from "lucide-react"; // CHANGED — added FileText, Plane

export const FIELD_TYPES = [
  {
    value: "yes_no",
    label: "Yes / No",
    icon: ToggleLeft,
    description: "Collect a yes or no answer",
  },
  {
    value: "number",
    label: "Number",
    icon: Hash,
    description: "Collect a numeric value",
  },
  {
    value: "text",
    label: "Text",
    icon: Type,
    description: "Collect a free-text answer",
  },
  {
    value: "choice",
    label: "Multiple Choice",
    icon: List,
    description: "Collect one of several options",
  },
  // NEW
  {
    value: "document",
    label: "Document Upload",
    icon: FileText,
    description: "Collect a document via WhatsApp (e.g. ID proof)",
  },
  // NEW
  {
    value: "travel_ticket",
    label: "Travel Ticket",
    icon: Plane,
    description:
      "Collect arrival & return tickets via WhatsApp, with auto-extraction",
  },
];

export const defaultSmartField = () => ({
  _id: Math.random().toString(36).slice(2),
  field_key: "",
  field_label: "",
  field_type: "yes_no",
  ai_question: "",
  options: [],
  is_required: true,
  display_order: 0,
});

// ─── SmartFieldRow Component ──────────────────────────────────────────────────
export const SmartFieldRow = ({ field, index, onChange, onRemove, isOnly }) => {
  const [optionInput, setOptionInput] = useState("");

  const update = (key, value) =>
    onChange(field._id, { ...field, [key]: value });

  const addOption = () => {
    const trimmed = optionInput.trim();
    if (!trimmed) return;
    update("options", [...(field.options || []), trimmed]);
    setOptionInput("");
  };

  const removeOption = (i) =>
    update(
      "options",
      field.options.filter((_, idx) => idx !== i),
    );

  const TypeIcon =
    FIELD_TYPES.find((t) => t.value === field.field_type)?.icon || Type;

  return (
    <div className="group relative rounded-2xl border border-[#1F1F2E] bg-gradient-to-br from-[#0E0E14] to-[#12121A] p-5 transition-all hover:border-blue-500/30">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 text-sm font-bold">
            {index + 1}
          </div>
          <span className="text-sm font-semibold text-gray-300">
            Smart Field
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <span className="text-xs text-gray-400">Required</span>
            <div
              onClick={() => update("is_required", !field.is_required)}
              className={`relative h-5 w-9 rounded-full transition-colors ${field.is_required ? "bg-blue-500" : "bg-[#2A2A3E]"}`}
            >
              <div
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${field.is_required ? "translate-x-4" : "translate-x-0.5"}`}
              />
            </div>
          </label>
          {!isOnly && (
            <button
              onClick={() => onRemove(field._id)}
              className="rounded-lg p-1.5 text-gray-600 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Field Label */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-400">
            Field Label <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={field.field_label}
            onChange={(e) => {
              const label = e.target.value;
              const key = label
                .toLowerCase()
                .replace(/\s+/g, "_")
                .replace(/[^a-z0-9_]/g, "");
              onChange(field._id, {
                ...field,
                field_label: label,
                field_key: key,
              });
            }}
            placeholder="e.g., Attendance, Guest Count"
            className="w-full rounded-xl border border-[#2A2A3E] bg-[#0A0A0F] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
          />
        </div>

        {/* Field Type */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-400">
            Field Type <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <TypeIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={15}
            />
            <select
              value={field.field_type}
              onChange={(e) => update("field_type", e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#2A2A3E] bg-[#0A0A0F] py-3 pl-9 pr-4 text-sm text-white outline-none transition focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
            >
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Question — full width */}
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-gray-400">
            AI Question (what the agent will ask){" "}
            <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={field.ai_question}
            onChange={(e) => update("ai_question", e.target.value)}
            placeholder="e.g., Will you be attending the event?"
            className="w-full rounded-xl border border-[#2A2A3E] bg-[#0A0A0F] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
          />
        </div>

        {/* Options — only for choice type */}
        {field.field_type === "choice" && (
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-400">
              Options <span className="text-red-400">*</span>
            </label>
            <div className="mb-2 flex flex-wrap gap-2">
              {(field.options || []).map((opt, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-500/15 px-3 py-1 text-sm text-blue-300"
                >
                  {opt}
                  <button
                    onClick={() => removeOption(i)}
                    className="text-blue-400 hover:text-red-400"
                  >
                    <Trash2 size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={optionInput}
                onChange={(e) => setOptionInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addOption()}
                placeholder="Type option and press Enter"
                className="flex-1 rounded-xl border border-[#2A2A3E] bg-[#0A0A0F] px-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500/60"
              />
              <button
                onClick={addOption}
                className="rounded-xl bg-blue-500/20 px-4 py-2.5 text-sm text-blue-300 transition hover:bg-blue-500/30"
              >
                Add
              </button>
            </div>
          </div>
        )}
        {/* NEW — info note for document/travel_ticket types */}
        {(field.field_type === "document" ||
          field.field_type === "travel_ticket") && (
          <div className="md:col-span-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
            <p className="text-xs text-amber-200/90 leading-relaxed">
              {field.field_type === "document" ? (
                <>
                  <span className="font-semibold text-amber-200">
                    WhatsApp only.
                  </span>{" "}
                  The guest will be asked to send a file (image or PDF). This
                  field is automatically skipped on voice calls — collect it
                  over WhatsApp instead.
                </>
              ) : (
                <>
                  <span className="font-semibold text-amber-200">
                    WhatsApp only.
                  </span>{" "}
                  The agent will automatically ask for an Arrival ticket, then a
                  Return ticket, and extract travel details from both. Also
                  skipped on voice calls.
                </>
              )}
            </p>
          </div>
        )}
        {/* Auto-generated field_key preview */}
        {field.field_key && (
          <div className="md:col-span-2">
            <p className="text-xs text-gray-600">
              Field key:{" "}
              <code className="rounded bg-[#1A1A2A] px-1.5 py-0.5 text-xs text-gray-400">
                {field.field_key}
              </code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
