import { useQueryClient } from "@tanstack/react-query";
import {
  useListClients as useGenListClients,
  useCreateClient as useGenCreateClient,
  useUpdateClient as useGenUpdateClient,
  useDeleteClient as useGenDeleteClient,
  useGetClient as useGenGetClient,
  getListClientsQueryKey,
  getGetClientQueryKey,
} from "@workspace/api-client-react";

export function useClients() {
  return useGenListClients();
}

export function useClient(id: number) {
  return useGenGetClient(id, { query: { enabled: !!id } });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useGenCreateClient({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
      },
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useGenUpdateClient({
    mutation: {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetClientQueryKey(variables.id) });
      },
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useGenDeleteClient({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
      },
    },
  });
}
