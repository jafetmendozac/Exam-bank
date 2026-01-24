import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface HeaderProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
}

export default function Header({ title, subtitle, icon }: HeaderProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        {icon && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>
        )}
        <Typography variant="h4" fontWeight={700}>
          {title}
        </Typography>
      </Box>
      <Typography color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  );
}