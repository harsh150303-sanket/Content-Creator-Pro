import { useQueryClient } from "@tanstack/react-query";
import {
  useListBlogs as useGenListBlogs,
  useCreateBlog as useGenCreateBlog,
  useUpdateBlog as useGenUpdateBlog,
  useDeleteBlog as useGenDeleteBlog,
  useGetBlog as useGenGetBlog,
  useGenerateBlog as useGenGenerateBlog,
  getListBlogsQueryKey,
  getGetBlogQueryKey,
} from "@workspace/api-client-react";

export function useBlogs(clientId: number) {
  return useGenListBlogs(clientId, { query: { enabled: !!clientId } });
}

export function useBlog(clientId: number, id: number) {
  return useGenGetBlog(clientId, id, { query: { enabled: !!clientId && !!id } });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  return useGenCreateBlog({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getListBlogsQueryKey(variables.clientId) });
      },
    },
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();
  return useGenUpdateBlog({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getListBlogsQueryKey(variables.clientId) });
        queryClient.invalidateQueries({ queryKey: getGetBlogQueryKey(variables.clientId, variables.id) });
      },
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  return useGenDeleteBlog({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getListBlogsQueryKey(variables.clientId) });
      },
    },
  });
}

export function useGenerateBlog() {
  const queryClient = useQueryClient();
  return useGenGenerateBlog({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getListBlogsQueryKey(variables.clientId) });
      },
    },
  });
}
