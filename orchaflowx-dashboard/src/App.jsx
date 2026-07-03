import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./hooks/useToast";
import Sidebar from "./components/Sidebar";

const Overview       = require("./pages/Overview").default;
const Workflows      = require("./pages/Workflows").default;
const WorkflowDetail = require("./pages/WorkflowDetail").default;
const Steps          = require("./pages/Steps").default;
const Metrics        = require("./pages/Metrics").default;
const CreateWorkflow = require("./pages/CreateWorkflow").default;

console.log({ Overview, Workflows, WorkflowDetail, Steps, Metrics, CreateWorkflow });

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
          <main style={{ flex: 1 }}>
            <Routes>
  <Route path="/" element={<Overview />} />
  {/* <Route path="/workflows"     element={<Workflows />} /> */}
  {/* <Route path="/workflows/:id" element={<WorkflowDetail />} /> */}
  {/* <Route path="/steps"         element={<Steps />} /> */}
  {/* <Route path="/metrics"       element={<Metrics />} /> */}
  {/* <Route path="/create"        element={<CreateWorkflow />} /> */}
</Routes>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}