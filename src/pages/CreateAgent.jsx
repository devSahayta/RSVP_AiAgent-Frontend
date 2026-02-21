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
} from "lucide-react";

const CreateAgent = () => {
  const navigate = useNavigate();
  const { user } = useKindeAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    agentName: "",
    agentDescription: "",
    selectedTemplate: null,
    knowledgeBaseName: "",
    knowledgeBaseContent: "",
  });

  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/agent-system/templates`);
      const data = await res.json();

      if (data.success) {
        setTemplates(data.data);
        if (data.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            selectedTemplate: data.data[0]
          }));
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

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.agentName.trim()) {
        toast.error("Please enter an agent name");
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.selectedTemplate) {
        toast.error("Please select a template");
        return;
      }
    }

    if (currentStep === 3) {
      if (!formData.knowledgeBaseName.trim() || !formData.knowledgeBaseContent.trim()) {
        toast.error("Please fill in both knowledge base fields");
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateAgent = async () => {
    try {
      setLoading(true);

      const kbRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/knowledge-bases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          name: formData.knowledgeBaseName,
          content: formData.knowledgeBaseContent,
        }),
      });

      const kbData = await kbRes.json();

      if (!kbData.success) {
        throw new Error(kbData.error || "Failed to create knowledge base");
      }

      const knowledgeBaseId = kbData.data.id;

      const agentRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/agent-system/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          template_id: formData.selectedTemplate.template_id,
          agent_name: formData.agentName,
          agent_description: formData.agentDescription,
          knowledge_base_id: knowledgeBaseId,
        }),
      });

      const agentData = await agentRes.json();

      if (!agentData.success) {
        throw new Error(agentData.error || "Failed to create agent");
      }

      toast.success("Agent created successfully!");
      navigate(`/agents/${agentData.data.agent_id}`);

    } catch (error) {
      console.error("Error creating agent:", error);
      toast.error(error.message || "Failed to create agent");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Basic Info", icon: Target },
    { number: 2, title: "Select Template", icon: Sparkles },
    { number: 3, title: "Knowledge Base", icon: Brain },
    { number: 4, title: "Review & Create", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#0B0B0C] to-[#0A0A0B] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-teal-500/10 border border-blue-500/20 rounded-full mb-6 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">AI Agent Builder</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-white via-blue-50 to-blue-100 bg-clip-text text-transparent leading-tight">
            Create Your AI Agent
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Build your intelligent assistant in 4 simple steps. Powered by advanced AI technology.
          </p>
        </div>

        <div className="mb-16">
          <div className="relative flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1 relative z-10">
                    <div
                      className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center
                        transition-all duration-500 mb-3 relative
                        ${isCompleted ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 scale-100" : ""}
                        ${isActive ? "bg-gradient-to-br from-blue-500 to-blue-600 scale-110 shadow-xl shadow-blue-500/50 animate-pulse-slow" : ""}
                        ${!isActive && !isCompleted ? "bg-gradient-to-br from-[#16161A] to-[#1A1A1E] border-2 border-[#26262E]" : ""}
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-white" strokeWidth={3} />
                      ) : (
                        <Icon className={`w-6 h-6 ${isActive ? "text-white" : "text-gray-600"}`} />
                      )}

                      {isActive && (
                        <div className="absolute inset-0 rounded-2xl bg-blue-500/30 animate-ping-slow"></div>
                      )}
                    </div>

                    <span
                      className={`
                        text-sm font-semibold text-center transition-all duration-300
                        ${isActive ? "text-white scale-105" : ""}
                        ${isCompleted ? "text-emerald-400" : ""}
                        ${!isActive && !isCompleted ? "text-gray-600" : ""}
                      `}
                    >
                      {step.title}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 mx-4 -mt-12 relative">
                      <div className="h-full bg-[#1A1A1E] rounded-full overflow-hidden">
                        <div
                          className={`
                            h-full transition-all duration-700 ease-out rounded-full
                            ${currentStep > step.number
                              ? "w-full bg-gradient-to-r from-emerald-500 to-teal-500"
                              : "w-0 bg-gradient-to-r from-blue-500 to-blue-600"
                            }
                          `}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#12121A] via-[#14141C] to-[#12121A] rounded-3xl p-8 md:p-12 border border-[#1F1F2E] min-h-[550px] shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-teal-500/5 pointer-events-none"></div>

          <div className="relative z-10">
            {currentStep === 1 && (
              <div className="space-y-8 animate-slideIn">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-blue-300">Step 1 of 4</span>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Let's start with the basics
                  </h2>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Give your AI agent a memorable name and describe its purpose
                  </p>
                </div>

                <div className="space-y-6 mt-8">
                  <div className="group">
                    <label className="block text-sm font-semibold mb-3 text-gray-300">
                      Agent Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.agentName}
                      onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                      placeholder="e.g., Wedding RSVP Bot, Event Assistant..."
                      className="w-full px-5 py-4 bg-[#0A0A0F] border border-white/5 rounded-xl focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/60 outline-none transition-all placeholder:text-gray-500 hover:border-white/10 text-white"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold mb-3 text-gray-300">
                      Description <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      value={formData.agentDescription}
                      onChange={(e) => setFormData({ ...formData, agentDescription: e.target.value })}
                      placeholder="Briefly describe what this agent will help with..."
                      rows={5}
                      className="w-full px-5 py-4 bg-[#0A0A0F] border-2 border-[#1F1F2E] rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-gray-600 hover:border-[#2A2A3E] group-hover:border-[#2A2A3E] text-white leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8 animate-slideIn">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-blue-300">Step 2 of 4</span>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Choose your agent template
                  </h2>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Select a pre-configured template optimized for your use case
                  </p>
                </div>

                {loadingTemplates ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                    <p className="text-gray-400">Loading templates...</p>
                  </div>
                ) : (
                  <div className="grid gap-5 mt-8">
                    {templates.map((template) => {
                      const config = typeof template.config === 'string'
                        ? JSON.parse(template.config)
                        : template.config;

                      const isSelected = formData.selectedTemplate?.template_id === template.template_id;

                      return (
                        <div
                          key={template.template_id}
                          onClick={() => setFormData({ ...formData, selectedTemplate: template })}
                          className={`
                            group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300
                            ${isSelected
                              ? "border-blue-500/60 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent shadow-xl shadow-blue-500/10 scale-[1.02]"
                              : "border-[#1F1F2E] bg-gradient-to-br from-[#14141C] to-[#16161E] hover:border-blue-500/30 hover:shadow-lg hover:scale-[1.01]"
                            }
                          `}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-teal-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                          <div className="relative">
                            <div className="flex items-start justify-between mb-5">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="text-2xl font-bold text-white">{template.name}</h3>
                                  {template.category && (
                                    <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-teal-300 border border-teal-500/30 rounded-full">
                                      {template.category}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-400 leading-relaxed">{template.description}</p>
                              </div>

                              <div
                                className={`
                                  w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ml-4
                                  ${isSelected
                                    ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 scale-110"
                                    : "bg-[#1A1A1E] border-2 border-[#2A2A3E] group-hover:border-blue-500/30"
                                  }
                                `}
                              >
                                {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-5">
                              {config.capabilities?.includes("voice") && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1A1A1E] to-[#16161C] border border-[#2A2A3E] rounded-xl text-sm font-medium hover:border-blue-500/30 transition-all">
                                  <Phone className="w-4 h-4 text-blue-400" />
                                  <span>Voice Calls</span>
                                </div>
                              )}
                              {config.capabilities?.includes("chat") && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1A1A1E] to-[#16161C] border border-[#2A2A3E] rounded-xl text-sm font-medium hover:border-blue-500/30 transition-all">
                                  <MessageSquare className="w-4 h-4 text-teal-400" />
                                  <span>WhatsApp Chat</span>
                                </div>
                              )}
                              {config.capabilities?.includes("document_collection") && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1A1A1E] to-[#16161C] border border-[#2A2A3E] rounded-xl text-sm font-medium hover:border-blue-500/30 transition-all">
                                  <FileText className="w-4 h-4 text-emerald-400" />
                                  <span>Document Collection</span>
                                </div>
                              )}
                            </div>

                            {isSelected && (
                              <div className="mt-6 pt-6 border-t border-[#2A2A3E] space-y-5 animate-slideIn">
                                {config.how_it_works?.voice && (
                                  <div className="bg-gradient-to-r from-blue-500/5 to-transparent p-5 rounded-xl border border-blue-500/10">
                                    <h4 className="font-bold mb-3 flex items-center gap-2 text-white">
                                      <Phone className="w-5 h-5 text-blue-400" />
                                      How Voice Agent Works
                                    </h4>
                                    <ul className="space-y-2">
                                      {config.how_it_works.voice.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                                          <span className="leading-relaxed">{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {config.how_it_works?.chat && (
                                  <div className="bg-gradient-to-r from-teal-500/5 to-transparent p-5 rounded-xl border border-teal-500/10">
                                    <h4 className="font-bold mb-3 flex items-center gap-2 text-white">
                                      <MessageSquare className="w-5 h-5 text-teal-400" />
                                      How Chat Agent Works
                                    </h4>
                                    <ul className="space-y-2">
                                      {config.how_it_works.chat.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                                          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 flex-shrink-0"></div>
                                          <span className="leading-relaxed">{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {config.features && (
                                  <div className="bg-gradient-to-r from-emerald-500/5 to-transparent p-5 rounded-xl border border-emerald-500/10">
                                    <h4 className="font-bold mb-3 text-white">Features Included</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {Object.entries(config.features).map(([key, value]) => (
                                        value && (
                                          <div key={key} className="flex items-center gap-2 text-sm text-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            <span className="capitalize">
                                              {key.replace(/_/g, " ")}
                                            </span>
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8 animate-slideIn">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-2">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-blue-300">Step 3 of 4</span>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Add Knowledge Base
                  </h2>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Provide information your agent will use to answer questions accurately
                  </p>
                </div>

                <div className="space-y-6 mt-8">
                  <div className="group">
                    <label className="block text-sm font-semibold mb-3 text-gray-300">
                      Knowledge Base Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.knowledgeBaseName}
                      onChange={(e) => setFormData({ ...formData, knowledgeBaseName: e.target.value })}
                      placeholder="e.g., Wedding Event Details, Company Info..."
                      className="w-full px-5 py-4 bg-[#0A0A0F] border-2 border-[#1F1F2E] rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-gray-600 hover:border-[#2A2A3E] group-hover:border-[#2A2A3E] text-white"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold mb-3 text-gray-300">
                      Knowledge Base Content <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={formData.knowledgeBaseContent}
                      onChange={(e) => setFormData({ ...formData, knowledgeBaseContent: e.target.value })}
                      placeholder={`Add event details, venue information, schedule, FAQs...\n\nExample:\nVenue: Grand Palace Hotel\nDate: December 20-21, 2025\nDress Code: Formal\n\nSchedule:\n- Day 1: Welcome Lunch at 1 PM\n- Day 1: Sangeet at 7 PM\n- Day 2: Wedding Ceremony at 6 PM`}
                      rows={14}
                      className="w-full px-5 py-4 bg-[#0A0A0F] border-2 border-[#1F1F2E] rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none font-mono text-sm placeholder:text-gray-600 hover:border-[#2A2A3E] group-hover:border-[#2A2A3E] text-white leading-relaxed"
                    />
                    <div className="mt-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-300 leading-relaxed">
                        <span className="font-semibold text-white">Pro Tip:</span> Include venue details, dates, schedule, dress codes, FAQs, and any other information guests might ask about. The more detailed, the better your agent will perform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-8 animate-slideIn">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-300">Step 4 of 4</span>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Review your agent
                  </h2>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Everything looks good? Click create to launch your AI agent
                  </p>
                </div>

                <div className="space-y-5 mt-8">
                  <div className="p-6 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent rounded-2xl border border-blue-500/20 backdrop-blur-sm">
                    <h3 className="font-bold mb-5 flex items-center gap-3 text-lg text-white">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      Agent Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between py-3 border-b border-blue-500/10">
                        <span className="text-gray-400 font-medium">Name</span>
                        <span className="font-semibold text-white text-right max-w-md">{formData.agentName}</span>
                      </div>
                      {formData.agentDescription && (
                        <div className="flex items-start justify-between py-3 border-b border-blue-500/10">
                          <span className="text-gray-400 font-medium">Description</span>
                          <span className="font-medium text-gray-300 text-right max-w-md leading-relaxed">
                            {formData.agentDescription}
                          </span>
                        </div>
                      )}
                      <div className="flex items-start justify-between py-3">
                        <span className="text-gray-400 font-medium">Template</span>
                        <span className="font-semibold text-white">{formData.selectedTemplate?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent rounded-2xl border border-teal-500/20 backdrop-blur-sm">
                    <h3 className="font-bold mb-5 flex items-center gap-3 text-lg text-white">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      Knowledge Base
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between py-3 border-b border-teal-500/10">
                        <span className="text-gray-400 font-medium">Name</span>
                        <span className="font-semibold text-white">{formData.knowledgeBaseName}</span>
                      </div>
                      <div className="py-3">
                        <span className="text-gray-400 font-medium block mb-3">Content Preview</span>
                        <div className="bg-[#0A0A0F] p-5 rounded-xl border border-teal-500/20 max-h-48 overflow-y-auto custom-scrollbar">
                          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                            {formData.knowledgeBaseContent.substring(0, 400)}
                            {formData.knowledgeBaseContent.length > 400 && "..."}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`
              group flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all
              ${currentStep === 1
                ? "opacity-0 cursor-not-allowed pointer-events-none"
                : "bg-gradient-to-r from-[#1A1A1E] to-[#16161C] hover:from-[#1F1F2E] hover:to-[#1A1A1E] border-2 border-[#2A2A3E] hover:border-blue-500/30 text-white shadow-lg hover:shadow-xl hover:scale-105"
              }
            `}
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 rounded-xl font-semibold transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
            >
              <span>Next Step</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              onClick={handleCreateAgent}
              disabled={loading}
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Agent...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Create Agent</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0A0A0F;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2A2A3E;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3A3A4E;
        }
      `}</style>
    </div>
  );
};

export default CreateAgent;
