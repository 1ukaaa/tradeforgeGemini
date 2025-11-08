import { Stack, Typography } from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import EmptyState from "../components/EmptyState";

const Journal = () => {
  return (
    <Stack spacing={4}>
      <Stack direction="row" spacing={1} alignItems="center">
        <AutoStoriesIcon color="primary" fontSize="large" />
        <Typography variant="h3" color="primary">
          Journal
        </Typography>
      </Stack>
      <Typography variant="body1" color="text.secondary" maxWidth={580}>
        Centralise tes analyses validées, retrouve les trades par actif, journée ou setup
        et suis l’évolution de ta discipline. Export, filtres et notes collaboratives arrivent bientôt.
      </Typography>
      <EmptyState
        title="Aucune entrée journalisée pour le moment"
        description="Valide une analyse depuis l’assistant ou importe ton historique pour alimenter le journal."
        actionLabel="Importer un historique"
        onAction={() => {}}
      />
    </Stack>
  );
};

export default Journal;
