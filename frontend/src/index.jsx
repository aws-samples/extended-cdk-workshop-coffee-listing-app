import * as ReactDOM from "react-dom";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "react-query";

import { App } from "./App";

let queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      suspense: true,
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
