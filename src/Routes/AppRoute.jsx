import { Route, Routes } from "react-router-dom"
import Home from "../Pages/Home"
import Agents from "../Pages/Agents"
import Admin from "../Pages/Admin"


function AppRoute() {
  return (
    <div>
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/admin" element={<Admin />} />



            <Route path="*" element={<h1>Page Not Found</h1>} />

            
        </Routes>

    </div>
  )
}

export default AppRoute