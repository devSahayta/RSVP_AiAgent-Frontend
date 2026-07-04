import { useState, useEffect, useRef } from "react";
import { Play, Pause, Loader2, Mic, Search, ChevronDown } from "lucide-react";

const USE_CASES = [
  { value: "", label: "All Use Cases" },
  { value: "conversational", label: "Conversational" },
  { value: "narrative_story", label: "Narration" },
  { value: "informative_educational", label: "Educational" },
  { value: "social_media", label: "Social Media" },
  // { value: "advertisement", label: "Advertisement" },
];

const GENDERS = [
  { value: "", label: "Any Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const INDIAN_ACCENTS = new Set([
  "indian",
  "tamil",
  "telugu",
  "hindi",
  "bengali",
  "malayalam",
  "kannada",
  "marathi",
  "punjabi",
  "gujarati",
  "standard", // "standard" covers hi-IN voices
]);

const INDIAN_LOCALES = new Set([
  "en-IN",
  "hi-IN",
  "ta-IN",
  "te-IN",
  "bn-IN",
  "ml-IN",
  "kn-IN",
  "mr-IN",
  "pa-IN",
  "gu-IN",
]);

const isIndianVoice = (voice) => {
  // Check accent
  if (INDIAN_ACCENTS.has(voice.accent?.toLowerCase())) return true;
  // Check verified languages for Indian locales
  if (voice.verified_languages?.some((vl) => INDIAN_LOCALES.has(vl.locale)))
    return true;
  // Check description/name for Indian keywords
  const text = `${voice.name} ${voice.description}`.toLowerCase();
  if (
    text.includes("indian") ||
    text.includes("hindi") ||
    text.includes("hinglish")
  )
    return true;
  return false;
};

// Single voice card with inline audio preview
const VoiceCard = ({ voice, isSelected, onSelect }) => {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!voice.preview_url) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(voice.preview_url);
      audioRef.current.onended = () => setPlaying(false);
    }

    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
      setLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setPlaying(true);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  // Stop audio when card unmounts or selection changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div
      onClick={() => onSelect(voice)}
      className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200
        ${
          isSelected
            ? "border-blue-500/60 bg-blue-500/10 shadow-lg shadow-blue-500/10"
            : "border-[#1F1F2E] bg-[#0E0E14] hover:border-blue-500/30"
        }`}
    >
      {/* Selection indicator */}
      <div
        className={`absolute top-3 right-3 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all
        ${isSelected ? "border-blue-500 bg-blue-500" : "border-[#3A3A4E]"}`}
      >
        {isSelected && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>

      <div className="flex items-start gap-3 pr-6">
        {/* Play button */}
        <button
          onClick={togglePlay}
          disabled={!voice.preview_url}
          className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl transition-all
            ${
              playing
                ? "bg-blue-500 shadow-lg shadow-blue-500/40"
                : "bg-[#1A1A2A] border border-[#2A2A3E] hover:bg-blue-500/20 hover:border-blue-500/40"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin text-white" />
          ) : playing ? (
            <Pause size={14} className="text-white" />
          ) : (
            <Play size={14} className="text-gray-300 ml-0.5" />
          )}
        </button>

        {/* Voice info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">
            {voice.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 capitalize">
            {voice.gender} · {voice.age?.replace("_", " ")} · {voice.accent}
          </p>
          {voice.description && (
            <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
              {voice.description}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {voice.use_case && (
          <span className="rounded-md bg-[#1A1A2A] border border-[#2A2A3E] px-2 py-0.5 text-xs text-gray-400 capitalize">
            {voice.use_case.replace(/_/g, " ")}
          </span>
        )}
        {voice.descriptive && (
          <span className="rounded-md bg-[#1A1A2A] border border-[#2A2A3E] px-2 py-0.5 text-xs text-gray-400 capitalize">
            {voice.descriptive}
          </span>
        )}
        {!voice.free_users_allowed && (
          <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
            Pro
          </span>
        )}
      </div>
    </div>
  );
};

const PAGE_SIZE = 24;

// Main VoiceSelector component
const VoiceSelector = ({ selectedVoice, onSelect }) => {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [gender, setGender] = useState("");
  const [useCase, setUseCase] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchVoices(1, false);
  }, [gender, useCase, debouncedSearch]);

  const fetchVoices = async (pageNum, append) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      const params = new URLSearchParams({
        page_size: String(PAGE_SIZE),
        page: String(pageNum),
      });
      if (gender) params.append("gender", gender);
      if (useCase) params.append("use_case", useCase);
      if (debouncedSearch) params.append("search", debouncedSearch);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/voices?${params.toString()}`,
      );
      const data = await res.json();
      if (data.success) {
        // When searching, client-side filter to keep only Indian voices
        // since locale filter is relaxed on the backend for search queries
        const filtered = debouncedSearch
          ? data.data.filter(isIndianVoice)
          : data.data;

        // setVoices((prev) => (append ? [...prev, ...filtered] : filtered));
        // // setVoices((prev) => (append ? [...prev, ...data.data] : data.data));
        // setPage(pageNum);
        // setHasMore(
        //   typeof data.total === "number"
        //     ? pageNum * PAGE_SIZE < data.total
        //     : typeof data.has_more === "boolean"
        //       ? data.has_more
        //       : data.data.length === PAGE_SIZE,
        // );

        if (append) {
          setVoices((prev) => {
            // Deduplicate by voice_id to prevent same voices appearing on load more
            const existingIds = new Set(prev.map((v) => v.voice_id));
            const newVoices = filtered.filter(
              (v) => !existingIds.has(v.voice_id),
            );
            return [...prev, ...newVoices];
          });
        } else {
          setVoices(filtered);
        }

        setPage(pageNum);

        // During search: has_more is unreliable after client-side filtering.
        // Only show load more if ElevenLabs says there's more AND we actually
        // got new voices after filtering (avoids infinite empty pages).
        if (debouncedSearch) {
          setHasMore(data.has_more && filtered.length > 0);
        } else {
          setHasMore(
            typeof data.total_count === "number"
              ? pageNum * PAGE_SIZE < data.total_count
              : (data.has_more ?? data.data.length === PAGE_SIZE),
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch voices:", err);
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  };

  // Auto-load the next page when the sentinel scrolls into view
  useEffect(() => {
    if (!hasMore || loading) return;
    const root = scrollRef.current;
    const target = sentinelRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          fetchVoices(page + 1, true);
        }
      },
      { root, threshold: 0.1 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={14}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search voices..."
            className="w-full rounded-xl border border-[#2A2A3E] bg-[#0A0A0F] py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500/60"
          />
        </div>

        <div className="relative">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="appearance-none rounded-xl border border-[#2A2A3E] bg-[#0A0A0F] py-2.5 pl-4 pr-8 text-sm text-white outline-none focus:border-blue-500/60"
          >
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        </div>

        <div className="relative">
          <select
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            className="appearance-none rounded-xl border border-[#2A2A3E] bg-[#0A0A0F] py-2.5 pl-4 pr-8 text-sm text-white outline-none focus:border-blue-500/60"
          >
            {USE_CASES.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        </div>
      </div>

      {/* Selected voice banner */}
      {selectedVoice && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-500/25 bg-blue-500/8 px-4 py-3">
          <Mic size={15} className="text-blue-400 flex-shrink-0" />
          <p className="text-sm text-blue-200">
            Selected:{" "}
            <span className="font-semibold text-white">
              {selectedVoice.name}
            </span>
            {(selectedVoice.gender || selectedVoice.accent) && (
              <span className="ml-2 text-xs text-gray-500 capitalize">
                ({selectedVoice.gender || "—"} · {selectedVoice.accent || "—"})
              </span>
            )}
          </p>
        </div>
      )}

      {/* Voice grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
          <p className="text-sm text-gray-400">Loading Indian voices...</p>
        </div>
      ) : voices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Mic size={32} className="text-gray-600 mb-3" />
          <p className="text-gray-400 text-sm">
            No voices found. Try different filters.
          </p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="max-h-[480px] overflow-y-auto pr-1 scrollbar-thin"
        >
          <div className="grid gap-3 md:grid-cols-2">
            {voices.map((voice) => (
              <VoiceCard
                key={voice.voice_id}
                voice={voice}
                isSelected={selectedVoice?.voice_id === voice.voice_id}
                onSelect={onSelect}
              />
            ))}
          </div>

          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-4">
              {loadingMore && (
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceSelector;
