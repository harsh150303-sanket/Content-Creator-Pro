import { useQueryClient } from "@tanstack/react-query";
import {
  useGetSearchConsoleKeywords as useGenGetKeywords,
  useConnectSearchConsole as useGenConnect,
  getGetSearchConsoleKeywordsQueryKey,
} from "@workspace/api-client-react";
import { getGetClientQueryKey } from "@workspace/api-client-react";

export function useSearchConsoleKeywords(clientId: number) {
  return useGenGetKeywords(clientId, { query: { enabled: !!clientId } });
}

export function useConnectSearchConsole() {
  const queryClient = useQueryClient();
  return useGenConnect({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getGetSearchConsoleKeywordsQueryKey(variables.clientId) });
        queryClient.invalidateQueries({ queryKey: getGetClientQueryKey(variables.clientId) });
      },
    },
  });
}
