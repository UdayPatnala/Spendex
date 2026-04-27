const DEFAULT_APK_PATH = "/spedex.apk";

function resolveApkUrl() {
  return import.meta.env.VITE_APK_URL || DEFAULT_APK_PATH;
}

export default function MobileVersion() {
  const apkUrl = resolveApkUrl();

  return (
    <main className="mobile-version-shell">
      <section className="mobile-version-card">
        <p className="eyebrow">Spedex Mobile</p>
        <h1 className="mobile-version-title">Install Spedex For Android</h1>
        <p className="mobile-version-copy">
          Download the APK and install the app to manage payments, budgets, and spending insights on your phone.
        </p>

        <a className="mobile-version-download" href={apkUrl} download>
          Download APK
        </a>

        <div className="mobile-version-steps">
          <h2>Install Steps</h2>
          <ol>
            <li>Tap "Download APK".</li>
            <li>Open the downloaded file on your Android device.</li>
            <li>Allow install from unknown sources if prompted.</li>
            <li>Complete installation and launch Spedex.</li>
          </ol>
        </div>
      </section>
    </main>
  );
}

