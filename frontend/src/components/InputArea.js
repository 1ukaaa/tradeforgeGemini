import TimelineIcon from "@mui/icons-material/Timeline";
import RouteRoundedIcon from "@mui/icons-material/RouteRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import GraphicEqRoundedIcon from "@mui/icons-material/GraphicEqRounded";
import MicNoneRoundedIcon from "@mui/icons-material/MicNoneRounded";
import DoNotDisturbAltRoundedIcon from "@mui/icons-material/DoNotDisturbAltRounded";
import { Box, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import ActionBar from "../features/analyzer/components/ActionBar";
import AiResponseCard from "../features/analyzer/components/AiResponseCard";
import SpeechControls from "../features/analyzer/components/SpeechControls";
import TranscriptEditor from "../features/analyzer/components/TranscriptEditor";
import useSpeechCapture from "../features/analyzer/hooks/useSpeechCapture";
import { requestAnalysis } from "../services/aiClient";

const inferContentType = (text) => {
  const match = text.match(/Type\s*:?\s*(Trade|Analyse)/i);
  return match ? match[1].toLowerCase() : "";
};

const InputArea = () => {
  const [transcript, setTranscript] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [detectedType, setDetectedType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const wordCount = useMemo(
    () => transcript.trim().split(/\s+/).filter(Boolean).length,
    [transcript]
  );

  const appendTranscript = useCallback((chunk) => {
    setTranscript((prev) => `${prev}${chunk}`);
  }, []);

  const { isSupported, isRecording, startRecording, stopRecording } = useSpeechCapture({
    onTranscript: appendTranscript,
  });

  const captureStatus = useMemo(() => {
    if (!isSupported) {
      return {
        label: "Dictée indisponible",
        icon: <DoNotDisturbAltRoundedIcon fontSize="small" />,
        sx: {
          bgcolor: "rgba(214, 65, 65, 0.12)",
          color: "#B42318",
          border: "1px solid rgba(214, 65, 65, 0.2)",
        },
      };
    }
    if (isRecording) {
      return {
        label: "Dictée active",
        icon: <GraphicEqRoundedIcon fontSize="small" />,
        sx: {
          background: "linear-gradient(120deg, rgba(255,76,91,0.9) 0%, rgba(255,119,119,0.82) 100%)",
          color: "#fff",
          boxShadow: "0 14px 28px rgba(255,76,91,0.28)",
        },
        iconColor: "#fff",
      };
    }
    return {
      label: "Dictée prête",
      icon: <MicNoneRoundedIcon fontSize="small" />,
      sx: {
        bgcolor: "rgba(28,98,209,0.14)",
        color: "primary.main",
        border: "1px solid rgba(28,98,209,0.24)",
      },
    };
  }, [isSupported, isRecording]);

  const captureStages = [
    { icon: <TimelineIcon fontSize="small" />, label: "Contexte" },
    { icon: <RouteRoundedIcon fontSize="small" />, label: "Plan" },
    { icon: <FactCheckRoundedIcon fontSize="small" />, label: "Checklist" },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await requestAnalysis({ rawText: transcript });
      setAiResult(result);
      setDetectedType(inferContentType(result));
    } catch (err) {
      setError(err.message || "Erreur inconnue lors de l'appel IA.");
      setAiResult("");
      setDetectedType("");
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setAiResult("");
    setDetectedType("");
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: { xs: 3, md: 3.5 },
          border: "1px solid rgba(24,38,88,0.08)",
          background: "linear-gradient(150deg, rgba(255,255,255,0.95) 0%, rgba(232,237,255,0.9) 100%)",
          boxShadow: "0 28px 68px rgba(14,32,76,0.12)",
        }}
      >
        <Stack spacing={{ xs: 3, md: 4 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 2.5, md: 3.5 }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Stack spacing={1.5}>
              <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing="0.14em">
                Capture & préparation
              </Typography>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                {captureStages.map(({ icon, label }) => (
                  <Chip
                    key={label}
                    icon={icon}
                    label={label}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      bgcolor: "rgba(39,58,150,0.1)",
                      color: "primary.main",
                      borderRadius: 2,
                    }}
                  />
                ))}
              </Stack>
            </Stack>

            <Stack direction={{ xs: "row", md: "row" }} spacing={1.5} alignItems="center">
              <SpeechControls
                isSupported={isSupported}
                isRecording={isRecording}
                onStart={startRecording}
                onStop={stopRecording}
              />
              <Chip
                icon={captureStatus.icon}
                label={captureStatus.label}
                sx={{
                  fontWeight: 600,
                  borderRadius: 999,
                  px: 1.5,
                  height: 32,
                  ...captureStatus.sx,
                  "& .MuiChip-icon": {
                    color: captureStatus.iconColor || captureStatus.sx?.color,
                  },
                }}
              />
            </Stack>
          </Stack>

          <Divider sx={{ borderColor: "rgba(39,58,150,0.12)" }} />

          <Box
            sx={{
              borderRadius: { xs: 2.5, md: 3 },
              border: "1px solid rgba(37,56,124,0.08)",
              backgroundColor: "rgba(255,255,255,0.92)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4)",
              p: { xs: 1.5, md: 2 },
            }}
          >
            <TranscriptEditor value={transcript} onChange={setTranscript} />
          </Box>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 2, md: 3 }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Chip
              label={`${wordCount} mots`}
              size="small"
              sx={{
                fontWeight: 600,
                bgcolor: "rgba(28,98,209,0.1)",
                color: "primary.main",
                borderRadius: 999,
              }}
            />
            <ActionBar
              disabled={!transcript.trim()}
              loading={loading}
              onSubmit={handleSubmit}
              error={error}
            />
          </Stack>
        </Stack>
      </Paper>

      <AiResponseCard detectedType={detectedType} result={aiResult} onReset={resetAnalysis} />
    </>
  );
};

export default InputArea;
