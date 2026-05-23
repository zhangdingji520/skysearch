import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { HomePage } from "@/pages/home";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomePage/>
      <Toaster/>
    </QueryClientProvider>
  );
}
