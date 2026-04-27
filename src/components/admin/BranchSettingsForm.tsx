import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Branch } from "@/types/branch";

type Props = {
  branch: Branch | null;
  onSaved: (branch: Branch) => void;
};

export default function BranchSettingsForm({ branch, onSaved }: Props) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [mapEmbedUrl, setMapEmbedUrl] = useState("");
  const [storeHours, setStoreHours] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const normalizeMapEmbedUrl = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (iframeSrcMatch?.[1]) {
      return iframeSrcMatch[1];
    }

    return trimmed;
  };

  useEffect(() => {
    setName(branch?.name || "");
    setAddress(branch?.address || "");
    setPhone(branch?.phone || "");
    setEmail(branch?.email || "");
    setWhatsappNumber(branch?.whatsappNumber || "");
    setMapEmbedUrl(branch?.mapEmbedUrl || "");
    setStoreHours(branch?.storeHours || "");
    setMessage("");
  }, [branch]);

  const save = async () => {
    try {
      setSaving(true);
      setMessage("");

      const updatedBranch = await api.updateCurrentBranch({
        name,
        address,
        phone,
        email,
        whatsappNumber,
        mapEmbedUrl: normalizeMapEmbedUrl(mapEmbedUrl),
        storeHours,
      });

      onSaved(updatedBranch);
      setMessage("Branch details updated successfully.");
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Failed to update branch details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full rounded-[1.25rem] bg-white/78 backdrop-blur-xl p-5 shadow-card border border-border/60 sm:rounded-[1.75rem] sm:p-8">
      <div className="mb-6">
        <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
          Storefront
        </div>
        <h2 className="text-2xl font-display font-bold gradient-text mb-2 sm:text-3xl">
          Storefront Details
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Update customer-facing contact, location, hours, and map details for this branch.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Hostname, slug, admin username, and branch access are controlled by the superadmin.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <input
          type="text"
          placeholder="Store display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
          required
        />
        <p className="-mt-2 text-xs text-muted-foreground">
          This is the public display name on the storefront. It does not change the branch URL.
        </p>

        <textarea
          placeholder="Branch address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
          rows={3}
        />

        <input
          type="text"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
        />

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
        />

        <input
          type="text"
          placeholder="WhatsApp number, e.g. 9779828037561"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
        />
        <p className="-mt-2 text-xs text-muted-foreground">
          WhatsApp is used for product inquiry buttons. Use digits with country code.
        </p>

        <textarea
          placeholder="Store hours"
          value={storeHours}
          onChange={(e) => setStoreHours(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
          rows={3}
        />

        <textarea
          placeholder="Google Maps iframe code or embed URL"
          value={mapEmbedUrl}
          onChange={(e) => setMapEmbedUrl(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
          rows={4}
        />

        <p className="text-xs text-muted-foreground">
          Paste either the full Google Maps iframe snippet or just the embeddable URL like
          {" "}
          <code>https://maps.google.com/maps?q=27.6882916,85.3162569&amp;z=18&amp;output=embed</code>
        </p>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-2xl gradient-button text-primary-foreground shadow-button font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Branch Details"}
        </button>

        {message && <p className="text-sm text-center text-muted-foreground">{message}</p>}
      </form>
    </div>
  );
}
