import { useAuth } from "../contexts/AuthProvider";

function Home() {
    const { isAuthLoading } = useAuth();
    
    if(isAuthLoading){
        return <div>Loading...</div>
    }
  return (
    <div>
        HomePage
    </div>
  )
}

export default Home