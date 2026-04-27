import { useState } from "react";
import { api } from "@/lib/api";

type Props = {
  username?: string | null;
};

export default function PasswordChangeForm({ username }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const save = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      const result = await api.changePassword({ currentPassword, newPassword });
      setMessage(result?.message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full rounded-[1.25rem] bg-white/78 backdrop-blur-xl p-5 shadow-card border border-border/60 sm:rounded-[1.75rem] sm:p-7 2xl:p-6">
      <div className="mb-6">
        <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
          Security
        </div>
        <h2 className="text-2xl font-display font-bold gradient-text mb-2 sm:text-3xl 2xl:text-2xl">
          Change Password
        </h2>
        <p className="text-sm text-muted-foreground">
          Update your own login password for this account.
        </p>
      </div>

      {username && (
        <div className="mb-4 rounded-xl border border-border/70 bg-white/70 px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Username
          </div>
          <div className="mt-1 font-medium">{username}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Usernames are managed by the superadmin and cannot be changed here.
          </p>
        </div>
      )}

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
          required
        />

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
          required
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
          required
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-2xl gradient-button text-primary-foreground shadow-button font-semibold disabled:opacity-50"
        >
          {saving ? "Updating..." : "Update Password"}
        </button>

        {message && <p className="text-sm text-center text-muted-foreground">{message}</p>}
      </form>
    </div>
  );
}
