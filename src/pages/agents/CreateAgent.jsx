import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import toast from "react-hot-toast";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  MessageSquare,
  Phone,
  Brain,
  FileText,
  CheckCircle2,
  Loader2,
  Zap,
  Target,
  Layers,
  Wand2,
  Plus,
  Mic,
} from "lucide-react";
import VoiceSelector from "../../components/VoiceSelector";
import {
  SmartFieldRow,
  defaultSmartField,
} from "../../components/SmartFieldEditor";

// ─── Main CreateAgent Component ───────────────────────────────────────────────
const CreateAgent = () => {
  const navigate = useNavigate();
  const { user } = useKindeAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // "classic" | "smart_fields"
  const [fieldMode, setFieldMode] = useState(null);

  const [formData, setFormData] = useState({
    agentName: "",
    agentDescription: "",
    selectedTemplate: null,
    knowledgeBaseName: "",
    knowledgeBaseContent: "",
    groomName: "",
    brideName: "",
    // Smart fields mode
    eventTitle: "",
    firstMessage: "",
    smartFields: [defaultSmartField()],
    selectedVoice: null,
  });

  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/agent-system/templates`,
      );
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data);
        if (data.data.length > 0) {
          setFormData((prev) => ({ ...prev, selectedTemplate: data.data[0] }));
        }
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load agent templates");
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // ─── Smart field helpers ───────────────────────────────────────────────────
  const addSmartField = () => {
    setFormData((prev) => ({
      ...prev,
      smartFields: [
        ...prev.smartFields,
        { ...defaultSmartField(), display_order: prev.smartFields.length },
      ],
    }));
  };

  const updateSmartField = (id, updated) => {
    setFormData((prev) => ({
      ...prev,
      smartFields: prev.smartFields.map((f) => (f._id === id ? updated : f)),
    }));
  };

  const removeSmartField = (id) => {
    setFormData((prev) => ({
      ...prev,
      smartFields: prev.smartFields
        .filter((f) => f._id !== id)
        .map((f, i) => ({ ...f, display_order: i })),
    }));
  };

  // ─── Step navigation ───────────────────────────────────────────────────────
  // Classic: Step 1 (mode) → 2 (basic) → 3 (template) → 4 (kb) → 5 (review)
  // Smart:   Step 1 (mode) → 2 (basic) → 3 (smart fields) → 4 (kb) → 5 (review)

  const stepsClassic = [
    { number: 1, title: "Agent Mode", icon: Layers },
    { number: 2, title: "Basic Info", icon: Target },
    { number: 3, title: "Template", icon: Sparkles },
    { number: 4, title: "Knowledge Base", icon: Brain },
    { number: 5, title: "Voice", icon: Mic },
    { number: 6, title: "Review", icon: CheckCircle2 },
  ];

  const stepsSmart = [
    { number: 1, title: "Agent Mode", icon: Layers },
    { number: 2, title: "Basic Info", icon: Target },
    { number: 3, title: "Smart Fields", icon: Wand2 },
    { number: 4, title: "Knowledge Base", icon: Brain },
    { number: 5, title: "Voice", icon: Mic },
    { number: 6, title: "Review", icon: CheckCircle2 },
  ];

  const steps = fieldMode === "smart_fields" ? stepsSmart : stepsClassic;

  const handleNext = () => {
    // Step 1: mode selection
    if (currentStep === 1) {
      if (!fieldMode) {
        toast.error("Please choose an agent mode to continue");
        return;
      }
    }

    // Step 2: basic info
    if (currentStep === 2) {
      if (!formData.agentName.trim()) {
        toast.error("Please enter an agent name");
        return;
      }
    }

    // Step 3 (classic): template
    if (currentStep === 3 && fieldMode === "classic") {
      if (!formData.selectedTemplate) {
        toast.error("Please select a template");
        return;
      }
    }

    // Step 3 (smart_fields): smart fields
    if (currentStep === 3 && fieldMode === "smart_fields") {
      if (!formData.eventTitle.trim()) {
        toast.error("Please enter an event title");
        return;
      }
      const invalid = formData.smartFields.find(
        (f) =>
          !f.field_label.trim() ||
          !f.ai_question.trim() ||
          (f.field_type === "choice" && (!f.options || f.options.length < 2)),
      );
      if (invalid) {
        toast.error("Please fill in all required smart field details");
        return;
      }
    }

    // Step 4: KB
    if (currentStep === 4) {
      if (
        !formData.knowledgeBaseName.trim() ||
        !formData.knowledgeBaseContent.trim()
      ) {
        toast.error("Please fill in both knowledge base fields");
        return;
      }
      if (
        fieldMode === "classic" &&
        formData.selectedTemplate?.category === "wedding" &&
        (!formData.groomName.trim() || !formData.brideName.trim())
      ) {
        toast.error("Please enter groom and bride name");
        return;
      }
    }

    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // ─── Classic create ────────────────────────────────────────────────────────
  const handleCreateClassic = async () => {
    const kbRes = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/knowledge-bases`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          name: formData.knowledgeBaseName,
          content: formData.knowledgeBaseContent,
          field_mode: "classic",
        }),
      },
    );
    const kbData = await kbRes.json();
    if (!kbData.success)
      throw new Error(kbData.error || "Failed to create knowledge base");

    let eventTitle = null;
    if (formData.selectedTemplate?.category === "wedding") {
      eventTitle = `Wedding of ${formData.groomName} and ${formData.brideName}`;
    }

    const agentRes = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/agent-system/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          template_id: formData.selectedTemplate.template_id,
          agent_name: formData.agentName,
          agent_description: formData.agentDescription,
          knowledge_base_id: kbData.data.id,
          event_title: eventTitle,
          field_mode: "classic",
          voice_id: formData.selectedVoice?.voice_id || null,
          voice_name: formData.selectedVoice?.name || null,
          public_owner_id: formData.selectedVoice?.public_owner_id || null,
        }),
      },
    );
    const agentData = await agentRes.json();
    if (!agentData.success)
      throw new Error(agentData.error || "Failed to create agent");
    return agentData;
  };

  // ─── Smart fields create ───────────────────────────────────────────────────
  const handleCreateSmartFields = async () => {
    const kbRes = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/knowledge-bases`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          name: formData.knowledgeBaseName,
          content: formData.knowledgeBaseContent,
          field_mode: "smart_fields",
        }),
      },
    );
    const kbData = await kbRes.json();
    if (!kbData.success)
      throw new Error(kbData.error || "Failed to create knowledge base");

    // Clean smart_fields — remove _id helper
    const cleanFields = formData.smartFields.map(({ _id, ...rest }, i) => ({
      ...rest,
      display_order: i,
    }));

    const agentRes = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/agent-system/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          agent_name: formData.agentName,
          agent_description: formData.agentDescription,
          knowledge_base_id: kbData.data.id,
          event_title: formData.eventTitle,
          first_message:
            formData.firstMessage ||
            "Hello {{guest_name}}! I'm calling on behalf of {{event_name}}. I'm here to confirm your RSVP and I'm also happy to answer any questions you have about the event. Is now a good time?",
          field_mode: "smart_fields",
          smart_fields: cleanFields,
          voice_id: formData.selectedVoice?.voice_id || null,
          voice_name: formData.selectedVoice?.name || null,
          public_owner_id: formData.selectedVoice?.public_owner_id || null,
        }),
      },
    );
    const agentData = await agentRes.json();
    if (!agentData.success)
      throw new Error(agentData.error || "Failed to create agent");
    return agentData;
  };

  const handleCreateAgent = async () => {
    try {
      setLoading(true);
      const result =
        fieldMode === "classic"
          ? await handleCreateClassic()
          : await handleCreateSmartFields();
      toast.success("Agent created successfully!");
      navigate(`/agents/${result.data.agent_id}`);
    } catch (error) {
      console.error("Error creating agent:", error);
      toast.error(error.message || "Failed to create agent");
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#0B0B0C] to-[#0A0A0B] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-teal-500/10 border border-blue-500/20 rounded-full mb-6">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">
              AI Agent Builder
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-br from-white via-blue-50 to-blue-100 bg-clip-text text-transparent">
            Create Your AI Agent
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Build your intelligent RSVP assistant in a few simple steps.
          </p>
        </div>

        {/* Step progress */}
        <div className="mb-10 overflow-x-auto">
          <div className="relative flex items-center justify-between min-w-[400px]">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1 relative z-10">
                    <div
                      className={`
                        w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 mb-2
                        ${isCompleted ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25" : ""}
                        ${isActive ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/40 scale-110" : ""}
                        ${!isActive && !isCompleted ? "bg-[#16161A] border border-[#26262E]" : ""}
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                      ) : (
                        <Icon
                          className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-600"}`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold text-center transition-all hidden sm:block
                        ${isActive ? "text-white" : ""}
                        ${isCompleted ? "text-emerald-400" : ""}
                        ${!isActive && !isCompleted ? "text-gray-600" : ""}
                      `}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 -mt-6 bg-[#1A1A1E] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          currentStep > step.number
                            ? "w-full bg-gradient-to-r from-emerald-500 to-teal-500"
                            : "w-0"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-[#12121A] via-[#14141C] to-[#12121A] rounded-2xl p-6 md:p-10 border border-[#1F1F2E] shadow-2xl">
          {/* ── STEP 1: Mode Selection ── */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-3">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-blue-300">
                    Step 1 of {steps.length}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Choose Agent Mode
                </h2>
                <p className="text-gray-400">
                  Classic mode uses a pre-built template. Custom mode lets you
                  define exactly what information the agent collects.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Classic */}
                <button
                  onClick={() => setFieldMode("classic")}
                  className={`group relative rounded-2xl border-2 p-6 text-left transition-all duration-200
                    ${
                      fieldMode === "classic"
                        ? "border-blue-500/60 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                        : "border-[#1F1F2E] bg-[#0E0E14] hover:border-blue-500/30"
                    }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20">
                      <Layers className="w-6 h-6 text-blue-400" />
                    </div>
                    <div
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all
                        ${fieldMode === "classic" ? "border-blue-500 bg-blue-500" : "border-[#3A3A4E]"}`}
                    >
                      {fieldMode === "classic" && (
                        <Check
                          className="w-3.5 h-3.5 text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Classic Template
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    Choose from pre-built wedding, corporate, or event RSVP
                    templates with ready-made flows.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Wedding RSVP",
                      "Corporate Events",
                      "Pre-built Flows",
                    ].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-[#1A1A2A] px-2.5 py-1 text-xs text-gray-400 border border-[#2A2A3E]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>

                {/* Smart Fields */}
                <button
                  onClick={() => setFieldMode("smart_fields")}
                  className={`group relative rounded-2xl border-2 p-6 text-left transition-all duration-200
                    ${
                      fieldMode === "smart_fields"
                        ? "border-teal-500/60 bg-teal-500/10 shadow-lg shadow-teal-500/10"
                        : "border-[#1F1F2E] bg-[#0E0E14] hover:border-teal-500/30"
                    }`}
                >
                  <div className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-teal-500/30 px-2.5 py-0.5">
                    <span className="text-xs font-semibold text-teal-300">
                      New
                    </span>
                  </div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal-500/20">
                      <Wand2 className="w-6 h-6 text-teal-400" />
                    </div>
                    <div
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all mt-7
                        ${fieldMode === "smart_fields" ? "border-teal-500 bg-teal-500" : "border-[#3A3A4E]"}`}
                    >
                      {fieldMode === "smart_fields" && (
                        <Check
                          className="w-3.5 h-3.5 text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Custom Smart Fields
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    Define exactly which questions your agent asks and how it
                    collects them — full control.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Custom Questions",
                      "Any Event Type",
                      "Flexible Fields",
                    ].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-[#1A1A2A] px-2.5 py-1 text-xs text-gray-400 border border-[#2A2A3E]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              </div>

              {fieldMode && (
                <div
                  className={`rounded-xl border p-4 text-sm ${
                    fieldMode === "classic"
                      ? "border-blue-500/20 bg-blue-500/5 text-blue-200"
                      : "border-teal-500/20 bg-teal-500/5 text-teal-200"
                  }`}
                >
                  {fieldMode === "classic"
                    ? "✓ You'll choose a pre-built template and the agent will use its built-in question flow."
                    : "✓ You'll define your own fields — the AI will ask questions based on exactly what you specify."}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Basic Info ── */}
          {currentStep === 2 && (
            <div className="space-y-7">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-3">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-blue-300">
                    Step 2 of {steps.length}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Basic Information
                </h2>
                <p className="text-gray-400">
                  Give your AI agent a name and a brief description.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Agent Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.agentName}
                    onChange={(e) =>
                      setFormData({ ...formData, agentName: e.target.value })
                    }
                    placeholder="e.g., Sharma Wedding Agent, Annual Gala RSVP..."
                    className="w-full rounded-xl border border-[#2A2A3E] bg-[#0A0A0F] px-5 py-4 text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Description{" "}
                    <span className="text-gray-500 font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={formData.agentDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        agentDescription: e.target.value,
                      })
                    }
                    placeholder="Briefly describe what this agent will help with..."
                    rows={4}
                    className="w-full rounded-xl border border-[#2A2A3E] bg-[#0A0A0F] px-5 py-4 text-white placeholder:text-gray-600 outline-none transition resize-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3 (Classic): Template ── */}
          {currentStep === 3 && fieldMode === "classic" && (
            <div className="space-y-7">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-3">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-blue-300">
                    Step 3 of {steps.length}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Choose a Template
                </h2>
                <p className="text-gray-400">
                  Select a pre-configured template optimized for your use case.
                </p>
              </div>

              {loadingTemplates ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-9 h-9 animate-spin text-blue-500 mb-4" />
                  <p className="text-gray-400">Loading templates...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {templates.map((template) => {
                    const config =
                      typeof template.config === "string"
                        ? JSON.parse(template.config)
                        : template.config;
                    const isSelected =
                      formData.selectedTemplate?.template_id ===
                      template.template_id;

                    return (
                      <div
                        key={template.template_id}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            selectedTemplate: template,
                          })
                        }
                        className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200
                          ${
                            isSelected
                              ? "border-blue-500/60 bg-blue-500/8 shadow-lg shadow-blue-500/10"
                              : "border-[#1F1F2E] bg-[#0E0E14] hover:border-blue-500/30"
                          }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-bold text-white">
                                {template.name}
                              </h3>
                              {template.category && (
                                <span className="px-2.5 py-0.5 text-xs font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/25 rounded-full">
                                  {template.category}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">
                              {template.description}
                            </p>
                          </div>
                          <div
                            className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 transition-all
                              ${isSelected ? "border-blue-500 bg-blue-500" : "border-[#3A3A4E]"}`}
                          >
                            {isSelected && (
                              <Check
                                className="w-3.5 h-3.5 text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {config?.capabilities?.includes("voice") && (
                            <div className="flex items-center gap-1.5 rounded-lg bg-[#1A1A2A] border border-[#2A2A3E] px-3 py-1 text-xs">
                              <Phone className="w-3.5 h-3.5 text-blue-400" />
                              <span className="text-gray-300">Voice</span>
                            </div>
                          )}
                          {config?.capabilities?.includes("chat") && (
                            <div className="flex items-center gap-1.5 rounded-lg bg-[#1A1A2A] border border-[#2A2A3E] px-3 py-1 text-xs">
                              <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                              <span className="text-gray-300">Chat</span>
                            </div>
                          )}
                          {config?.capabilities?.includes(
                            "document_collection",
                          ) && (
                            <div className="flex items-center gap-1.5 rounded-lg bg-[#1A1A2A] border border-[#2A2A3E] px-3 py-1 text-xs">
                              <FileText className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-gray-300">Docs</span>
                            </div>
                          )}
                        </div>

                        {isSelected && template.preview_image_url && (
                          <div className="mt-4 pt-4 border-t border-[#1F1F2E]">
                            <img
                              src={template.preview_image_url}
                              alt={`${template.name} preview`}
                              className="w-full h-auto rounded-xl object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3 (Smart Fields) ── */}
          {currentStep === 3 && fieldMode === "smart_fields" && (
            <div className="space-y-7">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-lg mb-3">
                  <Wand2 className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-medium text-teal-300">
                    Step 3 of {steps.length}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Define Smart Fields
                </h2>
                <p className="text-gray-400">
                  Tell the agent exactly what to ask. Each field becomes one
                  question in the conversation.
                </p>
              </div>

              {/* Event config */}
              <div className="grid gap-4 md:grid-cols-2 p-5 rounded-2xl border border-[#1F1F2E] bg-[#0E0E14]">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-400">
                    Event Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.eventTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, eventTitle: e.target.value })
                    }
                    placeholder="e.g., Sharma Wedding, Q3 Annual Gala"
                    className="w-full rounded-xl border border-[#2A2A3E] bg-[#0A0A0F] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-400">
                    Agent First Message{" "}
                    <span className="text-gray-500 font-normal">
                      {/* (optional) */}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstMessage}
                    onChange={(e) =>
                      setFormData({ ...formData, firstMessage: e.target.value })
                    }
                    placeholder="Hello {{guest_name}}! I'm calling on behalf of {{event_name}}. I'm here to confirm your RSVP and I'm also happy to answer any questions you have about the event. Is now a good time?"
                    className="w-full rounded-xl border border-[#2A2A3E] bg-[#0A0A0F] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30"
                  />
                  <p className="mt-1.5 text-xs text-gray-600">
                    Use{" "}
                    <code className="text-teal-500/80">{`{{guest_name}}`}</code>{" "}
                    and{" "}
                    <code className="text-teal-500/80">{`{{event_name}}`}</code>{" "}
                    as dynamic placeholders.
                  </p>
                </div>
              </div>

              {/* Fields list */}
              <div className="space-y-4">
                {formData.smartFields.map((field, index) => (
                  <SmartFieldRow
                    key={field._id}
                    field={field}
                    index={index}
                    onChange={updateSmartField}
                    onRemove={removeSmartField}
                    isOnly={formData.smartFields.length === 1}
                  />
                ))}
              </div>

              <button
                onClick={addSmartField}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#2A2A3E] py-4 text-sm font-medium text-gray-400 transition hover:border-teal-500/40 hover:text-teal-300 hover:bg-teal-500/5"
              >
                <Plus size={16} />
                Add Another Field
              </button>

              <div className="rounded-xl border border-teal-500/15 bg-teal-500/5 p-4 flex gap-3">
                <Sparkles className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-300 leading-relaxed">
                  <span className="font-semibold text-white">
                    How it works:
                  </span>{" "}
                  Each field you define becomes a question the AI voice agent
                  will ask conversationally. Required fields are always asked;
                  optional ones are skipped if the guest seems busy.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 4: Knowledge Base ── */}
          {currentStep === 4 && (
            <div className="space-y-7">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-3">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-blue-300">
                    Step 4 of {steps.length}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Add Knowledge Base
                </h2>
                <p className="text-gray-400">
                  Provide information your agent will reference when guests ask
                  questions.
                </p>
              </div>

              {/* Wedding-specific fields */}
              {fieldMode === "classic" &&
                formData.selectedTemplate?.category === "wedding" && (
                  <div className="grid md:grid-cols-2 gap-4 p-5 rounded-2xl border border-pink-500/20 bg-pink-500/5">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-300">
                        Groom Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.groomName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            groomName: e.target.value,
                          })
                        }
                        placeholder="e.g., Ajay"
                        className="w-full rounded-xl border border-[#2A2A3E] bg-[#0A0A0F] px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-pink-500/50"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-300">
                        Bride Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.brideName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            brideName: e.target.value,
                          })
                        }
                        placeholder="e.g., Pooja"
                        className="w-full rounded-xl border border-[#2A2A3E] bg-[#0A0A0F] px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-pink-500/50"
                      />
                    </div>
                  </div>
                )}

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Knowledge Base Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.knowledgeBaseName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        knowledgeBaseName: e.target.value,
                      })
                    }
                    placeholder="e.g., Sharma Wedding Details, Company Event Info"
                    className="w-full rounded-xl border border-[#2A2A3E] bg-[#0A0A0F] px-5 py-4 text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Knowledge Base Content{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.knowledgeBaseContent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        knowledgeBaseContent: e.target.value,
                      })
                    }
                    placeholder={`Add event details, venue info, schedule, FAQs...\n\nExample:\nVenue: Grand Palace Hotel\nDate: December 20-21, 2025\nDress Code: Formal\n\nSchedule:\n- Day 1: Welcome Lunch at 1 PM\n- Day 2: Wedding Ceremony at 6 PM`}
                    rows={12}
                    className="w-full rounded-xl border border-[#2A2A3E] bg-[#0A0A0F] px-5 py-4 text-white placeholder:text-gray-600 font-mono text-sm outline-none transition resize-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                  />
                  <div className="mt-3 flex items-start gap-3 rounded-xl border border-blue-500/10 bg-blue-500/5 p-3.5">
                    <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Include venue details, dates, schedule, dress codes, FAQs,
                      and anything guests might ask. More detail = better
                      performance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: Voice Selection ── */}
          {currentStep === 5 && (
            <div className="space-y-7">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-3">
                  <Mic className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-blue-300">
                    Step 5 of {steps.length}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Choose a Voice
                </h2>
                <p className="text-gray-400">
                  Pick an Indian voice for your agent. Hit play to preview
                  before selecting. You can skip this and assign a voice later.
                </p>
              </div>

              <VoiceSelector
                selectedVoice={formData.selectedVoice}
                onSelect={(voice) =>
                  setFormData((prev) => ({
                    ...prev,
                    selectedVoice:
                      prev.selectedVoice?.voice_id === voice.voice_id
                        ? null // clicking selected voice deselects it
                        : voice,
                  }))
                }
              />

              {!formData.selectedVoice && (
                <p className="text-center text-xs text-gray-600">
                  No voice selected — the agent will use the default ElevenLabs
                  voice.
                </p>
              )}
            </div>
          )}

          {/* ── STEP 6: Review ── */}
          {currentStep === 6 && (
            <div className="space-y-7">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-300">
                    Step 6 of {steps.length} — Review
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Review & Create
                </h2>
                <p className="text-gray-400">
                  Everything looks good? Hit create to launch your agent.
                </p>
              </div>

              <div className="space-y-4">
                {/* Agent Info */}
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/25">
                      <Target className="w-4 h-4 text-blue-400" />
                    </div>
                    Agent Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name</span>
                      <span className="font-semibold text-white">
                        {formData.agentName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mode</span>
                      <span
                        className={`font-semibold ${fieldMode === "classic" ? "text-blue-300" : "text-teal-300"}`}
                      >
                        {fieldMode === "classic"
                          ? "Classic Template"
                          : "Custom Smart Fields"}
                      </span>
                    </div>
                    {formData.agentDescription && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Description</span>
                        <span className="text-gray-300 max-w-xs text-right">
                          {formData.agentDescription}
                        </span>
                      </div>
                    )}
                    {formData.selectedVoice && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Voice</span>
                        <span className="font-semibold text-white capitalize">
                          {formData.selectedVoice.name}
                          <span className="ml-1.5 text-xs text-gray-500">
                            ({formData.selectedVoice.gender})
                          </span>
                        </span>
                      </div>
                    )}
                    {fieldMode === "classic" && formData.selectedTemplate && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Template</span>
                        <span className="font-semibold text-white">
                          {formData.selectedTemplate.name}
                        </span>
                      </div>
                    )}
                    {fieldMode === "smart_fields" && formData.eventTitle && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Event Title</span>
                        <span className="font-semibold text-white">
                          {formData.eventTitle}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Smart Fields Summary */}
                {fieldMode === "smart_fields" && (
                  <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-5">
                    <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/25">
                        <Wand2 className="w-4 h-4 text-teal-400" />
                      </div>
                      Smart Fields ({formData.smartFields.length})
                    </h3>
                    <div className="space-y-2">
                      {formData.smartFields.map((f, i) => (
                        <div
                          key={f._id}
                          className="flex items-center gap-3 rounded-xl bg-[#0A0A10] px-4 py-2.5 text-sm"
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-500/20 text-xs font-bold text-teal-400">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-white">
                              {f.field_label || "Untitled"}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              ({f.field_type})
                            </span>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${f.is_required ? "bg-red-500/15 text-red-400" : "bg-gray-500/15 text-gray-400"}`}
                          >
                            {f.is_required ? "Required" : "Optional"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* KB summary */}
                <div className="rounded-2xl border border-[#1F1F2E] bg-[#0E0E14] p-5">
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                      <Brain className="w-4 h-4 text-purple-400" />
                    </div>
                    Knowledge Base
                  </h3>
                  <p className="text-sm text-white font-medium mb-2">
                    {formData.knowledgeBaseName}
                  </p>
                  <div className="max-h-32 overflow-y-auto rounded-lg bg-[#0A0A0F] border border-[#1A1A2A] p-3">
                    <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">
                      {formData.knowledgeBaseContent.substring(0, 300)}
                      {formData.knowledgeBaseContent.length > 300 && "..."}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all text-sm
              ${
                currentStep === 1
                  ? "invisible"
                  : "border border-[#2A2A3E] bg-[#0E0E14] text-gray-300 hover:bg-[#161620] hover:border-[#3A3A4E]"
              }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < 6 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-7 py-3 font-semibold text-sm shadow-lg shadow-blue-500/25 transition hover:shadow-blue-500/40 hover:scale-[1.02]"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreateAgent}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-7 py-3 font-semibold text-sm shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Agent
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAgent;
