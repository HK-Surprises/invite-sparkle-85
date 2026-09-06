import { QRCodeSVG } from "qrcode.react";

export function QrCodeCard({ url, label }: { url: string; label?: string }) {
  return (
    <div className="card-elevated flex flex-col items-center gap-3 p-5 text-center">
      <div className="rounded-xl bg-card p-3 ring-1 ring-border">
        <QRCodeSVG value={url} size={160} bgColor="transparent" fgColor="currentColor" className="text-foreground" />
      </div>
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
    </div>
  );
}
