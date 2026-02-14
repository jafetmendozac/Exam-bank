import { Box, Typography, Stack } from "@mui/material";
import { Star } from "@mui/icons-material";
import type { RatingSummary } from "@/exams/services/ratings.service";

interface Props {
    summary?: RatingSummary;
    size?: "small" | "medium";
}

/**
 * Componente compacto para mostrar rating en tarjetas de exámenes
 */
export default function RatingBadge({ summary, size = "small" }: Props) {
    if (!summary || summary.count === 0) {
        return (
            <Typography variant="caption" color="text.secondary">
                Sin calificaciones
            </Typography>
        );
    }

    const fontSize = size === "small" ? "0.875rem" : "1rem";
    const iconSize = size === "small" ? "small" : "medium";

    return (
        <Stack direction="row" spacing={0.5} alignItems="center">
            <Star
                fontSize={iconSize}
                sx={{ color: "#FFA500" }}
            />
            <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ fontSize }}
            >
                {summary.average.toFixed(1)}
            </Typography>
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
            >
                ({summary.count})
            </Typography>
        </Stack>
    );
}