import AppRoutes from "../src/routes/AppRoutes";
import { SocketProvider } from "./context/SocketContext";
//import Header from "./layouts/common/Header";

const App = () => {
  return <SocketProvider>
    {/* <Header /> */}
    <AppRoutes />
  </SocketProvider>;
};

export default App;
