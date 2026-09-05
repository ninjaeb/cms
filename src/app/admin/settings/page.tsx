import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900">Settings</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
