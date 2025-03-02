// src/lib/organizationUtils.ts
import { supabaseClient } from "@/lib/supabaseClient";
import { Organization, OrganizationMember } from "@/types";

export async function getUserOrganizations(
  userId: string
): Promise<Organization[]> {
  const { data, error } = await supabaseClient
    .from("organizations")
    .select(
      `
      *,
      organization_members!inner(user_id)
    `
    )
    .eq("organization_members.user_id", userId);

  if (error) {
    console.error("Error fetching user organizations:", error);
    throw error;
  }

  return data || [];
}

export async function getUserOrganizationMemberships(
  userId: string
): Promise<(OrganizationMember & { organization: Organization })[]> {
  const { data, error } = await supabaseClient
    .from("organization_members")
    .select(
      `
      *,
      organizations(*)
    `
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user organization memberships:", error);
    throw error;
  }

  return data || [];
}

export async function addOrganizationMember(
  organizationId: string,
  userId: string,
  role: "owner" | "admin" | "member" = "member"
) {
  const { data, error } = await supabaseClient
    .from("organization_members")
    .insert({
      organization_id: organizationId,
      user_id: userId,
      role,
      status: "active",
      joined_at: new Date().toISOString(),
    })
    .select();

  if (error) {
    console.error("Error adding organization member:", error);
    throw error;
  }

  return data[0];
}

export async function updateOrganizationMemberRole(
  organizationId: string,
  userId: string,
  newRole: "owner" | "admin" | "member"
) {
  const { data, error } = await supabaseClient
    .from("organization_members")
    .update({ role: newRole })
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .select();

  if (error) {
    console.error("Error updating organization member role:", error);
    throw error;
  }

  return data[0];
}

export async function removeOrganizationMember(
  organizationId: string,
  userId: string
) {
  const { error } = await supabaseClient
    .from("organization_members")
    .delete()
    .eq("organization_id", organizationId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error removing organization member:", error);
    throw error;
  }

  return true;
}
