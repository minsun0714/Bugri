import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import type { Request } from "@/api/contracts";

export function useShop(userId: string) {
  const client = useQueryClient();
  const api = () =>
    createBrowserApi({ mode: "mock", userId });
  const products = useQuery({
    queryKey: ["shop", userId, "products"],
    queryFn: async () =>
      (await api()).request("products", {}),
  });
  const wallet = useQuery({
    queryKey: ["shop", userId, "wallet"],
    queryFn: async () =>
      (await api()).request("wallet", {}),
  });
  const inventory = useQuery({
    queryKey: ["shop", userId, "inventory"],
    queryFn: async () =>
      (await api()).request("inventory", {}),
  });
  const users = useQuery({
    queryKey: ["shop", userId, "users"],
    queryFn: async () =>
      (await api()).request("discoverUsers", {}),
  });
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({
        queryKey: ["shop", userId, "wallet"],
      }),
      client.invalidateQueries({
        queryKey: ["shop", userId, "inventory"],
      }),
      client.invalidateQueries({ queryKey: ["profile"] }),
    ]);
  };
  const purchase = useMutation({
    mutationFn: async (request: Request<"purchase">) =>
      (await api()).request("purchase", request),
    onSuccess: refresh,
    onError: refresh,
    retry: false,
  });
  const equip = useMutation({
    mutationFn: async (request: Request<"equip">) =>
      (await api()).request("equip", request),
    onSuccess: refresh,
    onError: refresh,
    retry: false,
  });
  const move = useMutation({
    mutationFn: async (
      request: Request<"transformEquipment">,
    ) =>
      (await api()).request("transformEquipment", request),
    onSuccess: refresh,
    retry: false,
  });
  return {
    move,
    products,
    wallet,
    inventory,
    users,
    purchase,
    equip,
  };
}

export function usePublicDesk(publicId: string) {
  return useQuery({
    queryKey: ["profile", publicId],
    queryFn: async () =>
      (
        await createBrowserApi({
          mode: "mock",
          userId: "learner",
        })
      ).request("publicProfile", { publicId }),
  });
}
