import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  CheckCircle2,
  Loader2,
  Target,
  Layers,
  Brain,
  Wand2,
  Plus,
  Mic,
  Save,
  Sparkles as Zap,
} from "lucide-react";
import VoiceSelector from "../../components/VoiceSelector";
import {
  SmartFieldRow,
  defaultSmartField,
} from "../../components/SmartFieldEditor";
import { fetchAgentById, updateAgentById } from "../../api/agents";
import {
  fetchKnowledgeBaseById,
  updateKnowledgeBase,
} from "../../api/knowledgeBases";
import useAuthUser from "../../hooks/useAuthUser";
import {
  showError,
  showSuccess,
  showLoading,
  dismissToast,
} from "../../utils/toast";

const UpdateAgent = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuthUser();

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [agent, setAgent] = useState(null);
  const [originalKb, setOriginalKb] = useState({ name: "", content: "" });

  const [formData, setFormData] = useState({
    agentName: "",
    agentDescription: "",
    eventTitle: "",
    firstMessage: "",
    smartFields: [defaultSmartField()],
    knowledgeBaseName: "",
    knowledgeBaseContent: "",
    selectedVoice: null,
  });

  useEffect(() => {
    const loadAgent = async () => {
      try {
        const res = await fetchAgentById(agentId);
        const agentData = res.data.data;
        setAgent(agentData);

        let smartFields = [defaultSmartField()];
        if (agentData.field_mode === "smart_fields") {
          try {
            const parsed = Array.isArray(agentData.smart_fields)
              ? agentData.smart_fields
              : JSON.parse(agentData.smart_fields || "[]");
            if (parsed.length > 0) {
              smartFields = parsed.map((f) => ({
                ...f,
                _id: Math.random().toString(36).slice(2),
              }));
            }
          } catch {
            // fall back to the default single field
          }
        }

        let kbName = "";
        let kbContent = "";
        if (agentData.knowledge_base_id) {
          const kbRes = await fetchKnowledgeBaseById(
            agentData.knowledge_base_id,
          );
          const kb = kbRes.data?.data || kbRes.data;
          kbName = kb?.name || "";
          kbContent = kb?.knowledge_entries?.[0]?.content || "";
        }
        setOriginalKb({ name: kbName, content: kbContent });

        setFormData({
          agentName: agentData.agent_name || "",
          agentDescription: agentData.agent_description || "",
          eventTitle: agentData.event_title || "",
          firstMessage: agentData.first_message || "",
          smartFields,
          knowledgeBaseName: kbName,
          knowledgeBaseContent: kbContent,
          selectedVoice: agentData.voice_id
            ? { voice_id: agentData.voice_id, name: agentData.voice_name }
            : null,
        });
      } catch (error) {
        console.error("Error loading agent:", error);
        showError("Failed to load agent details");
      } finally {
        setInitialLoading(false);
      }
    };
    loadAgent();
  }, [agentId]);

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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#0B0B0C] to-[#0A0A0B] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-blue-300">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span>Loading Agent...</span>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#0B0B0C] to-[#0A0A0B] text-white flex items-center justify-center">
        <p className="text-gray-400">Agent not found.</p>
      </div>
    );
  }

  const isSmartFields = agent.field_mode === "smart_fields";

  // ─── Step navigation ───────────────────────────────────────────────────────
  const stepsClassic = [
    { number: 1, title: "Basic Info", icon: Target },
    { number: 2, title: "Knowledge Base", icon: Brain },
    { number: 3, title: "Voice", icon: Mic },
    { number: 4, title: "Review", icon: CheckCircle2 },
  ];

  const stepsSmart = [
    { number: 1, title: "Basic Info", icon: Target },
    { number: 2, title: "Smart Fields", icon: Wand2 },
    { number: 3, title: "Knowledge Base", icon: Brain },
    { number: 4, title: "Voice", icon: Mic },
    { number: 5, title: "Review", icon: CheckCircle2 },
  ];

  const steps = isSmartFields ? stepsSmart : stepsClassic;
  const totalSteps = steps.length;

  // Map abstract step (1-indexed across `steps`) to a stable kind, so the
  // smart-fields-only step doesn't shift classic agents' step numbers.
  const stepKind = steps[currentStep - 1]?.title;

  const handleNext = () => {
    if (stepKind === "Basic Info") {
      if (!formData.agentName.trim()) {
        showError("Please enter an agent name");
        return;
      }
    }

    if (stepKind === "Smart Fields") {
      const invalid = formData.smartFields.find(
        (f) =>
          !f.field_label.trim() ||
          !f.ai_question.trim() ||
          (f.field_type === "choice" && (!f.options || f.options.length < 2)),
      );
      if (invalid) {
        showError("Please fill in all required smart field details");
        return;
      }
    }

    if (stepKind === "Knowledge Base") {
      if (
        !formData.knowledgeBaseName.trim() ||
        !formData.knowledgeBaseContent.trim()
      ) {
        showError("Please fill in both knowledge base fields");
        return;
      }
    }

    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // ─── Save ──────────────────────────────────────────────────────────────────
  const handleSaveAgent = async () => {
    const toastId = showLoading("Saving changes...");
    try {
      setLoading(true);

      const kbChanged =
        formData.knowledgeBaseName !== originalKb.name ||
        formData.knowledgeBaseContent !== originalKb.content;

      if (kbChanged && agent.knowledge_base_id) {
        const kbRes = await updateKnowledgeBase(agent.knowledge_base_id, {
          user_id: userId,
          name: formData.knowledgeBaseName,
          content: formData.knowledgeBaseContent,
        });
        if (!kbRes.data.success) {
          throw new Error(
            kbRes.data.error || "Failed to update knowledge base",
          );
        }
      }

      const payload = {
        agent_name: formData.agentName,
        agent_description: formData.agentDescription,
        event_title: formData.eventTitle || null,
        voice_id: formData.selectedVoice?.voice_id || null,
        voice_name: formData.selectedVoice?.name || null,
        public_owner_id: formData.selectedVoice?.public_owner_id || null,
      };

      if (isSmartFields) {
        payload.smart_fields = formData.smartFields.map(
          ({ _id, ...rest }, i) => ({ ...rest, display_order: i }),
        );
        payload.first_message = formData.firstMessage;
      }

      const agentRes = await updateAgentById(agent.agent_id, payload);
      if (!agentRes.data.success) {
        throw new Error(agentRes.data.error || "Failed to update agent");
      }

      dismissToast(toastId);
      showSuccess("Agent updated successfully!");
      navigate(`/agents/${agent.agent_id}`);
    } catch (error) {
      console.error("Error updating agent:", error);
      dismissToast(toastId);
      showError(error.message || "Failed to update agent");
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
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-full mb-6 ${
              isSmartFields
                ? "bg-gradient-to-r from-teal-500/10 to-blue-500/10 border-teal-500/20"
                : "bg-gradient-to-r from-blue-500/10 to-teal-500/10 border-blue-500/20"
            }`}
          >
            {isSmartFields ? (
              <Wand2 className="w-4 h-4 text-teal-400" />
            ) : (
              <Layers className="w-4 h-4 text-blue-400" />
            )}
            <span
              className={`text-sm font-medium ${isSmartFields ? "text-teal-300" : "text-blue-300"}`}
            >
              {isSmartFields ? "Custom Smart Fields Agent" : "Classic Template Agent"}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-br from-white via-blue-50 to-blue-100 bg-clip-text text-transparent">
            Update "{agent.agent_name}"
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Agent mode and template are locked in after creation — everything
            else can be edited here.
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
          {/* ── Basic Info ── */}
          {stepKind === "Basic Info" && (
            <div className="space-y-7">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-3">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-blue-300">
                    Step {currentStep} of {totalSteps}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Basic Information
                </h2>
                <p className="text-gray-400">
                  Update your AI agent's name, description, and event title.
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

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Event Title{" "}
                    <span className="text-gray-500 font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.eventTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, eventTitle: e.target.value })
                    }
                    placeholder="e.g., Sharma Wedding, Q3 Annual Gala"
                    className="w-full rounded-xl border border-[#2A2A3E] bg-[#0A0A0F] px-5 py-4 text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Smart Fields (smart_fields mode only) ── */}
          {stepKind === "Smart Fields" && (
            <div className="space-y-7">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-lg mb-3">
                  <Wand2 className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-medium text-teal-300">
                    Step {currentStep} of {totalSteps}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Edit Smart Fields
                </h2>
                <p className="text-gray-400">
                  Adjust the questions the agent asks during the conversation.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-[#1F1F2E] bg-[#0E0E14]">
                <label className="mb-1.5 block text-xs font-semibold text-gray-400">
                  Agent First Message{" "}
                  <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.firstMessage}
                  onChange={(e) =>
                    setFormData({ ...formData, firstMessage: e.target.value })
                  }
                  placeholder="Hello {{guest_name}}! I'm calling on behalf of {{event_name}}..."
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
            </div>
          )}

          {/* ── Knowledge Base ── */}
          {stepKind === "Knowledge Base" && (
            <div className="space-y-7">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-3">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-blue-300">
                    Step {currentStep} of {totalSteps}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Edit Knowledge Base
                </h2>
                <p className="text-gray-400">
                  Update the information your agent references when guests ask
                  questions.
                </p>
              </div>

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
                    rows={12}
                    className="w-full rounded-xl border border-[#2A2A3E] bg-[#0A0A0F] px-5 py-4 text-white placeholder:text-gray-600 font-mono text-sm outline-none transition resize-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                  />
                  {!isSmartFields && (
                    <div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-500/15 bg-amber-500/5 p-3.5">
                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-300 leading-relaxed">
                        This agent's voice config is synced to ElevenLabs.
                        Saving changes here will re-sync the knowledge base
                        document automatically.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Voice ── */}
          {stepKind === "Voice" && (
            <div className="space-y-7">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-3">
                  <Mic className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-blue-300">
                    Step {currentStep} of {totalSteps}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Choose a Voice
                </h2>
                <p className="text-gray-400">
                  Pick an Indian voice for your agent. Hit play to preview
                  before selecting.
                </p>
              </div>

              <VoiceSelector
                selectedVoice={formData.selectedVoice}
                onSelect={(voice) =>
                  setFormData((prev) => ({
                    ...prev,
                    selectedVoice:
                      prev.selectedVoice?.voice_id === voice.voice_id
                        ? null
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

          {/* ── Review ── */}
          {stepKind === "Review" && (
            <div className="space-y-7">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-300">
                    Step {currentStep} of {totalSteps} — Review
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Review & Save
                </h2>
                <p className="text-gray-400">
                  Everything looks good? Save your changes.
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
                        className={`font-semibold ${isSmartFields ? "text-teal-300" : "text-blue-300"}`}
                      >
                        {isSmartFields
                          ? "Custom Smart Fields"
                          : "Classic Template"}
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
                    {formData.eventTitle && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Event Title</span>
                        <span className="font-semibold text-white">
                          {formData.eventTitle}
                        </span>
                      </div>
                    )}
                    {formData.selectedVoice && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Voice</span>
                        <span className="font-semibold text-white capitalize">
                          {formData.selectedVoice.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Smart Fields Summary */}
                {isSmartFields && (
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

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-7 py-3 font-semibold text-sm shadow-lg shadow-blue-500/25 transition hover:shadow-blue-500/40 hover:scale-[1.02]"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSaveAgent}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-7 py-3 font-semibold text-sm shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateAgent;
