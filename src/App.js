import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import DogSearch from "./components/DogSearch";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/search" element={<DogSearch />} />
      </Routes>
    </Router>
  );
}

export default App;
