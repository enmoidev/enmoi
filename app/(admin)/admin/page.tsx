// this is homepage page for admin

import LinkNavCard from "../../../components/ui/LinkNavCard";
import { NavInfoCard } from "../../../types/navInfoCard";

export default function AdminHomePage() {

  const navInfoCards: NavInfoCard[] = [
  {
    title: "Gestion des aptitudes",
    shortDescription: "Modifiez les composantes des aptitudes",
    content: "Sélectionnez une aptitude parmi les 100 disponibles, modifiez ses composantes (titre, définition vivante, texte emblématique, forces associées, zones de vigilance et mots-clés), générez la fiche correspondante en PDF et enregistrer les modifications.",
    href: "/admin/aptitudes",
    d: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
  },
  {
    title: "Gestion des formules",
    shortDescription: "Modifiez les formules",
    content: "Sélectionnez une formule parmi les 7 disponibles, modifiez-la et calculez les résultats à partir d'une date de naissance pour obtenir le numéro des 7 aptitudes associées.",
    href: "/admin/formules",
    d: "M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25",
  },
  {
    title: "Générer des PMI",
    shortDescription: "Créez le PMI d'un individu (PMI)",
    content: "Générez un PMI en renseignant le nom, prénom et date de naissance d'une personne. Le PMI inclut automatiquement les informations calculées pour les aptitudes.",
    href: "/admin/pmi",
    d: "M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z",
  },
  {
    title: "Paramètres globaux",
    shortDescription: "Définissez les règles et accès globaux",
    content: "Configurez le nombre de comptes ambassadeur disponibles et modifiez les mots de passe administrateurs. Ces paramètres affectent l'ensemble de l'application.",
    href: "/admin/settings",
    d: "M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75",
  },
];


  return (

    <main className="flex flex-col justify-center">

      <h1 className="text-3xl font-medium tracking-wide mb-4">Tableau de bord</h1>

      <div className="flex flex-col md:flex-row gap-3">

      {navInfoCards.map(({ title, shortDescription, content, href, d }) => {

        return (
          <LinkNavCard key={title} title={title} shortDescription={shortDescription} content={content} href={href} d={d}></LinkNavCard>
        )

      })}
      </div>

    </main>

  );

}