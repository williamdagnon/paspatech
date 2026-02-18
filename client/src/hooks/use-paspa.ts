import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type errorSchemas } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// ============================================
// PROFILE HOOKS
// ============================================

export function useProfile() {
  return useQuery({
    queryKey: [api.profile.get.path],
    queryFn: async () => {
      const res = await fetch(api.profile.get.path, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.profile.get.responses[200].parse(await res.json());
    },
    retry: false,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.profile.create.input>) => {
      const res = await fetch(api.profile.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create profile");
      }
      return api.profile.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profile.get.path] });
      toast({ title: "Welcome!", description: "Your profile has been created successfully." });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to create profile", 
        variant: "destructive" 
      });
    },
  });
}

// ============================================
// PRODUCT HOOKS
// ============================================

export function useProducts() {
  return useQuery({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      const res = await fetch(api.products.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      return api.products.list.responses[200].parse(await res.json());
    },
  });
}

// ============================================
// ORDER HOOKS
// ============================================

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.orders.create.input>) => {
      const res = await fetch(api.orders.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Payment failed or order could not be created");
      }
      return api.orders.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      // We don't toast here to let the UI handle the specific success modal
    },
    onError: (error) => {
      toast({ 
        title: "Payment Failed", 
        description: error instanceof Error ? error.message : "Could not complete transaction", 
        variant: "destructive" 
      });
    },
  });
}

// ============================================
// ADMIN HOOKS
// ============================================

export function useAdminDashboard() {
  return useQuery({
    queryKey: [api.admin.dashboard.path],
    queryFn: async () => {
      const res = await fetch(api.admin.dashboard.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return api.admin.dashboard.responses[200].parse(await res.json());
    },
  });
}

export function useAdminAmbassadors() {
  return useQuery({
    queryKey: [api.admin.ambassadors.path],
    queryFn: async () => {
      const res = await fetch(api.admin.ambassadors.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch ambassadors");
      return api.admin.ambassadors.responses[200].parse(await res.json());
    },
  });
}

export function useApproveAmbassador() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.admin.approveAmbassador.path, { id });
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to approve");
      return api.admin.approveAmbassador.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.ambassadors.path] });
      toast({ title: "Approved", description: "Ambassador has been approved." });
    },
  });
}

// ============================================
// AMBASSADOR HOOKS
// ============================================

export function useAmbassadorStats() {
  return useQuery({
    queryKey: [api.ambassador.stats.path],
    queryFn: async () => {
      const res = await fetch(api.ambassador.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.ambassador.stats.responses[200].parse(await res.json());
    },
  });
}
