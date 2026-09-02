"use client";

// Médiathèque des forces — dépôt et remplacement des 2 visuels de chaque force

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeftRight,
  Check,
  ImageOff,
  Loader2,
  Pencil,
  Search,
  Upload,
  X,
} from "lucide-react";
import {
  FIRST_FORCE_NUMBER,
  FORCE_NUMBER_RANGE,
  LAST_FORCE_NUMBER,
  formatForceNumber,
} from "@/lib/forces/forceAssets";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import type { ForceType } from "@/types/modelPrisma";
import { isForceComplete } from "@/types/modelPrisma";

type ForcePage = "a" | "b";

/// Identifie l'opération en cours pour n'afficher le spinner que sur la bonne case.
type PendingKey = `${number}-${ForcePage}`;

/// Ne retient que les PNG d'un dépôt, triés par nom pour un ordre prévisible.
function pngFilesFrom(list: FileList | null): File[] {
  if (!list) return [];
  return Array.from(list)
    .filter((file) => file.type === "image/png")
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

export default function DataManipulationForces() {
  const [forces, setForces] = useState<ForceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Set<PendingKey>>(new Set());
  const [search, setSearch] = useState("");
  /// Numéro de la force actuellement survolée par un glisser-déposer.
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  /// Numéro de la force dont le titre est en cours d'édition, et sa saisie.
  const [editingNumber, setEditingNumber] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);
  /// Force dont on est en train de changer le numéro.
  const [renumbering, setRenumbering] = useState<ForceType | null>(null);

  const loadForces = useCallback(async () => {
    try {
      const res = await fetch("/api/forces");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chargement impossible.");
      setForces(data.forces);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForces();
  }, [loadForces]);

  const setPendingFor = (key: PendingKey, active: boolean) => {
    setPending((current) => {
      const next = new Set(current);
      if (active) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  /// Remplace une ou plusieurs forces dans la liste.
  ///
  /// L'appariement se fait sur l'`id` et non sur le numéro : celui-ci change
  /// lors d'un échange, il ne peut pas servir de repère.
  const applyUpdatedForces = (updated: ForceType[]) => {
    const byId = new Map(updated.map((force) => [force.id, force]));
    setForces((current) =>
      current
        .map((force) => byId.get(force.id) ?? force)
        .sort((left, right) => left.number - right.number)
    );
  };

  const applyUpdatedForce = (updated: ForceType) => applyUpdatedForces([updated]);

  const handleSwap = async (source: ForceType, target: number) => {
    const res = await fetch(`/api/forces/${source.number}/swap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Échange impossible.");

    applyUpdatedForces(data.forces);
  };

  const handleUpload = async (forceNumber: number, page: ForcePage, file: File) => {
    const key: PendingKey = `${forceNumber}-${page}`;
    setPendingFor(key, true);

    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch(`/api/forces/${forceNumber}/${page}`, {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Dépôt impossible.");

      applyUpdatedForce(data.force);
      toast.success(`Page ${page.toUpperCase()} de la force ${formatForceNumber(forceNumber)} déposée.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Dépôt impossible.");
    } finally {
      setPendingFor(key, false);
    }
  };

  const startEditing = (force: ForceType) => {
    setEditingNumber(force.number);
    setDraftTitle(force.title);
  };

  const cancelEditing = () => {
    setEditingNumber(null);
    setDraftTitle("");
  };

  const handleRenameTitle = async (forceNumber: number) => {
    const title = draftTitle.trim();
    if (!title) {
      toast.error("Le titre ne peut pas être vide.");
      return;
    }

    setSavingTitle(true);
    try {
      const res = await fetch(`/api/forces/${forceNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Renommage impossible.");

      applyUpdatedForce(data.force);
      cancelEditing();
      toast.success(`Titre de la force ${formatForceNumber(forceNumber)} mis à jour.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Renommage impossible.");
    } finally {
      setSavingTitle(false);
    }
  };

  /// Répartit un lot déposé sur une ligne : un fichier va dans la première case
  /// libre, deux fichiers remplissent A puis B dans l'ordre alphabétique.
  const handleRowFiles = (force: ForceType, files: File[]) => {
    if (files.length === 0) {
      toast.error("Seuls les fichiers PNG sont acceptés.");
      return;
    }

    if (files.length === 1) {
      const target: ForcePage = !force.pageAKey ? "a" : !force.pageBKey ? "b" : "a";
      handleUpload(force.number, target, files[0]);
      return;
    }

    handleUpload(force.number, "a", files[0]);
    handleUpload(force.number, "b", files[1]);

    if (files.length > 2) {
      toast(`Force ${formatForceNumber(force.number)} : seuls les 2 premiers fichiers ont été retenus.`);
    }
  };

  const visibleForces = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return forces.filter((force) => {
      if (!needle) return true;
      // La première force s'affiche « 00 » : on accepte les deux écritures,
      // « 0 » comme « 00 », sans quoi la recherche démentirait ce qui est à l'écran.
      return (
        force.title.toLowerCase().includes(needle) ||
        String(force.number) === needle ||
        formatForceNumber(force.number) === needle
      );
    });
  }, [forces, search]);

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-live="polite">
        <span className="sr-only">Chargement des forces…</span>
        <Skeleton className="h-11 w-full rounded-lg" />
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="text-ink-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        />
        <Input
          type="search"
          className="bg-paper h-11 pl-9"
          placeholder="Rechercher une force par titre ou par numéro…"
          aria-label="Rechercher une force"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <p className="text-ink-muted text-[0.8125rem]">
        Glissez un PNG sur une ligne pour remplacer une page, ou deux PNG pour
        remplacer les pages A et B d&apos;un coup.
      </p>

      {visibleForces.length === 0 ? (
        <p className="border-line text-ink-muted rounded-xl border border-dashed py-16 text-center">
          Aucune force ne correspond à cette recherche.
        </p>
      ) : (
        <ul className="space-y-2">
          {visibleForces.map((force) => {
            const complete = isForceComplete(force);
            const isDropTarget = dropTarget === force.number;

            return (
              <li
                key={force.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropTarget(force.number);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                    setDropTarget(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDropTarget(null);
                  handleRowFiles(force, pngFilesFrom(e.dataTransfer.files));
                }}
                className={`bg-paper shadow-sheet flex flex-col gap-4 rounded-lg border p-3 transition-colors sm:flex-row sm:items-center sm:gap-5 sm:p-4 ${
                  isDropTarget
                    ? "border-brand bg-brand-veil border-dashed"
                    : "border-line"
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {/* La pastille porte l'état de la ligne : turquoise si les deux
                      pages sont là, ocre s'il en manque une. Elle sert aussi de
                      bouton pour réattribuer le numéro. */}
                  <button
                    type="button"
                    onClick={() => setRenumbering(force)}
                    aria-label={`Changer le numéro de la force ${formatForceNumber(force.number)}, ${force.title}`}
                    title="Changer le numéro"
                    className={`group relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                      complete
                        ? "bg-brand-wash text-brand-deep hover:bg-brand"
                        : "bg-ochre-wash text-ochre hover:bg-ochre"
                    } hover:text-white`}
                  >
                    <span aria-hidden="true" className="group-hover:invisible">
                      {formatForceNumber(force.number)}
                    </span>
                    <ArrowLeftRight
                      aria-hidden="true"
                      className="invisible absolute h-4 w-4 group-hover:visible"
                    />
                  </button>

                  {editingNumber === force.number ? (
                    <span className="flex min-w-0 flex-1 items-center gap-1.5">
                      <Input
                        autoFocus
                        value={draftTitle}
                        disabled={savingTitle}
                        aria-label={`Titre de la force ${formatForceNumber(force.number)}`}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameTitle(force.number);
                          if (e.key === "Escape") cancelEditing();
                        }}
                        className="bg-paper h-8"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={savingTitle}
                        aria-label="Enregistrer le titre"
                        onClick={() => handleRenameTitle(force.number)}
                      >
                        {savingTitle ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={savingTitle}
                        aria-label="Annuler"
                        onClick={cancelEditing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </span>
                  ) : (
                    <>
                      <span className="text-ink truncate font-medium">{force.title}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Renommer la force ${formatForceNumber(force.number)}`}
                        title="Renommer"
                        onClick={() => startEditing(force)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <span aria-hidden="true" className="leader-dots hidden sm:block" />
                    </>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {(["a", "b"] as const).map((page) => (
                    <PageSlot
                      key={page}
                      force={force}
                      page={page}
                      busy={pending.has(`${force.number}-${page}`)}
                      onUpload={(file) => handleUpload(force.number, page, file)}
                    />
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {renumbering && (
        <RenumberDialog
          force={renumbering}
          forces={forces}
          onClose={() => setRenumbering(null)}
          onSwap={handleSwap}
        />
      )}
    </div>
  );
}

type RenumberDialogProps = {
  force: ForceType;
  forces: ForceType[];
  onClose: () => void;
  onSwap: (source: ForceType, target: number) => Promise<void>;
};

/// Réattribue le numéro d'une force.
///
/// Les 100 numéros (0 à 99) sont tous pris : l'opération est donc toujours un
/// échange.
/// Le dialogue nomme la force qui va recevoir l'ancien numéro, pour que
/// l'administrateur voie qu'il déplace deux lignes et non une seule.
function RenumberDialog({ force, forces, onClose, onSwap }: RenumberDialogProps) {
  const [draft, setDraft] = useState(String(force.number));
  const [saving, setSaving] = useState(false);

  const target = Number(draft);
  const isValid =
    Number.isInteger(target) &&
    target >= FIRST_FORCE_NUMBER &&
    target <= LAST_FORCE_NUMBER &&
    target !== force.number;
  const occupant = isValid ? forces.find((f) => f.number === target) : undefined;

  const submit = async () => {
    if (!isValid || !occupant) return;
    setSaving(true);
    try {
      await onSwap(force, target);
      toast.success(
        `Force ${formatForceNumber(force.number)} « ${force.title} » ↔ force ${formatForceNumber(target)} « ${occupant.title} ».`
      );
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échange impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent showCloseButton={false} className="bg-paper max-w-md gap-4">
        <DialogHeader>
          <p className="eyebrow text-brand-deep">Changer le numéro</p>
          <DialogTitle className="font-display text-ink text-xl">
            {formatForceNumber(force.number)}. {force.title}
          </DialogTitle>
        </DialogHeader>

        <label className="block">
          <span className="text-ink-muted text-[0.8125rem]">
            Nouveau numéro ({FORCE_NUMBER_RANGE})
          </span>
          <Input
            autoFocus
            type="number"
            min={FIRST_FORCE_NUMBER}
            max={LAST_FORCE_NUMBER}
            value={draft}
            disabled={saving}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape" && !saving) onClose();
            }}
            className="bg-paper mt-1.5 h-10"
          />
        </label>

        {/* L'échange n'est pas évident : on nomme explicitement la force qui
            part à la place de celle-ci. */}
        {occupant ? (
          <p className="bg-ochre-wash text-ochre rounded-lg px-3 py-2.5 text-[0.8125rem]">
            La force {formatForceNumber(target)} «&nbsp;{occupant.title}&nbsp;» prendra le numéro {formatForceNumber(force.number)}.
          </p>
        ) : (
          <p className="text-ink-muted text-[0.8125rem]">
            {draft.trim() === "" || target === force.number
              ? "Saisissez un numéro différent de l’actuel."
              : `Numéro invalide : attendu entre ${FORCE_NUMBER_RANGE}.`}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
            Annuler
          </Button>
          <Button type="button" disabled={!isValid || saving} onClick={submit}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Échanger"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type PageSlotProps = {
  force: ForceType;
  page: ForcePage;
  busy: boolean;
  onUpload: (file: File) => void;
};

/// Une case de dépôt, pour la page A ou B d'une force.
function PageSlot({ force, page, busy, onUpload }: PageSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const storedKey = page === "a" ? force.pageAKey : force.pageBKey;
  const filename = page === "a" ? force.pageAFilename : force.pageBFilename;
  const label = `Page ${page.toUpperCase()}`;
  const context = `${label} de la force ${formatForceNumber(force.number)}, ${force.title}`;

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          // Réinitialise pour permettre de redéposer le même fichier.
          e.target.value = "";
        }}
      />

      <button
        type="button"
        disabled={busy}
        onClick={() => (storedKey ? setShowPreview(true) : inputRef.current?.click())}
        aria-label={
          storedKey ? `Voir le visuel — ${context}` : `Déposer le visuel — ${context}`
        }
        title={filename ?? `${label} — aucun visuel déposé`}
        className={`flex min-w-[7.5rem] cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-wait disabled:opacity-50 ${
          storedKey
            ? "border-brand/40 bg-brand-veil text-primary hover:bg-brand-wash"
            : "border-line-strong text-ink-muted hover:border-brand hover:bg-brand-veil border-dashed"
        }`}
      >
        {busy ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : storedKey ? (
          <Check aria-hidden="true" className="h-4 w-4" />
        ) : (
          <ImageOff aria-hidden="true" className="h-4 w-4" />
        )}
        <span className="font-medium">{label}</span>
        <span className="text-[0.75rem] opacity-70">
          {storedKey ? "déposée" : "manquante"}
        </span>
      </button>

      {/* Pas de bouton « retirer » : les 100 forces sont livrées et le client ne
          fait que remplacer un visuel par une version plus récente. Vider une case
          ne ferait que casser la génération du miroir. */}
      {storedKey && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={busy}
          aria-label={`Remplacer le visuel — ${context}`}
          title={`Remplacer la page ${page.toUpperCase()}`}
          onClick={() => inputRef.current?.click()}
        >
          <Upload aria-hidden="true" className="h-4 w-4" />
        </Button>
      )}

      {storedKey && (
        <PreviewDialog
          open={showPreview}
          onOpenChange={setShowPreview}
          forceNumber={force.number}
          forceTitle={force.title}
          page={page}
        />
      )}
    </div>
  );
}

type PreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forceNumber: number;
  forceTitle: string;
  page: ForcePage;
};

/// Affiche le visuel en grand. L'image est servie par une route protégée : le
/// bucket est privé, il n'y a pas d'URL publique.
function PreviewDialog({
  open,
  onOpenChange,
  forceNumber,
  forceTitle,
  page,
}: PreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-paper max-w-[min(48rem,calc(100%-2rem))] gap-4"
      >
        <DialogHeader>
          <p className="eyebrow text-brand-deep">Page {page.toUpperCase()}</p>
          <DialogTitle className="font-display text-ink text-xl">
            {formatForceNumber(forceNumber)}. {forceTitle}
          </DialogTitle>
        </DialogHeader>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/forces/${forceNumber}/${page}/preview`}
          alt={`${forceTitle}, page ${page.toUpperCase()}`}
          className="border-line max-h-[65vh] w-full rounded border bg-white object-contain"
        />

        <DialogClose asChild>
          <Button type="button" variant="outline" className="self-end">
            Fermer
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
