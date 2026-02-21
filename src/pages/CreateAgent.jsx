// src/pages/CreateAgent.jsx
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
} from "lucide-react";

const CreateAgent = () => {
  const navigate = useNavigate();
  const { user } = useKindeAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    agentName: "",
    agentDescription: "",
    
    // Step 2: Template Selection (will be fetched)
    selectedTemplate: null,
    
    // Step 3: Knowledge Base
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
        // Auto-select first template if available
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

   // Fetch templates when component mounts
useEffect(() => {
  fetchTemplates();
}, []);


  const handleNext = () => {
    // Validation for each step
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

      // Step 1: Create Knowledge Base
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

      // Step 2: Create Agent
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

      toast.success("Agent created successfully! 🎉");
      
      // Navigate to agent details page
      navigate(`/agents/${agentData.data.agent_id}`);
      
    } catch (error) {
      console.error("Error creating agent:", error);
      toast.error(error.message || "Failed to create agent");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Basic Info", icon: FileText },
    { number: 2, title: "Select Template", icon: Sparkles },
    { number: 3, title: "Knowledge Base", icon: Brain },
    { number: 4, title: "Review & Create", icon: CheckCircle2 },
  ];

return (
    // <div className="min-h-screen bg-[#0B0B0C] text-white p-4 md:p-8">
    <div className="min-h-screen relative bg-[#0B0B0C] text-white p-4 md:p-8 overflow-hidden">
  {/* Ambient Gradient Glow */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 blur-[120px] pointer-events-none" />
  <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
  <div className="flex items-center gap-3 mb-4">
    <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-[#1F1F23]">
      <Sparkles className="w-6 h-6 text-violet-400" />
    </div>
    <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
      Create AI Agent
    </h1>
  </div>

  <p className="text-gray-400 text-lg max-w-2xl">
    Configure your intelligent voice & chat assistant powered by knowledge base and automation.
  </p>
</div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    {/* Step Circle */}
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        transition-all duration-300 mb-2 relative
                        ${isCompleted ? "bg-gradient-to-br from-violet-500via-purple-600 to-indigo-600 shadow-lg shadow-blue-500/30" : ""}
                        ${isActive ? "bg-gradient-to-br from-violet-500via-purple-600 to-indigo-600 scale-110 shadow-xl shadow-blue-500/40" : ""}
                        ${!isActive && !isCompleted ? "bg-[#111113] border border-[#1F1F23]" : ""}
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-600"}`} />
                      )}
                    </div>
                    
                    {/* Step Label */}
                    <span
                      className={`
                        text-xs md:text-sm font-medium text-center
                        ${isActive ? "text-white" : "text-gray-600"}
                      `}
                    >
                      {step.title}
                    </span>
                  </div>
                  
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-[2px] mx-2 -mt-10">
                      <div
                        className={`
                          h-full transition-all duration-300
                          ${currentStep > step.number ? "bg-gradient-to-r from-violet-500via-purple-600 to-indigo-600" : "bg-[#1F1F23]"}
                        `}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[#111113] rounded-2xl p-6 md:p-8 border border-[#1F1F23] min-h-[500px] shadow-2xl">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold mb-2">Let's start with the basics</h2>
                <p className="text-gray-400">Give your AI agent a name and description</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Agent Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.agentName}
                    onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                    placeholder="e.g., Wedding RSVP Bot, Event Assistant..."
                    className="w-full px-4 py-3 bg-[#0B0B0C] border border-[#1F1F23] rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-600 hover:border-[#18181B]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description <span className="text-gray-500">(Optional)</span>
                  </label>
                  <textarea
                    value={formData.agentDescription}
                    onChange={(e) => setFormData({ ...formData, agentDescription: e.target.value })}
                    placeholder="Briefly describe what this agent will help with..."
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0B0B0C] border border-[#1F1F23] rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all resize-none placeholder:text-gray-600 hover:border-[#18181B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Template Selection */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold mb-2">Choose your agent template</h2>
                <p className="text-gray-400">Select a pre-configured template for your use case</p>
              </div>

              {loadingTemplates ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="grid gap-4">
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
                          p-6 rounded-xl border-2 cursor-pointer transition-all
                          ${isSelected 
                            ? "border-blue-500/60 bg-blue-500/5 shadow-lg shadow-blue-500/10" 
                            : "border-[#1F1F23] bg-[#111113] hover:border-[#18181B] hover:bg-[#18181B]"
                          }
                        `}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold">{template.name}</h3>
                              {template.category && (
                                <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full">
                                  {template.category}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm">{template.description}</p>
                          </div>
                          
                          {isSelected && (
                            <div className="w-6 h-6 bg-violet-500rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        {/* Capabilities */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {config.capabilities?.includes("voice") && (
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-[#18181B] border border-[#1F1F23] rounded-full text-xs font-medium">
                              <Phone className="w-3 h-3" />
                              <span>Voice Calls</span>
                            </div>
                          )}
                          {config.capabilities?.includes("chat") && (
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-[#18181B] border border-[#1F1F23] rounded-full text-xs font-medium">
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp Chat</span>
                            </div>
                          )}
                          {config.capabilities?.includes("document_collection") && (
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-[#18181B] border border-[#1F1F23] rounded-full text-xs font-medium">
                              <FileText className="w-3 h-3" />
                              <span>Document Collection</span>
                            </div>
                          )}
                        </div>

                        {/* Show template details when selected */}
                        {isSelected && (
                          <div className="mt-6 pt-6 border-t border-[#1F1F23] space-y-4 animate-fadeIn">
                            {/* How Voice Agent Works */}
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-blue-400" />
                                How Voice Agent Works:
                              </h4>
                              <ul className="space-y-1 text-sm text-gray-400">
                                {config.how_it_works?.voice?.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-1">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* How Chat Agent Works */}
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-purple-400" />
                                How Chat Agent Works:
                              </h4>
                              <ul className="space-y-1 text-sm text-gray-400">
                                {config.how_it_works?.chat?.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-purple-400 mt-1">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Features */}
                            <div>
                              <h4 className="font-semibold mb-2">Features Included:</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(config.features || {}).map(([key, value]) => (
                                  value && (
                                    <div key={key} className="flex items-center gap-2 text-sm text-gray-400">
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                      <span className="capitalize">
                                        {key.replace(/_/g, " ")}
                                      </span>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Knowledge Base */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold mb-2">Add Knowledge Base</h2>
                <p className="text-gray-400">
                  Provide information your agent will use to answer questions
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Knowledge Base Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.knowledgeBaseName}
                    onChange={(e) => setFormData({ ...formData, knowledgeBaseName: e.target.value })}
                    placeholder="e.g., Wedding Event Details, Company Info..."
                    className="w-full px-4 py-3 bg-[#0B0B0C] border border-[#1F1F23] rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-600 hover:border-[#18181B]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Knowledge Base Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.knowledgeBaseContent}
                    onChange={(e) => setFormData({ ...formData, knowledgeBaseContent: e.target.value })}
                    placeholder={`Add event details, venue information, schedule, FAQs...\n\nExample:\nVenue: Grand Palace Hotel\nDate: December 20-21, 2025\nDress Code: Formal\n\nSchedule:\n- Day 1: Welcome Lunch at 1 PM\n- Day 1: Sangeet at 7 PM\n- Day 2: Wedding Ceremony at 6 PM`}
                    rows={12}
                    className="w-full px-4 py-3 bg-[#0B0B0C] border border-[#1F1F23] rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all resize-none font-mono text-sm placeholder:text-gray-600 hover:border-[#18181B]"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Tip: Include venue details, dates, schedule, dress codes, FAQs, and any other information guests might ask about
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Create */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold mb-2">Review your agent</h2>
                <p className="text-gray-400">
                  Everything looks good? Click create to launch your AI agent!
                </p>
              </div>

              <div className="space-y-4">
                {/* Agent Info */}
                <div className="p-4 bg-[#18181B] rounded-xl border border-[#1F1F23]">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    Agent Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="font-medium">{formData.agentName}</span>
                    </div>
                    {formData.agentDescription && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Description:</span>
                        <span className="font-medium text-right max-w-xs">
                          {formData.agentDescription}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Template:</span>
                      <span className="font-medium">{formData.selectedTemplate?.name}</span>
                    </div>
                  </div>
                </div>

                {/* Knowledge Base */}
                <div className="p-4 bg-[#18181B] rounded-xl border border-[#1F1F23]">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    Knowledge Base
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="font-medium">{formData.knowledgeBaseName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-2">Content Preview:</span>
                      <div className="bg-[#0B0B0C] p-3 rounded-lg border border-[#1F1F23] max-h-40 overflow-y-auto">
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                          {formData.knowledgeBaseContent.substring(0, 300)}
                          {formData.knowledgeBaseContent.length > 300 && "..."}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
              ${currentStep === 1 
                ? "opacity-0 cursor-not-allowed" 
                : "bg-[#18181B] hover:bg-[#1F1F23] border border-[#1F1F23] text-white"
              }
            `}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-500via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-blue-700 hover:to-indigo-700 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreateAgent}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 hover:from-emerald-600 hover:via-emerald-700 hover:to-green-700 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CreateAgent;