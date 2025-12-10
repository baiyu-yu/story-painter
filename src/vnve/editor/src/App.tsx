import { createHashRouter, RouterProvider } from "react-router-dom";
import { EditorPage } from "./page/EditorPage.tsx";

function RouteErrorElement() {
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>出现错误</h2>
      <p style={{ marginTop: 8, color: "#666" }}>
        页面渲染失败。请返回重试，或刷新后再次进入。
      </p>
    </div>
  );
}

const router = createHashRouter([
  {
    path: "/",
    element: <EditorPage />,
    errorElement: <RouteErrorElement />,
  },
]);

export default function App() {
  return <RouterProvider router={router}></RouterProvider>;
}
