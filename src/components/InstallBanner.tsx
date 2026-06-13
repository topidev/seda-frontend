'use client'

import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Download, Share, X } from "lucide-react";
import { useState } from "react";

export default function InstallBanner() {
	const { canInstall, isInstalled, isIOS, promptInstall } = useInstallPrompt()
	const [dismissed, setDismissed] = useState(false)
	const [showIOSInstructions, setShowIOSInstructions] = useState(false)

	if (isInstalled || dismissed) return null

	if (canInstall) {
		return (
			<div
				className="rounded-2xl p-4 mb-6 flex items-center gap-3"
				style={{
					backgroundColor: 'var(--color-bg-elevated)',
					border: '1px solid var(--color-primary)',
				}}
			>
				<div
					className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
					style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
					>
						<Download size={18} style={{ color: 'var(--color-primary)' }} />
				</div>
				<div className="flex-1">
					<p
							className="text-sm font-medium"
							style={{ color: 'var(--color-text-primary)' }}
					>
						Instala SEDA en tu dispositivo
					</p>
					<p
						className="text-xs"
						style={{ color: 'var(--color-text-secondary)' }}
					>
						Accede más rápido y usa la app sin conexión
					</p>
				</div>
				<button
					onClick={promptInstall}
					className="px-3 py-2 rounded-xl text-sm font-medium cursor-pointer shrink-0"
					style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
					>
						Instalar
				</button>
				<button
					onClick={() => setDismissed(true)}
					className="cursor-pointer shrink-0"
					style={{ color: 'var(--color-text-disabled)' }}
					>
						<X size={16} />
				</button>
			</div>
		)
	}

	if (isIOS) {
    return (
      <div
        className="rounded-2xl p-4 mb-6"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-primary)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
          >
            <Download size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Instala SEDA en tu iPhone
            </p>
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Accede más rápido y usa la app sin conexión
            </p>
          </div>
          <button
            onClick={() => setShowIOSInstructions(!showIOSInstructions)}
            className="px-3 py-2 rounded-xl text-sm font-medium cursor-pointer shrink-0"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          >
            Ver cómo
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="cursor-pointer shrink-0"
            style={{ color: 'var(--color-text-disabled)' }}
          >
            <X size={16} />
          </button>
        </div>

        {showIOSInstructions && (
          <div
            className="mt-4 pt-4 flex flex-col gap-3"
            style={{ borderTop: '1px solid var(--color-divider)' }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-primary)' }}
              >
                1
              </span>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Toca el botón <Share size={14} className="inline mx-1" /> compartir en Safari
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-primary)' }}
              >
                2
              </span>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Selecciona &quot;Agregar a pantalla de inicio&quot;
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-primary)' }}
              >
                3
              </span>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Confirma tocando &quot;Agregar&quot;
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }
	return null
}