import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App";

export default function QueryClientHolder () {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <App/>
        </QueryClientProvider>
    )
}