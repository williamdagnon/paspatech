import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useProfile() {
  return useQuery({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile", { credentials: "include" });
      if (res.status === 404 || res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    retry: false,
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Produit introuvable");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useUserOrders() {
  return useQuery({
    queryKey: ["/api/user/orders"],
    queryFn: async () => {
      const res = await fetch("/api/user/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["/api/admin/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
  });
}

export function useAdminAmbassadors() {
  return useQuery({
    queryKey: ["/api/admin/ambassadors"],
    queryFn: async () => {
      const res = await fetch("/api/admin/ambassadors", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ["/api/admin/products"],
    queryFn: async () => {
      const res = await fetch("/api/admin/products", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

export function useApproveAmbassador() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/ambassadors/${id}/approve`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/ambassadors"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Approuvé", description: "L'ambassadeur a été approuvé." });
    },
  });
}

export function useRejectAmbassador() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/ambassadors/${id}/reject`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/ambassadors"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Rejeté", description: "L'ambassadeur a été rejeté." });
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { name: string; description: string; price: string; fileUrl?: string; coverImageUrl?: string }) => {
      const res = await fetch("/api/admin/products", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), credentials: "include",
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/products"] });
      qc.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Produit créé", description: "Le guide PDF a été ajouté." });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<{ name: string; description: string; price: string; coverImageUrl: string }> }) => {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), credentials: "include",
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/products"] });
      qc.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Produit mis à jour", description: "Les modifications ont été enregistrées." });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/products"] });
      qc.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Supprimé", description: "Le produit a été désactivé." });
    },
  });
}

export function usePayCommission() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/commissions/${id}/pay`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Commission payée", description: "La commission a été marquée comme payée." });
    },
  });
}

export function useAmbassadorStats() {
  return useQuery({
    queryKey: ["/api/ambassador/stats"],
    queryFn: async () => {
      const res = await fetch("/api/ambassador/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}
