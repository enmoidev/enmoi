// Logotype enMOI composé typographiquement, dans la script de la marque

type Props = {
  /// Taille du logotype ; le trait sous « MOI » suit la même échelle.
  className?: string;
};

export function BrandMark({ className = "text-3xl" }: Props) {
  return (
    <span className={`wordmark inline-flex items-end ${className}`}>
      {/* Le nom est lu « enMoi » par les lecteurs d'écran, pas lettre à lettre. */}
      <span aria-hidden="true">en</span>
      <span aria-hidden="true" className="relative">
        MOI
        {/* La courbe fléchée du logotype, réduite à un trait sous les capitales. */}
        <span
          aria-hidden="true"
          className="absolute -bottom-1 left-0 h-px w-full bg-current opacity-70"
        />
      </span>
      <span className="sr-only">EnMoi</span>
    </span>
  );
}
