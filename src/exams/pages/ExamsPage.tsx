import { useAuth } from "@/auth/context/useAuth";
import { Button } from "@mui/material";


const ExamsPage = () => { 

  const { role } = useAuth();

  return (
    <>
    <p>HOLA</p>
    {role === "admin" && (
      <Button variant="contained">Subir examen</Button>
    )}
    {role}
    </>
  )
}


export default ExamsPage