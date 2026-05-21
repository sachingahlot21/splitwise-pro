import App from "@/App";
import { AuthProvider } from '@/context/AuthContext';

export default function Page() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}