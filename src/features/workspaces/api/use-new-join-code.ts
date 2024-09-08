import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCallback, useMemo, useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

type RequestType = { workspaceId: Id<"workspaces"> };
type ResponseType = Id<"workspaces"> | null;
type Options = {
  onSuccess?: (data: ResponseType) => void;
  onError?: (error: Error) => void;
  onSettled?: () => {};
  throwError?: boolean;
};
const useNewJoinCode = () => {
  const [data, setData] = useState<ResponseType>(null);
  const [error, setError] = useState<Error | null>(null);
  const [state, setState] = useState<"success" | "error" | "settled" | "pending" | null>(null);

  const isPending = useMemo(() => state === "pending", [state]);
  const isSuccess = useMemo(() => state === "success", [state]);
  const isError = useMemo(() => state === "error", [state]);
  const isSettled = useMemo(() => state === "settled", [state]);

  const mutation = useMutation(api.workspaces.newJoinCode);
  const mutate = useCallback(
    async (values: RequestType, options: Options) => {
      try {
        setData(null);
        setError(null);
        setState("pending");
        const res = await mutation(values);
        options?.onSuccess?.(res);
        return res;
      } catch (error) {
        setState("error");
        options?.onError?.(error as Error);
        if (options?.throwError) throw error;
      } finally {
        setState("settled");
        options?.onSettled?.();
      }
    },
    [mutation],
  );

  return {
    mutate,
    data,
    error,
    isPending,
    isSettled,
    isSuccess,
    isError,
  };
};

export default useNewJoinCode;
