import { Box, Typography } from "@mui/material";


interface HeaderProps {
  title: string
  subtitle: string
}

export default function Header({title, subtitle}: HeaderProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" fontWeight={700}>
        {title}
      </Typography>
      <Typography color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  )
}
