import { Box, Typography, LinearProgress, Stack, Chip } from "@mui/material";
import { Star, StarBorder } from "@mui/icons-material";
import type { RatingSummary } from "@/exams/services/ratings.service";

interface Props {
    summary: RatingSummary;
    compact?: boolean;
}

export default function RatingDisplay({ summary, compact = false }: Props) {
    if (summary.count === 0) {
        return (
            <Box>
                <Typography variant="body2" color="text.secondary">
                    Sin calificaciones aún
                </Typography>
            </Box>
        );
    }

    // Renderizar estrellas
    const renderStars = (rating: number, size: "small" | "medium" | "large" = "medium") => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <Star key={i} fontSize={size} sx={{ color: "#FFA500" }} />
                );
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <Star key={i} fontSize={size} sx={{ color: "#FFA500", opacity: 0.5 }} />
                );
            } else {
                stars.push(
                    <StarBorder key={i} fontSize={size} sx={{ color: "#FFA500" }} />
                );
            }
        }

        return <Box display="flex">{stars}</Box>;
    };

    if (compact) {
        return (
            <Stack direction="row" spacing={1} alignItems="center">
                {renderStars(summary.average, "small")}
                <Typography variant="body2" fontWeight="bold">
                    {summary.average.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    ({summary.count} {summary.count === 1 ? "calificación" : "calificaciones"})
                </Typography>
            </Stack>
        );
    }

    return (
        <Box>
            {/* Promedio general */}
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Box textAlign="center">
                    <Typography variant="h3" fontWeight="bold">
                        {summary.average.toFixed(1)}
                    </Typography>
                    {renderStars(summary.average, "large")}
                    <Typography variant="body2" color="text.secondary" mt={1}>
                        {summary.count} {summary.count === 1 ? "calificación" : "calificaciones"}
                    </Typography>
                </Box>

                {/* Distribución */}
                <Box flex={1}>
                    {[5, 4, 3, 2, 1].map((stars) => {
                        const count = summary.distribution[stars as keyof typeof summary.distribution];
                        const percentage = summary.count > 0 ? (count / summary.count) * 100 : 0;

                        return (
                            <Stack
                                key={stars}
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                mb={0.5}
                            >
                                <Typography variant="body2" sx={{ minWidth: 20 }}>
                                    {stars}
                                </Typography>
                                <Star fontSize="small" sx={{ color: "#FFA500" }} />
                                <LinearProgress
                                    variant="determinate"
                                    value={percentage}
                                    sx={{
                                        flex: 1,
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: "#E0E0E0",
                                        "& .MuiLinearProgress-bar": {
                                            backgroundColor: "#FFA500",
                                        },
                                    }}
                                />
                                <Typography variant="body2" sx={{ minWidth: 30 }}>
                                    {count}
                                </Typography>
                            </Stack>
                        );
                    })}
                </Box>
            </Stack>
        </Box>
    );
}