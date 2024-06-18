import  { useEffect, lazy, Suspense } from "react";
import { IconCloudOffline16 } from "./assets/icons";
import toast from "react-hot-toast";
import { Routes, Route, useLocation } from "react-router-dom";
import MLoader from "./components/MLoader";
const HomePage = lazy(() => import("./pages/home"));

function App() {
  const {pathname} = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  useEffect(() => {
    if (!navigator.onLine) {
      toast("You are currently offline!", {
        style: {
          backgroundColor: "gray",
          color: "#fff",
        },
        icon: <IconCloudOffline16 />,
      });
    }
  }, [pathname]);

  
  return (
    <>
      <Suspense
        fallback={
          <div>
      <MLoader/>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
