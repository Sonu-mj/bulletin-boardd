import { AuthButton } from "./components/Auth";

export default function App() {
  return (
    <div style={{ padding: "32px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Anonymous Board</h1>
        <AuthButton />
      </div>
    </div>
  );
}
